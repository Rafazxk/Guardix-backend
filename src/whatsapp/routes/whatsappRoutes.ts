import { Router } from "express";

import authMiddleware from "../../middleware/authMiddleware.js";
import WhatsappController from "../controllers/WhatsappConectionController.js";

const router = Router();

router.post(
  "/connect",
  authMiddleware,
  WhatsappController.conectar
);

router.delete(
  "/disconnect",
  authMiddleware,
  WhatsappController.desconectar
);

router.get(
  "/status",
  authMiddleware,
  WhatsappController.status
);

export default router;