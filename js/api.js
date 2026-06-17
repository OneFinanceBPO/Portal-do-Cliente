/* ── ONE FINANCE — API Client ──
 * Busca dados financeiros do Neon via Cloudflare Worker.
 * Cache em sessionStorage (5 minutos por cnpj+ano).
 */
const OF_API = (() => {
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  function workerUrl()  { return localStorage.getItem('of_worker_url') || ''; }
  function appSecret()  { return localStorage.getItem('of_app_secret') || ''; }

  function cacheKey(cnpj, ano) { return `of_fin_${cnpj}_${ano}`; }

  function cacheGet(cnpj, ano) {
    try {
      const raw = sessionStorage.getItem(cacheKey(cnpj, ano));
      if (!raw) return null;
      const { data, ts } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(cacheKey(cnpj, ano)); return null; }
      return data;
    } catch { return null; }
  }

  function cacheSet(cnpj, ano, data) {
    try { sessionStorage.setItem(cacheKey(cnpj, ano), JSON.stringify({ data, ts: Date.now() })); } catch {}
  }

  async function fetchFinanceiro(cnpj, ano) {
    const base = workerUrl();
    if (!base) throw new Error('URL do Worker não configurada. Acesse Gerenciamento → Configurações.');

    const url = `${base}/api/financeiro?cnpj=${encodeURIComponent(cnpj)}&ano=${ano}`;
    const res = await fetch(url, {
      headers: { 'X-App-Secret': appSecret() },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(`API ${res.status}: ${err.error || res.statusText}`);
    }

    return res.json();
  }

  /**
   * Retorna dados financeiros do CNPJ para o ano dado.
   * Formato retornado:
   * {
   *   ano, cnpj, anos,
   *   meses: {
   *     "1": { mes, mesNome, mesAbr, recTotal, pagTotal, qtdRec, qtdPag,
   *            entItens:[{name,val}], saiItens:[{name,val}], rows:[{dt,rec,pag}] }
   *   },
   *   pendentes: [{ desc, cat, venc, val, status }]
   * }
   */
  async function getFinanceiro(cnpj, ano) {
    const cached = cacheGet(cnpj, ano);
    if (cached) return cached;

    const data = await fetchFinanceiro(cnpj, ano);
    cacheSet(cnpj, ano, data);
    return data;
  }

  /** Invalida o cache de um cliente (ex: após novo extrato ser gerado) */
  function invalidar(cnpj) {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(`of_fin_${cnpj}_`)) sessionStorage.removeItem(key);
    }
  }

  return { getFinanceiro, invalidar };
})();
