import pool from "../../config/database.js";

export type VerificationCodeType =
  | "EMAIL_VERIFICATION"
  | "PHONE_VERIFICATION"
  | "PASSWORD_RESET";

export interface VerificationCode {
  id: string;
  user_id: string;
  code_hash: string;
  type: VerificationCodeType;
  expires_at: Date;
  attempts: number;
  used_at?: Date | null;
  data_criacao: Date;
}

export interface CreateVerificationCodeDTO {
  user_id: string;
  code_hash: string;
  type: VerificationCodeType;
  expires_at: Date;
}

class VerificationCodeRepository {
  async create({
    user_id,
    code_hash,
    type,
    expires_at,
  }: CreateVerificationCodeDTO): Promise<VerificationCode> {
    const query = `
      INSERT INTO verification_codes
        (user_id, code_hash, type, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const result = await pool.query<VerificationCode>(
      query,
      [user_id, code_hash, type, expires_at]
    );

    return result.rows[0];
  }

  async findValidCode(
    userId: string,
    type: VerificationCodeType
  ): Promise<VerificationCode | undefined> {
    const query = `
      SELECT *
      FROM verification_codes
      WHERE user_id = $1
        AND type = $2
        AND used_at IS NULL
        AND expires_at > CURRENT_TIMESTAMP
      ORDER BY data_criacao DESC
      LIMIT 1;
    `;

    const result = await pool.query<VerificationCode>(
      query,
      [userId, type]
    );

    return result.rows[0];
  }

  async markAsUsed(id: string): Promise<void> {
    await pool.query(
      `
        UPDATE verification_codes
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `,
      [id]
    );
  }

  async incrementAttempts(id: string): Promise<void> {
    await pool.query(
      `
        UPDATE verification_codes
        SET attempts = attempts + 1
        WHERE id = $1
      `,
      [id]
    );
  }

  async invalidatePreviousCodes(userId: string, type: VerificationCodeType): Promise<void> {
    await pool.query(`
     UPDATE verification_codes SET used_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
       AND type = $2
       AND used_at IS NULL `,
      [userId, type]);
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    const query = ` 
         UPDATE users 
         SET email_verified = TRUE 
         WHERE user_id = $1::uuid `;

    await pool.query(query, [userId]);


  }
}

export default new VerificationCodeRepository();

