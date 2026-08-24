interface RuleResult {
  score: number;
  message: string | null;
}

class ValidateNumberRule {

  async execute(numero: string): Promise<RuleResult> {

    const apenasNumeros =
      numero.replace(/\D/g, "");

    // Aceitar de 10 a 15 dígitos
    const regex = /^\d{10,15}$/;

    if (!regex.test(apenasNumeros)) {
      return {
        score: 70,
        message:
          "Número com formato internacional ou local inválido."
      };
    }

    return {
      score: 0,
      message: null
    };
  }
}

export default ValidateNumberRule;