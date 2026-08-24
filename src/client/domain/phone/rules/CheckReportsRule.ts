import PhoneReportsRepository from "../../../repositories/PhoneReportsRepository.js";

interface RuleResult {
  score: number;
  message: string | null;
}

class CheckReportsRule {

  async execute(
    numero: string
  ): Promise<RuleResult> {

    const res =
      await PhoneReportsRepository.countReports(numero);

    const count =
      parseInt(String(res)) || 0;

    if (count === 0) {
      return {
        score: 0,
        message: null
      };
    }

    console.log(
      "numero de denuncias: ",
      count
    );

    if (count >= 5) {
      return {
        score: 100,
        message:
          "Muitas denúncias vinculadas a este número!"
      };
    }

    return {
      score: 20,
      message:
        `Este número possui ${count} denúncia(s) no sistema.`
    };
  }
}

export default CheckReportsRule;