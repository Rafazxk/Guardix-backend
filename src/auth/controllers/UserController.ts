import { Request, Response } from 'express';
import UserService from '../services/UserService.js';

console.log("ARQUIVO CONTROLLER CARREGADO");

export default class UserController {
  async register(req: Request, res: Response): Promise<Response> {
    try {
      const user = await UserService.register(req.body);
      return res.status(201).json(user);
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }

  async login(req: Request, res: Response): Promise<Response> {
    try {
      console.log("debug - controller ", req.body);
      const { user, token } = await UserService.login(req.body);
      
      const resposta = {
        user: {
          id: user.user_id,
          nome: user.nome,
          email: user.email,
          plano: user.plano || "free"
        },
        token
      };
      console.log("debug - ", resposta);
      return res.status(200).json(resposta);
    } catch (err: any) {
      return res.status(401).json({ error: err.message });
    }
  }
  
  async virarPro(req: Request, res: Response): Promise<Response> {
    try {
      // Usamos 'any' temporariamente ou estendemos a Request se o seu middleware injetar o 'user'
      const userId = (req as any).user.id;
      const user = await UserService.virarPro(userId);
      
      console.log("id que o controller recebeu: ", userId);
      return res.status(200).json({ message: "Upgrade Concluído", user });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  }
}