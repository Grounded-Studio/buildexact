// Shared helpers for calculator demos.
window.BE = {
  v(id, fallback) {
    const el = document.getElementById(id);
    if (!el) return fallback ?? 0;
    const n = parseFloat(el.value);
    return isFinite(n) ? n : (fallback ?? 0);
  },
  checked(id) { const el = document.getElementById(id); return el && el.checked; },
  set(id, value, decimals) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = typeof value === 'number'
      ? (decimals != null ? value.toFixed(decimals) : (Number.isInteger(value) ? value.toString() : value.toFixed(2)))
      : value;
  },
  bindAll(ids, fn) { ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', fn);
  }); fn(); },
  chip(groupId, onChange) {
    const group = document.getElementById(groupId);
    if (!group) return;
    group.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip');
      if (!btn) return;
      group.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.dataset.value);
    });
  },
  activeChip(groupId) {
    const btn = document.querySelector('#' + groupId + ' .chip.active');
    return btn ? btn.dataset.value : null;
  },
};

// Daily free-credits system (localStorage-based).
// Rules:
//   - 3 free different calculator slugs per day
//   - Within same slug: unlimited tweaks (no extra cost)
//   - Area, perimeter, cost estimator are always free (opt-out via data-no-lock)
//   - When the 4th different slug is opened in a day → lock overlay
(function creditsAndLock() {
  const KEY = 'be_credits_v1';
  const DAILY_LIMIT = 3;
  const PLAY = 'https://play.google.com/store/apps/details?id=com.metenweten.bouw';

  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    chipFree:   (n, max) => `${n} van ${max} gratis berekeningen vandaag gebruikt`,
    chipLast:   (max) => `Laatste gratis berekening vandaag (${max}/${max})`,
    chipLocked: 'Daglimiet bereikt — installeer de app voor onbeperkt',
    lockTitle:  'Daglimiet bereikt',
    lockBody:   `Je hebt vandaag ${DAILY_LIMIT} gratis berekeningen gedaan. Installeer de app voor onbeperkt — of koop binnenkort credits op de website.`,
    lockCta:    'BuildExact installeren',
  } : {
    chipFree:   (n, max) => `${n} of ${max} free calculations used today`,
    chipLast:   (max) => `Last free calculation today (${max}/${max})`,
    chipLocked: 'Daily limit reached — install the app for unlimited',
    lockTitle:  'Daily limit reached',
    lockBody:   `You've used your ${DAILY_LIMIT} free calculations for today. Install the app for unlimited — or buy credits on the website (coming soon).`,
    lockCta:    'Install BuildExact',
  };

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function loadCredits() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return { date: todayStr(), used: [] };
      const parsed = JSON.parse(raw);
      if (parsed.date !== todayStr()) return { date: todayStr(), used: [] };
      return { date: parsed.date, used: Array.isArray(parsed.used) ? parsed.used : [] };
    } catch { return { date: todayStr(), used: [] }; }
  }

  function saveCredits(c) {
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {}
  }

  function currentSlug() {
    // /calculators/fence/ or /nl/calculators/fence/  →  "fence"
    const m = location.pathname.match(/\/calculators\/([a-z0-9-]+)\//);
    return m ? m[1] : null;
  }

  function wrapAndBlur(result) {
    const groups = result.querySelectorAll('.result-rows');
    groups.forEach(rows => {
      if (rows.closest('.locked-section')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'locked-section';
      rows.parentNode.insertBefore(wrapper, rows);
      wrapper.appendChild(rows);
    });
    const first = result.querySelector('.locked-section');
    if (!first) return;
    const overlay = document.createElement('div');
    overlay.className = 'locked-overlay';
    overlay.innerHTML = `
      <div class="lock-icon">🔒</div>
      <h4>${STR.lockTitle}</h4>
      <p>${STR.lockBody}</p>
      <a href="${PLAY}" class="btn btn-primary btn-sm">${STR.lockCta}</a>
    `;
    first.appendChild(overlay);
  }

  function addCreditChip(result, state) {
    const existing = result.querySelector('.credit-chip');
    if (existing) existing.remove();
    const chip = document.createElement('div');
    const used = state.used.length;
    let text, cls = '';
    if (state.locked) {
      text = STR.chipLocked;
      cls = ' exhausted';
    } else if (used === DAILY_LIMIT) {
      text = STR.chipLast(DAILY_LIMIT);
    } else {
      text = STR.chipFree(used, DAILY_LIMIT);
    }
    chip.className = 'credit-chip' + cls;
    chip.textContent = '📊 ' + text;
    // Insert at top of result card, before the h3 or any other content
    const h3 = result.querySelector('h3');
    if (h3) h3.insertAdjacentElement('afterend', chip);
    else result.prepend(chip);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const results = document.querySelectorAll('.calc-result');
    if (results.length === 0) return;
    const slug = currentSlug();
    if (!slug) return;

    results.forEach(result => {
      // Opt-out (area/perimeter/cost): no credit, no lock, no chip
      if (result.dataset.noLock === 'true') return;

      // Only lock when there's a real breakdown
      let totalRows = 0;
      result.querySelectorAll('.result-rows .result-row').forEach(() => totalRows++);
      // Even if empty at load (fence rows render dynamically) still gate the slug
      // so the user doesn't get a 4th free calc just because .result-rows is empty.

      const credits = loadCredits();
      const alreadyUsed = credits.used.includes(slug);

      if (!alreadyUsed && credits.used.length >= DAILY_LIMIT) {
        // Locked: no credit left, this slug not already paid for
        addCreditChip(result, { used: credits.used, locked: true });
        wrapAndBlur(result);
      } else {
        if (!alreadyUsed) {
          credits.used.push(slug);
          saveCredits(credits);
        }
        addCreditChip(result, { used: credits.used, locked: false });
      }
    });
  });
})();
