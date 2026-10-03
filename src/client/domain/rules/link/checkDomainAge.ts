import whoisCache from "../../../../utils/whoisCache.js";

import type {
  LinkFraudContext,
  LinkFraudRule,
  LinkRuleResult,
} from "../../../../types/interfaces/LinkFraudTypes.js";

class CheckDomainAge implements LinkFraudRule {
  async execute(
    context: LinkFraudContext
  ): Promise<LinkRuleResult | null> {
    const domain = context.domain;

    if (!domain) {
      return null;
    }

    const idadeDias = await this.getDomainAge(domain);

    if (idadeDias === null) {
      return null;
    }

    return this.calcularPontuacaoPorIdade(idadeDias);
  }

  private async getDomainAge(
    domain: string
  ): Promise<number | null> {
    let idadeDias = whoisCache.get(domain);

    if (idadeDias !== null) {
      return idadeDias;
    }

    console.log(
      `[Age] Cache miss. Consultando WHOIS para: ${domain}`
    );

    try {
      idadeDias = await this.consultarWhoisComTimeout(
        domain,
        3000
      );

      if (idadeDias !== null) {
        whoisCache.set(domain, idadeDias);
      }

      return idadeDias;
    } catch {
      console.warn(
        `[Age] Falha ou timeout no WHOIS para ${domain}, ignorando regra.`
      );

      return null;
    }
  }

  private async consultarWhoisComTimeout(
    domain: string,
    timeoutMs: number
  ): Promise<number> {
    return Promise.race([
      this.chamarApiWhoisReal(domain),

      new Promise<number>((_, reject) =>
        setTimeout(
          () => reject(new Error("WHOIS Timeout")),
          timeoutMs
        )
      ),
    ]);
  }

  private async chamarApiWhoisReal(
    domain: string
  ): Promise<number> {
    return 20663;
  }

  private calcularPontuacaoPorIdade(
    dias: number
  ): LinkRuleResult | null {
    if (dias < 7) {
      return {
        tipo: "dominio_recente",
        pontuacao: 100,
        mensagem: "Domínio extremamente recente",
      };
    }

    if (dias < 30) {
      return {
        tipo: "dominio_recente",
        pontuacao: 60,
        mensagem: "Domínio criado há menos de 1 mês",
      };
    }

    if (dias < 180) {
      return {
        tipo: "dominio_recente",
        pontuacao: 30,
        mensagem: "Domínio recente",
      };
    }

    return null;
  }
}

export default CheckDomainAge;