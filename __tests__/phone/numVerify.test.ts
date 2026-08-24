import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckNumverifyRule from "../../src/domain/phone/rules/CheckNumverifyRule"; 
import NumverifyClient from "../../src/integrations/NumverifyClient.js";

describe("Regra: CheckNumverifyRule", () => {
  const regra = new CheckNumverifyRule();

  beforeEach(() => {
    vi.restoreAllMocks(); // Limpa os spies/mocks anteriores
  });

  it("deve retornar score 0 se o número for válido", async () => {
    // Espiona o método da instância e simula o retorno de sucesso
    vi.spyOn(NumverifyClient, "validate").mockResolvedValue({
      success: true,
      valid: true,
    });

    const resultado = await regra.execute("123456789");
    
    expect(resultado.score).toBe(0);
    expect(resultado.message).toBeNull();
  });

  it("deve penalizar em 70 pontos se o número for inexistente", async () => {
    vi.spyOn(NumverifyClient, "validate").mockResolvedValue({
      success: true,
      valid: false,
    });

    const resultado = await regra.execute("123456789");

    expect(resultado.score).toBe(70);
    expect(resultado.message).toBe("A operadora informa que este número é inexistente.");
  });

  it("deve retornar score 0 se a API falhar (success: false)", async () => {
    vi.spyOn(NumverifyClient, "validate").mockResolvedValue({
      success: false,
      error: { type: "invalid_access_key" },
    });

    const resultado = await regra.execute("123456789");

    expect(resultado.score).toBe(0);
    expect(resultado.message).toBeNull();
  });

  it("deve retornar score 0 se houver um erro de rede (exceção)", async () => {
    vi.spyOn(NumverifyClient, "validate").mockRejectedValue(new Error("Network Error"));

    const resultado = await regra.execute("123456789");

    expect(resultado.score).toBe(0);
    expect(resultado.message).toBeNull();
  });
});