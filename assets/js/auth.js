// auth.js — Client-side route protection
// NOTE: This is client-side only. Real security requires server-side validation.

const AUTH = (() => {
  const SESSION_KEY = 'of_session';

  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch { return null; }
  }

  function setSession(data) {
    // Never store password
    const { senha, ...safe } = data;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(safe));
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
  }

  function requireAuth() {
    if (!getSession()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  function requireAdmin() {
    const s = getSession();
    if (!s || (s.tipo !== 'adm' && s.tipo !== 'Administrador')) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  return { getSession, setSession, clearSession, requireAuth, requireAdmin };
})();
