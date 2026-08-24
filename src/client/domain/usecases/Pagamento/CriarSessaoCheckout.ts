import Stripe from "stripe";

interface CheckoutData {
  userId: string;
  email: string;
}

class CriarSessaoCheckout {

  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(
      process.env.STRIPE_SECRET_KEY as string
    );
  }

  async execute(
    { userId, email }: CheckoutData
  ): Promise<string> {

    try {

      const session =
        await this.stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          mode: "subscription",

          customer_email: email,

          line_items: [
            {
              price: process.env.STRIPE_PRICE_ID as string,
              quantity: 1
            }
          ],

          success_url:
            `${process.env.APP_URL}/dashboard?status=success`,

          cancel_url:
            `${process.env.APP_URL}/dashboard?status=canceled`,

          client_reference_id: userId
        });

      return session.id;

    } catch (error: unknown) {

      const message =
        error instanceof Error
          ? error.message
          : "Erro desconhecido";

      console.error(
        "ERRO DO STRIPE:",
        message
      );

      throw new Error(
        `Falha no Stripe: ${message}`
      );
    }
  }
}

export default CriarSessaoCheckout;