import db from "../../config/database.js";

import WebhookEventRepository from "../repositories/WebhookEventRepository.js";

interface CheckoutWebhook {
  id: string;
  event: string;

  checkout?: {
    id?: string;
    externalReference?: string;
    status?: string;

    items?: Array<{
      name?: string;
      description?: string;
      value?: number;
    }>;
  };
}

class PaymentWebhookService {
  async process(event: CheckoutWebhook): Promise<void> {
    if (event.event !== "CHECKOUT_PAID") {
      console.log(`Evento Asaas ignorado: ${event.event}`);
      return;
    }

    const jaProcessado = await WebhookEventRepository.exists(event.id);

    if (jaProcessado) {
      console.log(`Webhook já processado: ${event.id}`);
      return;
    }

    const userId = event.checkout?.externalReference;

    if (!userId) {
      throw new Error(
        "CHECKOUT_PAID recebido sem externalReference."
      );
    }

    const nomePlano = event.checkout?.items?.[0]?.name;

    const plano =
      nomePlano === "Guardix Pro"
        ? "pro"
        : nomePlano === "Guardix Premium"
          ? "premium"
          : null;

    if (!plano) {
      throw new Error(
        `Plano não identificado no checkout: ${nomePlano ?? "não informado"}`
      );
    }

    await db.query(
      `
      UPDATE users
      SET plano = $1
      WHERE user_id = $2
      `,
      [plano, userId]
    );

    await WebhookEventRepository.create({
      eventId: event.id,
      event: event.event,
    });

    console.log(
      `Plano ${plano} ativado para o usuário ${userId}.`
    );
  }
}

export default new PaymentWebhookService();