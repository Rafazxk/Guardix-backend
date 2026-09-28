import { Router } from "express";

import ApiKeyController from "../controllers/ApiKeyController.js";

import authMiddleware from "../../middleware/authMiddleware.js";

const router = Router();

router.post("/keys", authMiddleware, ApiKeyController.create);

router.get("/keys", authMiddleware, ApiKeyController.findAllByUser);

router.get("/keys/:id", authMiddleware, ApiKeyController.findById);

router.delete("/keys/:id", authMiddleware, ApiKeyController.revoke);

export default router;