import pkg from "google-libphonenumber";

const { PhoneNumberUtil } = pkg;
const phoneUtil = PhoneNumberUtil.getInstance();

interface RuleResult {
  score: number;
  message: string | null;
}

class ValidateFormatRule {
  async execute(numero: string): Promise<RuleResult> {
    try {

      let numeroParaValidar = numero.replace(/\D/g, "");
   
      if (!numeroParaValidar.startsWith("+")) {
        numeroParaValidar = "+" + numeroParaValidar;
      }

      const numberProto = phoneUtil.parse(numeroParaValidar);

      const isValid = phoneUtil.isValidNumber(numberProto);


      
      if (!isValid) {
        return {
          score: 70,
          message: "O formato do número é impossível ou inexistente."
        };
      }

      return {
        score: 0,
        message: null
      };

    } catch (error: unknown) {
      // Caso o parse lance uma exceção (ex: formato totalmente irreconhecível)
      return {
        score: 70,
        message: "Número inválido: formato internacional não reconhecido."
      };
    }
  }
}

export default ValidateFormatRule;