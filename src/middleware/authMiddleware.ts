import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import pool from "../config/database.js"; 

interface JwtPayload {
  id?: string;
  user_id?: string;
  email: string;
}

export default async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
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

    const userId = decoded.id || decoded.user_id;

    if (!userId) {
      res.status(401).json({ error: "Token inválido: ID do usuário ausente no payload" });
      return;
    }


    const userQuery = await pool.query(
      "SELECT plano, status_assinatura FROM users WHERE user_id = $1",
      [userId]
    );

    const userDb = userQuery.rows[0];

    // Se a assinatura for 'active', usa o plano cadastrado; caso contrário, assume 'free'
    const planoAtivo = (userDb && (userDb.status_assinatura === "active" || userDb.plano === "free")) 
      ? userDb.plano 
      : "free";

    req.user = {
      id: userId,
      user_id: userId,
      email: decoded.email,
      plano: (planoAtivo || "free").toLowerCase(),
    };

    next();

  } catch (err: unknown) {
    console.error("Erro na verificação do JWT:", err);
    const isExpired = err instanceof jwt.TokenExpiredError;

    res.status(401).json({
      error: isExpired ? "Token expirado" : "Token inválido",
      expired: isExpired,
    });
    return;
  }
}