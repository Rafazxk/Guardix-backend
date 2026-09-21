export interface PlanConfig {
  maxConsultasLinks: number; // -1 ilimitado
  maxConsultasTelefones: number;
  maxConsultasPrints: number;
  detalharIa: boolean;
  guardarHistorico: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  free: {
    maxConsultasLinks: 5,
    maxConsultasTelefones: 5,
    maxConsultasPrints: 3,
    detalharIa: false,
    guardarHistorico: true,
  },

  pro: {
    maxConsultasLinks: -1, // Ilimitado
    maxConsultasTelefones: -1, // Ilimitado
    maxConsultasPrints: -1, // Ilimitado
    detalharIa: true,
    guardarHistorico: true,
  },
  
  premium: {
    maxConsultasLinks: -1,
    maxConsultasTelefones: -1,
    maxConsultasPrints: -1,
    detalharIa: true,
    guardarHistorico: true,
  },
};