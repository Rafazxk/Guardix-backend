import { describe, it, expect } from "vitest";
import CheckSuspiciousTLD from "../../src/domain/rules/link/CheckSuspiciousTLD.js"; // Ajuste o caminho se necessário

describe("Regra: CheckSuspiciousTLD", () => {
  const regra = new CheckSuspiciousTLD();

  it("deve retornar null para domínios com TLDs comuns e seguros (ex: .com, .com.br)", async () => {
    const resultadoCom = await regra.execute({ domain: "nubank.com" });
    const resultadoBr = await regra.execute({ domain: "banco.com.br" });

    expect(resultadoCom).toBeNull();
    expect(resultadoBr).toBeNull();
  });

  it("deve retornar null se o domínio vier vazio", async () => {
    const resultado = await regra.execute({ domain: "" });
    expect(resultado).toBeNull();
  });

  it("deve pontuar e sinalizar corretamente quando o TLD for suspeito", async () => {

    const resultado = await regra.execute({ domain: "promocao-imperdivel.xyz" });

    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(40);
    expect(resultado?.regra).toBe("CHECK_SUSPICIOUS_TLD");
    expect(resultado?.mensagem).toBe("TLD Suspeito: .xyz");
  });

  it("deve identificar corretamente TLDs suspeitos mesmo com múltiplos subdomínios", async () => {
    const resultado = await regra.execute({ domain: "login.seguro.site.click" });

    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(40);
    expect(resultado?.mensagem).toBe("TLD Suspeito: .click");
  });
});