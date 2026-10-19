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

// =====================================================================
// Credit system — lifetime balance (not daily)
//   - Start: 5 free credits per browser
//   - Each click of "Calculate" on a monetised calc = -1 credit
//   - At 0: Calculate button becomes "Buy 50 credits — €2,99"
//   - Simple calcs (data-no-lock) stay free, no button needed
//   - Payment is wired later; for now the buy button leads to a redeem page
// =====================================================================
(function () {
  const KEY = 'be_credits_v2';
  const STARTING = 5;
  const PACK = { size: 50, price: '€ 2,99' };
  const PLAY = 'https://play.google.com/store/apps/details?id=com.metenweten.bouw';

  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    chipBalance: (n) => `${n} credit${n === 1 ? '' : 's'} over`,
    chipZero:    'Geen credits meer — koop een pakket',
    calcBtn:     'Bereken (−1 credit)',
    calcBtnBuy:  `Koop ${PACK.size} credits — ${PACK.price}`,
    stale:       'Invoer gewijzigd — klik Bereken opnieuw',
    heroPlaceholder: 'Klik Bereken',
    placeholderMsg: 'Vul in en klik Bereken om je resultaat te zien',
    lockTitle:   'Je credits zijn op',
    lockBody:    `Koop een pakket van ${PACK.size} credits voor ${PACK.price} om door te rekenen op de website. Blijft eenmalig, geen abonnement.`,
    lockBuy:     `Koop ${PACK.size} credits — ${PACK.price}`,
    lockHaveCode: 'Al een code? Inwisselen',
    installFoot: 'Liever onbeperkt + PDF-offertes? Installeer BuildExact (€5,99 eenmalig in de app)',
  } : {
    chipBalance: (n) => `${n} credit${n === 1 ? '' : 's'} left`,
    chipZero:    'Out of credits — buy a pack',
    calcBtn:     'Calculate (−1 credit)',
    calcBtnBuy:  `Buy ${PACK.size} credits — ${PACK.price}`,
    stale:       'Inputs changed — click Calculate again',
    heroPlaceholder: 'Click Calculate',
    placeholderMsg: 'Fill in and click Calculate to see your result',
    lockTitle:   'Out of credits',
    lockBody:    `Buy a pack of ${PACK.size} credits for ${PACK.price} to keep calculating on the website. One-off, no subscription.`,
    lockBuy:     `Buy ${PACK.size} credits — ${PACK.price}`,
    lockHaveCode: 'Already got a code? Redeem',
    installFoot: 'Want unlimited + branded PDF quotes? Install BuildExact (one-off €5.99 in the app)',
  };

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) {
        const seed = { balance: STARTING };
        localStorage.setItem(KEY, JSON.stringify(seed));
        return seed;
      }
      const parsed = JSON.parse(raw);
      if (typeof parsed.balance !== 'number' || parsed.balance < 0) {
        return { balance: STARTING };
      }
      return parsed;
    } catch { return { balance: STARTING }; }
  }

  function save(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch {} }

  // Public API
  window.BE.credits = {
    balance() { return load().balance; },
    consume() {
      const c = load();
      if (c.balance <= 0) return false;
      c.balance -= 1;
      save(c);
      updateAllChips();
      return true;
    },
    add(n) { const c = load(); c.balance += n; save(c); updateAllChips(); },
  };

  function slugForLang(hrefCore) {
    const nlPrefix = isNl ? '/nl' : '';
    return nlPrefix + hrefCore;
  }

  function makeChip(balance) {
    const chip = document.createElement('div');
    const cls = balance <= 0 ? 'credit-chip exhausted' : 'credit-chip';
    chip.className = cls;
    chip.textContent = (balance <= 0 ? '🚫 ' : '🪙 ') + (balance <= 0 ? STR.chipZero : STR.chipBalance(balance));
    return chip;
  }

  function updateAllChips() {
    const balance = load().balance;
    document.querySelectorAll('.calc-result').forEach(result => {
      if (result.dataset.noLock === 'true') return;
      const existing = result.querySelector('.credit-chip');
      const chip = makeChip(balance);
      if (existing) existing.replaceWith(chip); else {
        const h3 = result.querySelector('h3');
        if (h3) h3.insertAdjacentElement('afterend', chip); else result.prepend(chip);
      }
      // Also update the Calculate button label
      const btn = document.getElementById('calcBtn');
      if (btn) {
        if (balance <= 0) {
          btn.textContent = STR.calcBtnBuy;
          btn.classList.add('calc-btn-buy');
          btn.dataset.action = 'buy';
        } else {
          btn.textContent = STR.calcBtn;
          btn.classList.remove('calc-btn-buy');
          btn.dataset.action = 'calc';
        }
      }
    });
  }

  function showLockOverlay() {
    const result = document.querySelector('.calc-result:not([data-no-lock="true"])');
    if (!result) return;
    // Overlay the result card entirely
    if (result.querySelector('.locked-overlay')) return;
    const rows = result.querySelector('.result-rows');
    if (rows && !rows.closest('.locked-section')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'locked-section';
      rows.parentNode.insertBefore(wrapper, rows);
      wrapper.appendChild(rows);
    }
    const target = result.querySelector('.locked-section') || result;
    const overlay = document.createElement('div');
    overlay.className = 'locked-overlay';
    overlay.innerHTML = `
      <div class="lock-icon">🪙</div>
      <h4>${STR.lockTitle}</h4>
      <p>${STR.lockBody}</p>
      <a href="${isNl ? '/nl/credits/' : '/credits/'}" class="btn btn-primary btn-sm">${STR.lockBuy}</a>
      <a href="${isNl ? '/nl/credits/#redeem' : '/credits/#redeem'}" style="display:block;margin-top:10px;font-size:.8rem;color:var(--muted);">${STR.lockHaveCode}</a>
    `;
    target.appendChild(overlay);
  }

  function removeLockOverlay() {
    document.querySelectorAll('.locked-overlay').forEach(e => e.remove());
    document.querySelectorAll('.locked-section').forEach(sec => {
      const parent = sec.parentNode;
      while (sec.firstChild) parent.insertBefore(sec.firstChild, sec);
      sec.remove();
    });
  }

  function setStale(stale) {
    const result = document.querySelector('.calc-result:not([data-no-lock="true"])');
    if (!result) return;
    let hint = result.querySelector('.calc-stale-hint');
    if (stale) {
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'calc-stale-hint';
        hint.textContent = '⚠️ ' + STR.stale;
        const rows = result.querySelector('.result-rows') || result.querySelector('.result-hero');
        if (rows) rows.parentNode.insertBefore(hint, rows);
      }
      result.classList.add('calc-stale');
    } else {
      if (hint) hint.remove();
      result.classList.remove('calc-stale');
    }
  }

  // Public helper: wire a Calculate button on a monetised calc.
  //   recalcFn — the per-calc computation + render function
  //   staleIds — input ids that mark result as stale when changed
  //   Also wires chip clicks, toggles, add-list buttons to mark stale.
  window.BE.wireCalc = function wireCalc(recalcFn, staleIds) {
    const btn = document.getElementById('calcBtn');
    if (!btn) return;
    const resultCard = document.querySelector('.calc-result:not([data-no-lock="true"])');
    btn.addEventListener('click', () => {
      if (btn.dataset.action === 'buy') {
        location.href = isNl ? '/nl/credits/' : '/credits/';
        return;
      }
      if (!window.BE.credits.consume()) {
        showLockOverlay();
        return;
      }
      removeLockOverlay();
      recalcFn();
      setStale(false);
      if (resultCard) resultCard.setAttribute('data-ready', 'true');
    });
    // Mark stale on any input change
    (staleIds || []).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => setStale(resultCard && resultCard.hasAttribute('data-ready')));
    });
  };

  // Mark stale on toggles & chip clicks (helper used by individual calcs)
  window.BE.markStaleOn = function markStaleOn(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.addEventListener('change', () => setStale(isReady()));
      el.addEventListener('click', () => setStale(isReady()));
    });
  };

  function isReady() {
    const r = document.querySelector('.calc-result:not([data-no-lock="true"])');
    return r && r.hasAttribute('data-ready');
  }

  // On page load for monetised calcs: insert placeholder, don't touch hero text
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('calcBtn')) {
      const result = document.querySelector('.calc-result:not([data-no-lock="true"])');
      if (result && !result.querySelector('.calc-placeholder')) {
        const placeholder = document.createElement('div');
        placeholder.className = 'calc-placeholder';
        placeholder.innerHTML = `<span class="pl-icon">🧮</span>${STR.placeholderMsg}`;
        const hero = result.querySelector('.result-hero');
        if (hero) hero.parentNode.insertBefore(placeholder, hero);
      }
    }
    updateAllChips();
  });

  // Expose string table for calcs that need it (e.g. for a "no result yet" state)
  window.BE.STR = STR;
})();
