console.log("🛡️ GUARDIX CONTENT SCRIPT CARREGADO!");

const API_URL = "http://localhost:10000";

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

document.addEventListener("click", async (event) => {
  const link = event.target.closest("a");

  if (!link || !link.href) {
    return;
  }

  const url = link.href;

  console.log("🔗 LINK DETECTADO:", url);

  event.preventDefault();

  console.log("🛑 NAVEGAÇÃO BLOQUEADA TEMPORARIAMENTE");

  try {
    console.log("🔍 Enviando para o Guardix...");

    const resultado = await analisarLink(url);

    if (resultado.classificacao === "Seguro") {
  console.log("✅ LINK SEGURO — LIBERANDO NAVEGAÇÃO");
  window.location.href = url;
} else {
  console.log("⚠️ LINK SUSPEITO — NAVEGAÇÃO BLOQUEADA");
}


    console.log("🛡️ RESULTADO DA ANÁLISE:", resultado);
  } catch (error) {
    console.error("❌ ERRO AO ANALISAR LINK:", error);
  }
});