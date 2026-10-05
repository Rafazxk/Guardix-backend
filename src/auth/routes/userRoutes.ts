import { Router, Request, Response } from "express";
import UserController from "../controllers/UserController.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = Router();

const userController = new UserController();

router.post("/register", (req, res) => userController.register(req, res));
router.post("/login", (req, res) => userController.login(req, res));

router.get("/me", authMiddleware, (req: Request, res: Response) =>
  userController.me(req, res)
);

export default router;