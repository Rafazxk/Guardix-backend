import pool from "../../config/database.js";
import { QueryResult } from "pg";

export interface ConsultaStats {
  status: string;
  total_denuncias: string;
}

class ConsultaStatsService {
  async obterStatsLive(): Promise<ConsultaStats[]> {
    const result: QueryResult<ConsultaStats> = await pool.query(`
      SELECT
        status,
        COUNT(*) AS total_denuncias
      FROM telefones_reportados
      WHERE data_criacao > CURRENT_DATE - INTERVAL '24 hours'
      GROUP BY status
      ORDER BY total_denuncias DESC
      LIMIT 3
    `);

    return result.rows;
  }
}

export default new ConsultaStatsService();