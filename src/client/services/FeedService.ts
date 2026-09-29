import FeedRepository from "../repositories/FeedRepository.js";

import { CreateDenunciaDTO } from "../../types/interfaces/FeedInterface.js";

class FeedService {
 async listarFeed(
  busca: string = "",
  page: number = 1,
  limit: number = 10
) {
  return await FeedRepository.listarFeed(busca, page, limit);
}

  async listarEstatisticas(usuarioId: string) {
    return await FeedRepository.listarEstatisticas(usuarioId);
  }

 async criarDenuncia(data: CreateDenunciaDTO) {
  if (!data.tipo) {
    throw new Error("Tipo da denúncia é obrigatório.");
  }

  if (!data.valor) {
    throw new Error("Valor da denúncia é obrigatório.");
  }

  if (data.tipo !== "link" && data.tipo !== "telefone") {
    throw new Error("Tipo de denúncia inválido.");
  }

  const valorNormalizado =
    data.tipo === "link"
      ? data.valor.replace(/\/+$/, "")
      : data.valor.replace(/\D/g, "");

  console.log("VALOR RECEBIDO:", data.valor);
console.log("VALOR NORMALIZADO:", valorNormalizado);


  await FeedRepository.criarDenuncia({
    tipo: data.tipo,
    valor: valorNormalizado,
  });
}
}

export default new FeedService();