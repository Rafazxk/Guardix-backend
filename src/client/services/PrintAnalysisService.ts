import crypto from "crypto";
import fs from "fs";

import { extractTextFromImage } from "../../utils/ocr.js";
import PrintFraudEngine from "../domain/engines/PrintFraudEngine.js";
import PrintRepository from "../repositories/PrintRepository.js";

import {
  PrintAnalysisInput,
  PrintAnalysisData,
  PrintAnalysisResponse
} from "../../types/interfaces/PrintInterface.js";

class PrintAnalysisService {

  async execute({
    image_path
  }: PrintAnalysisInput): Promise<PrintAnalysisResponse> {

    if (!image_path) {
      throw new Error("A imagem é obrigatória.");
    }

    try {

      const imageBuffer = fs.readFileSync(image_path);

      const id_hash = crypto
        .createHash("sha256")
        .update(imageBuffer)
        .digest("hex");

      const analiseExistente =
        await PrintRepository.findByHash(id_hash);

      if (analiseExistente) {

        console.log(
          "--- [SERVICE] Imagem já conhecida, retornando cache ---"
        );

        return this.formatResponse(
          {
            score: analiseExistente.score_risco,
            classificacao: analiseExistente.tipo_golpe,
            fatores: []
          },
          id_hash
        );
      }

      const text = await extractTextFromImage(image_path);

      console.log(
        "debug - texto extraído do print:",
        text
      );

      const result = PrintFraudEngine.analyze(text);

      return this.formatResponse(
        {
          score: result.score,
          classificacao: result.classificacao,
          fatores: result.fatoresDetectados,
          texto_extraido: text
        },
        id_hash
      );

    } catch (error) {

      console.error(
        "[PrintService Error]:",
        error
      );

      throw new Error(
        "Erro ao processar inteligência da imagem."
      );
    }
  }

  private formatResponse(
    dados: PrintAnalysisData,
    id_hash: string
  ): PrintAnalysisResponse {

    const {
      score,
      classificacao,
      fatores,
      texto_extraido
    } = dados;

    const alertasHumanos = (fatores || []).map((fator) => {

      const termo = fator
        .toString()
        .toLowerCase();

      if (termo.includes("urgencia")) {
        return "Pressão psicológica para agir rápido.";
      }

      if (
        termo.includes("dinheiro") ||
        termo.includes("pix")
      ) {
        return "Solicitação de transferência de valores.";
      }

      if (termo.includes("banco")) {
        return "Tentativa de se passar por instituição financeira.";
      }

      return "Padrão suspeito detectado.";
    });

    return {
      id_hash,
      texto_extraido,
      score: Number(score),
      classificacao,
      alertas: [...new Set(alertasHumanos)],
      conclusao: this.buildConclusion(
        Number(score),
        classificacao
      )
    };
  }

  private buildConclusion(
    score: number,
    classificacao: string
  ): string {

    if (classificacao === "Comprovante Detectado") {
      return "Documento de transação identificado. Verifique seu saldo.";
    }

    if (
      classificacao === "Golpe" ||
      score >= 100
    ) {
      return "BLOQUEIE O CONTATO. Identificamos padrões claros de golpe.";
    }

    if (
      classificacao === "Suspeito" ||
      score >= 50
    ) {
      return "ATENÇÃO: Elementos suspeitos detectados. Não forneça dados.";
    }

    return "Não detectamos riscos imediatos nesta imagem.";
  }
}

export default new PrintAnalysisService();