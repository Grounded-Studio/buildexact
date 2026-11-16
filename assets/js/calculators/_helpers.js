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
  isNl() { return (document.documentElement.lang || '').toLowerCase().startsWith('nl'); },
  // Number in the page language: 1,234.5 (EN) or 1.234,5 (NL).
  num(v, d) {
    d = d == null ? 2 : d;
    return Number(v).toLocaleString(BE.isNl() ? 'nl-NL' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d });
  },
  money(v) { return '€ ' + BE.num(v, 2); },
  // rows: [[label, value, extraClass?], ...] → result rows HTML
  rows(rows) {
    return rows.filter(Boolean).map(r =>
      `<div class="result-row${r[2] ? ' ' + r[2] : ''}"><span class="k">${r[0]}</span><span class="v">${r[1]}</span></div>`).join('');
  },
  show(id, on) { const el = document.getElementById(id); if (el) el.style.display = on ? '' : 'none'; },
  // Repeating input rows (shapes, walls, windows). template(data) returns the
  // inner HTML of one row; inputs/selects carry data-k="key". The add button
  // has id listId + 'Add'. onChange runs after every add, remove or edit.
  list(listId, template, initial, blank, onChange) {
    const box = document.getElementById(listId);
    const add = document.getElementById(listId + 'Add');
    if (!box) return;
    const removeLabel = BE.isNl() ? 'Verwijderen' : 'Remove';
    function addRow(data) {
      const div = document.createElement('div');
      div.className = 'dyn-row';
      div.innerHTML = template(data || {}).replace('{{remove}}',
        `<button type="button" class="gate-remove" aria-label="${removeLabel}" title="${removeLabel}">✕</button>`);
      box.appendChild(div);
    }
    (initial || []).forEach(addRow);
    if (add) add.addEventListener('click', () => { addRow(blank ? blank() : {}); onChange(); });
    box.addEventListener('click', (e) => {
      const rm = e.target.closest('.gate-remove');
      if (!rm) return;
      rm.closest('.dyn-row').remove();
      onChange();
    });
    box.addEventListener('input', onChange);
    box.addEventListener('change', onChange);
  },
  listValues(listId) {
    return Array.from(document.querySelectorAll('#' + listId + ' .dyn-row')).map(row => {
      const o = {};
      row.querySelectorAll('[data-k]').forEach(el => {
        if (el.type === 'checkbox') o[el.dataset.k] = el.checked;
        else if (el.tagName === 'SELECT') o[el.dataset.k] = el.value;
        else { const n = parseFloat(el.value); o[el.dataset.k] = isFinite(n) ? n : 0; }
      });
      return o;
    });
  },
};

