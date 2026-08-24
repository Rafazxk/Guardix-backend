export interface LinkFraudContext {
  url: string;
  domain: string;
  score: number;
  riscos: string[];
  regrasVioladas: RegraViolada[];
}

export interface RegraViolada {
  regra: string;
  mensagem: string;
}

export interface LinkRuleResult {
  pontuacao: number;
  mensagem?: string;
}

export interface LinkFraudRule {
  execute(
    context: LinkFraudContext
  ): Promise<LinkRuleResult | null>;
}