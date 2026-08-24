import type {
  LinkRiskMapping,
  LinkRiskInterpretation,
} from "../../../types/interfaces/LinkInterfaces.js";


class LinkRiskInterpreter {
  private readonly mapping: Record<string, LinkRiskMapping> = {
    marca: {
      texto: "O site tenta imitar uma empresa conhecida.",
      tipo: "Phishing / Roubo de Dados",
    },

    TLD: {
      texto: "O endereço utiliza uma terminação suspeita.",
      tipo: "Ameaça de Infraestrutura",
    },

    recente: {
      texto: "Este site foi criado há pouco tempo.",
      tipo: "Golpe Financeiro",
    },

    subdomínios: {
      texto: "A estrutura do link é confusa e oculta o destino real.",
      tipo: "Redirecionamento Malicioso",
    },

    hífens: {
      texto: "O nome do site parece artificial e forçado.",
      tipo: "Engenharia Social",
    },
  };

  execute(riscos: string[]): LinkRiskInterpretation {
    const alertas: string[] = [];
    const tipos = new Set<string>();

    for (const risco of riscos) {
      const chave = Object.keys(this.mapping).find((key) =>
        risco.includes(key)
      );

      if (!chave) {
        alertas.push("Atividade incomum detectada.");
        continue;
      }

      alertas.push(this.mapping[chave].texto);
      tipos.add(this.mapping[chave].tipo);
    }

    return {
      alertas: [...new Set(alertas)],
      tipos: [...tipos],
    };
  }
}

export default LinkRiskInterpreter;