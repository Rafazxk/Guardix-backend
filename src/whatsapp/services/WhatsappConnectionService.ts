import WhatsappConnectionRepository from "../repositories/WhatsappConnectionRepository.js";
import UserRepository from "../../auth/repositories/UserRepository.js";

class WhatsappConnectionService {
  private normalizePhone(phone: string): string {
    const numbers = phone.replace(/\D/g, "");

    if (numbers.startsWith("55") && numbers.length === 13) {
      return numbers.slice(2);
    }

    return numbers;
  }

  async findUserByPhone(phone: string) {
    const normalizedPhone = this.normalizePhone(phone);

    const connection =
      await WhatsappConnectionRepository.findByPhone(
        normalizedPhone
      );

    if (!connection) {
      return null;
    }

    const user = await UserRepository.findById(
      connection.user_id
    );

    if (!user) {
      return null;
    }

    return {
      userId: user.user_id,
      phone: connection.phone,
      plano: user.plano ?? "free",
      emailVerified: user.email_verified,
    };
  }

  async connect(userId: string, phone: string) {
    if (!userId) {
      throw new Error("Usuário não informado.");
    }

    if (!phone) {
      throw new Error("Número de WhatsApp não informado.");
    }

    const normalizedPhone = this.normalizePhone(phone);

    const existingConnection =
  await WhatsappConnectionRepository.findByPhone(
    normalizedPhone
  );

if (existingConnection) {
  if (existingConnection.user_id !== userId) {
    throw new Error(
      "Este número de WhatsApp já está vinculado a outra conta."
    );
  }

  if (existingConnection.ativo) {
    throw new Error(
      "Este número de WhatsApp já está vinculado a esta conta."
    );
  }


  
  return WhatsappConnectionRepository.reactivate(
    existingConnection.id
  );
}

return WhatsappConnectionRepository.create(
  userId,
  normalizedPhone
);
  }

  async disconnect(userId: string) {
    if (!userId) {
      throw new Error("Usuário não informado.");
    }

    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    const connection =
      await this.findConnectionByUserId(userId);

    if (!connection) {
      throw new Error(
        "Nenhum WhatsApp está vinculado a esta conta."
      );
    }

    await WhatsappConnectionRepository.deactivate(
      connection.phone
    );
  }

  async isPremium(phone: string): Promise<boolean> {
    const user = await this.findUserByPhone(phone);

    if (!user) {
      return false;
    }

    return user.plano.toLowerCase() === "premium";
  }

  async findConnectionByUserId(userId: string) {
    return WhatsappConnectionRepository.findByUserId(
      userId
    );
  }
}

export default new WhatsappConnectionService();