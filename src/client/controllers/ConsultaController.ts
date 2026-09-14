import { Request, Response } from "express";

import ConsultaRepository from "../repositories/ConsultaRepository.js";
import ConsultaStatsService from "../services/ConsultaStatsService.js";
import ConsultaService from "../services/ConsultaService.js";

export type TipoConsulta = "link" | "telefone" | "print";

class ConsultaController {

  public processarAnalise = async (
    req: Request,
    res: Response,
    tipo: TipoConsulta
  ): Promise<Response> => {

    console.log(
      "Iniciando análise do tipo:",
      tipo,
      req.body
    );

    try {

      const user_id = req.user?.id;

      if (!user_id) {
        return res.status(401).json({
          error: "Usuário não autenticado.",
        });
      }

      const resultado = await ConsultaService.execute({
        user_id,
        tipo,
        input: {
          url: req.body.url,
          numero: req.body.numero,
          image_path: req.file?.path,
        },
      });

      return res.json(resultado);

    } catch (error: unknown) {

      console.error(
        `Erro na análise de ${tipo}:`,
        error
      );

      return res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Erro ao realizar análise.",
      });
    }
  };

  public analisarLink = (
    req: Request,
    res: Response
  ): Promise<Response> =>
    this.processarAnalise(req, res, "link");

  public analisarTelefone = (
    req: Request,
    res: Response
  ): Promise<Response> =>
    this.processarAnalise(req, res, "telefone");

  public analisarPrint = (
    req: Request,
    res: Response
  ): Promise<Response> =>
    this.processarAnalise(req, res, "print");

public obterHistorico = async (
    req: Request,
    res: Response
): Promise<Response> => {
    try {
        const user_id = req.user?.id;

        if (!user_id) {
            return res.status(401).json({
                error: "Usuário não autenticado.",
            });
        }

        const consultas = await ConsultaRepository.findAllByUser(user_id);

        const historicoFormatado = consultas.map((c: any) => ({
            id: c.id,
            data: c.data || "N/A",
            tipo: c.tipo,
            alvo: c.alvo,
            status: c.status || "Indefinido",
        }));

        return res.json(historicoFormatado);
    } catch (error: unknown) {
        console.error("Erro no Histórico:", error);

        return res.status(500).json({
            error: "Erro interno ao buscar histórico",
        });
    }
};

  public obterStatsLive = async (
    _req: Request,
    res: Response
  ): Promise<Response> => {
    try {
      const stats = await ConsultaStatsService.obterStatsLive();
      return res.json(stats);

    } catch (error: unknown) {

      console.error(
        "Erro ao buscar stats:",
        error
      );

      return res.status(500).json({
        error: "Erro ao buscar estatísticas.",
      });
    }
  };
}

export default new ConsultaController();