import pool from "../../config/database.js";

interface WhatsappConnection {
  id: string;
  user_id: string;
  phone: string;
  ativo: boolean;
  created_at: Date;
}

class WhatsappConnectionRepository {
  async create(
    userId: string,
    phone: string
  ): Promise<WhatsappConnection> {
    const result = await pool.query<WhatsappConnection>(
      `
      INSERT INTO whatsapp_connections (
        user_id,
        phone
      )
      VALUES ($1, $2)
      RETURNING
        id,
        user_id,
        phone,
        ativo,
        created_at
      `,
      [userId, phone]
    );

    return result.rows[0];
  }

  private normalizePhone(phone: string): string {
  const numbers = phone.replace(/\D/g, "");

  if (numbers.startsWith("55") && numbers.length === 13) {
    return numbers.slice(2);
  }

  return numbers;
}

async findByUserId(
  userId: string
): Promise<WhatsappConnection | null> {
  const result = await pool.query<WhatsappConnection>(
    `
    SELECT
      id,
      user_id,
      phone,
      ativo,
      created_at
    FROM whatsapp_connections
    WHERE user_id = $1
      AND ativo = true
    LIMIT 1
    `,
    [userId]
  );

  return result.rows[0] ?? null;
}

 async findByPhone(phone: string): Promise<WhatsappConnection | null> {
  const result = await pool.query<WhatsappConnection>(
    `
    SELECT
      id,
      user_id,
      phone,
      ativo,
      created_at
    FROM whatsapp_connections
    WHERE phone = $1
    LIMIT 1
    `,
    [phone]
  );

  return result.rows[0] ?? null;
}

  async deactivate(phone: string): Promise<void> {
    await pool.query(
      `
      UPDATE whatsapp_connections
      SET ativo = false
      WHERE phone = $1
      `,
      [phone]
    );
  }

async reactivate(
  connectionId: string
): Promise<WhatsappConnection> {
  const result = await pool.query<WhatsappConnection>(
    `
    UPDATE whatsapp_connections
    SET ativo = true
    WHERE id = $1
    RETURNING
      id,
      user_id,
      phone,
      ativo,
      created_at
    `,
    [connectionId]
  );

  return result.rows[0];
}
}

export default new WhatsappConnectionRepository();