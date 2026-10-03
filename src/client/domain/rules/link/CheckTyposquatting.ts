import type {
  LinkFraudContext,
  LinkFraudRule,
  LinkRuleResult,
} from "../../../../types/interfaces/LinkFraudTypes.js";

class CheckTyposquatting implements LinkFraudRule {
  async execute(
    context: LinkFraudContext
  ): Promise<LinkRuleResult | null> {
    const domain = context.domain;

    if (!domain) {
      return null;
    }

    const fullCleanDomain = domain
      .replace(/[-.]/g, "")
      .toLowerCase();

    const parts = domain.split(".");

    const rawMainPart = parts[0]
      .replace(/-/g, "")
      .toLowerCase();

    const normalizedMainPart =
      this.normalizeLeetspeak(rawMainPart);

    const popularDomains: string[] = [
      "amazon",
      "google",
      "facebook",
      "paypal",
      "nubank",
      "itau",
      "bradesco",
    ];

    const normalizedFull =
      this.normalizeLeetspeak(fullCleanDomain);

    for (const legit of popularDomains) {
      if (normalizedFull.includes(legit)) {
        const isOfficial =
          domain === `${legit}.com` ||
          domain === `${legit}.net` ||
          domain.endsWith(`.${legit}.com`) ||
          domain.endsWith(`.${legit}.net`) ||
          domain === `${legit}.com.br` ||
          domain.endsWith(`.${legit}.com.br`);

        if (!isOfficial) {
          return {
            tipo: "typosquatting",
            pontuacao: 100,
            mensagem: `Marca ${legit} detectada em domínio não oficial`,
          };
        }
      }

      const distance = this.levenshtein(
        normalizedMainPart,
        legit
      );

      if (distance >= 1 && distance <= 2) {
        return {
          tipo: "typosquatting",
          pontuacao: 80,
          mensagem:
            `Domínio visualmente parecido com ${legit}`,
        };
      }
    }

    return null;
  }

  private normalizeLeetspeak(str: string): string {
    return str
      .replace(/0/g, "o")
      .replace(/1/g, "l")
      .replace(/3/g, "e")
      .replace(/5/g, "s")
      .replace(/4/g, "a")
      .replace(/@/g, "a");
  }

  private levenshtein(
    a: string,
    b: string
  ): number {
    if (a.length === 0) {
      return b.length;
    }

    if (b.length === 0) {
      return a.length;
    }

    const matrix: number[][] = Array.from(
      { length: b.length + 1 },
      (_, i) => [i]
    );

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(
                matrix[i - 1][j - 1] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j] + 1
              );
      }
    }

    return matrix[b.length][a.length];
  }
}

export default CheckTyposquatting;