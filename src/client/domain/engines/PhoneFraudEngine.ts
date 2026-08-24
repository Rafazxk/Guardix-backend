import ValidateNumberRule from "../phone/rules/ValidateNumberRule.js";
import CheckReportsRule from "../phone/rules/CheckReportsRule.js";
import ValidateFormatRule from "../phone/rules/ValidateFormatRule.js";

interface PhoneRuleResult {
  score: number;
  message: string | null;
}

interface PhoneRule {
  execute(numero: string): Promise<PhoneRuleResult>;
}

interface PhoneAnalysisResult {
  score: number;
  maxScore: number;
  classificacao: string;
  alertas: string[];
  conclusao: string;
}

class PhoneFraudEngine {

  async analyze(
    numero: string
  ): Promise<PhoneAnalysisResult> {

    let score = 0;
    const riscos: string[] = [];

    const numeroLimpo = numero.replace(/\D/g, "");

    const rules: PhoneRule[] = [
      new ValidateNumberRule(),
      new CheckReportsRule(),
      new ValidateFormatRule()
    ];

    for (const rule of rules) {

      try {

        const result = await rule.execute(
          numeroLimpo
        );

        if (
          result &&
          result.score > 0 &&
          result.message
        ) {

          console.log(
            `Regra: ${rule.constructor.name} | ADICIONOU ${result.score} pts`
          );

          score += result.score;

          riscos.push(result.message);
        }

      } catch (e: unknown) {

        const message =
          e instanceof Error
            ? e.message
            : "Erro desconhecido";

        console.error(
          `Erro na regra ${rule.constructor.name}:`,
          message
        );
      }
    }

    let classificacao = "Seguro";

    if (score >= 120) {
      classificacao = "Golpe";
    } else if (score >= 60) {
      classificacao = "Suspeito";
    }

    console.log(
      "classificacao final - ",
      classificacao
    );

    return {
      score,
      maxScore: 200,
      classificacao,
      alertas: riscos,
      conclusao:
        score >= 60
          ? "Cuidado! Este número possui flags de risco."
          : "Nenhum risco significativo identificado."
    };
  }
}

export default new PhoneFraudEngine();