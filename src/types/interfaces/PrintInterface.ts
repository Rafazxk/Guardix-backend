export interface Print {
  id: string;
  id_hash: string;
  consulta_id: string;
  caminho_arquivo: string;
  texto_extraido: string;
  tipo_golpe: string;
  score_risco: number;
}

export type CreatePrintDTO = Omit<Print, "id">;

export interface PrintAnalysisInput {
  image_path: string;
  plano?: string;
}

export interface PrintAnalysisData {
  score: number;
  classificacao: string;
  fatores: string[];
  texto_extraido?: string;
}

export interface PrintAnalysisResponse {
  id_hash: string;
  texto_extraido?: string;
  score: number;
  classificacao: string;
  alertas: string[];
  conclusao: string;
}