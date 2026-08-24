import pool from "../../config/database.js";

class PhoneReportsRepository {

  async countReports(numero: string): Promise<number> {

    const query = `
      SELECT COALESCE(SUM(denuncias), 0) AS total
      FROM telefones_reportados
      WHERE numero = $1
    `;

    const result = await pool.query<{ total: string }>(
      query,
      [numero]
    );

    return parseInt(result.rows[0].total, 10);
  }
}

export default new PhoneReportsRepository();