interface CreateCheckoutInput {
  userId: string;
  plano: string;
}

interface AsaasCheckoutResponse {
  id: string;
  link?: string;
  status?: string;
}

class PaymentService {
  async createCheckout({
    userId,
    plano,
  }: CreateCheckoutInput): Promise<AsaasCheckoutResponse & {
    success: boolean;
    userId: string;
    plano: string;
  }> {
    if (!plano) {
    throw new Error("Plano não informado.");
}

if (plano !== "pro" && plano !== "premium") {
    throw new Error("Plano inválido.");
}

const apiUrl = process.env.ASAAS_API_URL;
const apiKey = process.env.ASAAS_API_KEY;

const proPrice = Number(process.env.GUARDIX_PRO_PRICE);
const premiumPrice = Number(process.env.GUARDIX_PREMIUM_PRICE);

if (!apiUrl || !apiKey) {
    throw new Error("Configuração do Asaas não encontrada.");
}

const price = plano === "pro" ? proPrice : premiumPrice;

if (!price || price <= 0) {
    throw new Error(
        `Preço do plano ${plano === "pro" ? "Pro" : "Premium"} não configurado.`
    );
}

    const successUrl = process.env.GUARDIX_PAYMENT_SUCCESS_URL;
    const cancelUrl = process.env.GUARDIX_PAYMENT_CANCEL_URL;
    const expiredUrl = process.env.GUARDIX_PAYMENT_EXPIRED_URL;

    if (!successUrl || !cancelUrl || !expiredUrl) {
      throw new Error("URLs de pagamento não configuradas.");
    }

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const nextDueDate = tomorrow
      .toISOString()
      .slice(0, 10);

    const payload = {
      billingTypes: ["CREDIT_CARD"],
      chargeTypes: ["RECURRENT"],
      minutesToExpire: 60,

      externalReference: userId,

      callback: {
        successUrl,
        cancelUrl,
        expiredUrl,
      },

    items: [
    {
        name: plano === "pro" ? "Guardix Pro" : "Guardix Premium",
        description:
            plano === "pro"
                ? "Plano Pro mensal do Guardix"
                : "Plano Premium mensal do Guardix",
        quantity: 1,
        value: price,
    },
],

      subscription: {
        cycle: "MONTHLY",
        nextDueDate,
      },
    };

    const response = await fetch(`${apiUrl}/checkouts`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        access_token: apiKey,
        "User-Agent": "Guardix/1.0.0",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro retornado pelo Asaas:", data);

      throw new Error(
        data?.errors?.[0]?.description ||
          "Erro ao criar checkout no Asaas."
      );
    }

    return {
      success: true,
      userId,
      plano,
      id: data.id,
      link: data.link,
      status: data.status,
    };
  }
}

export default new PaymentService();