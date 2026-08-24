import pool from "../../config/database.js";
import type { QueryResult } from "pg";
import type { BlacklistItem } from "../../types/interfaces/BlacklistInterface.js";
import type { IBlacklistRepository } from "./interfaces/IBlackListRepository.js";

class BlacklistRepository implements IBlacklistRepository {
  async findByDomain(
    domain: string
  ): Promise<BlacklistItem | undefined> {
    const query = `
      SELECT valor, motivo
      FROM blacklist
      WHERE tipo = 'dominio'
      AND ($1 = valor OR $1 LIKE '%.' || valor)
      LIMIT 1;
    `;

    const result: QueryResult<BlacklistItem> =
      await pool.query(query, [domain]);

    return result.rows[0];
  }
}

export default new BlacklistRepository();