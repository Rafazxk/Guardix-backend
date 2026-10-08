interface CreateCheckoutInput {
    userId: string;
    plano: "pro" | "premium";
    periodo: "monthly" | "yearly";
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
        periodo,
    }: CreateCheckoutInput): Promise<
        AsaasCheckoutResponse & {
            success: boolean;
            userId: string;
            plano: string;
            periodo: string;
        }
    > {
        if (!plano) {
            throw new Error("Plano não informado.");
        }

        if (plano !== "pro" && plano !== "premium") {
            throw new Error("Plano inválido.");
        }

        if (!periodo) {
            throw new Error("Período não informado.");
        }

        if (periodo !== "monthly" && periodo !== "yearly") {
            throw new Error("Período inválido.");
        }

        const apiUrl = process.env.ASAAS_API_URL?.replace(/\/+$/, "");
        const apiKey = process.env.ASAAS_API_KEY;

        console.log("🔎 ASAAS_API_URL carregada:", JSON.stringify(apiUrl));
console.log(
  "🔎 ASAAS_API_KEY é produção:",
  apiKey?.startsWith("$aact_prod_")
);

        const proMonthlyPrice = Number(
            process.env.GUARDIX_PRO_MONTHLY_PRICE
        );

        const proYearlyPrice = Number(
            process.env.GUARDIX_PRO_YEARLY_PRICE
        );

        const premiumMonthlyPrice = Number(
            process.env.GUARDIX_PREMIUM_MONTHLY_PRICE
        );

        const premiumYearlyPrice = Number(
            process.env.GUARDIX_PREMIUM_YEARLY_PRICE
        );

        if (!apiUrl || !apiKey) {
            throw new Error(
                "Configuração do Asaas não encontrada."
            );
        }

        const isSandboxUrl = apiUrl.includes(
            "api-sandbox.asaas.com"
        );

        const isProductionUrl = apiUrl.includes(
            "api.asaas.com"
        );

        if (!isSandboxUrl && !isProductionUrl) {
            throw new Error(
                "ASAAS_API_URL inválida. Use uma URL de Sandbox ou Produção do Asaas."
            );
        }

        if (
            isSandboxUrl &&
            !apiKey.startsWith("$aact_hmlg_")
        ) {
            throw new Error(
                "A ASAAS_API_URL está configurada para Sandbox, mas a ASAAS_API_KEY não é uma chave de Sandbox."
            );
        }

        if (
            isProductionUrl &&
            !apiKey.startsWith("$aact_prod_")
        ) {
            throw new Error(
                "A ASAAS_API_URL está configurada para Produção, mas a ASAAS_API_KEY não é uma chave de Produção."
            );
        }

        const price =
            plano === "pro"
                ? periodo === "monthly"
                    ? proMonthlyPrice
                    : proYearlyPrice
                : periodo === "monthly"
                    ? premiumMonthlyPrice
                    : premiumYearlyPrice;

        if (!price || price <= 0) {
            throw new Error(
                `Preço do plano ${
                    plano === "pro" ? "Pro" : "Premium+"
                } para o período ${
                    periodo === "monthly" ? "mensal" : "anual"
                } não configurado.`
            );
        }

        const successUrl =
            process.env.GUARDIX_PAYMENT_SUCCESS_URL;

        const cancelUrl =
            process.env.GUARDIX_PAYMENT_CANCEL_URL;

        const expiredUrl =
            process.env.GUARDIX_PAYMENT_EXPIRED_URL;

        if (!successUrl || !cancelUrl || !expiredUrl) {
            throw new Error(
                "URLs de pagamento não configuradas."
            );
        }

        const tomorrow = new Date(
            Date.now() + 24 * 60 * 60 * 1000
        );

        const nextDueDate = tomorrow
            .toISOString()
            .slice(0, 10);

        const isYearly = periodo === "yearly";

        const planName =
            plano === "pro"
                ? "Guardix Pro"
                : "Guardix Premium+";

        const periodLabel = isYearly
            ? "anual"
            : "mensal";

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
                    name: planName,
                    description: `${planName} - plano ${periodLabel} do Guardix`,
                    quantity: 1,
                    value: price,
                },
            ],

            subscription: {
                cycle: isYearly
                    ? "YEARLY"
                    : "MONTHLY",
                nextDueDate,
            },
        };

        const response = await fetch(
            `${apiUrl}/checkouts`,
            {
                method: "POST",

                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    access_token: apiKey,
                    "User-Agent": "Guardix/1.0.0",
                },

                body: JSON.stringify(payload),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(
                "Erro retornado pelo Asaas:",
                data
            );

            throw new Error(
                data?.errors?.[0]?.description ||
                    "Erro ao criar checkout no Asaas."
            );
        }

        return {
            success: true,
            userId,
            plano,
            periodo,
            id: data.id,
            link: data.link,
            status: data.status,
        };
    }
}

export default new PaymentService();