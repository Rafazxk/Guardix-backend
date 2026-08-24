import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  user_id: string;
  email: string;
}

export default function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {

  console.log(
    "1. Middleware recebendo requisição..."
  );

  const authHeader = req.headers.authorization;

  if (!authHeader) {

    console.log(
      "Erro: Header ausente"
    );

    res.status(401).json({
      error: "Token não fornecido"
    });

    return;
  }

  const token = authHeader.split(" ")[1];

  if (!token) {

    res.status(401).json({
      error: "Token não fornecido"
    });

    return;
  }

  try {

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET!
      ) as JwtPayload;

    req.user = {
      id: decoded.user_id,
      email: decoded.email
    };

    console.log(
      "Middleware: token ok - id:",
      req.user.id
    );

    console.log(
      "middleware: email ok -",
      req.user.email
    );

    next();

  } catch (err: unknown) {
const isExpired = err instanceof jwt.TokenExpiredError;
    
    res.status(401).json({
      error: isExpired ? "Token expirado" : "Token inválido",
      expired: isExpired 
    });
    return;
  }
}