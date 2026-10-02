import express from "express";
import ExtensionController from "../controllers/ExtensionController.js";

const router = express.Router();

router.post(
  "/analyze",
  ExtensionController.analisarLink
);

export default router;