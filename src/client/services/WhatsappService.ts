import ConsultaService from './ConsultaService.js';
import axios from 'axios';

class WhatsAppBotService {
    private token = process.env.WHATSAPP_ACCESS_TOKEN;
    private phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    private async sendWhatsAppMessage(to: string, bodyText: string): Promise<void> {
        await axios.post(
            `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`,
            { messaging_product: 'whatsapp', to, text: { body: bodyText } },
            { headers: { Authorization: `Bearer ${this.token}` } }
        );
    }

    private async baixarE2SalvarMidiaMeta(mediaId: string): Promise<string> {
        const mediaResponse = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        const mediaUrl = mediaResponse.data.url;

        const imageResponse = await axios.get(mediaUrl, {
            headers: { Authorization: `Bearer ${this.token}` },
            responseType: 'arraybuffer'
        });

        const fs = await import('fs');
        const path = await import('path');
        const localPath = path.resolve(`./uploads/${mediaId}.jpg`);
        
        fs.writeFileSync(localPath, Buffer.from(imageResponse.data));

        return localPath;
    }

    public async handleWhatsAppMessage(messageData: any): Promise<void> {
        const senderPhone = messageData.from;
        const userId = "uuid-do-usuario-aqui";

        let tipoConsulta: 'link' | 'telefone' | 'print' = 'link';
        let inputPayload: any = {};

        if (messageData.type === 'text') {
            const text = messageData.text.body.trim();
            if (text.startsWith('http')) {
                tipoConsulta = 'link';
                inputPayload = { url: text };
            } else {
                tipoConsulta = 'telefone';
                inputPayload = { numero: text };
            }
        } else if (messageData.type === 'image') {
            tipoConsulta = 'print';
            const localImagePath = await this.baixarE2SalvarMidiaMeta(messageData.image.id);
            inputPayload = { image_path: localImagePath };
        }

        try {
            const resultadoFormatado = await ConsultaService.execute({
                user_id: userId,
                tipo: tipoConsulta,
                input: inputPayload
            });

            const respostaWhatsApp = `
🚨 *Resultado da Análise Anti-Fraude*
📊 *Score de Risco:* ${resultadoFormatado.score}/100
🛡️ *Classificação:* ${resultadoFormatado.classificacao}
📋 *Conclusão:* ${resultadoFormatado.conclusao}

🔍 *Detalhes:*
• Alvo: ${resultadoFormatado.detalhes.valor}
• Tipo: ${resultadoFormatado.detalhes.tipo}
            `.trim();

            await this.sendWhatsAppMessage(senderPhone, respostaWhatsApp);

        } catch (error) {
            console.error("Erro ao processar consulta via WhatsApp:", error);
            await this.sendWhatsAppMessage(senderPhone, "❌ Ocorreu um erro ao processar sua análise. Tente novamente.");
        }
    }
}

export default new WhatsAppBotService();