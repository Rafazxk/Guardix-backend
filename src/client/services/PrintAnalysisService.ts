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
  private gerarAnaliseDetalhada(
  score: number,
  classificacao: string,
  alertas: string[],
  conclusao: string,
  textoExtraido?: string
): string {

  const explicacao: string[] = [];

  explicacao.push(
    `A imagem foi classificada como ${classificacao}.`
  );

  explicacao.push("");

  explicacao.push(`Score de risco: ${score}.`);

  explicacao.push("");

  if (alertas.length > 0) {
    explicacao.push("Indicadores identificados:");

    alertas.forEach((alerta, index) => {
      explicacao.push(`${index + 1}. ${alerta}`);
    });
  } else {
    explicacao.push(
      "Nenhum indicador de risco foi identificado na imagem."
    );
  }

  explicacao.push("");

  if (textoExtraido) {
    explicacao.push(
      "O OCR identificou texto na imagem, que foi utilizado como parte da análise."
    );
  } else {
    explicacao.push(
      "Nenhum texto relevante foi extraído da imagem."
    );
  }

  explicacao.push("");

  explicacao.push(`Conclusão: ${conclusao}`);

  explicacao.push("");

  if (
    classificacao === "Golpe" ||
    score >= 100
  ) {
    explicacao.push(
      "Recomendação: não realize pagamentos, não forneça dados pessoais e bloqueie o contato responsável pelo envio."
    );
  } else if (
    classificacao === "Suspeito" ||
    score >= 50
  ) {
    explicacao.push(
      "Recomendação: não forneça dados pessoais ou financeiros sem confirmar a autenticidade das informações."
    );
  } else {
    explicacao.push(
      "Recomendação: nenhum risco imediato foi identificado, mas mantenha os cuidados básicos de segurança."
    );
  }

  return explicacao.join("\n");
}

  async execute({
    image_path,
    plano
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
        id_hash,
        plano
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
    id_hash: string,
    plano?: string
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

    const alertas = [...new Set(alertasHumanos)];

const conclusao = this.buildConclusion(
  Number(score),
  classificacao
);

return {
  id_hash,
  texto_extraido,
  score: Number(score),
  classificacao,
  alertas,
  conclusao,

  ...(plano?.toLowerCase() !== "free"
    ? {
        analiseDetalhadaIa: this.gerarAnaliseDetalhada(
          Number(score),
          classificacao,
          alertas,
          conclusao,
          texto_extraido
        )
      }
    : {})
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