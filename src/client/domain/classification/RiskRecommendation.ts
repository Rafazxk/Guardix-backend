class RiskRecommendation {
  execute(score: number): string {
    if (score >= 200) {
      return "NÃO forneça senhas ou dados pessoais.";
    }

    if (score >= 100) {
      return "Evite realizar pagamentos neste endereço.";
    }

    return "Tenha cautela ao navegar.";
  }
}

export default RiskRecommendation;