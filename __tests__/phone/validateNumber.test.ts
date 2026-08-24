import { describe, it, expect } from "vitest";
import ValidateNumberRule from "../../src/domain/phone/rules/ValidateNumberRule";

describe("Regra: ValidateNumberRule", () => {
  const regra = new ValidateNumberRule();

  it("deve retornar score 0 para um número brasileiro válido com 11 dígitos (com DDD e 9º dígito)", async () => {
    const resultado = await regra.execute("(81) 98888-7777");

    expect(resultado.score).toBe(0);
    expect(resultado.message).toBeNull();
  });

  it("deve retornar score 0 para um número local com 10 dígitos", async () => {
    const resultado = await regra.execute("8188887777");

    expect(resultado.score).toBe(0);
    expect(resultado.message).toBeNull();
  });

  it("deve retornar score 70 se o número tiver menos de 10 dígitos", async () => {
    const resultado = await regra.execute("12345"); // 5 dígitos

    expect(resultado.score).toBe(70);
    expect(resultado.message).toBe("Número com formato internacional ou local inválido.");
  });

  it("deve retornar score 70 se o número tiver mais de 15 dígitos", async () => {
    const resultado = await regra.execute("55119888877771234"); // 17 dígitos

    expect(resultado.score).toBe(70);
    expect(resultado.message).toBe("Número com formato internacional ou local inválido.");
  });

  it("deve retornar score 70 se a string contiver apenas letras ou símbolos sem números suficientes", async () => {
    const resultado = await regra.execute("abc-xyz");

    expect(resultado.score).toBe(70);
    expect(resultado.message).toBe("Número com formato internacional ou local inválido.");
  });
});