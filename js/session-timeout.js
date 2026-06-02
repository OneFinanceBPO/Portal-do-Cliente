// session-timeout.js — Auto-logout after inactivity
// Include in all authenticated pages (not index.html)

const SESSION_TIMEOUT = (() => {
  const TIMEOUT_MS  = 20 * 60 * 1000; // 20 minutes
  const WARNING_MS  = 2  * 60 * 1000; // warn at 2 min remaining
  let timer, warnTimer, countdownInterval;

  function reset() {
    clearTimeout(timer);
    clearTimeout(warnTimer);
    clearInterval(countdownInterval);
    hideWarning();

    warnTimer = setTimeout(showWarning, TIMEOUT_MS - WARNING_MS);
    timer     = setTimeout(logout, TIMEOUT_MS);
  }

  function logout() {
    clearInterval(countdownInterval);
    if (typeof AUTH !== 'undefined') AUTH.clearSession();
    else sessionStorage.clear();
    window.location.href = 'index.html?reason=timeout';
  }

  function showWarning() {
    let secs = Math.floor(WARNING_MS / 1000);
    const modal = document.getElementById('sessionWarningModal');
    if (modal) {
      modal.classList.add('open');
      const cd = document.getElementById('sessionCountdown');
      if (cd) cd.textContent = secs;
      countdownInterval = setInterval(() => {
        secs--;
        if (cd) cd.textContent = secs;
        if (secs <= 0) clearInterval(countdownInterval);
      }, 1000);
    }
  }

  function hideWarning() {
    const modal = document.getElementById('sessionWarningModal');
    if (modal) modal.classList.remove('open');
  }

  function init() {
    ['mousemove','keydown','click','scroll','touchstart'].forEach(e =>
      document.addEventListener(e, reset, { passive: true })
    );
    reset();
  }

  return { init, reset, logout, hideWarning };
})();

document.addEventListener('DOMContentLoaded', () => SESSION_TIMEOUT.init());
