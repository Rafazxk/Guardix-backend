import crypto from "crypto";

import ApiKeyRepository from "../repositories/ApiKeyRepository.js";

import type {
  ApiKey,
  CreateApiKeyDTO,
} from "../../types/interfaces/ApiKeyInterface.js";

class ApiKeyService {

  async create(data: CreateApiKeyDTO) {
    const rawKey = crypto.randomBytes(32).toString("hex");

    const prefix = rawKey.substring(0, 8);

    const keyHash = crypto
      .createHash("sha256")
      .update(rawKey)
      .digest("hex");

    const apiKey = await ApiKeyRepository.create(
      data,
      keyHash,
      prefix
    );

    return {
      apiKey,
      key: rawKey,
    };
  }

  async findAllByUser(userId: string): Promise<ApiKey[]> {
    return await ApiKeyRepository.findAllByUser(userId);
  }

  async findById(id: string): Promise<ApiKey | null> {
    return await ApiKeyRepository.findById(id);
  }

  async findByHash(keyHash: string): Promise<ApiKey | null> {
    return await ApiKeyRepository.findByHash(keyHash);
  }

  async revoke(id: string, userId: string): Promise<boolean> {
    return await ApiKeyRepository.revoke(id, userId);
  }
}

export default new ApiKeyService();