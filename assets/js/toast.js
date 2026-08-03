// toast.js — Notification toasts
const TOAST = (() => {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
      document.body.appendChild(container);
    }
    return container;
  }

  const ICONS = { success:'✓', error:'✗', warning:'⚠', info:'ℹ' };
  const COLORS = {
    success: { bg:'rgba(34,197,94,.12)',  border:'rgba(34,197,94,.3)',  color:'#22c55e' },
    error:   { bg:'rgba(244,63,94,.12)',  border:'rgba(244,63,94,.3)',  color:'#f43f5e' },
    warning: { bg:'rgba(251,191,36,.12)', border:'rgba(251,191,36,.3)', color:'#fbbf24' },
    info:    { bg:'rgba(59,130,246,.12)', border:'rgba(59,130,246,.3)', color:'#3b82f6' },
  };
  const DURATIONS = { success:4000, info:4000, warning:6000, error:6000 };

  function show(message, type = 'info') {
    const c = COLORS[type] || COLORS.info;
    const toast = document.createElement('div');
    toast.style.cssText = `pointer-events:all;display:flex;align-items:flex-start;gap:10px;padding:12px 16px;border-radius:10px;border:1px solid ${c.border};background:${c.bg};backdrop-filter:blur(8px);font-size:13px;color:var(--text,#f0f4ff);max-width:320px;box-shadow:0 4px 20px rgba(0,0,0,.4);font-family:inherit;opacity:0;transform:translateY(12px);transition:all .25s ease;`;
    toast.innerHTML = `<span style="color:${c.color};font-weight:700;font-size:15px;flex-shrink:0">${ICONS[type]||'ℹ'}</span><span style="flex:1;line-height:1.4">${message}</span><button onclick="this.closest('[data-toast]').remove()" style="background:none;border:none;color:var(--text2,#8ba0c4);cursor:pointer;font-size:16px;padding:0;line-height:1;flex-shrink:0">✕</button>`;
    toast.setAttribute('data-toast', '');
    getContainer().appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px)';
      setTimeout(() => toast.remove(), 300);
    }, DURATIONS[type] || 4000);
  }

  return { show };
})();
