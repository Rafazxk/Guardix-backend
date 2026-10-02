import { analisarLink } from "../services/GuardixApi.js";

const status = document.getElementById("status");

chrome.tabs.query(
  { active: true, currentWindow: true },
  async (tabs) => {
    const tab = tabs[0];

    if (!tab?.url) {
      status.textContent = "Não foi possível obter a URL.";
      return;
    }

    console.log("URL atual:", tab.url);

    try {
      status.textContent = "Analisando...";

      const resultado = await analisarLink(tab.url);

      console.log("Resultado Guardix:", resultado);

      status.textContent = resultado.classificacao;
    } catch (error) {
      console.error("Erro ao consultar Guardix:", error);

      status.textContent = "Erro ao conectar ao Guardix.";
    }
  }
);