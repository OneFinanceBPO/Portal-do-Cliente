// Cloudflare Worker — One Finance Portal API
// Rotas:
//   POST /api/sync        → sincroniza arquivos JSON no GitHub
//   GET  /api/financeiro  → consulta dados do Neon (extrato_movimentacoes)
//
// Variáveis de ambiente necessárias (Cloudflare Dashboard → Workers → Settings → Variables):
//   GITHUB_TOKEN   — token do GitHub com permissão de escrita no repo
//   APP_SECRET     — segredo compartilhado com o portal (validação de chamadas)
//   ALLOWED_ORIGIN — origem permitida (ex: https://onefinancebpo.github.io)
//   DATABASE_URL   — connection string do Neon (postgresql://user:pass@host/db?sslmode=require)

const REPO = 'OneFinanceBPO/Portal-do-Cliente';
const API  = `https://api.github.com/repos/${REPO}/contents/`;

const MESES_NOME = ['','Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                    'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const MESES_ABR  = ['','Jan','Fev','Mar','Abr','Mai','Jun',
                    'Jul','Ago','Set','Out','Nov','Dez'];

// ─── Helper: consulta Neon via HTTP API ────────────────────────────────────
async function queryNeon(dbUrl, query, params = []) {
  // Extrai o host do connection string para montar o endpoint HTTP
  const u = new URL(dbUrl.replace(/^postgresql:\/\//, 'https://').replace(/^postgres:\/\//, 'https://'));
  const endpoint = `https://${u.hostname}/sql`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': dbUrl,
    },
    body: JSON.stringify({ query, params }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Neon HTTP ${res.status}: ${txt.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.rows ?? [];
}

// ─── Rota: GET /api/financeiro ─────────────────────────────────────────────
async function handleFinanceiro(request, env, corsHeaders) {
  const url  = new URL(request.url);
  const cnpj = url.searchParams.get('cnpj');
  const ano  = parseInt(url.searchParams.get('ano') || new Date().getFullYear(), 10);

  if (!cnpj) {
    return new Response(JSON.stringify({ error: 'Parâmetro cnpj obrigatório' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!env.DATABASE_URL) {
    return new Response(JSON.stringify({ error: 'DATABASE_URL não configurada no Worker' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ── Q1: Fluxo diário realizado ──
  const dailyRows = await queryNeon(env.DATABASE_URL, `
    SELECT
      TO_CHAR(data_lancamento, 'DD/MM/YYYY')   AS dt,
      EXTRACT(MONTH FROM data_lancamento)::int  AS mes,
      ROUND(SUM(CASE WHEN valor > 0 THEN valor   ELSE 0 END)::numeric, 2) AS rec,
      ROUND(SUM(CASE WHEN valor < 0 THEN ABS(valor) ELSE 0 END)::numeric, 2) AS pag
    FROM extrato_movimentacoes
    WHERE empresa_cnpj = $1
      AND EXTRACT(YEAR FROM data_lancamento)::int = $2
      AND situacao IN ('Conciliado', 'Quitado')
      AND resumo NOT LIKE 'Saldo Inicial%'
    GROUP BY data_lancamento
    ORDER BY data_lancamento
  `, [cnpj, ano]);

  // ── Q2: Categorias realizadas ──
  const catRows = await queryNeon(env.DATABASE_URL, `
    SELECT
      EXTRACT(MONTH FROM data_lancamento)::int            AS mes,
      COALESCE(NULLIF(TRIM(categoria), ''), 'Outros')    AS cat,
      CASE WHEN valor > 0 THEN 'rec' ELSE 'pag' END      AS tipo,
      ROUND(SUM(ABS(valor))::numeric, 2)                  AS total
    FROM extrato_movimentacoes
    WHERE empresa_cnpj = $1
      AND EXTRACT(YEAR FROM data_lancamento)::int = $2
      AND situacao IN ('Conciliado', 'Quitado')
      AND resumo NOT LIKE 'Saldo Inicial%'
      AND valor <> 0
    GROUP BY mes, cat, tipo
    ORDER BY mes, tipo, total DESC
  `, [cnpj, ano]);

  // ── Q3: Pendentes (Em aberto / Agendado) ──
  const pendentesRows = await queryNeon(env.DATABASE_URL, `
    SELECT
      TO_CHAR(data_lancamento, 'DD/MM/YYYY')            AS venc,
      data_lancamento::text                              AS venc_iso,
      resumo                                             AS descricao,
      COALESCE(NULLIF(TRIM(categoria), ''), 'Outros')   AS cat,
      ROUND(ABS(valor)::numeric, 2)                     AS val,
      CASE WHEN valor >= 0 THEN 'rec' ELSE 'pag' END    AS tipo,
      situacao
    FROM extrato_movimentacoes
    WHERE empresa_cnpj = $1
      AND situacao IN ('Em aberto', 'Agendado')
    ORDER BY data_lancamento, ABS(valor) DESC
    LIMIT 100
  `, [cnpj]);

  // ── Agrega por mês ──
  const meses = {};

  for (const r of dailyRows) {
    const m   = parseInt(r.mes, 10);
    const rec = parseFloat(r.rec) || 0;
    const pag = parseFloat(r.pag) || 0;

    if (!meses[m]) {
      meses[m] = {
        mes: m, mesNome: MESES_NOME[m], mesAbr: MESES_ABR[m],
        recTotal: 0, pagTotal: 0, qtdRec: 0, qtdPag: 0,
        entItens: [], saiItens: [], rows: [],
      };
    }

    meses[m].recTotal = Math.round((meses[m].recTotal + rec) * 100) / 100;
    meses[m].pagTotal = Math.round((meses[m].pagTotal + pag) * 100) / 100;
    if (rec > 0) meses[m].qtdRec++;
    if (pag > 0) meses[m].qtdPag++;
    meses[m].rows.push({ dt: r.dt, rec, pag });
  }

  // Monta entItens / saiItens por mês (top 8 categorias)
  const catByMes = {};
  for (const r of catRows) {
    const m = parseInt(r.mes, 10);
    if (!catByMes[m]) catByMes[m] = { rec: {}, pag: {} };
    const tipo  = r.tipo;
    const cat   = r.cat;
    const total = parseFloat(r.total) || 0;
    catByMes[m][tipo][cat] = (catByMes[m][tipo][cat] || 0) + total;
  }

  for (const m of Object.keys(meses)) {
    const cats = catByMes[m] || { rec: {}, pag: {} };
    meses[m].entItens = Object.entries(cats.rec)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, val]) => ({ name, val: Math.round(val * 100) / 100 }));
    meses[m].saiItens = Object.entries(cats.pag)
      .sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, val]) => ({ name, val: Math.round(val * 100) / 100 }));
  }

  // ── Processa pendentes ──
  const hoje = new Date().toISOString().slice(0, 10);
  const em15 = new Date(Date.now() + 15 * 864e5).toISOString().slice(0, 10);

  const pendentes = pendentesRows.map(p => {
    let status = 'futuro';
    if (p.venc_iso < hoje)      status = 'atrasado';
    else if (p.venc_iso <= em15) status = 'vencer';
    return {
      desc:  p.descricao,
      cat:   p.cat,
      venc:  p.venc,
      val:   parseFloat(p.val) || 0,
      tipo:  p.tipo,   // 'rec' (entrada) | 'pag' (saída)
      status,
    };
  });

  // ── Anos disponíveis (para o seletor do portal) ──
  const anosRows = await queryNeon(env.DATABASE_URL, `
    SELECT DISTINCT EXTRACT(YEAR FROM data_lancamento)::int AS ano
    FROM extrato_movimentacoes
    WHERE empresa_cnpj = $1
      AND situacao IN ('Conciliado', 'Quitado')
    ORDER BY ano DESC
    LIMIT 10
  `, [cnpj]);

  const anos = anosRows.map(r => parseInt(r.ano, 10));

  return new Response(JSON.stringify({ ano, cnpj, meses, pendentes, anos }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// ─── Rota: POST /api/sync (GitHub) ────────────────────────────────────────
async function handleSync(request, env, corsHeaders) {
  const toB64   = s => btoa(unescape(encodeURIComponent(JSON.stringify(s, null, 2))));
  const fromB64 = s => JSON.parse(decodeURIComponent(escape(atob(s.replace(/\n/g, '')))));

  const { path, content, sha, message } = await request.json();

  let fileSha = sha;
  if (!fileSha) {
    const r = await fetch(API + path, {
      headers: { Authorization: `token ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
    });
    const d = await r.json();
    fileSha = d.sha;
  }

  const res = await fetch(API + path, {
    method: 'PUT',
    headers: {
      Authorization:  `token ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      message: message || `chore: update ${path}`,
      content: toB64(content),
      sha: fileSha,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: data.message }), { status: 500, headers: corsHeaders });
  }
  return new Response(JSON.stringify({ success: true, sha: data.content.sha }), { headers: corsHeaders });
}

// ─── Entry point ──────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const corsHeaders = {
      'Access-Control-Allow-Origin':  env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-App-Secret',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Valida segredo (exceto OPTIONS)
    const secret = request.headers.get('X-App-Secret');
    if (secret !== env.APP_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: corsHeaders,
      });
    }

    const { pathname } = new URL(request.url);

    try {
      if (pathname === '/api/sync' && request.method === 'POST') {
        return await handleSync(request, env, corsHeaders);
      }

      if (pathname === '/api/financeiro' && request.method === 'GET') {
        return await handleFinanceiro(request, env, corsHeaders);
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404, headers: corsHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500, headers: corsHeaders,
      });
    }
  },
};