// =====================================================================
// Units: metric or imperial
//   The calculators keep computing in metric. A field marked with
//   data-unit (via BE.units) is shown in the chosen system, and BE.v() /
//   BE.listValues() turn its value back into metric. BE.q() prints a
//   metric value in the chosen system. The choice comes from ?units= in
//   the URL, else from this browser (localStorage, no cookie), else
//   imperial for an English page in an en-US browser, else metric.
// =====================================================================
(function () {
  const KEY = 'be_units';
  // metric unit -> [metric label, imperial label, metric value of 1 imperial unit]
  const U = {
    m: ['m', 'ft', 0.3048], cm: ['cm', 'in', 2.54], mm: ['mm', 'in', 25.4],
    m2: ['m²', 'sq ft', 0.09290304], m3: ['m³', 'cu yd', 0.764554858],
    kg: ['kg', 'lb', 0.45359237], L: ['L', 'gal', 3.785411784],
    m2L: ['m²/L', 'sq ft/gal', 0.09290304 / 3.785411784], kgm2: ['kg/m²', 'lb/sq ft', 0.45359237 / 0.09290304],
    kgm3: ['kg/m³', 'lb/cu yd', 0.45359237 / 0.764554858], eurm2: ['€/m²', '€/sq ft', 1 / 0.09290304],
  };
  // How a unit is written inside a field label, and its imperial replacement.
  const LABEL = {
    m: [[/\(m\)/g, '(ft)'], [/\(m,/g, '(ft,'], [/linear met(er|re)s/gi, 'linear feet']],
    cm: [[/\(cm\b/g, '(in']], mm: [[/\(mm\b/g, '(in']],
    m2: [[/\(m²\)/g, '(sq ft)']], m3: [[/\(m³\)/g, '(cu yd)']],
    kg: [[/\(kg\)/g, '(lb)']], L: [[/\(L\)/g, '(gal)']],
    m2L: [[/m²\/L/g, 'sq ft/gal']], kgm2: [[/kg\/m²/g, 'lb/sq ft']], kgm3: [[/kg\/m³/g, 'lb/cu yd']],
    eurm2: [[/m²/g, 'sq ft']],
  };
  function chosen() {
    try {
      const p = new URLSearchParams(location.search).get('units');
      if (p === 'imperial' || p === 'metric') return p;
    } catch (_) {}
    try {
      const s = localStorage.getItem(KEY);
      if (s === 'imperial' || s === 'metric') return s;
    } catch (_) {}
    const en = !BE.isNl();
    return en && /^en-US$/i.test(navigator.language || '') ? 'imperial' : 'metric';
  }
  const imp = chosen() === 'imperial';
  const round = (v) => Math.round(v * 1000) / 1000;

  BE.imp = () => imp;
  BE.u = (k) => (U[k] ? U[k][imp ? 1 : 0] : k);
  BE.toMetric = (k, v) => (imp && U[k] ? v * U[k][2] : v);
  BE.fromMetric = (k, v) => (imp && U[k] ? v / U[k][2] : v);
  // A metric value printed in the chosen system, e.g. BE.q('m2', 20) → "215.28 sq ft".
  BE.q = (k, v, d) => BE.num(BE.fromMetric(k, v), d == null ? 2 : d) + ' ' + BE.u(k);
  // Put a metric value into a field that may be shown in imperial.
  BE.setU = (id, metric) => {
    const el = document.getElementById(id);
    if (el) el.value = round(BE.fromMetric(el.dataset.unit, metric));
  };

  const rawV = BE.v;
  BE.v = function (id, fallback) {
    const el = document.getElementById(id);
    const v = rawV.call(BE, id, fallback);
    return el && el.dataset.unit && isFinite(parseFloat(el.value)) ? BE.toMetric(el.dataset.unit, v) : v;
  };
  const rawList = BE.listValues;
  BE.listValues = function (listId) {
    const rows = rawList.call(BE, listId);
    document.querySelectorAll('#' + listId + ' .dyn-row').forEach((row, i) => {
      row.querySelectorAll('[data-k][data-unit]').forEach(el => {
        rows[i][el.dataset.k] = BE.toMetric(el.dataset.unit, rows[i][el.dataset.k]);
      });
    });
    return rows;
  };
  BE.relabel = (text, k) => (imp && LABEL[k] ? LABEL[k].reduce((t, [re, s]) => t.replace(re, s), text) : text);

  // Mark the fields of a page: map = { fieldId: unit }. In imperial the label
  // and the value change; impDefaults = { fieldId: nice imperial value }.
  BE.units = (map, impDefaults) => {
    Object.keys(map).forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.dataset.unit = map[id];
      if (!imp) return;
      const lab = document.querySelector(`label[for="${id}"]`) || (el.closest('.field') || {}).querySelector?.('label');
      if (lab) lab.textContent = BE.relabel(lab.textContent, map[id]);
      const d = impDefaults && impDefaults[id];
      el.value = d != null ? d : (el.value === '' ? '' : round(BE.fromMetric(map[id], parseFloat(el.value) || 0)));
      el.step = 'any';
    });
    BE.unitToggle();
  };

  // "Metric | Imperial" switch at the top of the calculator form.
  BE.unitToggle = () => {
    const form = document.querySelector('form.calc-form');
    if (!form || form.querySelector('.unit-toggle')) return;
    const nl = BE.isNl();
    const box = document.createElement('div');
    box.className = 'unit-toggle';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', nl ? 'Eenheden' : 'Units');
    box.innerHTML =
      `<button type="button" data-u="metric" aria-pressed="${!imp}" class="${imp ? '' : 'active'}">${nl ? 'Metrisch (m, cm)' : 'Metric (m, cm)'}</button>` +
      `<button type="button" data-u="imperial" aria-pressed="${imp}" class="${imp ? 'active' : ''}">${nl ? 'Imperial (ft, in)' : 'Imperial (ft, in)'}</button>`;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-u]');
      if (!b || b.dataset.u === (imp ? 'imperial' : 'metric')) return;
      try { localStorage.setItem(KEY, b.dataset.u); } catch (_) {}
      const url = new URL(location.href);
      url.searchParams.set('units', b.dataset.u);
      location.replace(url.toString());
    });
    form.insertBefore(box, form.firstChild);
  };
})();

