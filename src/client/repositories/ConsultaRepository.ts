import pool from "../../config/database.js";
import ConsultaDetalhesRepository from "./ConsultaDetalhesRepository.js";
import { QueryResult } from "pg";
import { Consulta, CreateConsultaDTO } from "../../types/interfaces/ConsultaInterface.js";

class ConsultaRepository {

 async create(
  data: CreateConsultaDTO & { alvo?: string }
): Promise<Consulta> {

  const client = await pool.connect();

  try {

    await client.query("BEGIN");

    const consultaQuery = `
      INSERT INTO consultas
      (
        user_id,
        key_id,
        tipo_consulta,
        score_risco,
        resultado,
        data_consulta
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING *;
    `;

    const consultaValues = [
      data.user_id,
      data.key_id ?? null,
      data.tipo_consulta,
      data.score_risco,
      JSON.stringify(data.resultado)
    ];

    const consultaResult = await client.query(
      consultaQuery,
      consultaValues
    );

    const novaConsulta = consultaResult.rows[0];

    if (data.alvo) {

      if (data.tipo_consulta === "link") {

        await client.query(
          `
            INSERT INTO links_analisados
            (consulta_id, url)
            VALUES ($1, $2)
          `,
          [
            novaConsulta.consulta_id,
            data.alvo
          ]
        );

      } else if (data.tipo_consulta === "telefone") {

        await client.query(
          `
            INSERT INTO telefones_reportados
            (consulta_id, numero)
            VALUES ($1, $2)
          `,
          [
            novaConsulta.consulta_id,
            data.alvo
          ]
        );

      } else if (data.tipo_consulta === "print") {

        await client.query(
          `
            INSERT INTO prints_analisados
            (consulta_id, caminho_arquivo)
            VALUES ($1, $2)
          `,
          [
            novaConsulta.consulta_id,
            data.alvo
          ]
        );
      }
    }

    await client.query("COMMIT");

    return novaConsulta;

  } catch (error) {

    await client.query("ROLLBACK");

    throw error;

  } finally {

    client.release();

  }
}

async findAllByUser(user_id: string): Promise<any[]> {
    const query = `
      SELECT 
        c.consulta_id AS id,
        TO_CHAR(c.data_consulta, 'DD/MM/YYYY') AS data,
        c.tipo_consulta AS tipo,
        c.score_risco AS status,
        COALESCE(
          la.url, 
          tr.numero, 
          pa.caminho_arquivo, 
          c.resultado::json->>'url', 
          c.resultado::json->>'numero', 
          c.resultado::json->>'alvo',
          'Alvo não especificado'
        ) AS alvo
      FROM consultas c
      LEFT JOIN links_analisados la ON c.consulta_id = la.consulta_id
      LEFT JOIN telefones_reportados tr ON c.consulta_id = tr.consulta_id
      LEFT JOIN prints_analisados pa ON c.consulta_id = pa.consulta_id
      WHERE c.user_id = $1::uuid
      ORDER BY c.data_consulta DESC;
    `;

    const result = await pool.query(query, [user_id]);
    return result.rows;
  }

  async salvarDetalhes(detalhes: any) {
    return ConsultaDetalhesRepository.salvarDetalhe(detalhes);
  }

  
}

export default new ConsultaRepository();