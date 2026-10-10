import db from "../../config/database.js";

import {
  FeedItem,
  FeedStatistics,
  FeedResponse,
  CreateDenunciaDTO,
} from "../../types/interfaces/FeedInterface.js";

class FeedRepository {
  async listarFeed(
    busca: string = "",
    page: number = 1,
    limit: number = 10
  ): Promise<FeedResponse> {
    const offset = (page - 1) * limit;

    const query = `
    WITH feed AS (
      SELECT
        'link' AS tipo,
        lr.url AS valor,
        SUM(lr.denuncias)::text AS total
      FROM links_reportados lr
      WHERE lr.url NOT ILIKE '%google.com%'
        AND lr.url NOT ILIKE '%google.com.br%'
        AND lr.url NOT ILIKE '%github.com%'
        AND lr.url NOT ILIKE '%whatsapp.com%'
        AND lr.url NOT ILIKE '%microsoft.com%'
        AND lr.url NOT ILIKE '%apple.com%'
        AND lr.url ILIKE '%' || $1 || '%'
      GROUP BY lr.url

      UNION ALL

      SELECT
        'telefone' AS tipo,
        tr.numero AS valor,
        SUM(tr.denuncias)::text AS total
      FROM telefones_reportados tr
      WHERE regexp_replace(tr.numero, '\\D', '', 'g')
        ILIKE '%' || regexp_replace($1, '\\D', '', 'g') || '%'
      GROUP BY tr.numero
    )

    SELECT
      tipo,
      valor,
      total,
      COUNT(*) OVER() AS total_resultados
    FROM feed
    ORDER BY total::integer DESC
    LIMIT $2
    OFFSET $3;
  `;

    const result = await db.query<FeedItem & { total_resultados: string }>(
      query,
      [busca, limit, offset]
    );

    const total = result.rows.length > 0
      ? Number(result.rows[0].total_resultados)
      : 0;

    const items: FeedItem[] = result.rows.map(
      ({ tipo, valor, total }) => ({
        tipo,
        valor,
        total,
      })
    );

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async listarRelatorio(usuarioId: string) {
    const evolucao = await db.query(
      `
    SELECT
      TO_CHAR(DATE(data_consulta), 'YYYY-MM-DD') AS data,
      COUNT(*) AS total
    FROM consultas
    WHERE user_id = $1
    GROUP BY DATE(data_consulta)
    ORDER BY DATE(data_consulta) ASC
  `,
      [usuarioId]
    );

    const distribuicaoRisco = await db.query(
      `
      SELECT
        CASE
          WHEN score_risco >= 70 THEN 'alto'
          WHEN score_risco >= 40 THEN 'medio'
          ELSE 'baixo'
        END AS risco,
        COUNT(*) AS total
      FROM consultas
      WHERE user_id = $1
      GROUP BY
        CASE
          WHEN score_risco >= 70 THEN 'alto'
          WHEN score_risco >= 40 THEN 'medio'
          ELSE 'baixo'
        END
      ORDER BY total DESC
    `,
      [usuarioId]
    );

    const tiposAnalise = await db.query(
      `
      SELECT
        tipo_consulta,
        COUNT(*) AS total
      FROM consultas
      WHERE user_id = $1
      GROUP BY tipo_consulta
      ORDER BY total DESC
    `,
      [usuarioId]
    );

    return {
      evolucao: evolucao.rows,
      distribuicao_risco: distribuicaoRisco.rows,
      tipos_analise: tiposAnalise.rows,
    };
  }

  async contarDenunciasLink(url: string): Promise<number> {
    const result = await db.query<{ denuncias: number }>(
      `
      SELECT COALESCE(denuncias, 0) AS denuncias
      FROM links_reportados
      WHERE url = $1
      LIMIT 1
    `,
      [url]
    );

    return result.rows.length > 0
      ? Number(result.rows[0].denuncias)
      : 0;
  }

  
async listarEstatisticas(
  usuarioId: string
): Promise<FeedStatistics> {
  const query = `
    SELECT
      (
        SELECT COUNT(*)
        FROM consultas
        WHERE user_id = $1
      ) AS total_consultas,

      (
        SELECT COUNT(*)
        FROM consultas
        WHERE user_id = $1
          AND score_risco >= 70
      ) AS ameacas_evitadas,

      (
        SELECT COUNT(*)
        FROM consultas
        WHERE user_id = $1
          AND score_risco < 70
      ) AS analises_seguras,

      (
        SELECT COUNT(*)
        FROM links_reportados lr
        INNER JOIN consultas c
          ON c.consulta_id = lr.consulta_id
        WHERE c.user_id = $1
      )
      +
      (
        SELECT COUNT(*)
        FROM telefones_reportados
        WHERE user_id = $1
      ) AS total_reportados;
  `;

  const result = await db.query<FeedStatistics>(
    query,
    [usuarioId]
  );

  return result.rows[0];
}


  async criarDenuncia({
    tipo,
    valor,
    usuarioId
  }: CreateDenunciaDTO): Promise<void> {
    if (tipo === "link") {
      const existente = await db.query(
        `
        SELECT link_id
        FROM links_reportados
        WHERE url = $1
        LIMIT 1
      `,
        [valor]
      );

      if (existente.rows.length > 0) {
        await db.query(
          `
          UPDATE links_reportados
          SET denuncias = denuncias + 1
          WHERE link_id = $1
        `,
          [existente.rows[0].link_id]
        );

        return;
      }

      await db.query(
        `
        INSERT INTO links_reportados
          (url, denuncias)
        VALUES
          ($1, 1, )
      `,
        [valor]
      );

      return;
    }

    const existente = await db.query(
      `
      SELECT telefone_id
      FROM telefones_reportados
      WHERE numero = $1
      LIMIT 1
    `,
      [valor]
    );

    if (existente.rows.length > 0) {
      await db.query(
        `
        UPDATE telefones_reportados
        SET denuncias = denuncias + 1
        WHERE telefone_id = $1
      `,
        [existente.rows[0].telefone_id]
      );

      return;
    }

    await db.query(
      `
      INSERT INTO telefones_reportados
        (numero, denuncias, user_id)
      VALUES
        ($1, 1, $2)
    `,
      [valor, usuarioId]
    );
  }
}

export default new FeedRepository();