import { Router } from "express";

import VerificationCodeController from "../controllers/VerificationCodeController.js";

const router = Router();

router.post(
  "/send",
  (req, res) => VerificationCodeController.sendVerificationCode(req, res)
);

router.post(
  "/verify-email", (req, res) =>VerificationCodeController.verifyEmail(req, res)
);

export default router;

