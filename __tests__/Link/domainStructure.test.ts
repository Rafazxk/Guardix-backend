import { describe, it, expect } from "vitest";
import CheckDomainStructure from "../../src/domain/rules/link/checkDomainStructure.js"; // Ajuste o caminho se necessário

describe("Regra: CheckDomainStructure", () => {
  const regra = new CheckDomainStructure();

  it("deve retornar null para domínios estruturalmente normais e seguros", async () => {
    const resultado = await regra.execute({ domain: "nubank.com.br" });
    expect(resultado).toBeNull();
  });

  it("deve retornar null se o domínio vier vazio", async () => {
    const resultado = await regra.execute({ domain: "" });
    expect(resultado).toBeNull();
  });

  it("deve detectar e pontuar TLDs de alto risco", async () => {
    // .xyz está no dicionário com pontuação 40
    const resultado = await regra.execute({ domain: "promocao-site.xyz" });

    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(40);
    expect(resultado?.regra).toBe("CHECK_DOMAIN_STRUCTURE");
    expect(resultado?.mensagem).toContain("TLD de alto risco detectado: .xyz");
  });

  it("deve penalizar excesso de subdomínios (partes > 3)", async () => {
   
    
    const resultado = await regra.execute({ domain: "login.nubank.com.br" });

    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(20);
    expect(resultado?.mensagem).toContain("Excesso de subdomínios detectado");
  });

  it("deve penalizar o uso excessivo de hífens (> 2)", async () => {
    // Contém 3 hífens -> adiciona 25 pontos
    const resultado = await regra.execute({ domain: "site-de-pagamento-seguro.com" });

    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(25);
    expect(resultado?.mensagem).toContain("Uso excessivo de hífens");
  });

  it("deve acumular pontuações quando múltiplos riscos ocorrem simultaneamente", async () => {
    const resultado = await regra.execute({ domain: "sub.login.um-dois-tres-quatro.xyz" });
    
    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(85);
    expect(resultado?.mensagem).toContain("TLD de alto risco");
    expect(resultado?.mensagem).toContain("Excesso de subdomínios");
    expect(resultado?.mensagem).toContain("Uso excessivo de hífens");
  });
});