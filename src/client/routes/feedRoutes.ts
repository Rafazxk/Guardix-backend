import express from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import { checkPlan } from "../../middleware/checkPlanLimits.js";
import denunciaController from "../controllers/FeedController.js";

const router = express.Router();

router.get(
  "/feed",
  authMiddleware,
  checkPlan("premium"),
  denunciaController.listarFeed
);

router.get(
  "/estatisticas",
  authMiddleware,
  checkPlan("premium"),
  denunciaController.listarEstatisticas
);

router.get(
  "/relatorio",
  authMiddleware,
  checkPlan("premium"),
  denunciaController.listarRelatorio
);

router.post(
  "/report",
  authMiddleware,
  denunciaController.criarDenuncia
);

export default router;