import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import pool from '../config/database.js';

export async function authApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKeyHeader = req.headers['x-api-key'] as string;

  if (!apiKeyHeader) {
    return res.status(401).json({ error: 'Cabeçalho x-api-key não informado.' });
  }

  const keyHash = crypto.createHash('sha256').update(apiKeyHeader).digest('hex');

  try {
    // CORREÇÃO: Usar u.user_id tanto no SELECT quanto no INNER JOIN
    const query = `
      SELECT k.id as key_id, k.ativa, u.user_id, u.nome, u.plano 
      FROM api_keys k
      INNER JOIN users u ON u.user_id = k.user_id
      WHERE k.key_hash = $1
    `;

    const result = await pool.query(query, [keyHash]);

    if (result.rows.length === 0 || !result.rows[0].ativa) {
      return res.status(401).json({ error: 'Chave de API inválida ou revogada.' });
    }

    const cliente = result.rows[0];

    if (cliente.plano?.toLowerCase() !== 'premium') {
      return res.status(403).json({ 
        error: 'Acesso negado. A API do Guardix é exclusiva do plano Premium.' 
      });
    }

    req.user = cliente;
    next();
  } catch (error) {
    console.error('Erro na autenticação de API Key:', error);
    return res.status(500).json({ error: 'Erro interno ao validar chave de API.' });
  }
}

export default authApiKey;