import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckReportsRule from "../../src/domain/phone/rules/CheckReportsRule"; 
import PhoneReportsRepository from "../../src/repositories/PhoneReportsRepository.js";

describe("Regra: CheckReportsRule", () => {
  const regra = new CheckReportsRule();

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("deve retornar score 0 se o número não possuir denúncias (count = 0)", async () => {
    vi.spyOn(PhoneReportsRepository, "countReports").mockResolvedValue(0);

    const resultado = await regra.execute("11988887777");
    
    expect(resultado.score).toBe(0);
    expect(resultado.message).toBeNull();
  });

  it("deve retornar score 20 se o número possuir entre 1 e 4 denúncias", async () => {
    vi.spyOn(PhoneReportsRepository, "countReports").mockResolvedValue(3);

    const resultado = await regra.execute("11988887777");

    expect(resultado.score).toBe(20);
    expect(resultado.message).toBe("Este número possui 3 denúncia(s) no sistema.");
  });

  it("deve retornar score 100 se o número possuir 5 ou mais denúncias", async () => {
    vi.spyOn(PhoneReportsRepository, "countReports").mockResolvedValue(5);

    const resultado = await regra.execute("11988887777");

    expect(resultado.score).toBe(100);
    expect(resultado.message).toBe("Muitas denúncias vinculadas a este número!");
  });

  it("deve tratar o retorno do repositório vindo como string numérica com segurança", async () => {
    // Simula o banco retornando uma string "2" em vez de número
    vi.spyOn(PhoneReportsRepository, "countReports").mockResolvedValue("2" as any);

    const resultado = await regra.execute("11988887777");

    expect(resultado.score).toBe(20);
    expect(resultado.message).toContain("2 denúncia(s)");
  });
});