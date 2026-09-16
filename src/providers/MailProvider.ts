import nodemailer from "nodemailer";

class MailProvider {
  private transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER, 
      pass: process.env.MAIL_PASS,
    }
  });

  async sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
    await this.transporter.sendMail({
      from: `"Guardix" <${process.env.MAIL_USER}>`,
      to, 
      subject,
      text,
    });
  }
}

export default new MailProvider();