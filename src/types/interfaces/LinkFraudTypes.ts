export interface LinkFraudContext {
  url: string;
  domain: string;
  score: number;
  riscos: string[];
  regrasVioladas: RegraViolada[];
}

export type LinkFraudType =
  | "blacklist"
  | "typosquatting"
  | "estrutura_suspeita"
  | "dominio_recente"
  | "tld_suspeito"
  | "phishing";

export interface RegraViolada {
  regra: string;
  tipo: LinkFraudType;
  pontuacao: number;
  mensagem: string;
}

export interface LinkRuleResult {
  pontuacao: number;
  tipo: LinkFraudType;
  mensagem?: string;
}

export interface LinkFraudRule {
  execute(
    context: LinkFraudContext
  ): Promise<LinkRuleResult | null>;
}