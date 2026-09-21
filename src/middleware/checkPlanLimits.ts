import { Request, Response, NextFunction } from 'express';
import pool from '../config/database.js';
import { PLANS } from '../config/planos.js';

export const checkPlanLimits = (tipoConsulta: 'link' | 'telefone' | 'print') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user.id; // Supondo que o middleware de auth coloca o user no req

      // 1. Busca o plano atual do usuário
      const userQuery = await pool.query('SELECT plano FROM users WHERE user_id = $1', [userId]);
      const planoUser = userQuery.rows[0]?.plano || 'free';

      const configPlano = PLANS[planoUser];

      // Se for ilimitado (-1), passa direto
      if (
        (tipoConsulta === 'link' && configPlano.maxConsultasLinks === -1) ||
        (tipoConsulta === 'telefone' && configPlano.maxConsultasTelefones === -1) ||
        (tipoConsulta === 'print' && configPlano.maxConsultasPrints === -1)
      ) {
        return next();
      }

      // 2. Para plano FREE, conta quantas consultas ele já fez hoje
      const countQuery = await pool.query(
        `SELECT COUNT(*) FROM consultas 
         WHERE user_id = $1 
           AND tipo_consulta = $2 
           AND data_consulta >= CURRENT_DATE`,
        [userId, tipoConsulta]
      );

      const totalHoje = parseInt(countQuery.rows[0].count, 10);
      const limite = 
        tipoConsulta === 'link' ? configPlano.maxConsultasLinks :
        tipoConsulta === 'telefone' ? configPlano.maxConsultasTelefones : configPlano.maxConsultasPrints;

      if (totalHoje >= limite) {
        return res.status(403).json({
          erro: 'Limite de consultas atingido para o plano Free.',
          mensagem: 'Faça o upgrade para o plano Pro para ter verificações ilimitadas!',
        });
      }

      next();
    } catch (err) {
      return res.status(500).json({ erro: 'Erro ao verificar limites do plano.' });
    }
  };
};