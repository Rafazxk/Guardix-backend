import db from "../../config/database.js";

import {
  FeedItem,
  FeedStatistics,
  CreateDenunciaDTO,
} from "../../types/interfaces/FeedInterface.js";

class FeedRepository {
  async listarFeed(): Promise<FeedItem[]> {
  const query = `
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
    GROUP BY lr.url

    UNION ALL

    SELECT
      'telefone' AS tipo,
      tr.numero AS valor,
      SUM(tr.denuncias)::text AS total
    FROM telefones_reportados tr
    GROUP BY tr.numero

    ORDER BY total DESC;
  `;

  const result = await db.query<FeedItem>(query);

  return result.rows;
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
          FROM links_reportados l
          JOIN consultas c ON l.consulta_id = c.consulta_id
          WHERE c.user_id = $1
        )
        +
        (
          SELECT COUNT(*)
          FROM telefones_reportados t
          JOIN consultas c ON t.consulta_id = c.consulta_id
          WHERE c.user_id = $1
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
          ($1, 1)
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
        (numero, denuncias)
      VALUES
        ($1, 1)
    `,
    [valor]
  );
}
}

export default new FeedRepository();