import { Router } from "express";
import UserController from "../controllers/UserController.js";

const router = Router();

const userController = new UserController();

router.get('/test-connection', (req, res) => {
  console.log("TESTE DE CONEXAO RECEBIDO NO BACKEND");
  res.json({ message: "Conexão estabelecida com sucesso!" });
});

router.post("/register", (req, res) => userController.register(req, res));
router.post("/login", (req, res) => userController.login(req, res));

export default router;