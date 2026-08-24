// Apenas para rodar um teste rápido e ver se sua lógica no controller funciona
async function testar() {
    const userId = "usuario_teste_123";
    
    // Simula a chamada que seu WebhookController faria
    console.log("Simulando processamento para:", userId);
    
    // Aqui você chama a sua função de serviço diretamente
    // Ex: await UserService.virarPro(userId);
    
    console.log("Teste de lógica concluído!");
}

testar();