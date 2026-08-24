import LinkFraudEngine from "./LinkFraudEngine.js";

import CheckBlacklist from "../rules/link/CheckBlacklist.js";
import CheckDomainStructure from "../rules/link/CheckDomainStructure.js";
import CheckTyposquatting from "../rules/link/CheckTyposquatting.js";
import CheckDomainAge from "../rules/link/checkDomainAge.js";

import type { IBlacklistRepository } from "../../repositories/interfaces/IBlackListRepository.js";

class LinkFraudEngineFactory {
  static create(
    blacklistRepository: IBlacklistRepository
  ): LinkFraudEngine {
    return new LinkFraudEngine([
      new CheckBlacklist(blacklistRepository),
      new CheckDomainStructure(),
      new CheckTyposquatting(),
      new CheckDomainAge(),
    ]);
  }
}

export default LinkFraudEngineFactory;