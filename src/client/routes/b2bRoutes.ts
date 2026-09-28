import { Router } from "express";

import B2BController from "../controllers/B2BController.js";
import apiAuth from "../../middleware/apiAuth.js";


const router = Router();

router.post("/analisar", apiAuth, B2BController.analisar);

export default router;