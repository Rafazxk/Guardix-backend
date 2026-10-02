import ConsultaAnalysisService from "../../client/services/ConsultaAnalysisService.js";

class ExtensionService {
  async analisarLink(url: string) {
    if (!url) {
      throw new Error("URL não informada.");
    }

    return ConsultaAnalysisService.execute("link", {
      url,
    });
  }
}

export default new ExtensionService();