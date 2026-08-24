import ScoreCalculator from "../scoring/ScoreCalculator.js";

import type {
  LinkFraudContext,
  LinkFraudRule,
  LinkRuleResult,
} from "../../../types/interfaces/LinkFraudTypes.js";

class LinkFraudEngine {
  private rules: LinkFraudRule[];
  private scoreCalculator: ScoreCalculator;

  constructor(
    rules: LinkFraudRule[] = [],
    scoreCalculator: ScoreCalculator = new ScoreCalculator()
  ) {
    this.rules = rules;
    this.scoreCalculator = scoreCalculator;
  }

  async execute(
    context: LinkFraudContext
  ): Promise<LinkFraudContext> {
    const results: LinkRuleResult[] = [];

    for (const rule of this.rules) {
      try {
        const result = await rule.execute(context);

        if (!result) continue;

        results.push(result);

        if (result.mensagem) {
          context.riscos.push(result.mensagem);

          context.regrasVioladas.push({
            regra: rule.constructor.name,
            mensagem: result.mensagem,
          });
        }
      } catch (error: unknown) {
        const message =
          error instanceof Error
            ? error.message
            : "Erro desconhecido";

        console.error(
          `Erro na regra ${rule.constructor.name}:`,
          message
        );
      }
    }

    context.score = this.scoreCalculator.execute(results);

    return context;
  }
}

export default LinkFraudEngine;