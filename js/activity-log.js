/* ── ONE FINANCE — Activity Log ── */
const ACTIVITY_LOG = (() => {
  const KEY     = 'of_activity_log';
  const MAX     = 300;

  const LABELS = {
    login:          'Login',
    logout:         'Logout',
    session_expired:'Sessão expirada',
    client_add:     'Cliente adicionado',
    client_edit:    'Cliente editado',
    client_delete:  'Cliente excluído',
    perfil_add:     'Perfil criado',
    perfil_edit:    'Perfil editado',
    perfil_delete:  'Perfil excluído',
    password_reset: 'Senha redefinida',
    sync_ok:        'Sincronização OK',
    sync_error:     'Erro de sincronização',
    token_config:   'Token configurado',
  };

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); }
    catch { return []; }
  }

  function save(entries) {
    localStorage.setItem(KEY, JSON.stringify(entries.slice(-MAX)));
  }

  function add(action, details = '', user = '') {
    const entries = load();
    if (!user) {
      try {
        const s = JSON.parse(sessionStorage.getItem('of_session') || 'null');
        user = s?.email || localStorage.getItem('of_login_email') || '—';
      } catch { user = '—'; }
    }
    entries.push({
      id:        Date.now() + Math.random(),
      ts:        new Date().toISOString(),
      action,
      details:   details || '',
      user,
    });
    save(entries);
  }

  function getAll() { return load().slice().reverse(); }
  function clear()  { localStorage.removeItem(KEY); }

  function label(action) { return LABELS[action] || action; }

  function exportCSV() {
    const entries = load();
    if (!entries.length) return;

    const header = ['Data/Hora', 'Usuário', 'Ação', 'Detalhes'];
    const rows   = entries.map(e => [
      new Date(e.ts).toLocaleString('pt-BR'),
      e.user,
      label(e.action),
      e.details,
    ]);

    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), {
      href:     url,
      download: `log-atividades-${new Date().toISOString().slice(0,10)}.csv`,
    });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return { add, getAll, clear, label, exportCSV };
})();
