import { Request, Response } from "express";

import ApiKeyService from "../services/ApiKeyService.js";

class ApiKeyController {
  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { nome } = req.body;

        console.log("USER AUTENTICADO:", req.user);

      if (!nome) {
        return res.status(400).json({
          error: "O nome da API Key é obrigatório.",
        });
      }

      if (!req.user?.user_id) {
        return res.status(401).json({
          error: "Usuário não autenticado.",
        });
      }

      const resultado = await ApiKeyService.create({
        user_id: req.user.user_id,
        nome,
      });

      const { key_hash, user_id, ...apiKeyPublic } = resultado.apiKey;
      
      return res.status(201).json({
        message: "API Key criada com sucesso.",
        apiKey: apiKeyPublic,
        key: resultado.key,
      });
    } catch (error) {
      console.error("Erro ao criar API Key:", error);

      return res.status(500).json({
        error: "Erro interno ao criar API Key.",
      });
    }
  }

  async findAllByUser(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.user?.user_id) {
        return res.status(401).json({
          error: "Usuário não autenticado.",
        });
      }

      const apiKeys = await ApiKeyService.findAllByUser(
        req.user.user_id
      );

      return res.status(200).json(apiKeys);
    } catch (error) {
      console.error("Erro ao buscar API Keys:", error);

      return res.status(500).json({
        error: "Erro interno ao buscar API Keys.",
      });
    }
  }

  async findById(req: Request<{ id: string }>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID da API Key é obrigatório.",
        });
      }

      if (!req.user?.user_id) {
        return res.status(401).json({
          error: "Usuário não autenticado.",
        });
      }

      const apiKey = await ApiKeyService.findById(id);

      if (!apiKey) {
        return res.status(404).json({
          error: "API Key não encontrada.",
        });
      }

      if (apiKey.user_id !== req.user.user_id) {
        return res.status(403).json({
          error: "Você não possui acesso a esta API Key.",
        });
      }

      return res.status(200).json(apiKey);
    } catch (error) {
      console.error("Erro ao buscar API Key:", error);

      return res.status(500).json({
        error: "Erro interno ao buscar API Key.",
      });
    }
  }

  async revoke(req: Request<{ id: string }>, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: "ID da API Key é obrigatório.",
        });
      }

      if (!req.user?.user_id) {
        return res.status(401).json({
          error: "Usuário não autenticado.",
        });
      }

      const revoked = await ApiKeyService.revoke(
        id,
        req.user.user_id
      );

      if (!revoked) {
        return res.status(404).json({
          error: "API Key não encontrada ou já revogada.",
        });
      }

      return res.status(200).json({
        message: "API Key revogada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao revogar API Key:", error);

      return res.status(500).json({
        error: "Erro interno ao revogar API Key.",
      });
    }
  }
}

export default new ApiKeyController();