// =====================================================================
// Credit system — saldo staat op de server, gekoppeld aan het account
//   - Inloggen (e-mailcode) geeft eenmalig 5 gratis credits
//   - Elke klik op "Bereken" bij een betaalde calc = −1 credit via /spend.php
//   - Niet ingelogd: eerst ANON_FREE berekeningen per calculator gratis (per
//     browser, localStorage); daarna wordt de knop "Log in — 5 gratis credits"
//   - Op 0: de knop wordt "Koop 50 credits — €2,99"
//   - Simpele calcs (data-no-lock) blijven gratis, zonder knop
//   Vereist window.BEAuth uit main.js (dat vóór dit bestand laadt).
// =====================================================================
(function () {
  const PACK = { size: 50, price: '€ 2,99', firstBonus: 10 };
  const FREE = 5;
  const ANON_FREE = 3;
  const ANON_KEY = 'be_anon_uses_v1';
  const Auth = window.BEAuth;

  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const CREDITS_URL = isNl ? '/nl/credits/' : '/credits/';
  const STR = isNl ? {
    chipBalance: (n) => `${n} credit${n === 1 ? '' : 's'} over`,
    chipZero:    'Geen credits meer — koop een pakket',
    chipLogin:   `Log in voor ${FREE} gratis credits`,
    chipAnon:    (n) => `Nog ${n} keer gratis, zonder inloggen`,
    calcBtnFree: 'Bereken (gratis)',
    chipLoading: 'Saldo ophalen…',
    calcBtn:     'Bereken (−1 credit)',
    calcBtnBuy:  `Koop ${PACK.size} credits — ${PACK.price}`,
    calcBtnLogin: `Log in — ${FREE} gratis credits`,
    calcBusy:    'Bezig…',
    netError:    'Geen verbinding met de server. Probeer het opnieuw.',
    stale:       'Invoer gewijzigd — klik Bereken opnieuw',
    heroPlaceholder: 'Klik Bereken',
    placeholderMsg: 'Vul in en klik Bereken om je resultaat te zien',
    lockTitle:   'Je credits zijn op',
    lockBody:    `Koop een pakket van ${PACK.size} credits voor ${PACK.price} om door te rekenen op de website. Eenmalig, geen abonnement. Bij je eerste aankoop krijg je er ${PACK.firstBonus} extra.`,
    lockBuy:     `Koop ${PACK.size} credits — ${PACK.price}`,
    installFoot: 'Bewaar, combineer met de andere 24 calculators en maak er een offerte-PDF van in de app. PRO: €5,99 eenmalig, geen abonnement.',
  } : {
    chipBalance: (n) => `${n} credit${n === 1 ? '' : 's'} left`,
    chipZero:    'Out of credits — buy a pack',
    chipLogin:   `Log in for ${FREE} free credits`,
    chipAnon:    (n) => `${n} free ${n === 1 ? 'try' : 'tries'} left, no login`,
    calcBtnFree: 'Calculate (free)',
    chipLoading: 'Loading balance…',
    calcBtn:     'Calculate (−1 credit)',
    calcBtnBuy:  `Buy ${PACK.size} credits — ${PACK.price}`,
    calcBtnLogin: `Log in — ${FREE} free credits`,
    calcBusy:    'Working…',
    netError:    "Couldn't reach the server. Please try again.",
    stale:       'Inputs changed — click Calculate again',
    heroPlaceholder: 'Click Calculate',
    placeholderMsg: 'Fill in and click Calculate to see your result',
    lockTitle:   'Out of credits',
    lockBody:    `Buy a pack of ${PACK.size} credits for ${PACK.price} to keep calculating on the website. One-off, no subscription. Your first purchase comes with ${PACK.firstBonus} extra.`,
    lockBuy:     `Buy ${PACK.size} credits — ${PACK.price}`,
    installFoot: 'Save it, combine it with the other 24 calculators and turn it into a quote PDF in the app. PRO: €5.99 one-time, no subscription.',
  };

  // null = nog onbekend, anders { loggedIn, credits }
  let acct = null;

  function setAcct(me) {
    acct = (me && me.loggedIn) ? { loggedIn: true, credits: me.credits | 0 } : { loggedIn: false, credits: 0 };
    updateAllChips();
  }

  document.addEventListener('be:credits', (e) => {
    acct = { loggedIn: true, credits: e.detail.credits | 0 };
    updateAllChips();
  });

  // Saldo voor pagina's buiten de calculators (credits-pagina's).
  window.BE.credits = {
    balance() { return acct && acct.loggedIn ? acct.credits : 0; },
    loggedIn() { return !!(acct && acct.loggedIn); },
  };

  function calcName() {
    return location.pathname.split('/').filter(Boolean).pop() || '';
  }

  // Free tries before login, counted per calculator in this browser. Without
  // storage (private mode) a visitor simply keeps calculating for free.
  function anonUses() {
    try { return JSON.parse(localStorage.getItem(ANON_KEY) || '{}') || {}; } catch (_) { return null; }
  }
  function anonLeft() {
    const u = anonUses();
    return u ? Math.max(0, ANON_FREE - (u[calcName()] | 0)) : ANON_FREE;
  }
  function useAnon() {
    const u = anonUses();
    if (!u) return;
    u[calcName()] = (u[calcName()] | 0) + 1;
    try { localStorage.setItem(ANON_KEY, JSON.stringify(u)); } catch (_) {}
  }
  const anonMode = () => !!(acct && !acct.loggedIn && anonLeft() > 0);

  function makeChip() {
    const chip = document.createElement(acct && !acct.loggedIn ? 'a' : 'div');
    if (!acct) {
      chip.className = 'credit-chip';
      chip.textContent = '🪙 ' + STR.chipLoading;
    } else if (anonMode()) {
      chip.className = 'credit-chip';
      chip.href = Auth.loginUrl();
      chip.textContent = '🎁 ' + STR.chipAnon(anonLeft());
    } else if (!acct.loggedIn) {
      chip.className = 'credit-chip';
      chip.href = Auth.loginUrl();
      chip.textContent = '🔑 ' + STR.chipLogin;
    } else if (acct.credits <= 0) {
      chip.className = 'credit-chip exhausted';
      chip.textContent = '🚫 ' + STR.chipZero;
    } else {
      chip.className = 'credit-chip';
      chip.textContent = '🪙 ' + STR.chipBalance(acct.credits);
    }
    if (acct && acct.loggedIn) {
      // Saldo-chip linkt naar de koop-pagina.
      const a = document.createElement('a');
      a.className = chip.className;
      a.href = CREDITS_URL;
      a.title = STR.lockBuy;
      a.textContent = chip.textContent + ' · +';
      return a;
    }
    return chip;
  }

  function updateAllChips() {
    document.querySelectorAll('.calc-result').forEach(result => {
      if (result.dataset.noLock === 'true') return;
      const existing = result.querySelector('.credit-chip');
      const chip = makeChip();
      if (existing) existing.replaceWith(chip); else {
        const h3 = result.querySelector('h3');
        if (h3) h3.insertAdjacentElement('afterend', chip); else result.prepend(chip);
      }
    });
    const btn = document.getElementById('calcBtn');
    if (!btn || btn.disabled) return;
    btn.classList.remove('calc-btn-buy');
    if (anonMode()) {
      btn.textContent = STR.calcBtnFree;
      btn.dataset.action = 'free';
    } else if (acct && !acct.loggedIn) {
      btn.textContent = STR.calcBtnLogin;
      btn.dataset.action = 'login';
    } else if (acct && acct.credits <= 0) {
      btn.textContent = STR.calcBtnBuy;
      btn.classList.add('calc-btn-buy');
      btn.dataset.action = 'buy';
    } else {
      btn.textContent = STR.calcBtn;
      btn.dataset.action = 'calc';
    }
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
      <a href="${CREDITS_URL}" class="btn btn-primary btn-sm">${STR.lockBuy}</a>
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

  function setHint(text, isError) {
    const result = document.querySelector('.calc-result:not([data-no-lock="true"])');
    if (!result) return;
    let hint = result.querySelector('.calc-stale-hint');
    if (text) {
      if (!hint) {
        hint = document.createElement('div');
        hint.className = 'calc-stale-hint';
        const rows = result.querySelector('.result-rows') || result.querySelector('.result-hero');
        if (rows) rows.parentNode.insertBefore(hint, rows); else result.appendChild(hint);
      }
      hint.textContent = '⚠️ ' + text;
      hint.classList.toggle('calc-error', !!isError);
    } else if (hint) {
      hint.remove();
    }
  }

  function setStale(stale) {
    const result = document.querySelector('.calc-result:not([data-no-lock="true"])');
    if (!result) return;
    setHint(stale ? STR.stale : null);
    result.classList.toggle('calc-stale', !!stale);
  }

  // Public helper: wire a Calculate button on a monetised calc.
  //   recalcFn — the per-calc computation + render function
  //   staleIds — input ids that mark result as stale when changed
  //   Also wires chip clicks, toggles, add-list buttons to mark stale.
  window.BE.wireCalc = function wireCalc(recalcFn, staleIds) {
    const btn = document.getElementById('calcBtn');
    if (!btn) return;
    const resultCard = document.querySelector('.calc-result:not([data-no-lock="true"])');
    btn.addEventListener('click', async () => {
      if (btn.disabled) return;
      if (btn.dataset.action === 'buy') { location.href = CREDITS_URL; return; }
      if (btn.dataset.action === 'login') { location.href = Auth.loginUrl(); return; }
      if (btn.dataset.action === 'free' && anonMode()) {
        useAnon();
        recalcFn();
        setStale(false);
        if (resultCard) resultCard.setAttribute('data-ready', 'true');
        updateAllChips();
        showResult();
        return;
      }

      btn.disabled = true;
      btn.textContent = STR.calcBusy;
      let r = null;
      try { r = await Auth.spend(calcName()); } catch (_) {}
      btn.disabled = false;

      if (!r) {
        updateAllChips();
        setHint(STR.netError, true);
        return;
      }
      if (r.status === 401) { setAcct(null); location.href = Auth.loginUrl(); return; }
      if (r.status === 402) { setAcct({ loggedIn: true, credits: 0 }); showLockOverlay(); return; }
      if (!r.ok) { updateAllChips(); setHint(STR.netError, true); return; }

      updateAllChips();
      removeLockOverlay();
      recalcFn();
      setStale(false);
      if (resultCard) resultCard.setAttribute('data-ready', 'true');
      showResult();
    });

    // On a phone the result sits below the form: bring it into view.
    function showResult() {
      if (!resultCard) return;
      const r = resultCard.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.6 || r.bottom < 0) {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
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

  // Voor calcs met dynamische velden (schutting): invoer gewijzigd → resultaat verouderd.
  window.BE.markStale = function markStale() { setStale(isReady()); };

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
        placeholder.innerHTML = `<span class="pl-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2.5" width="16" height="19" rx="3"/><rect x="7.5" y="6" width="9" height="3.5" rx="1"/><path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01"/><path d="M16 16v2"/></svg></span>${STR.placeholderMsg}`;
        const hero = result.querySelector('.result-hero');
        if (hero) hero.parentNode.insertBefore(placeholder, hero);
      }
    }
    updateAllChips();
  });

  if (Auth) Auth.me().then(setAcct);

  // Expose string table for calcs that need it (e.g. for a "no result yet" state)
  window.BE.STR = STR;

  // =====================================================================
  // AI Shopping List — generates a practical bouwmarkt list via Gemini
  //   Calculators call BE.wireShoppingList(calcType, getInputs, getResults, title)
  //   where getInputs/getResults return a plain object with the current state.
  //   De server schrijft de credits af (en boekt terug als de AI faalt).
  // =====================================================================
  const AI_SHOP_API = 'https://api.buildexact.app/ai-shopping.php';
  const AI_SHOP_COST = 3;

  const AI_STR = isNl ? {
    btn:         `🛒 Boodschappenlijst (−${AI_SHOP_COST} credits)`,
    btnBusy:     'Lijst wordt gemaakt…',
    needCredits: `Je hebt ${AI_SHOP_COST} credits nodig voor een boodschappenlijst.`,
    error:       'Kon de lijst niet maken. Probeer het later opnieuw.',
  } : {
    btn:         `🛒 Shopping list (−${AI_SHOP_COST} credits)`,
    btnBusy:     'Generating list…',
    needCredits: `You need ${AI_SHOP_COST} credits for a shopping list.`,
    error:       "Couldn't create the list. Please try again later.",
  };

  const SHOPLIST_KEY_PREFIX = 'be_shoplist_v1_';
  const SHOPLIST_PAGE = isNl ? '/nl/shopping-list/' : '/shopping-list/';

  function makeShoplistId() {
    // Short URL-safe id based on timestamp + random
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  window.BE.wireShoppingList = function wireShoppingList(calcType, getInputs, getResults, titleBuilder) {
    const result = document.querySelector('.calc-result:not([data-no-lock="true"])');
    if (!result) return;

    // Button leeft onder .result-rows en wordt pas zichtbaar als result "ready" is
    const wrap = document.createElement('div');
    wrap.className = 'ai-shop-trigger';
    wrap.innerHTML = `<button type="button" class="btn btn-ghost ai-shop-btn">${AI_STR.btn}</button><p class="ai-shop-msg" style="display:none;"></p>`;
    const rows = result.querySelector('.result-rows') || result;
    rows.parentNode.insertBefore(wrap, rows.nextSibling);

    const btn = wrap.querySelector('.ai-shop-btn');
    const msg = wrap.querySelector('.ai-shop-msg');

    function showMsg(text) {
      msg.style.display = 'block';
      msg.style.color = 'var(--err)';
      msg.textContent = text;
    }

    btn.addEventListener('click', async () => {
      msg.style.display = 'none';
      const results = (typeof getResults === 'function') ? getResults() : {};
      if (!results || !Object.keys(results).length) return;

      if (acct && !acct.loggedIn) { location.href = Auth.loginUrl(); return; }
      if (acct && acct.credits < AI_SHOP_COST) { showMsg(AI_STR.needCredits); return; }

      btn.disabled = true;
      const originalLabel = btn.textContent;
      btn.textContent = AI_STR.btnBusy;

      try {
        const title = (typeof titleBuilder === 'function') ? titleBuilder() : '';
        const r = await fetch(AI_SHOP_API, {
          method: 'POST',
          credentials: 'include',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            calcType,
            title,
            inputs:  (typeof getInputs === 'function') ? getInputs() : {},
            results,
          }),
        });
        const data = await r.json().catch(() => ({}));
        if (typeof data.credits === 'number') Auth.setCredits(data.credits);

        if (r.status === 401) { location.href = Auth.loginUrl(); return; }
        if (r.status === 402) { showMsg(AI_STR.needCredits); return; }

        if (data.ok && Array.isArray(data.items)) {
          // Save list in localStorage onder een nieuwe UUID + open shopping-list pagina
          const id = makeShoplistId();
          const payload = {
            title,
            calcType,
            createdAt: Date.now(),
            items: data.items.map(it => ({...it, checked: false})),
            tips:  data.tips || [],
          };
          try { localStorage.setItem(SHOPLIST_KEY_PREFIX + id, JSON.stringify(payload)); } catch (_) {}
          window.location.href = SHOPLIST_PAGE + '?id=' + encodeURIComponent(id);
        } else {
          // Server heeft teruggeboekt; saldo opnieuw ophalen.
          Auth.refresh();
          showMsg(AI_STR.error);
        }
      } catch (e) {
        Auth.refresh();
        showMsg(AI_STR.error);
      } finally {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
    });
  };
})();

