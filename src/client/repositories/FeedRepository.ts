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
        url AS valor,
        SUM(denuncias) AS total
      FROM links_reportados
      GROUP BY url
      HAVING SUM(denuncias) >= 1

      UNION ALL

      SELECT
        'telefone' AS tipo,
        numero AS valor,
        SUM(denuncias) AS total
      FROM telefones_reportados
      GROUP BY numero
      HAVING SUM(denuncias) >= 1

      ORDER BY total DESC
      LIMIT 5;
    `;

    const result = await db.query<FeedItem>(query);

    return result.rows;
  }

  async listarEstatisticas(): Promise<FeedStatistics> {

    const query = `
      SELECT
        (SELECT COUNT(*) FROM consultas) AS total_consultas,

        (
          SELECT COUNT(*)
          FROM telefones_reportados
          WHERE status = 'bloqueado'
        )
        +
        (
          SELECT COUNT(*)
          FROM links_reportados
          WHERE status = 'bloqueado'
        ) AS ameacas_evitadas,

        (
          SELECT COUNT(*)
          FROM telefones_reportados
        )
        +
        (
          SELECT COUNT(*)
          FROM links_reportados
        ) AS total_reportados;
    `;

    const result =
      await db.query<FeedStatistics>(query);

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