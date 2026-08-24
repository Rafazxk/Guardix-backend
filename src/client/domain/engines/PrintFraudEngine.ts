interface PrintAnalysisResult {
  score: number;
  classificacao: string;
  fatoresDetectados: string[];
}

interface DictionaryItem {
  termo: string;
  peso: number;
  label: string;
}

class PrintFraudEngine {
  private containsBankDataRequest(text: string): boolean {
    const termosDadosBancarios = [
      "informações bancárias",
      "dados bancários",
      "dados da conta",
      "número da conta",
      "conta bancária",
    ];

    const termosContextoFinanceiro = [
      "receber o valor",
      "receber",
      "valor da causa",
      "pagamento",
      "transferência",
      "depositar",
    ];

    const solicitaDados = termosDadosBancarios.some((termo) =>
      text.includes(termo)
    );

    const contextoFinanceiro = termosContextoFinanceiro.some(
      (termo) => text.includes(termo)
    );

    return solicitaDados && contextoFinanceiro;
  }


  analyze(text: string): PrintAnalysisResult {
    const cleanText = (text || "")
      .toString()
      .toLowerCase();

    let score = 0;
    const fatoresDetectados: string[] = [];



    const dicionario: DictionaryItem[] = [
      {
        termo: "urgente",
        peso: 40,
        label: "urgencia",
      },
      {
        termo: "agora",
        peso: 30,
        label: "urgencia",
      },
      {
        termo: "imediatamente",
        peso: 40,
        label: "urgencia",
      },
      {
        termo: "até hoje",
        peso: 35,
        label: "urgencia",
      },
      {
        termo: "até às",
        peso: 35,
        label: "urgencia",
      },

      {
        termo: "pix",
        peso: 50,
        label: "dinheiro",
      },
      {
        termo: "depositar",
        peso: 50,
        label: "dinheiro",
      },
      {
        termo: "depósito",
        peso: 50,
        label: "dinheiro",
      },
      {
        termo: "transferência",
        peso: 50,
        label: "dinheiro",
      },

      {
        termo: "valor para receber",
        peso: 50,
        label: "promessa_dinheiro",
      },
      {
        termo: "dinheiro para receber",
        peso: 50,
        label: "promessa_dinheiro",
      },
      {
        termo: "você tem um valor",
        peso: 40,
        label: "promessa_dinheiro",
      },

      {
        termo: "seus dados",
        peso: 50,
        label: "solicitacao_dados",
      },
      {
        termo: "dados pessoais",
        peso: 50,
        label: "solicitacao_dados",
      },
      {
        termo: "senha",
        peso: 60,
        label: "solicitacao_dados",
      },
      {
        termo: "cpf",
        peso: 40,
        label: "solicitacao_dados",
      },

      {
        termo: "código",
        peso: 60,
        label: "codigo",
      },

      {
        termo: "banco",
        peso: 30,
        label: "banco",
      },
    ];

    dicionario.forEach((item) => {
      if (cleanText.includes(item.termo)) {
        score += item.peso;

        if (!fatoresDetectados.includes(item.label)) {
          fatoresDetectados.push(item.label);
        }
      }
    });

    if (this.containsBankImpersonation(cleanText)) {
      score += 20;

      if (!fatoresDetectados.includes("banco")) {
        fatoresDetectados.push("banco");
      }
    }

    if (this.containsAdvancePaymentScam(cleanText)) {
      score += 80;

      if (
        !fatoresDetectados.includes(
          "pagamento_antecipado"
        )
      ) {
        fatoresDetectados.push(
          "pagamento_antecipado"
        );
      }
    }

    if (this.containsBankDataRequest(cleanText)) {
      score += 70;

      if (!fatoresDetectados.includes("solicitacao_dados_bancarios")) {
        fatoresDetectados.push("solicitacao_dados_bancarios");
      }
    }
    let classificacaoFinal =
      score >= 100
        ? "Golpe"
        : score >= 50
          ? "Suspeito"
          : "Seguro";

    const termosComprovante: string[] = [
      "comprovante",
      "comprovante de",
      "transação",
    ];

    const termosSucesso: string[] = [
      "realizado",
      "pago",
      "sucesso",
      "concluída",
    ];

    const ehComprovante =
      termosComprovante.some((termo) =>
        cleanText.includes(termo)
      ) &&
      termosSucesso.some((sucesso) =>
        cleanText.includes(sucesso)
      );

    if (ehComprovante) {
      classificacaoFinal =
        "Comprovante Detectado";
      score = 0;
    }

    return {
      score,
      classificacao: classificacaoFinal,
      fatoresDetectados,
    };
  }

  containsAdvancePaymentScam(
    text: string
  ): boolean {
    const temPagamento =
      text.includes("depositar") ||
      text.includes("depósito") ||
      text.includes("pagar") ||
      text.includes("taxa");

    const temBeneficio =
      text.includes("receber") ||
      text.includes("liberar") ||
      text.includes("prêmio") ||
      text.includes("valor");

    return temPagamento && temBeneficio;
  }

  containsUrgency(text: string): boolean {
    return (
      text.includes("urgente") ||
      text.includes("agora") ||
      text.includes("imediatamente") ||
      text.includes("até hoje") ||
      text.includes("até às")
    );
  }

  containsMoneyRequest(text: string): boolean {
    return (
      text.includes("pix") ||
      text.includes("transferência") ||
      text.includes("manda dinheiro") ||
      text.includes("depositar") ||
      text.includes("depósito")
    );
  }

  containsCodeRequest(text: string): boolean {
    return (
      text.includes("código") ||
      text.includes("verificação")
    );
  }

  containsBankImpersonation(text: string): boolean {
    const termosBanco: string[] = [
      "sou do banco",
      "central do banco",
      "senha do banco",
      "código do banco",
    ];

    return termosBanco.some((termo) =>
      text.includes(termo)
    );
  }
}

export default new PrintFraudEngine();