interface CacheItem {
  idadeDias: number;
  expiracao: number;
}

class WhoisCache {
  private cache = new Map<string, CacheItem>();
  private readonly TTL_MILISEGUNDOS = 12 * 60 * 60 * 1000; 

  get(domain: string): number | null {
    const item = this.cache.get(domain);
    
    if (!item) return null;

    if (Date.now() > item.expiracao) {
      this.cache.delete(domain);
      return null;
    }

    console.log(`[Cache WHOIS] 🚀 Acierto de cache para o domínio: ${domain}`);
    return item.idadeDias;
  }

  set(domain: string, idadeDias: number): void {
    const expiracao = Date.now() + this.TTL_MILISEGUNDOS;
    this.cache.set(domain, { idadeDias, expiracao });
  }
  
  listarCache() {
    const agora = Date.now();
    const resultados: Array<{ dominio: string; idadeDias: number; expiraEmMinutos: number }> = [];

    for (const [dominio, item] of this.cache.entries()) {
      if (agora > item.expiracao) {
        this.cache.delete(dominio); 
      } else {
        const expiraEmMinutos = Math.round((item.expiracao - agora) / 1000 / 60);
        resultados.push({
          dominio,
          idadeDias: item.idadeDias,
          expiraEmMinutos
        });
      }
    }
    return resultados;
  }

  limpar() {
    this.cache.clear();
    console.log("[Cache WHOIS] 🧹 Cache limpo manualmente.");
  }
}

export default new WhoisCache();