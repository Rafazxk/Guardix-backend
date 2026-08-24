import pool from "../../config/database.js";
import ConsultaDetalhesRepository from "./ConsultaDetalhesRepository.js";
import { QueryResult } from "pg";
import { Consulta, CreateConsultaDTO } from "../../types/interfaces/ConsultaInterface.js";

class ConsultaRepository {

  async create({
    user_id,
    tipo_consulta,
    score_risco,
    resultado
  }: CreateConsultaDTO): Promise<Consulta> {

    const query = `
      INSERT INTO consultas 
      (user_id, tipo_consulta, score_risco, resultado, data_consulta)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;

    const values = [
      user_id,
      tipo_consulta,
      score_risco,
      JSON.stringify(resultado)
    ];

    const result: QueryResult<Consulta> =
      await pool.query(query, values);

    return result.rows[0];
  }

  async findAllByUser(user_id: string): Promise<Consulta[]> {

    const query = `
      SELECT *
      FROM consultas
      WHERE user_id = $1::uuid
      ORDER BY data_consulta DESC;
    `;

    const result: QueryResult<Consulta> =
      await pool.query(query, [user_id]);

    return result.rows;
  }

  async salvarDetalhes(detalhes: any) {
    return ConsultaDetalhesRepository.salvarDetalhe(detalhes);
  }
}

export default new ConsultaRepository();