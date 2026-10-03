import type { Request, Response } from "express";
import PaymentWebhookService from "../services/PaymentWebhookService.js";

class PaymentWebhookController {
  async handle(req: Request, res: Response): Promise<Response> {
    try {
      const webhookToken = process.env.ASAAS_WEBHOOK_TOKEN;

      if (!webhookToken) {
        console.error(
          "ASAAS_WEBHOOK_TOKEN não configurado."
        );

        return res.status(500).json({
          message: "Webhook não configurado.",
        });
      }

      const receivedToken = req.headers["asaas-access-token"];

      if (receivedToken !== webhookToken) {
        return res.status(401).json({
          message: "Token do webhook inválido.",
        });
      }

      await PaymentWebhookService.process(req.body);

      return res.status(200).json({
        received: true,
      });
    } catch (error) {
      console.error(
        "Erro ao processar webhook do Asaas:",
        error
      );

      return res.status(500).json({
        message: "Erro ao processar webhook.",
      });
    }
  }
}

export default new PaymentWebhookController();