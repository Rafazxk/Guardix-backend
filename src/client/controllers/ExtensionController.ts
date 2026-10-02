import type { Request, Response } from "express";
import ExtensionService from "../services/ExtensionService.js";

class ExtensionController {
  async analisarLink(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      const resultado = await ExtensionService.analisarLink(url);

      res.status(200).json(resultado);
    } catch (error) {
      console.error("Erro na análise da extensão:", error);

      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Erro ao analisar o link.",
      });
    }
  }
}

export default new ExtensionController();