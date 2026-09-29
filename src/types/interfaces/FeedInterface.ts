export interface FeedItem {
  tipo: "link" | "telefone";
  valor: string;
  total: string; 
}

export interface FeedStatistics {
  total_consultas: string;
  ameacas_evitadas: string;
  analises_seguras: string;
  total_reportados: string;
}

export interface CreateDenunciaDTO {
  tipo: "link" | "telefone";
  valor: string;
}

export interface FeedPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeedResponse {
  items: FeedItem[];
  pagination: FeedPagination;
}