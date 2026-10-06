import PhoneFraudEngine from "../domain/engines/PhoneFraudEngine.js";
import PhoneReportsRepository from "../repositories/PhoneReportsRepository.js";

interface PhoneAnalysisInput {
  numero: string;
  plano?: string;
}

interface PhoneAnalysisResult {
  score: number;
  tipoGolpe: string;
  denuncias: number;
  servico: string;
  [key: string]: unknown;
}

class PhoneAnalysisService {

  private gerarAnaliseDetalhada(
  numero: string,
  score: number,
  classificacao: string,
  tipoGolpe: string,
  denuncias: number,
  alertas: string[],
  conclusao: string
): string {

  const explicacao: string[] = [];

  explicacao.push(
    `O número ${numero} foi classificado como ${classificacao}.`
  );

  explicacao.push("");

  explicacao.push(
    `Score de risco: ${score}/200.`
  );

  explicacao.push(
    `Tipo de ameaça: ${tipoGolpe}.`
  );

  explicacao.push("");

  if (alertas.length > 0) {
    explicacao.push("Indicadores de risco encontrados:");

    alertas.forEach((alerta, index) => {
      explicacao.push(`${index + 1}. ${alerta}`);
    });
  } else {
    explicacao.push(
      "Nenhum indicador de risco foi identificado pelas regras de análise."
    );
  }

  explicacao.push("");

  if (denuncias > 0) {
    explicacao.push(
      `O número possui ${denuncias} denúncia(s) registrada(s) no Guardix.`
    );
  } else {
    explicacao.push(
      "Não existem denúncias registradas para este número."
    );
  }

  explicacao.push("");

  explicacao.push(`Conclusão da análise: ${conclusao}`);

  explicacao.push("");

  if (score >= 120) {
    explicacao.push(
      "Recomendação: não forneça dados pessoais, códigos de autenticação ou informações financeiras para este contato."
    );
  } else if (score >= 60) {
    explicacao.push(
      "Recomendação: tenha cautela e confirme a identidade do contato antes de fornecer qualquer informação."
    );
  } else {
    explicacao.push(
      "Recomendação: nenhum risco significativo foi identificado, mas mantenha os cuidados básicos de segurança."
    );
  }

  return explicacao.join("\n");
}

  async execute({
    numero,
    plano
  }: PhoneAnalysisInput): Promise<PhoneAnalysisResult> {

    if (!numero) {
      throw new Error("Telefone é obrigatório");
    }

    const numeroLimpo = numero.replace(/\D/g, "");

    if (numeroLimpo.length !== 10 && numeroLimpo.length !== 11) {
      throw new Error("Número de telefone inválido.");
    }

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

    const resultado: PhoneAnalysisResult = {
  ...result,
  tipoGolpe,
  denuncias: totalDenuncias,
  servico: "Guardix Phone Intelligence"
};

if (plano?.toLowerCase() !== "free") {
  return {
    ...resultado,
    analiseDetalhadaIa: this.gerarAnaliseDetalhada(
      numeroLimpo,
      result.score,
      result.classificacao,
      tipoGolpe,
      totalDenuncias,
      result.alertas,
      result.conclusao
    )
  };
}


    return resultado;
  }
}

export default new PhoneAnalysisService();

