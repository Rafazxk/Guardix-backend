interface LinkFraudContext {
  domain: string;
}

interface RuleResult {
  regra: string;
  pontuacao: number;
  mensagem: string;
}

class CheckSuspiciousTLD {

  async execute(
    context: LinkFraudContext
  ): Promise<RuleResult | null> {

    const domain = context.domain;

    if (!domain) {
      return null;
    }

    const tld = this.extractTLD(domain);

    const suspiciousTLDs: string[] = [
      "xyz",
      "top",
      "click",
      "shop",
      "online",
      "info",
      "site",
      "biz",
      "cc"
    ];

    if (suspiciousTLDs.includes(tld)) {

      return {
        regra: "CHECK_SUSPICIOUS_TLD",
        pontuacao: 40,
        mensagem: `TLD Suspeito: .${tld}`
      };
    }

    return null;
  }

  extractTLD(domain: string): string {

    const parts = domain.split(".");

    return parts[parts.length - 1];
  }
}

export default CheckSuspiciousTLD;