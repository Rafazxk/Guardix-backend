import LinkFraudEngine from "../domain/engines/LinkFraudEngine.js";
import LinkFraudEngineFactory from "../domain/engines/LinkFraudEngineFactory.js";
import BlacklistRepository from "../repositories/BlackListRepository.js";
import RiskClassifier from "../domain/classification/RiskClassifier.js";
import DomainExtractor from "../domain/utils/DomainExtractor.js";
import LinkRiskInterpreter from "../domain/classification/LinkRiskInterpreter.js";
import RiskRecommendation from "../domain/classification/RiskRecommendation.js";
import FeedRepository from "../repositories/FeedRepository.js";

export interface LinkAnalysisContext {
  url: string;
  plano?: string; 
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
  denuncias?: number;
  regrasVioladas?: RegraVioladaLog[];
  mensagem?: string;
  analiseDetalhadaIa?: string; 

}

export class LinkAnalysisService {
  private engine: LinkFraudEngine;
  private domainExtractor: DomainExtractor;
  private riskClassifier: RiskClassifier;
  private riskInterpreter: LinkRiskInterpreter;
  private riskRecommendation: RiskRecommendation;

  constructor(blacklistRepo: typeof BlacklistRepository) {
    this.engine = LinkFraudEngineFactory.create(blacklistRepo);
    this.domainExtractor = new DomainExtractor();
    this.riskClassifier = new RiskClassifier();
    this.riskInterpreter = new LinkRiskInterpreter();
    this.riskRecommendation = new RiskRecommendation();
  }

  async execute(context: LinkAnalysisContext): Promise<LinkAnalysisResult> {
    const planoUser = context.plano?.toLowerCase() || 'free';

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

const denuncias = await FeedRepository.contarDenunciasLink(context.url);

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
        denuncias,
      };
    }

    const classificacao = this.riskClassifier.execute(analiseTecnica.score);
    const interpretacao = this.riskInterpreter.execute(analiseTecnica.riscos);

    const tipoGolpe =
      interpretacao.tipos.length > 0
        ? interpretacao.tipos.join(" / ")
        : "Suspeita de Fraude";

    const recomendacao = this.riskRecommendation.execute(analiseTecnica.score);

    if (planoUser === 'free') {
      return {
        url: context.url,
        score: analiseTecnica.score,
        classificacao,
        tipoGolpe,
        alertas: interpretacao.alertas.slice(0, 2), 
        conclusao: recomendacao,
        denuncias,
      };
    }

  
    const logsTecnicos = analiseTecnica.regrasVioladas;

    return {
      url: context.url,
      score: analiseTecnica.score,
      classificacao,
      tipoGolpe,
      alertas: interpretacao.alertas,
      conclusao: recomendacao,
      regrasVioladas: logsTecnicos, 
      analiseDetalhadaIa: `Este domínio (${domain}) ativou ${logsTecnicos.length} indicadores de risco. Recomendamos não inserir dados de cartão de crédito nem credenciais pessoais.`
    };
  }
}

export default new LinkAnalysisService(BlacklistRepository);