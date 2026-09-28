import { Request, Response } from "express";

import ConsultaService from "../services/ConsultaService.js";

class B2BController {
  async analisar(req: Request, res: Response): Promise<Response> {
    try {
      const { tipo, dado } = req.body;

      if (!tipo || !dado) {
        return res.status(400).json({
          error: 'Os campos "tipo" e "dado" são obrigatórios.',
        });
      }

      if (!req.user?.user_id) {
        return res.status(401).json({
          error: "Usuário não identificado.",
        });
      }

      if (!req.user?.key_id) {
        return res.status(401).json({
          error: "Chave de API não identificada.",
        });
      }

      let input;

      switch (tipo) {
        case "link":
          input = {
            url: dado,
          };
          break;

        case "telefone":
          input = {
            numero: dado,
          };
          break;

        case "print":
          input = {
            image_path: dado,
          };
          break;

        default:
          return res.status(400).json({
            error: `Tipo de consulta não suportado: ${tipo}`,
          });
      }

      const resultado = await ConsultaService.execute({
        user_id: req.user.user_id,
        key_id: req.user.key_id,
        tipo,
        input,
      });

      return res.status(200).json({
        status: "sucesso",
        solicitante: {
          empresa: req.user.nome,
          plano: req.user.plano,
        },
        analise: {
          dado_consultado: dado,
          tipo,
          ...resultado,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro na análise B2B:", error);

      return res.status(500).json({
        error: "Erro interno ao realizar análise.",
      });
    }
  }
}

export default new B2BController();