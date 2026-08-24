import { describe, it, expect, vi, beforeEach } from 'vitest';
import CheckBlacklist from '../../src/domain/rules/link/CheckBlacklist.js';

describe('Regra: CheckBlacklist', () => {

  const mockBlacklistRepository = {
    findByDomain: vi.fn() 
  };

  // 2. Injetamos o repositório falso na regra
  const regra = new CheckBlacklist(mockBlacklistRepository as any);

  // Limpamos o histórico de chamadas antes de cada teste
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Deve retornar null (seguro) se o domínio NÃO estiver na blacklist', async () => {
    // 3. Forçamos o repositório falso a responder 'false' (não encontrou na lista)
    mockBlacklistRepository.findByDomain.mockResolvedValue(false);

    const contexto = { domain: 'site-limpo-e-seguro.com.br' };
    const resultado = await regra.execute(contexto);

    expect(resultado).toBeNull(); // O site passa ileso
    
    // Bônus: garantimos que a regra realmente consultou o banco com o domínio certo
    expect(mockBlacklistRepository.findByDomain).toHaveBeenCalledWith('site-limpo-e-seguro.com.br');
  });

  it('Deve retornar pontuação máxima (bloqueio) se o domínio ESTIVER na blacklist', async () => {
   
    mockBlacklistRepository.findByDomain.mockResolvedValue({ domain: "site-de-golpe.com"});

    const contexto = { domain: 'site-de-golpe-conhecido.com' };
    const resultado = await regra.execute(contexto);

    expect(resultado).not.toBeNull();
    expect(resultado?.pontuacao).toBe(150); 
    expect(resultado?.regra).toBe('CHECK_BLACKLIST');
  });

  it('Deve tratar o caso onde a URL/domain vem vazia', async () => {
    const contexto = { domain: '' };
    const resultado = await regra.execute(contexto);

    expect(resultado).toBeNull();
    
    expect(mockBlacklistRepository.findByDomain).not.toHaveBeenCalled();
  });
});