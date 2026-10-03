import type {
  LinkFraudContext,
  LinkFraudRule,
  LinkRuleResult,
} from "../../../../types/interfaces/LinkFraudTypes.js";

import type { IBlacklistRepository } from "../../../repositories/interfaces/IBlackListRepository.js";

class CheckBlacklist implements LinkFraudRule {
  private blacklistRepository: IBlacklistRepository;

  constructor(
    blacklistRepository: IBlacklistRepository
  ) {
    this.blacklistRepository = blacklistRepository;
  }

  async execute(
    context: LinkFraudContext
  ): Promise<LinkRuleResult | null> {
    const registro =
      await this.blacklistRepository.findByDomain(
        context.domain
      );

    if (!registro) {
      return null;
    }

    return {
      tipo: "blacklist",
      pontuacao: 150,
      mensagem: `Domínio listado: ${
        registro.motivo || "sem motivo"
      }`,
    };
  }
}

export default CheckBlacklist;