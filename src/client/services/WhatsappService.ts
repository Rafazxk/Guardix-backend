import axios from "axios";
import fs from "fs";
import path from "path";

import ConsultaAnalysisService, {
  type TipoConsulta,
} from "./ConsultaAnalysisService.js";

class WhatsAppBotService {
  private token = process.env.WHATSAPP_ACCESS_TOKEN;
  private phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  private async sendWhatsAppMessage(
  to: string,
  bodyText: string
): Promise<void> {
  try {
    await axios.post(
      `https://graph.facebook.com/v25.0/${this.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: bodyText,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Mensagem enviada pelo WhatsApp.");
  } catch (error: any) {
    console.error(
      "❌ ERRO REAL DA META:",
      JSON.stringify(error.response?.data, null, 2)
    );

    throw error;
  }
}

  private async baixarESalvarMidiaMeta(
    mediaId: string
  ): Promise<string> {
    const mediaResponse = await axios.get(
      `https://graph.facebook.com/v25.0/${mediaId}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      }
    );

    const mediaUrl = mediaResponse.data.url;

    const imageResponse = await axios.get(mediaUrl, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      responseType: "arraybuffer",
    });

    const uploadsDir = path.resolve("./uploads");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localPath = path.join(
      uploadsDir,
      `${mediaId}.jpg`
    );

    fs.writeFileSync(
      localPath,
      Buffer.from(imageResponse.data)
    );

    return localPath;
  }

private ehNumeroTelefone(text: string): boolean {
  const apenasNumeros = text.replace(/\D/g, "");

  return apenasNumeros.length >= 10 && apenasNumeros.length <= 13;
}

  public async handleWhatsAppMessage(
    messageData: any
  ): Promise<void> {
    const senderPhone = messageData.from;

    let tipoConsulta: TipoConsulta;
    let inputPayload: {
      url?: string;
      numero?: string;
      image_path?: string;
    };

    if (messageData.type === "text") {
  const text = messageData.text.body.trim();
  const textoNormalizado = text.toLowerCase();

  const saudacoes = [
    "oi",
    "olá",
    "ola",
    "oie",
    "eai",
    "e aí",
    "bom dia",
    "boa tarde",
    "boa noite",
    "menu",
    "ajuda",
  ];

  if (saudacoes.includes(textoNormalizado)) {
    await this.sendWhatsAppMessage(
      senderPhone,
      `🛡️ *Olá! Eu sou o Guardix.*

Posso analisar:

🔗 *Links suspeitos*
📱 *Números de telefone*
🖼️ *Imagens e prints*

Envie o conteúdo que deseja verificar.`
    );

    return;
  }

  if (text.startsWith("http")) {
    tipoConsulta = "link";

    inputPayload = {
      url: text,
    };
  } else if (this.ehNumeroTelefone(text)) {
    tipoConsulta = "telefone";

    inputPayload = {
      numero: text,
    };
  } else {
    await this.sendWhatsAppMessage(
      senderPhone,
      `❓ Não consegui identificar o conteúdo.

Envie um *link*, um *número de telefone* ou uma *imagem/print* para eu analisar.`
    );

    return;
  }
} else if (messageData.type === "image") {
      tipoConsulta = "print";

      const localImagePath =
        await this.baixarESalvarMidiaMeta(
          messageData.image.id
        );

      inputPayload = {
        image_path: localImagePath,
      };
    } else {
      await this.sendWhatsAppMessage(
        senderPhone,
        "❌ No momento, consigo analisar links, números de telefone e imagens."
      );

      return;
    }

    try {
      const resultado =
        await ConsultaAnalysisService.execute(
          tipoConsulta,
          inputPayload
        );

      const valorIdentificado =
        tipoConsulta === "link"
          ? inputPayload.url
          : tipoConsulta === "telefone"
            ? inputPayload.numero
            : "Imagem";

      const respostaWhatsApp = `
🛡️ *Resultado da Análise Guardix*

📊 *Score de risco:* ${resultado.score}/100

🛡️ *Classificação:* ${
        resultado.classificacao || resultado.nivel || "Indefinido"
      }

📋 *Conclusão:* ${
        resultado.conclusao || "Análise concluída."
      }

🔍 *Detalhes:*

• Tipo: ${tipoConsulta}
• Alvo: ${valorIdentificado}
• Tipo de golpe: ${resultado.tipoGolpe || "Indeterminado"}
• Denúncias: ${resultado.denuncias || 0}
      `.trim();

      await this.sendWhatsAppMessage(
        senderPhone,
        respostaWhatsApp
      );
    } catch (error) {
      console.error(
        "Erro ao processar consulta via WhatsApp:",
        error
      );

      await this.sendWhatsAppMessage(
        senderPhone,
        "❌ Ocorreu um erro ao analisar este conteúdo. Tente novamente."
      );
    }
  }
}

export default new WhatsAppBotService();