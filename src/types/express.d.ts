// src/types/express.d.ts
import { Request } from 'express';
import 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id?: string;
        user_id?: string;
        email?: string;
        nome?: string;
        plano?: string;
        key_id?: string;
        ativa?: boolean;
      };
      file?: Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}