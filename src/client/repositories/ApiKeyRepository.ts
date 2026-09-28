import db from "../../config/database.js";

import type {
  ApiKey,
  CreateApiKeyDTO,
} from "../../types/interfaces/ApiKeyInterface.js";

class ApiKeyRepository {
  async create(
    data: CreateApiKeyDTO,
    keyHash: string,
    prefix: string
  ): Promise<ApiKey> {
    const result = await db.query(
      `
      INSERT INTO api_keys
        (user_id, nome, key_hash, prefix, ativa, created_at)
      VALUES
        ($1, $2, $3, $4, true, NOW())
      RETURNING *;
      `,
      [data.user_id, data.nome, keyHash, prefix]
    );

    return result.rows[0];
  }

  async findAllByUser(userId: string): Promise<ApiKey[]> {
    const result = await db.query(
      `
      SELECT *
      FROM api_keys
      WHERE user_id = $1
      ORDER BY created_at DESC;
      `,
      [userId]
    );

    return result.rows;
  }

  async findById(id: string): Promise<ApiKey | null> {
    const result = await db.query(
      `
      SELECT *
      FROM api_keys
      WHERE id = $1;
      `,
      [id]
    );

    return result.rows[0] ?? null;
  }

  async findByHash(keyHash: string): Promise<ApiKey | null> {
    const result = await db.query(
      `
      SELECT *
      FROM api_keys
      WHERE key_hash = $1;
      `,
      [keyHash]
    );

    return result.rows[0] ?? null;
  }

  async revoke(id: string, userId: string): Promise<boolean> {
    const result = await db.query(
      `
      UPDATE api_keys
      SET ativa = false
      WHERE id = $1
        AND user_id = $2
        AND ativa = true;
      `,
      [id, userId]
    );

    return result.rowCount === 1;
  }
}

export default new ApiKeyRepository();