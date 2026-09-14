import bcrypt from "bcryptjs";

import VerificationCodeRepository, {
  type VerificationCodeType,
  type VerificationCode,
} from "../repositories/VerificationCodeRepository.js";

class VerificationCodeService {
  async create(
    userId: string,
    type: VerificationCodeType
  ): Promise<{ code: string; verificationCode: VerificationCode }> {

    await VerificationCodeRepository.invalidatePreviousCodes(
      userId,
      type
    );

    const code = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const codeHash = await bcrypt.hash(code, 10);

    const expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const verificationCode =
      await VerificationCodeRepository.create({
        user_id: userId,
        code_hash: codeHash,
        type,
        expires_at: expiresAt,
      });

    return {
      code,
      verificationCode,
    };
  }

  async verify(
    userId: string,
    type: VerificationCodeType,
    code: string
  ): Promise<boolean> {

    const verificationCode =
      await VerificationCodeRepository.findValidCode(
        userId,
        type
      );

    if (!verificationCode) {
      return false;
    }

    // Limita a quantidade de tentativas
    if (verificationCode.attempts >= 5) {
      return false;
    }

    const isCodeValid = await bcrypt.compare(
      code,
      verificationCode.code_hash
    );

    if (!isCodeValid) {
      await VerificationCodeRepository.incrementAttempts(
        verificationCode.id
      );

      return false;
    }

    await VerificationCodeRepository.markAsUsed(
      verificationCode.id
    );

    return true;
  }
}

export default new VerificationCodeService();

