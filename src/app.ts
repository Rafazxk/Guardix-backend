import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import consultaRoutes from "./client/routes/consultaRoutes.js"
import userRoutes from './auth/routes/userRoutes.js';
import feedRoutes from './client/routes/feedRoutes.js';
import whatappRoutes from './client/routes/whatsappRoutes.js';
import vericationCodeRoutes from './auth/routes/VerificationCodeRoutes.js';
import apiKeyRoutes from "./client/routes/ApiKeyRoutes.js";
import b2bRoutes from "./client/routes/b2bRoutes.js";
import extensionRoutes from "./client/routes/extensionRoutes.js";
import PaymentRoutes from "./payments/routes/paymentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public'))); 

app.use('/users', userRoutes);
app.use('/api', consultaRoutes);
app.use('/stats', feedRoutes);
app.use('/wpp', whatappRoutes);
app.use('/verification', vericationCodeRoutes);

app.use("/api", apiKeyRoutes);
app.use("/v1", b2bRoutes);
app.use("/extension", extensionRoutes);
app.use("/payments", PaymentRoutes);

app.use((
   err: Error,
   req: Request,
   res: Response,
   next: NextFunction) => {
     console.error(err.stack);
     res.status(500).json({ error: 'Erro interno no servidor' });
});

export default app;