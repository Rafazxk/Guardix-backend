import type { BlacklistItem } from "../../../types/interfaces/BlacklistInterface.js";

export interface IBlacklistRepository {
  findByDomain(
    domain: string
  ): Promise<BlacklistItem | undefined>;
}