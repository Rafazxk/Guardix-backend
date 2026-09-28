import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { PLANS } from '../config/planos.js';

export const checkPlanLimits = (tipoConsulta: 'link' | 'telefone' | 'print') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id || req.user?.user_id;

      if (!userId) {
        return res.status(401).json({ erro: 'Usuário não autenticado.' });
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

      const limitesMap = {
        link: configPlano.maxConsultasLinks,
        telefone: configPlano.maxConsultasTelefones,
        print: configPlano.maxConsultasPrints,
      };

      const limite = limitesMap[tipoConsulta];

      if (limite === -1) {
        return next();
      }

      const countQuery = await pool.query(
        `SELECT COUNT(*) FROM consultas 
         WHERE user_id = $1 
           AND tipo_consulta = $2 
           AND data_consulta >= date_trunc('day', CURRENT_TIMESTAMP)`,
        [userId, tipoConsulta]
      );

      const totalHoje = parseInt(countQuery.rows[0].count, 10);

      if (totalHoje >= limite) {
        return res.status(403).json({
          erro: 'Limite de consultas atingido.',
          mensagem: `Você atingiu o limite de ${limite} consultas de ${tipoConsulta} para o plano Free hoje. Faça upgrade para ter verificações ilimitadas!`,
          limite,
          usado: totalHoje,
        });
      }

      next();
    } catch (err) {
      console.error('Erro no checkPlanLimits:', err);
      return res.status(500).json({ erro: 'Erro ao verificar limites do plano.' });
    }
  };
};