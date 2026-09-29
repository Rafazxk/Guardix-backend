import { Request, Response } from "express";
import FeedService from "../services/FeedService.js";

class FeedController {

 async listarFeed(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const busca = String(req.query.busca ?? "");

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      50
    );

    const feed = await FeedService.listarFeed(
      busca,
      page,
      limit
    );

    return res.json(feed);
  } catch (err: unknown) {
    console.error("Erro ao carregar feed:", err);

    return res.status(500).json({
      error: "Erro interno ao carregar o feed de alertas.",
    });
  }
}

 async listarEstatisticas(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const usuarioId = req.user?.user_id;

    if (!usuarioId) {
      return res.status(401).json({
        error: "Usuário não autenticado.",
      });
    }

    const estatisticas =
      await FeedService.listarEstatisticas(usuarioId);

    return res.json(estatisticas);
  } catch (err: unknown) {
    console.error(
      "Erro ao buscar estatísticas:",
      err
    );

    return res.status(500).json({
      error: "Erro ao buscar estatísticas.",
    });
  }
}

 async criarDenuncia(
  req: Request,
  res: Response
): Promise<Response> {
  try {
    const usuarioId = req.user?.user_id;

    if (!usuarioId) {
      return res.status(401).json({
        error: "Usuário não autenticado.",
      });
    }

    await FeedService.criarDenuncia({
      ...req.body,
      usuarioId,
    });

    return res.status(201).json({
      message: "Denúncia registrada com sucesso!",
    });
  } catch (err: unknown) {
    console.error(
      "Erro ao registrar denúncia:",
      err
    );

    const message =
      err instanceof Error
        ? err.message
        : "Erro ao registrar denúncia.";

    return res.status(400).json({
      error: message,
    });
  }
}
}

export default new FeedController();