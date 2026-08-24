interface RuleResult {
  pontuacao: number;
}

class ScoreCalculator {
  execute(results: RuleResult[]): number {
    return results.reduce(
      (total, rule) => total + rule.pontuacao,
      0
    );
  }
}

export default ScoreCalculator;