import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { PLANS } from '../config/planos.js';

export const checkPlanLimits = (
  tipoConsulta: 'link' | 'telefone' | 'print'
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = req.user?.id || req.user?.user_id;

      if (!userId) {
        return res.status(401).json({
          erro: 'Usuário não autenticado.'
        });
      }

      let planoUser = req.user?.plano;

      if (!planoUser) {
        const userQuery = await pool.query(
          'SELECT plano FROM users WHERE user_id = $1',
          [userId]
        );

        planoUser = userQuery.rows[0]?.plano;
      }

      const planoChave = (planoUser || 'free').toLowerCase();
      const configPlano = PLANS[planoChave] || PLANS.free;

      // Planos pagos continuam sem limite
      if (planoChave !== 'free') {
        return next();
      }

      // Free possui uma única cota global de 5 consultas
      const limite = 5;

      const countQuery = await pool.query(
        `SELECT COUNT(*)
         FROM consultas
         WHERE user_id = $1`,
        [userId]
      );

      const totalConsultas = parseInt(
        countQuery.rows[0].count,
        10
      );

      if (totalConsultas >= limite) {
        return res.status(403).json({
          erro: 'Limite de consultas atingido.',
          mensagem:
            'Você atingiu o limite de 5 consultas gratuitas. Faça upgrade para continuar utilizando o Verificador.',
          limite,
          usado: totalConsultas,
        });
      }

      next();

    } catch (err) {
      console.error('Erro no checkPlanLimits:', err);

      return res.status(500).json({
        erro: 'Erro ao verificar limites do plano.'
      });
    }
  };
};

export const checkPlan = (planoPermitido: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const planoAtual = req.user?.plano?.toLowerCase() || "free";

    if (planoAtual !== planoPermitido.toLowerCase()) {
      res.status(403).json({
        erro: "Plano insuficiente.",
        mensagem: `Este recurso está disponível apenas para usuários ${planoPermitido}.`,
      });
      return;
    }

    next();
  };
};