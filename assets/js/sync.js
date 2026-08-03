/* ── ONE FINANCE — GitHub Sync ── */
const GH_SYNC = (() => {
  const REPO    = 'OneFinanceBPO/Portal-do-Cliente';
  const API     = `https://api.github.com/repos/${REPO}/contents/`;
  const RAW     = `https://raw.githubusercontent.com/${REPO}/main/`;
  const TOKEN_KEY  = 'of_github_token';
  const WORKER_KEY = 'of_worker_url';
  const SECRET_KEY = 'of_app_secret';

  const sha = {};   // cache: sha['data/clients.json'] = '...'

  function getToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }

  function getWorkerUrl() { return localStorage.getItem(WORKER_KEY) || ''; }
  function setWorkerUrl(u) { localStorage.setItem(WORKER_KEY, u); }
  function getAppSecret() { return localStorage.getItem(SECRET_KEY) || ''; }
  function setAppSecret(s) { localStorage.setItem(SECRET_KEY, s); }

  const toB64   = s => btoa(unescape(encodeURIComponent(s)));
  const fromB64 = s => decodeURIComponent(escape(atob(s.replace(/\n/g, ''))));

  async function hashPassword(pwd) {
    if (!pwd) return '';
    const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pwd));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  /* Internal: fetch a JSON file from GitHub (via API to get SHA, or raw as fallback) */
  async function fetchFile(path) {
    const token = getToken();
    const headers = { Accept: 'application/vnd.github.v3+json' };
    if (token) headers.Authorization = `token ${token}`;

    try {
      const res  = await fetch(API + path, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      sha[path] = data.sha;
      return JSON.parse(fromB64(data.content));
    } catch {
      // Fallback: raw URL (no SHA, write will re-fetch SHA)
      const res = await fetch(RAW + path + '?t=' + Date.now());
      if (!res.ok) throw new Error('Fetch failed');
      return await res.json();
    }
  }

  /* Internal: write a JSON file to GitHub */
  async function writeFile(path, payload) {
    const workerUrl = getWorkerUrl();

    // ── Worker mode (recommended) ──
    if (workerUrl) {
      try {
        const res = await fetch(`${workerUrl}/api/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-App-Secret': getAppSecret(),
          },
          body: JSON.stringify({ path, content: payload, sha: sha[path] }),
        });
        const data = await res.json();
        if (!res.ok) return { ok: false, error: data.error };
        if (data.sha) sha[path] = data.sha;
        return { ok: true };
      } catch (e) {
        return { ok: false, error: e.message };
      }
    }

    // ── Legacy: direct GitHub token ──
    const token = getToken();
    if (!token) return { ok: false, noToken: true };

    const headers = {
      Authorization: `token ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github.v3+json',
    };

    // Ensure we have the SHA
    if (!sha[path]) {
      const r = await fetch(API + path, { headers });
      const d = await r.json();
      sha[path] = d.sha;
    }

    const res  = await fetch(API + path, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `chore: update ${path}`,
        content: toB64(JSON.stringify(payload, null, 2)),
        sha: sha[path],
      }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.message };
    sha[path] = data.content.sha;
    return { ok: true };
  }

  /* ── PUBLIC API ── */
  return {
    getToken,
    setToken,
    getWorkerUrl,
    setWorkerUrl,
    getAppSecret,
    setAppSecret,
    hashPassword,

    async testToken(token) {
      const r = await fetch(API + 'data/clients.json', {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github.v3+json',
        }
      });
      return r.ok;
    },

    /* CLIENTS */
    async loadClients() {
      try { return (await fetchFile('data/clients.json')).clients || []; }
      catch { return []; }
    },
    async saveClients(list) {
      return writeFile('data/clients.json', { clients: list });
    },

    /* PERFIS */
    async loadPerfis() {
      try { return (await fetchFile('data/perfis.json')).perfis || []; }
      catch { return []; }
    },
    async savePerfis(list) {
      return writeFile('data/perfis.json', { perfis: list });
    },
  };
})();
