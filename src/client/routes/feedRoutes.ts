import express from 'express';
const router = express.Router();
import denunciaController from '../controllers/FeedController.js';
import authMiddleware from "../../middleware/authMiddleware.js";

router.get('/feed', denunciaController.listarFeed);

router.get('/estatisticas', authMiddleware, denunciaController.listarEstatisticas);

router.post('/report', denunciaController.criarDenuncia);

export default router;