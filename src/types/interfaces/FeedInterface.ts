export interface FeedItem {
  tipo: "link" | "telefone";
  valor: string;
  total: string;
}

export interface FeedStatistics {
  total_consultas: string;
  ameacas_evitadas: string;
  total_reportados: string;
}

export interface CreateDenunciaDTO {
  tipo: "link" | "telefone";
  valor: string;
  descricao?: string;
}