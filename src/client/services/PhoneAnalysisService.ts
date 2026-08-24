import PhoneFraudEngine from "../domain/engines/PhoneFraudEngine.js";
import PhoneReportsRepository from "../repositories/PhoneReportsRepository.js";

interface PhoneAnalysisInput {
  numero: string;
}

interface PhoneAnalysisResult {
  score: number;
  tipoGolpe: string;
  denuncias: number;
  servico: string;
  [key: string]: unknown;
}

class PhoneAnalysisService {

  async execute({
    numero
  }: PhoneAnalysisInput): Promise<PhoneAnalysisResult> {

    if (!numero) {
      throw new Error("Telefone é obrigatório");
    }

    const numeroLimpo = numero.replace(/\D/g, "");

    const result = await PhoneFraudEngine.analyze(numeroLimpo);

    const totalDenuncias =
      await PhoneReportsRepository.countReports(numeroLimpo);

    let tipoGolpe = "Análise Padrão";

    if (totalDenuncias > 20) {
      tipoGolpe = "Fraude de Alta Recorrência";
    } else if (result.score >= 100) {
      tipoGolpe = "Engenharia Social / Fraude";
    } else if (result.score >= 50) {
      tipoGolpe = "Suspeita de Atividade Maliciosa";
    }

    return {
      ...result,
      tipoGolpe,
      denuncias: totalDenuncias,
      servico: "Guardix Phone Intelligence"
    };
  }
}

export default new PhoneAnalysisService();