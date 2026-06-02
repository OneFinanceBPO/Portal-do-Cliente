// Cloudflare Worker — One Finance GitHub Sync Proxy
// Deploy at: https://dash.cloudflare.com → Workers
// Set env vars: GITHUB_TOKEN, APP_SECRET, ALLOWED_ORIGIN

const REPO = 'OneFinanceBPO/Portal-do-Cliente';
const API  = `https://api.github.com/repos/${REPO}/contents/`;

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-App-Secret',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: corsHeaders });
    }

    // Validate app secret
    const secret = request.headers.get('X-App-Secret');
    if (secret !== env.APP_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }

    const { path, content, sha, message } = await request.json();

    // Get current SHA if not provided
    let fileSha = sha;
    if (!fileSha) {
      const r = await fetch(API + path, {
        headers: { Authorization: `token ${env.GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' }
      });
      const d = await r.json();
      fileSha = d.sha;
    }

    const toB64 = s => btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2))));

    const res = await fetch(API + path, {
      method: 'PUT',
      headers: {
        Authorization: `token ${env.GITHUB_TOKEN}`,
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
    if (!res.ok) return new Response(JSON.stringify({ error: data.message }), { status: 500, headers: corsHeaders });

    return new Response(JSON.stringify({ success: true, sha: data.content.sha }), { headers: corsHeaders });
  }
};
