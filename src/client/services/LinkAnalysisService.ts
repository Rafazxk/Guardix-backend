import LinkFraudEngine from "../domain/engines/LinkFraudEngine.js";
import LinkFraudEngineFactory from "../domain/engines/LinkFraudEngineFactory.js";
import BlacklistRepository from "../repositories/BlackListRepository.js";
import RiskClassifier from "../domain/classification/RiskClassifier.js";
import DomainExtractor from "../domain/utils/DomainExtractor.js";
import LinkRiskInterpreter from "../domain/classification/LinkRiskInterpreter.js";
import RiskRecommendation from "../domain/classification/RiskRecommendation.js";

export interface LinkAnalysisContext {
  url: string;
  [key: string]: any;
}

export interface RegraVioladaLog {
  regra: string;
  mensagem: string;
}

export interface LinkAnalysisResult {
  url?: string;
  status?: string;
  score: number;
  classificacao: string;
  tipoGolpe: string;
  alertas: string[];
  conclusao: string;
  regrasVioladas?: RegraVioladaLog[];
  mensagem?: string;
}

export class LinkAnalysisService {
  private engine: LinkFraudEngine;
  private domainExtractor: DomainExtractor;
  private riskClassifier: RiskClassifier;
  private riskInterpreter: LinkRiskInterpreter;
  private riskRecommendation: RiskRecommendation;

  constructor(blacklistRepo: typeof BlacklistRepository) {
    this.engine = LinkFraudEngineFactory.create(
      blacklistRepo
    );

    this.domainExtractor = new DomainExtractor();
    this.riskClassifier = new RiskClassifier();
    this.riskInterpreter = new LinkRiskInterpreter();
    this.riskRecommendation = new RiskRecommendation();
  }

  async execute(context: LinkAnalysisContext): Promise<LinkAnalysisResult> {
    const domain = this.domainExtractor.execute(context.url);
    if (!domain) {
      return {
        score: 0,
        classificacao: "Inválido",
        tipoGolpe: "Nenhum",
        alertas: [],
        conclusao: "URL Inválida",
        status: "Erro",
        mensagem: "URL Inválida"
      };
    }


    const analiseTecnica = await this.engine.execute({
      ...context,
      domain,
      score: 0,
      riscos: [],
      regrasVioladas: [],
    });

    if (analiseTecnica.score === 0) {
      return {
        url: context.url,
        status: "Seguro",
        score: 0,
        tipoGolpe: "Nenhum",
        classificacao: "Seguro",
        alertas: [],
        conclusao: "Não detectamos ameaças neste link.",
      };
    }

    const classificacao = this.riskClassifier.execute(
      analiseTecnica.score
    );


    const interpretacao = this.riskInterpreter.execute(
      analiseTecnica.riscos
    );

    const tipoGolpe =
      interpretacao.tipos.length > 0
        ? interpretacao.tipos.join(" / ")
        : "Suspeita de Fraude";

    const recomendacao =
      this.riskRecommendation.execute(analiseTecnica.score);

    const logsTecnicos = analiseTecnica.regrasVioladas;

    return {
      url: context.url,
      score: analiseTecnica.score,
      classificacao,
      tipoGolpe: tipoGolpe,
      alertas: interpretacao.alertas,
      conclusao: recomendacao,
      regrasVioladas: logsTecnicos
    };
  }
}

export default new LinkAnalysisService(BlacklistRepository);