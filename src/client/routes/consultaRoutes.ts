import { Router, Request, Response } from 'express';
import express from 'express';
import ConsultaController from '../controllers/ConsultaController.js';
// import WebhookController from '../controllers/WebhookController.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import upload from '../../middleware/upload.js';
import { checkPlanLimits } from '../../middleware/checkPlanLimits.js';

const router = Router();

router.post('/link', authMiddleware, checkPlanLimits('link'), ConsultaController.analisarLink);
router.post('/phone', authMiddleware, checkPlanLimits('telefone'),ConsultaController.analisarTelefone);

router.get(
  '/stats/live',
  authMiddleware,
  ConsultaController.obterStatsLive
);

router.get(
  '/historico',
  authMiddleware,
  ConsultaController.obterHistorico
);

router.post(
  '/print',
  authMiddleware,
  checkPlanLimits('print'),
  upload.single('imagem'),
  ConsultaController.analisarPrint
);


export default router;