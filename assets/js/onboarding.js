/* ── ONE FINANCE — Onboarding Tour ── */
const ONBOARDING = (() => {
  const DONE_KEY  = 'of_onboarding_done';
  const STEPS_KEY = 'of_onboarding_step';

  let steps   = [];
  let current = 0;
  let overlay, popover, spotlight;

  // ── Public: define steps and start tour
  function init(stepDefs) {
    steps = stepDefs;
    // Don't auto-start if already completed
    if (localStorage.getItem(DONE_KEY)) return;
    const saved = parseInt(localStorage.getItem(STEPS_KEY) || '0', 10);
    current = isNaN(saved) ? 0 : saved;
    buildDOM();
    show(current);
  }

  // ── Public: force restart
  function restart() {
    localStorage.removeItem(DONE_KEY);
    localStorage.setItem(STEPS_KEY, '0');
    current = 0;
    if (!overlay) buildDOM();
    show(0);
  }

  // ── DOM ──
  function buildDOM() {
    if (document.getElementById('ob-overlay')) return; // already built

    overlay = document.createElement('div');
    overlay.id = 'ob-overlay';
    overlay.style.cssText = [
      'position:fixed','inset:0','z-index:9000',
      'background:rgba(0,0,0,0)','pointer-events:none',
      'transition:background .3s',
    ].join(';');
    document.body.appendChild(overlay);

    spotlight = document.createElement('div');
    spotlight.id = 'ob-spotlight';
    spotlight.style.cssText = [
      'position:fixed','z-index:9001','border-radius:10px',
      'box-shadow:0 0 0 9999px rgba(0,0,0,.72)',
      'transition:all .35s cubic-bezier(.4,0,.2,1)',
      'pointer-events:none',
    ].join(';');
    document.body.appendChild(spotlight);

    popover = document.createElement('div');
    popover.id = 'ob-popover';
    popover.style.cssText = [
      'position:fixed','z-index:9002',
      'background:#0b1131','border:1px solid rgba(59,130,246,.35)',
      'border-radius:14px','padding:20px 22px','width:300px',
      'box-shadow:0 16px 48px rgba(0,0,0,.7)',
      'transition:all .3s cubic-bezier(.4,0,.2,1)',
      'font-family:Inter,system-ui,sans-serif',
    ].join(';');
    popover.innerHTML = `
      <div id="ob-step-label" style="font-size:10px;font-weight:700;letter-spacing:.06em;
        color:rgba(59,130,246,.8);margin-bottom:8px;text-transform:uppercase;"></div>
      <div id="ob-title" style="font-size:15px;font-weight:700;color:#f0f4ff;margin-bottom:8px;line-height:1.4;"></div>
      <div id="ob-body"  style="font-size:13px;color:#8ba0c4;line-height:1.65;margin-bottom:18px;"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
        <div id="ob-dots" style="display:flex;gap:5px;"></div>
        <div style="display:flex;gap:8px;">
          <button id="ob-skip"  style="font-size:12px;background:none;border:none;color:#8ba0c4;cursor:pointer;padding:6px 10px;border-radius:7px;transition:color .15s;" onmouseover="this.style.color='#f0f4ff'" onmouseout="this.style.color='#8ba0c4'">Pular</button>
          <button id="ob-prev"  style="font-size:12px;background:rgba(59,130,246,.1);border:1px solid rgba(59,130,246,.25);color:#3b82f6;padding:6px 14px;border-radius:7px;cursor:pointer;transition:background .15s;" onmouseover="this.style.background='rgba(59,130,246,.2)'" onmouseout="this.style.background='rgba(59,130,246,.1)'">← Voltar</button>
          <button id="ob-next"  style="font-size:12px;background:#2563eb;border:none;color:#fff;padding:6px 16px;border-radius:7px;cursor:pointer;font-weight:600;transition:background .15s;" onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">Próximo →</button>
        </div>
      </div>`;
    document.body.appendChild(popover);

    document.getElementById('ob-skip').addEventListener('click', finish);
    document.getElementById('ob-prev').addEventListener('click', () => { if (current > 0) show(current - 1); });
    document.getElementById('ob-next').addEventListener('click', () => {
      if (current < steps.length - 1) show(current + 1);
      else finish();
    });
  }

  function show(idx) {
    current = idx;
    localStorage.setItem(STEPS_KEY, idx);

    const step   = steps[idx];
    const target = step.target ? document.querySelector(step.target) : null;

    // Update text
    document.getElementById('ob-step-label').textContent = `Passo ${idx + 1} de ${steps.length}`;
    document.getElementById('ob-title').textContent       = step.title;
    document.getElementById('ob-body').textContent        = step.body;

    // Dots
    const dotsEl = document.getElementById('ob-dots');
    dotsEl.innerHTML = steps.map((_, i) => `
      <div style="width:${i===idx?'18':'7'}px;height:7px;border-radius:4px;
        background:${i===idx?'#2563eb':'rgba(59,130,246,.25)'};transition:all .25s;"></div>`
    ).join('');

    // Button labels
    const nextBtn = document.getElementById('ob-next');
    const prevBtn = document.getElementById('ob-prev');
    nextBtn.textContent = idx === steps.length - 1 ? 'Concluir ✓' : 'Próximo →';
    prevBtn.style.display = idx === 0 ? 'none' : 'inline-block';

    // Spotlight + popover positioning
    overlay.style.background = 'rgba(0,0,0,0)'; // overlay dims via spotlight shadow
    popover.style.opacity    = '0';
    popover.style.transform  = 'scale(.95)';

    requestAnimationFrame(() => {
      if (target) {
        const r = target.getBoundingClientRect();
        const pad = 6;
        spotlight.style.cssText += [
          `;top:${r.top - pad}px`,
          `left:${r.left - pad}px`,
          `width:${r.width + pad * 2}px`,
          `height:${r.height + pad * 2}px`,
          'opacity:1',
        ].join(';');

        // Position popover beside or below target
        positionPopover(r);
      } else {
        // Center
        spotlight.style.cssText += ';top:50%;left:50%;width:0px;height:0px;opacity:0;';
        popover.style.top  = '50%';
        popover.style.left = '50%';
        popover.style.transform = 'translate(-50%,-50%) scale(1)';
      }
      popover.style.opacity   = '1';
      popover.style.transform = (target ? '' : 'translate(-50%,-50%) ') + 'scale(1)';
    });

    // Scroll target into view
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function positionPopover(r) {
    const pw  = 300;
    const ph  = 220; // approx height
    const vw  = window.innerWidth;
    const vh  = window.innerHeight;
    const gap = 14;

    let top, left, transform = '';

    // Prefer below
    if (r.bottom + ph + gap < vh) {
      top  = r.bottom + gap;
      left = Math.min(Math.max(r.left, 10), vw - pw - 10);
    } else if (r.top - ph - gap > 0) {
      top  = r.top - ph - gap;
      left = Math.min(Math.max(r.left, 10), vw - pw - 10);
    } else if (r.right + pw + gap < vw) {
      top  = r.top;
      left = r.right + gap;
    } else {
      top  = r.top;
      left = r.left - pw - gap;
    }

    popover.style.top       = top  + 'px';
    popover.style.left      = left + 'px';
    popover.style.transform = 'scale(1)';
  }

  function finish() {
    localStorage.setItem(DONE_KEY, '1');
    localStorage.removeItem(STEPS_KEY);
    [overlay, spotlight, popover].forEach(el => {
      if (el) { el.style.opacity = '0'; setTimeout(() => el?.remove(), 300); }
    });
    overlay = spotlight = popover = null;
  }

  return { init, restart };
})();
