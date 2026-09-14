
import type { Request, Response } from "express";

import VerificationCodeService from "../services/verificationCodeService.js";
import VerificationCodeRepository from "../repositories/VerificationCodeRepository.js";

class VerificationCodeController {

  async sendVerificationCode(
    req: Request,
    res: Response
  ): Promise<Response> {

    const { userId, type } = req.body;

    const result = await VerificationCodeService.create(
      userId,
      type
    );

    return res.status(200).json({
      message: "Código de verificação criado.",
      code: result.code,
    });
  }

  async verifyEmail(
    req: Request,
    res: Response
  ): Promise<Response> {

    const { userId, code } = req.body;

    const isValid = await VerificationCodeService.verify(
      userId,
      "EMAIL_VERIFICATION",
      code
    );

    if (!isValid) {
      return res.status(400).json({
        message: "Código inválido ou expirado.",
      });
    }

    await VerificationCodeRepository.markEmailAsVerified(userId);

    
    return res.status(200).json({
      message: "E-mail verificado com sucesso.",
    });
  }
}

export default new VerificationCodeController();

