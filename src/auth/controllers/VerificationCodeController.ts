import type { Request, Response } from "express";

import VerificationCodeService from "../services/verificationCodeService.js";
import VerificationCodeRepository from "../repositories/VerificationCodeRepository.js";
import UserRepository from "../repositories/UserRepository.js";
import MailProvider from "../../providers/MailProvider.js";

class VerificationCodeController {

  async sendVerificationCode(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { email, type } = req.body;

      if (!email) {
        return res.status(400).json({ message: "O e-mail é obrigatório." });
      }

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const result = await VerificationCodeService.create(
        user.user_id,
        type || "EMAIL_VERIFICATION"
      );

      await MailProvider.sendMail({
        to: user.email,
        subject: "Seu código de acesso - Guardix",
        text: `Olá, ${user.nome}! Seu código de verificação é: ${result.code}`,
      });

      return res.status(200).json({
        message: "Código de verificação enviado para seu E-mail.",
      });
    } catch (error) {
      console.error("Erro ao enviar código:", error);
      return res.status(500).json({ message: "Erro interno ao enviar e-mail de verificação." });
    }
  }

  async verifyEmail(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({ message: "E-mail e código são obrigatórios." });
      }

      const user = await UserRepository.findByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      const isValid = await VerificationCodeService.verify(
        user.user_id,
        "EMAIL_VERIFICATION",
        code
      );

      if (!isValid) {
        return res.status(400).json({
          message: "Código inválido ou expirado.",
        });
      }

      await VerificationCodeRepository.markEmailAsVerified(user.user_id);

      return res.status(200).json({
        message: `Seja bem-vindo ao Guardix, ${user.nome}!`,
        token: "authenticated", 
        user: {
          id: user.user_id,
          nome: user.nome,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Erro ao verificar código:", error);
      return res.status(500).json({ message: "Erro interno ao verificar o código." });
    }
  }
}

export default new VerificationCodeController();