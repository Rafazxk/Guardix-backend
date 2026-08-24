import db from "../../config/database.js";
import { QueryResult } from "pg";
import {
  ConsultaDetalhe,
  CreateConsultaDetalheDTO
} from "../../types/interfaces/ConsultaInterface.js";

class ConsultaDetalhesRepository {

  async salvarDetalhe(
    { consulta_id, regra_ativada, pontuacao, mensagem, risco }: CreateConsultaDetalheDTO
  ): Promise<ConsultaDetalhe> {

    const query = `
      INSERT INTO consulta_detalhes
      (consulta_id, regra_ativada, pontuacao, mensagem, risco)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      consulta_id,
      regra_ativada,
      pontuacao,
      mensagem,
      risco
    ];

    const result: QueryResult<ConsultaDetalhe> =
      await db.query(query, values);

    return result.rows[0];
  }
}

export default new ConsultaDetalhesRepository();