export interface Consulta {
  id: string;
  user_id: string;
  tipo_consulta: string;
  score_risco: number;
  resultado: Record<string, any>;
  data_consulta: Date;
}

export type CreateConsultaDTO = Omit<
  Consulta,
  "id" | "data_consulta"
>;

export interface ConsultaDetalhe {
  id: string;
  consulta_id: string;
  regra_ativada: string;
  pontuacao: number;
  mensagem: string;
  risco: string;
}

export type CreateConsultaDetalheDTO = Omit<
  ConsultaDetalhe,
  "id"
>;