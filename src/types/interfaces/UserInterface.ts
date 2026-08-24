export interface User {
  user_id: string;
  nome: string;
  email: string;
  senha: string;
  tipo_pessoa: string;
  plano: string;
}

export interface PublicUser {
  user_id: string;
  nome: string;
  email: string;
  tipo_pessoa: string;
  plano: string;
}

export interface AuthResponse {
  user: PublicUser;
  token: string;
}