import db from "../../config/database.js";
import {
  FeedItem,
  FeedStatistics,
  CreateDenunciaDTO
} from "../../types/interfaces/FeedInterface.js";

class FeedRepository {

  async listarFeed(): Promise<FeedItem[]> {
    const query = `
    SELECT 
      'link' AS tipo,
      lr.url AS valor,
      COUNT(DISTINCT c.user_id) AS total
    FROM links_reportados lr
    INNER JOIN consultas c ON lr.consulta_id = c.consulta_id
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
      COUNT(DISTINCT c.user_id) AS total
    FROM telefones_reportados tr
    INNER JOIN consultas c ON tr.consulta_id = c.consulta_id
    GROUP BY tr.numero

    ORDER BY total DESC
    LIMIT 1;
  `;

    const result = await db.query<FeedItem>(query);
    return result.rows;
  }
  async listarEstatisticas(usuarioId: string | number): Promise<FeedStatistics> {
    const query = `
    SELECT
      (SELECT COUNT(*) FROM consultas WHERE user_id = $1) AS total_consultas,

      -- Conta apenas o que é considerado alto risco / ameaça
      (
        SELECT COUNT(*) FROM consultas 
        WHERE user_id = $1 AND (resultado LIKE '%Alto risco%' OR score_risco >= 70)
      ) AS ameacas_evitadas,

      -- Conta apenas o que é seguro
      (
        SELECT COUNT(*) FROM consultas 
        WHERE user_id = $1 AND (resultado LIKE '%Seguro%' OR score_risco < 70)
      ) AS analises_seguras,

      -- Denúncias
      (
        SELECT COUNT(*) FROM links_reportados l
        JOIN consultas c ON l.consulta_id = c.consulta_id
        WHERE c.user_id = $1
      ) + (
        SELECT COUNT(*) FROM telefones_reportados t
        JOIN consultas c ON t.consulta_id = c.consulta_id
        WHERE c.user_id = $1
      ) AS reportados;
  `;

    const result = await db.query<FeedStatistics>(query, [usuarioId]);
    return result.rows[0];
  }

  async criarDenuncia({
    tipo,
    valor
  }: CreateDenunciaDTO): Promise<void> {

    if (tipo === "link") {

      await db.query(
        `
          INSERT INTO links_reportados
          (url, denuncias)
          VALUES ($1, 1)
        `,
        [valor]
      );

      return;
    }

    await db.query(
      `
        INSERT INTO telefones_reportados
        (numero, denuncias)
        VALUES ($1, 1)
      `,
      [valor]
    );
  }
}

export default new FeedRepository();