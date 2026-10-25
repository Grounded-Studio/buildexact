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
// Credit system — saldo staat op de server, gekoppeld aan het account
//   - Inloggen (e-mailcode) geeft eenmalig 5 gratis credits
//   - Elke klik op "Bereken" bij een betaalde calc = −1 credit via /spend.php
//   - Niet ingelogd: de knop wordt "Log in — 5 gratis credits"
//   - Op 0: de knop wordt "Koop 50 credits — €2,99"
//   - Simpele calcs (data-no-lock) blijven gratis, zonder knop
//   Vereist window.BEAuth uit main.js (dat vóór dit bestand laadt).
// =====================================================================
(function () {
  const PACK = { size: 50, price: '€ 2,99', firstBonus: 10 };
  const FREE = 5;
  const Auth = window.BEAuth;

  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const CREDITS_URL = isNl ? '/nl/credits/' : '/credits/';
  const STR = isNl ? {
    chipBalance: (n) => `${n} credit${n === 1 ? '' : 's'} over`,
    chipZero:    'Geen credits meer — koop een pakket',
    chipLogin:   `Log in voor ${FREE} gratis credits`,
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
    lockHaveCode: 'Al een code? Inwisselen',
    installFoot: 'Liever onbeperkt + PDF-offertes? Installeer BuildExact (€7,99 eenmalig in de app)',
  } : {
    chipBalance: (n) => `${n} credit${n === 1 ? '' : 's'} left`,
    chipZero:    'Out of credits — buy a pack',
    chipLogin:   `Log in for ${FREE} free credits`,
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
    lockHaveCode: 'Already got a code? Redeem',
    installFoot: 'Want unlimited + branded PDF quotes? Install BuildExact (one-off €7.99 in the app)',
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

  function makeChip() {
    const chip = document.createElement(acct && !acct.loggedIn ? 'a' : 'div');
    if (!acct) {
      chip.className = 'credit-chip';
      chip.textContent = '🪙 ' + STR.chipLoading;
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
    if (acct && !acct.loggedIn) {
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
      <a href="${CREDITS_URL}#redeem" style="display:block;margin-top:10px;font-size:.8rem;color:var(--muted);">${STR.lockHaveCode}</a>
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
        placeholder.innerHTML = `<span class="pl-icon">🧮</span>${STR.placeholderMsg}`;
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

