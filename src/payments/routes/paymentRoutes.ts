import { Router } from "express";

import PaymentController from "../controllers/PaymentController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/checkout",
  authMiddleware,
  PaymentController.createCheckout
);

export default router;