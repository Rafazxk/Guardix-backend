import NumverifyClient from "../../../../integrations/NumverifyClient.js";

interface NumverifyResult {
  success?: boolean;
  valid?: boolean;
  error?: {
    type?: string;
  };
}

interface RuleResult {
  score: number;
  message: string | null;
}

class CheckNumverifyRule {

  async execute(
    numero: string
  ): Promise<RuleResult> {

    try {

      const data: NumverifyResult =
        await NumverifyClient.validate(numero);

      if (
        data.success === false ||
        data.error
      ) {

        console.warn(
          "⚠️ Numverify Error:",
          data.error
            ? data.error.type
            : "Unknown"
        );

        return {
          score: 0,
          message: null
        };
      }


      if (data.valid === false) {

        return {
          score: 70,
          message:
            "A operadora informa que este número é inexistente."
        };
      }

      return {
        score: 0,
        message: null
      };

    } catch (e: unknown) {

      return {
        score: 0,
        message: null
      };
    }
  }
}

export default CheckNumverifyRule;