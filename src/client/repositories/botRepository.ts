import ConsultaRepository from './ConsultaRepository.js';

async function processarMensagemWhatsApp(userId: string, tipo: 'link' | 'telefone' | 'print', alvo: string, resultadoAnalise: any) {
    try {
        // Salva exatamente no mesmo banco e tabelas que o seu dashboard usa
        const novaConsulta = await ConsultaRepository.create({
            user_id: userId,
            tipo_consulta: tipo,
            score_risco: resultadoAnalise.score, 
            resultado: resultadoAnalise,         
            alvo: alvo                           
        });

        return novaConsulta;
    } catch (error) {
        console.error('Erro ao salvar consulta do WhatsApp:', error);
        throw error;
    }
}