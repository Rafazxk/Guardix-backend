import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js"; 
interface JwtPayload {
  user_id: string;
  email: string;
}

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {

  console.log("1. Middleware recebendo requisição...");

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("Erro: Header ausente");
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token não fornecido" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    // Busca o plano atual do usuário direto no PostgreSQL
    const userQuery = await pool.query(
      "SELECT plano, status_assinatura FROM users WHERE user_id = $1",
      [decoded.user_id]
    );

    const userDb = userQuery.rows[0];

    // Se o usuário não existir no banco ou a assinatura estiver inativa/cancelada, recua para 'free'
    const planoAtivo = (userDb && userDb.status_assinatura === "active") 
      ? userDb.plano 
      : "free";

    // Anexa id, email e plano ao req.user
    req.user = {
      id: decoded.user_id,
      email: decoded.email,
      plano: planoAtivo,
    };

    console.log(`Middleware OK | ID: ${req.user.id} | Plano: ${req.user.plano}`);

    next();

  } catch (err: unknown) {
    const isExpired = err instanceof jwt.TokenExpiredError;

    res.status(401).json({
      error: isExpired ? "Token expirado" : "Token inválido",
      expired: isExpired,
    });
    return;
  }
}