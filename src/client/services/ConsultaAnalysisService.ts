import LinkAnalysisService from "./LinkAnalysisService.js";
import PhoneAnalysisService from "./PhoneAnalysisService.js";
import PrintAnalysisService from "./PrintAnalysisService.js";

export type TipoConsulta = "link" | "telefone" | "print";

export interface AnalysisInput {
  url?: string;
  numero?: string;
  image_path?: string;
}

export interface ConsultaAnalysisResult {
  score: number;
  classificacao?: string;
  nivel?: string;
  conclusao?: string;
  regrasVioladas?: Array<{
    regra: string;
    mensagem: string;
  }>;
  tipoGolpe?: string;
  denuncias?: number;
  servico?: string;

  id_hash?: string;
  texto_extraido?: string;
}

class ConsultaAnalysisService {

  async execute(
    tipo: TipoConsulta,
    input: AnalysisInput
  ): Promise<ConsultaAnalysisResult> {

    const services = {
      link: async () => {
        if (!input.url) {
          throw new Error("URL não informada.");
        }

        return LinkAnalysisService.execute({
          url: input.url,
        });
      },

      telefone: async () => {
        if (!input.numero) {
          throw new Error("Número de telefone não informado.");
        }

        return PhoneAnalysisService.execute({
          numero: input.numero,
        });
      },

      print: async () => {
        if (!input.image_path) {
          throw new Error("Arquivo de imagem não informado.");
        }

        return PrintAnalysisService.execute({
          image_path: input.image_path,
        });
      },
    };

    const service = services[tipo];

    if (!service) {
      throw new Error("Tipo de consulta inválido.");
    }

    return service();
  }
}

export default new ConsultaAnalysisService();