class RiskClassifier {
  execute(score: number): string {
    console.log(
      "calculando classificação para score: ",
      score
    );

    if (score >= 80) {
      return "Alto risco";
    }

    if (score >= 50) {
      return "Médio risco";
    }

    return "Seguro";
  }
}

export default RiskClassifier;