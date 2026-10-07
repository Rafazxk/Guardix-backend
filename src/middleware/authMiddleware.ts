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
    res.status(401).json({
      error: "Token não fornecido",
    });
    return;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    res.status(401).json({
      error: "Token inválido",
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as JwtPayload;

    const userId = decoded.id || decoded.user_id;

    if (!userId) {
      res.status(401).json({
        error: "Token inválido: ID do usuário ausente no payload",
      });
      return;
    }

    const userQuery = await pool.query(
      `
        SELECT
          user_id,
          email,
          plano,
          status_assinatura
        FROM users
        WHERE user_id = $1
      `,
      [userId]
    );

    const userDb = userQuery.rows[0];

    if (!userDb) {
      res.status(401).json({
        error: "Usuário não encontrado",
      });
      return;
    }

    const planoAtual =
      typeof userDb.plano === "string" && userDb.plano.trim()
        ? userDb.plano.toLowerCase()
        : "free";

    req.user = {
      id: userDb.user_id,
      user_id: userDb.user_id,
      email: userDb.email || decoded.email,
      plano: planoAtual,
    };

    console.log("[AUTH]", {
      userId: userDb.user_id,
      email: userDb.email,
      plano: planoAtual,
      statusAssinatura: userDb.status_assinatura,
    });

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