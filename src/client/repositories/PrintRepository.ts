import pool from "../../config/database.js";
import { Print, CreatePrintDTO } from "../../types/interfaces/PrintInterface.js";

class PrintRepository {

  async findByHash(id_hash: string): Promise<Print | undefined> {

    const query = `
      SELECT *
      FROM prints_analisados
      WHERE id_hash = $1
    `;

    const result = await pool.query<Print>(query, [id_hash]);

    return result.rows[0];
  }

  async save(dados: CreatePrintDTO): Promise<Print> {

    const {
      id_hash,
      consulta_id,
      caminho_arquivo,
      texto_extraido,
      tipo_golpe,
      score_risco
    } = dados;

    const query = `
      INSERT INTO prints_analisados
      (
        id_hash,
        consulta_id,
        caminho_arquivo,
        texto_extraido,
        tipo_golpe,
        score_risco
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      id_hash,
      consulta_id,
      caminho_arquivo,
      texto_extraido,
      tipo_golpe,
      score_risco
    ];

    const result = await pool.query<Print>(query, values);

    return result.rows[0];
  }
}

export default new PrintRepository();