import ConsultaRepository from "../repositories/ConsultaRepository.js";
import PrintRepository from "../repositories/PrintRepository.js";
import ConsultaAnalysisService, {
  type TipoConsulta,
} from "./ConsultaAnalysisService.js";

interface ConsultaServiceInput {
  user_id: string;
  tipo: TipoConsulta;
  input: {
    url?: string;
    numero?: string;
    image_path?: string;
  };
}

class ConsultaService {
  async execute({ user_id, tipo, input }: ConsultaServiceInput) {
    const resultado = await ConsultaAnalysisService.execute(tipo, input);

    const alvoIdentificado =
      tipo === "link" ? input.url :
      tipo === "telefone" ? input.numero :
      tipo === "print" ? input.image_path : undefined;

    const novaConsulta = await ConsultaRepository.create({
      user_id,
      tipo_consulta: tipo,
      score_risco: resultado.score,
      resultado: { nivel: resultado.classificacao || resultado.nivel },
      alvo: alvoIdentificado,
    });

    if (tipo === "print" && input.image_path && resultado.id_hash) {
      try {
        const jaExiste = await PrintRepository.findByHash(resultado.id_hash);
        if (!jaExiste) {
          await PrintRepository.save({
            id_hash: resultado.id_hash,
            consulta_id: (novaConsulta as any).consulta_id || novaConsulta.id,
            caminho_arquivo: input.image_path,
            texto_extraido: resultado.texto_extraido,
            tipo_golpe: resultado.classificacao,
            score_risco: resultado.score,
          });
        }
      } catch (error) {
        console.warn("Aviso: falha ao salvar detalhes do print, mas a consulta foi gravada.", error);
      }
    }

    const valorIdentificado = tipo === "link" ? input.url : tipo === "telefone" ? input.numero : "Print/Imagem";

    return {
      score: resultado.score,
      classificacao: resultado.classificacao || resultado.nivel,
      conclusao: resultado.conclusao || (resultado.score >= 60 ? "Risco Detectado" : "Parece Seguro"),
      regrasVioladas: resultado.regrasVioladas || [],
      detalhes: {
        tipo,
        tipoGolpe: resultado.tipoGolpe || "Indeterminado",
        valor: valorIdentificado,
        denuncias: resultado.denuncias || 0,
        servico: resultado.servico || "Análise Padrão",
      },
    };
  }
}

export default new ConsultaService();