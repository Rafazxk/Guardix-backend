console.log("🛡️ GUARDIX SERVICE WORKER CARREGADO!");

const API_URL = "http://localhost:10000";

const avisosPendentes = new Map();
const urlsAutorizadas = new Map();

async function analisarLink(url) {
  const response = await fetch(`${API_URL}/extension/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status}`);
  }

  return await response.json();
}


// ======================================================
// MENSAGENS DA TELA DE AVISO
// ======================================================

chrome.runtime.onMessage.addListener(
  (message, sender, sendResponse) => {

    // ==============================================
    // CONTINUAR
    // ==============================================

    if (message.type === "CONTINUAR_NAVEGACAO") {

      const tabId = message.tabId;
      const url = message.url;

      if (!tabId || !url) {
        sendResponse({ ok: false });
        return;
      }

      const aviso = avisosPendentes.get(tabId);

      if (!aviso || aviso.url !== url) {
        console.warn(
          "⚠️ Não existe autorização para:",
          url
        );

        sendResponse({ ok: false });
        return;
      }

      console.log(
        "➡️ CONTINUANDO PARA:",
        url
      );

      // Autoriza essa URL uma vez
      urlsAutorizadas.set(tabId, url);

      // Remove o aviso pendente
      avisosPendentes.delete(tabId);

      // Navega para o site
      chrome.tabs.update(tabId, {
        url: url
      });

      sendResponse({ ok: true });

      return;
    }


    // ==============================================
    // VOLTAR
    // ==============================================

    if (message.type === "VOLTAR_NAVEGACAO") {

      const tabId = message.tabId;

      if (!tabId) {
        sendResponse({ ok: false });
        return;
      }

      console.log(
        "⬅️ VOLTANDO PARA O GOOGLE"
      );

      // Remove qualquer aviso pendente
      avisosPendentes.delete(tabId);

      // Vai diretamente para o Google
      chrome.tabs.update(tabId, {
        url: "https://www.google.com/"
      });

      sendResponse({ ok: true });

      return;
    }
  }
);


// ======================================================
// MONITORAMENTO DAS NAVEGAÇÕES
// ======================================================

chrome.webNavigation.onBeforeNavigate.addListener(
  async (details) => {

    // Ignora iframes
    if (details.frameId !== 0) {
      return;
    }

    const tabId = details.tabId;
    const url = details.url;
    
    if (
      url === "about:blank" ||
      url.startsWith("chrome://") ||
      url.startsWith("chrome-extension://")
    ) {
      return;
    }


    // ==============================================
    // URL AUTORIZADA PELO BOTÃO CONTINUAR
    // ==============================================

    const urlAutorizada =
      urlsAutorizadas.get(tabId);

    if (urlAutorizada === url) {

      console.log(
        "✅ NAVEGAÇÃO AUTORIZADA:",
        url
      );

      // Remove a autorização.
      urlsAutorizadas.delete(tabId);

      return;
    }


    // ==============================================
    // NOVA NAVEGAÇÃO
    // ==============================================

    console.log(
      "🌐 NAVEGAÇÃO DETECTADA:",
      url
    );


    try {

      console.log(
        "🔍 ANALISANDO URL..."
      );

      const resultado =
        await analisarLink(url);

      console.log(
        "🛡️ RESULTADO:",
        resultado
      );


      // ============================================
      // ALTO RISCO
      // ============================================

      if (
        resultado.classificacao === "Alto risco"
      ) {

        console.log(
          "🚨 LINK DE ALTO RISCO:",
          url
        );

        // Guarda a URL que foi bloqueada
        avisosPendentes.set(tabId, {
          url: url
        });


        const warningUrl =
          chrome.runtime.getURL(
            `warning/warning.html?url=${encodeURIComponent(url)}`
          );


        console.log(
          "🚨 ABRINDO TELA DE PERIGO"
        );


        await chrome.tabs.update(tabId, {
          url: warningUrl
        });


        return;
      }


      // ============================================
      // SEGURO
      // ============================================

      console.log(
        "✅ URL SEGURA:",
        url
      );

    } catch (error) {

      console.error(
        "❌ ERRO AO ANALISAR:",
        error
      );

    }
  }
);


// ======================================================
// LIMPEZA
// ======================================================

chrome.tabs.onRemoved.addListener((tabId) => {

  avisosPendentes.delete(tabId);

  urlsAutorizadas.delete(tabId);

});