import { describe, it, expect, vi, beforeEach } from 'vitest'; 
import LinkAnalysisServiceInstance from '../../src/services/LinkAnalysisService'; 

describe('LinkAnalysisService', () => {
  
  beforeEach(() => {
    vi.clearAllMocks(); 
  });

  it('Deve retornar erro para uma URL inválida', async () => {
    const context = { url: 'isso-nao-e-uma-url' };
    const resultado = await LinkAnalysisServiceInstance.execute(context);

    expect(resultado.status).toBe('Erro');
    expect(resultado.classificacao).toBe('Inválido');
    expect(resultado.conclusao).toBe('URL Inválida');
    expect(resultado.score).toBe(0);
  });



  it('Deve retornar "Seguro" quando a engine não encontrar riscos (score 0)', async () => {
    vi.spyOn((LinkAnalysisServiceInstance as any).engine, 'execute').mockResolvedValue({
      score: 0,
      classificacao: 'Seguro',
      riscos: []
    });

    const context = { url: 'https://site-seguro.com.br' };
    const resultado = await LinkAnalysisServiceInstance.execute(context);

    expect(resultado.status).toBe('Seguro');
    expect(resultado.score).toBe(0);
    expect(resultado.conclusao).toBe('Não detectamos ameaças neste link.');
  });

  it('Deve traduzir riscos técnicos para alertas humanos e mapear tipo de golpe', async () => {
    vi.spyOn((LinkAnalysisServiceInstance as any).engine, 'execute').mockResolvedValue({
      score: 150,
      classificacao: 'Suspeito',
      riscos: ['marca', 'TLD']
    });

    const context = { url: 'https://nubank.pagamentos-br.xyz' };
    const resultado = await LinkAnalysisServiceInstance.execute(context);

    expect(resultado.alertas).toContain('O site tenta imitar uma empresa conhecida.');
    expect(resultado.alertas).toContain('O endereço utiliza uma terminação suspeita.');

    expect(resultado.tipoGolpe).toContain('Phishing / Roubo de Dados');
    expect(resultado.tipoGolpe).toContain('Ameaça de Infraestrutura');

    expect(resultado.conclusao).toBe('Evite realizar pagamentos neste endereço.');
  });

  it('Deve recomendar bloqueio total para scores muito altos (>= 200)', async () => {
    vi.spyOn((LinkAnalysisServiceInstance as any).engine, 'execute').mockResolvedValue({
      score: 250,
      classificacao: 'Perigoso',
      riscos: ['recente']
    });

    const context = { url: 'https://promocao-imperdivel-agora.com' };
    const resultado = await LinkAnalysisServiceInstance.execute(context);

    expect(resultado.conclusao).toBe('NÃO forneça senhas ou dados pessoais.');
  });
});