class MailProvider {
  async sendMail({
    to,
    subject,
    text,
  }: {
    to: string;
    subject: string;
    text: string;
  }) {
    const apiKey = process.env.BREVO_API_KEY;
    const fromEmail = process.env.MAIL_FROM;
    const fromName = process.env.MAIL_FROM_NAME || "Guardix";

    if (!apiKey) {
      throw new Error("BREVO_API_KEY não configurada.");
    }

    if (!fromEmail) {
      throw new Error("MAIL_FROM não configurado.");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: fromName,
          email: fromEmail,
        },
        to: [
          {
            email: to,
          },
        ],
        subject,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Brevo recusou o envio (${response.status}): ${errorBody}`
      );
    }
  }
}

export default new MailProvider();