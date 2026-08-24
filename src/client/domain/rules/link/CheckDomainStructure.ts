import type {
  LinkFraudContext,
  LinkFraudRule,
  LinkRuleResult,
} from "../../../../types/interfaces/LinkFraudTypes.js";

class CheckDomainStructure implements LinkFraudRule {
  async execute(
    context: LinkFraudContext
  ): Promise<LinkRuleResult | null> {
    const domain = context.domain;

    if (!domain) {
      return null;
    }

    let pontuacao = 0;
    const mensagens: string[] = [];

    const partes = domain.split(".");
    const tld = partes[partes.length - 1].toLowerCase();

    const temTldComposto =
      partes.length >= 3 &&
      (partes[partes.length - 2] === "com" ||
        partes[partes.length - 2] === "net" ||
        partes[partes.length - 2] === "gov" ||
        partes[partes.length - 2] === "edu");

    if (partes.length > 3) {
      pontuacao += 20;
      mensagens.push("Excesso de subdomínios detectado");
    } else if (partes.length === 3 && !temTldComposto) {
      pontuacao += 20;
      mensagens.push(
        "Presença de subdomínio em domínio de terceiros"
      );
    }

    const tldSuspeitos: Record<string, number> = {
      ru: 50,
      tk: 45,
      xyz: 40,
      top: 35,
      gq: 35,
      pw: 40,
      online: 30,
      site: 30,
    };

    const pontosTLD = tldSuspeitos[tld];

    if (pontosTLD) {
      pontuacao += pontosTLD;
      mensagens.push(
        `TLD de alto risco detectado: .${tld}`
      );
    }

    const partesAteRaiz = partes.slice(0, -1).join(".");
    const hifens = (partesAteRaiz.match(/-/g) || []).length;

    if (hifens > 1) {
      pontuacao += 25;
      mensagens.push("Uso excessivo de hífens");
    }

    if (pontuacao === 0) {
      return null;
    }

    return {
      pontuacao,
      mensagem: mensagens.join(" | "),
    };
  }
}

export default CheckDomainStructure;