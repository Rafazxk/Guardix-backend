import db from "../../config/database.js";
import WebhookEventRepository from "../repositories/WebhookEventRepository.js";

interface CheckoutWebhook {
  id: string;

  event: string;

  checkout?: {
    id?: string;
    externalReference?: string;
    status?: string;
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

    await db.query(
      `
      UPDATE users
      SET plano = 'premium'
      WHERE user_id = $1
      `,
      [userId]
    );

    await WebhookEventRepository.create({
      eventId: event.id,
      event: event.event,
    });

    console.log(
      `Plano Premium ativado para o usuário ${userId}.`
    );
  }
}

export default new PaymentWebhookService();