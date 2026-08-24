import { Router, Request, Response } from 'express';
import express from 'express';
import ConsultaController from '../controllers/ConsultaController.js';
// import WebhookController from '../controllers/WebhookController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import pool from '../../config/database.js';
import upload from '../../middleware/upload.js';
import { QueryResult } from 'pg';

const router = Router();

router.post('/link', authMiddleware, ConsultaController.analisarLink);
router.post('/phone', authMiddleware, ConsultaController.analisarTelefone);
router.get('/historico', authMiddleware, ConsultaController.obterHistorico);

router.get(
  '/stats/live',
  authMiddleware,
  ConsultaController.obterStatsLive
);

// Rota de Print (Com Middleware do Multer tipado)
router.post('/print', authMiddleware, upload.single('imagem'), ConsultaController.analisarPrint);

// Rota de Webhook (Utilizando body bruto com Express)
// router.post('/api/webhook', express.raw({ type: 'application/json' }), WebhookController.handle);

export default router;