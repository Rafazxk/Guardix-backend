import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckDomainAge from "../../src/domain/rules/link/checkDomainAge.js";

describe("Regra: CheckDomainAge", () => {
  let regra: CheckDomainAge;

  beforeEach(() => {
    regra = new CheckDomainAge();
    vi.clearAllMocks();
  });

  it("deve retornar null (sem idade) caso a API nao encontre o dominio", async () => {
    // Forçamos o método getDomainAge a retornar null (simulando que a API falhou)
    vi.spyOn(regra, "getDomainAge").mockResolvedValue(null);

    const resultado = await regra.execute({ domain: "dominio-inexistente.com" });

    expect(resultado).toBeNull();
  });

  it("deve retornar pontuação 100 para domínios extremamente recentes (< 7 dias)", async () => {
    // Simulamos que o domínio tem apenas 3 dias de vida
    vi.spyOn(regra, "getDomainAge").mockResolvedValue(3);

    const resultado = await regra.execute({ domain: "golpe-recente.com" });

    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(100);
    expect(resultado?.mensagem).toContain("Domínio extremamente recente");
  });

  it("deve retornar pontuação 60 para domínios criados há menos de 1 mês (< 30 dias)", async () => {
    vi.spyOn(regra, "getDomainAge").mockResolvedValue(15);

    const resultado = await regra.execute({ domain: "site-novo.com" });

    expect(resultado?.pontuacao).toBe(60);
    expect(resultado?.mensagem).toContain("menos de 1 mês");
  });

  it("deve retornar pontuação 30 para domínios recentes (menos de 6 meses)", async () => {
    vi.spyOn(regra, "getDomainAge").mockResolvedValue(90);

    const resultado = await regra.execute({ domain: "site-suspeito-medio.com" });

    expect(resultado?.pontuacao).toBe(30);
  });

  it("deve retornar null para domínios com mais de 6 meses (considerados seguros)", async () => {
    // Domínio com 400 dias (mais de 180 dias)
    vi.spyOn(regra, "getDomainAge").mockResolvedValue(400);

    const resultado = await regra.execute({ domain: "google.com" });

    expect(resultado).toBeNull(); // Não gera alerta de idade
  });
});