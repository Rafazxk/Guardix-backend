import { Router } from "express";

import PaymentController from "../controllers/PaymentController.js";
import authMiddleware from "../../middleware/authMiddleware.js";
import PaymentWebhookController from "../controllers/PaymentWebhookController.js";

const router = Router();

router.post(
  "/checkout",
  authMiddleware,
  PaymentController.createCheckout
);
 
router.post(
  "/webhook",
  PaymentWebhookController.handle
);

export default router;


