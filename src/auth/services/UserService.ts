import jwt from "jsonwebtoken";
import UserRepository from "../repositories/UserRepository.js";
import bcrypt from "bcryptjs";

// Interface atualizada incluindo o 'nome' exigido pelo repositório
interface RegisterDTO {
  nome: string;
  email: string;
  senha: string;
  tipo_pessoa: string;
}

interface LoginDTO {
  email: string;
  senha: string;
}

class UserService {
  async register({ nome, email, senha, tipo_pessoa }: RegisterDTO) {
    const userExists = await UserRepository.findByEmail(email);

    if (userExists) {
      throw new Error("Usuário já existe");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const user = await UserRepository.create({
      nome,
      email,
      senha: senhaHash,
      tipo_pessoa,
    });

    return user;
  }

  async login({ email, senha }: LoginDTO) {
    const user = await UserRepository.findByEmail(email);

    if (!user) {
      throw new Error("Usuário não encontrado");
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);

    if (!senhaValida) {
      throw new Error("Senha inválida");
    }

    if (!user.email_verified) { throw new Error("E-mail não verificado"); }

    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      throw new Error("JWT_SECRET não está definido nas variáveis de ambiente.");
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email,
      },
      secret,
      { expiresIn: "1d" }
    );

    console.log("TOKEN USUARIO NO SERVICE: ", token);

    return { user, token };
  }

async getCurrentUser(userId: string) {
  const user = await UserRepository.findById(userId);

  if (!user) {
    throw new Error("Usuário não encontrado.");
  }

  return {
    id: user.user_id,
    nome: user.nome,
    email: user.email,
    plano: user.plano,
    tipo_pessoa: user.tipo_pessoa,
    email_verified: user.email_verified,
  };
}

  async virarPro(userId: string | number) {
    const user = await UserRepository.findById(userId);
    if (!user) throw new Error("Usuário não encontrado.");

    return await UserRepository.updatePlan(userId, "pro");
  }
}

export default new UserService();