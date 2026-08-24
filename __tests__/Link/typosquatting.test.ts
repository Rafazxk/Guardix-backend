import { describe, it, expect } from 'vitest';
import CheckTyposquatting from '../../src/domain/rules/link/CheckTyposquatting.js'; // Ajuste o caminho

describe('Regra: CheckTyposquatting', () => {
  const regra = new CheckTyposquatting();

  it('Deve retornar null (seguro) para os domínios oficiais', async () => {
    
    const resultados = await Promise.all([
      regra.execute({ domain: 'google.com' }),
      regra.execute({ domain: 'nubank.com.br' }), 
      regra.execute({ domain: 'itau.net' })
    ]);

    for (const resultado of resultados) {
      expect(resultado).toBeNull();
    }
  });

  it('Deve retornar null (seguro) para domínios comuns e sem relação com a lista', async () => {
    const resultado = await regra.execute({ domain: 'meublog-pessoal.com.br' });
    expect(resultado).toBeNull();
  });

  it('Deve pontuar 100 se o golpista tentar usar ".com" no meio de um domínio falso', async () => {
    const contexto = { domain: 'nubank.com.promocaofalsa.net' };
    const resultado = await regra.execute(contexto);

    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(100);
    expect(resultado?.regra).toBe('CHECK_TYPOSQUATTING');
    expect(resultado?.mensagem).toBe('Marca nubank detectada');
  });

  it('Deve pontuar 80 quando o domínio for visualmente parecido (Levenshtein = 1 ou 2)', async () => {
    const contexto1 = { domain: 'faceb00k.com' };
    const resultado1 = await regra.execute(contexto1);

    expect(resultado1).not.toBeNull();
    expect(resultado1?.pontuacao).toBe(80);
    expect(resultado1?.mensagem).toBe('Domínio visualmente parecido com facebook');

    const contexto2 = { domain: 'go0gle.com.br' };
    const resultado2 = await regra.execute(contexto2);

    expect(resultado2?.pontuacao).toBe(80);
  });

  it('Deve testar diretamente a função de Levenshtein', () => {
    const distancia1 = regra.levenshtein('google', 'g00gle');
    expect(distancia1).toBe(2);

    const distancia2 = regra.levenshtein('itau', 'itua');
    expect(distancia2).toBe(2);

    const distancia3 = regra.levenshtein('paypal', 'payppal');
    expect(distancia3).toBe(1);
  });
});