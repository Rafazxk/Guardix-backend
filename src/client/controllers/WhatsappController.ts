import { Request, Response } from "express";

import WhatsAppBotService from "../services/WhatsappService.js";

class WhatsAppController {
  async receberWebhook(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const body = req.body;

      if (body.object !== "whatsapp_business_account") {
        return res.sendStatus(404);
      }

      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const message = value?.messages?.[0];

      // Responde imediatamente para a Meta
      res.status(200).json({
        status: "EVENT_RECEIVED",
      });

      if (message) {
        await WhatsAppBotService.handleWhatsAppMessage(message);
      }

      return res;
    } catch (err: unknown) {
      console.error(
        "Erro ao processar webhook do WhatsApp:",
        err
      );

      return res;
    }
  }

  async verificarWebhook(
    req: Request,
    res: Response
  ): Promise<Response> {
    console.log(
      "Recebendo GET de verificação da Meta:",
      req.query
    );

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const VERIFY_TOKEN =
      process.env.WHATSAPP_VERIFY_TOKEN;

    if (
      mode === "subscribe" &&
      token === VERIFY_TOKEN
    ) {
      console.log("✅ Webhook do WhatsApp verificado.");

      return res.status(200).send(challenge);
    }

    console.error("❌ Falha na verificação do webhook.");

    return res.sendStatus(403);
  }
}

export default new WhatsAppController();