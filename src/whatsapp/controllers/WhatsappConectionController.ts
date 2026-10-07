import type { Request, Response } from "express";
import WhatsappConnectionService from "../services/WhatsappConnectionService.js";

class WhatsappController {
  async conectar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.user_id;
      const { phone } = req.body;

      if (!userId) {
        res.status(401).json({
          erro: "Usuário não autenticado.",
        });
        return;
      }

      const connection = await WhatsappConnectionService.connect(
        userId,
        phone
      );

      res.status(201).json({
        mensagem: "WhatsApp conectado com sucesso.",
        connection,
      });
    } catch (error: any) {
      console.error("Erro ao conectar WhatsApp:", error);

      res.status(400).json({
        erro: error.message || "Não foi possível conectar o WhatsApp.",
      });
    }
  }

  async desconectar(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.user_id;

      if (!userId) {
        res.status(401).json({
          erro: "Usuário não autenticado.",
        });
        return;
      }

      await WhatsappConnectionService.disconnect(userId);

      res.status(200).json({
        mensagem: "WhatsApp desconectado com sucesso.",
      });
    } catch (error: any) {
      console.error("Erro ao desconectar WhatsApp:", error);

      res.status(400).json({
        erro:
          error.message ||
          "Não foi possível desconectar o WhatsApp.",
      });
    }
  }

  async status(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id || req.user?.user_id;

      if (!userId) {
        res.status(401).json({
          erro: "Usuário não autenticado.",
        });
        return;
      }

      const user = await WhatsappConnectionService.findConnectionByUserId(
        userId
      );

      res.status(200).json({
        conectado: !!user,
        connection: user ?? null,
      });
    } catch (error: any) {
      console.error("Erro ao consultar WhatsApp:", error);

      res.status(500).json({
        erro: "Não foi possível consultar a conexão do WhatsApp.",
      });
    }
  }
}

export default new WhatsappController();