import FeedRepository from "../repositories/FeedRepository.js";
import { CreateDenunciaDTO } from "../../types/interfaces/FeedInterface.js";

class FeedService {

  async listarFeed() {
    const itens = FeedRepository.listarFeed();
    return itens; 
  }

  async listarEstatisticas(usuarioId: string) {
    return FeedRepository.listarEstatisticas(usuarioId);
  }

  async criarDenuncia(data: CreateDenunciaDTO) {

    if (!data.tipo) {
      throw new Error("Tipo da denúncia é obrigatório.");
    }

    if (!data.valor) {
      throw new Error("Valor da denúncia é obrigatório.");
    }

    if (
      data.tipo !== "link" &&
      data.tipo !== "telefone"
    ) {
      throw new Error("Tipo de denúncia inválido.");
    }

    await FeedRepository.criarDenuncia(data);
  }
}

export default new FeedService();