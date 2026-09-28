export type TipoConsulta =
  | "link"
  | "telefone"
  | "print";

export interface Consulta {
  consulta_id: number;
  user_id: string;
  key_id?: string | null;
  tipo_consulta: TipoConsulta;
  score_risco: number;
  resultado: Record<string, any>;
  data_consulta: Date;
}

export type CreateConsultaDTO = Omit<
  Consulta,
  "consulta_id" | "data_consulta"
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