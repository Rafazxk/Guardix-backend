const params = new URLSearchParams(
  window.location.search
);

const url = params.get("url");

const urlElement =
  document.getElementById("url");

if (url) {
  urlElement.textContent = url;
} else {
  urlElement.textContent =
    "Endereço não identificado.";
}


// ======================================================
// IDENTIFICAR A ABA
// ======================================================

chrome.tabs.getCurrent((tab) => {

  if (!tab?.id) {
    console.error(
      "❌ Não foi possível identificar a aba."
    );

    return;
  }

  const tabId = tab.id;


  // ====================================================
  // CONTINUAR
  // ====================================================

  document
    .getElementById("continue")
    .addEventListener("click", () => {

      if (!url) {
        return;
      }

      console.log(
        "➡️ Continuar:",
        url
      );

      chrome.runtime.sendMessage(
        {
          type: "CONTINUAR_NAVEGACAO",
          tabId: tabId,
          url: url
        },
        (response) => {

          if (chrome.runtime.lastError) {

            console.error(
              "❌ Erro:",
              chrome.runtime.lastError.message
            );

            return;
          }

          if (!response?.ok) {

            console.error(
              "❌ Não foi possível continuar."
            );

            return;
          }

          console.log(
            "✅ Continuando para o site..."
          );

        }
      );
    });


  // ====================================================
  // VOLTAR
  // ====================================================

  document
    .getElementById("back")
    .addEventListener("click", () => {

      console.log(
        "⬅️ Voltando para Google..."
      );

      chrome.runtime.sendMessage(
        {
          type: "VOLTAR_NAVEGACAO",
          tabId: tabId
        },
        (response) => {

          if (chrome.runtime.lastError) {

            console.error(
              "❌ Erro:",
              chrome.runtime.lastError.message
            );

            return;
          }

          if (!response?.ok) {

            console.error(
              "❌ Não foi possível voltar."
            );

            return;
          }

          console.log(
            "✅ Indo para Google..."
          );

        }
      );
    });

});