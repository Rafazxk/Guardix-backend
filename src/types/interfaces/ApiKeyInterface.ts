export interface ApiKey {
  id: string;
  user_id: string;
  nome: string;
  key_hash: string;
  prefix: string;
  ativa: boolean;
  created_at: Date;
}

export interface CreateApiKeyDTO {
  user_id: string;
  nome: string;
}