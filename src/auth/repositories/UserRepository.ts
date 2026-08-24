import pool from "../../config/database.js";

export interface User {
  user_id: string;
  nome: string;
  email: string;
  senha: string;
  tipo_pessoa?: string;
  plano?: string;
  created_at?: Date;
}

interface CreateUserDTO {
  nome: string;
  email: string;
  senha: string;
  tipo_pessoa?: string;
}

class UserRepository {
  async create({ nome, email, senha, tipo_pessoa }: CreateUserDTO): Promise<User> {
    const query = `
      INSERT INTO users (nome, email, senha, tipo_pessoa)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;

    const values = [nome, email, senha, tipo_pessoa];

    const result = await pool.query<User>(query, values);
    return result.rows[0];
  }

  async findById(userId: string | number): Promise<User | undefined> {
    console.log("DEBUG: Buscando ID exatamente:", userId);
    
    const result = await pool.query<User>('SELECT * FROM users WHERE user_id = $1::uuid', [userId]);

    if (result.rowCount === 0) {
      const allUsers = await pool.query<{ user_id: string }>('SELECT user_id FROM users');
      console.log("DEBUG: IDs disponíveis no banco:", allUsers.rows.map(r => r.user_id));
    }
    
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query<User>(query, [email]);
    return result.rows[0];
  }
  
  async updatePlan(userId: string | number, novoPlano: string): Promise<void> {
    const query = `
      UPDATE users 
      SET plano = $1 
      WHERE user_id = $2
    `;
    
    await pool.query(query, [novoPlano, userId]);
  }
}

export default new UserRepository();