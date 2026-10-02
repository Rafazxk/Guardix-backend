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

export { analisarLink };