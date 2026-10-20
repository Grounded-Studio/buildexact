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
    consumeN(n) {
      const c = load();
      if (c.balance < n) return false;
      c.balance -= n;
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

  // =====================================================================
  // AI Shopping List — generates a practical bouwmarkt list via Gemini
  //   Calculators call BE.wireShoppingList(calcType, getInputs, getResults, title)
  //   where getInputs/getResults return a plain object with the current state.
  // =====================================================================
  const AI_SHOP_API = 'https://api.buildexact.app/ai-shopping.php';
  const AI_SHOP_COST = 3;

  const AI_STR = isNl ? {
    btn:        `🛒 Boodschappenlijst (−${AI_SHOP_COST} credits)`,
    btnBusy:    'Lijst wordt gemaakt…',
    needCredits: `Je hebt ${AI_SHOP_COST} credits nodig voor een shoppinglist.`,
    modalTitle: 'Je boodschappenlijst',
    modalIntro: 'Praktische lijst voor de bouwmarkt. Klik een item om 't bij Praxis / Gamma / Hornbach op te zoeken.',
    tipsTitle:  'Tips voor deze klus',
    close:      'Sluiten',
    copy:       '📋 Kopiëren',
    copied:     '✓ Gekopieerd',
    error:      'Kon de lijst niet maken. Probeer het later opnieuw.',
    searchAt:   'Zoek bij',
  } : {
    btn:        `🛒 Shopping list (−${AI_SHOP_COST} credits)`,
    btnBusy:    'Generating list…',
    needCredits: `You need ${AI_SHOP_COST} credits for a shopping list.`,
    modalTitle: 'Your shopping list',
    modalIntro: 'A practical list for the DIY store. Click any item to search for it.',
    tipsTitle:  'Tips for this job',
    close:      'Close',
    copy:       '📋 Copy',
    copied:     '✓ Copied',
    error:      "Couldn't create the list. Please try again later.",
    searchAt:   'Search at',
  };

  function storesForQuery(q) {
    const enc = encodeURIComponent(q);
    return [
      { name: 'Praxis',   url: `https://www.praxis.nl/zoeken?text=${enc}` },
      { name: 'Gamma',    url: `https://www.gamma.nl/zoeken?text=${enc}` },
      { name: 'Hornbach', url: `https://www.hornbach.nl/s/${enc}` },
    ];
  }

  function renderModal(data) {
    const existing = document.getElementById('aiShopModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'aiShopModal';
    modal.className = 'ai-shop-modal';
    modal.innerHTML = `
      <div class="ai-shop-backdrop"></div>
      <div class="ai-shop-dialog" role="dialog" aria-labelledby="aiShopTitle">
        <header class="ai-shop-head">
          <h3 id="aiShopTitle">🛒 ${AI_STR.modalTitle}</h3>
          <button type="button" class="ai-shop-close" aria-label="${AI_STR.close}">✕</button>
        </header>
        <p class="ai-shop-intro">${AI_STR.modalIntro}</p>
        <ol class="ai-shop-items"></ol>
        <div class="ai-shop-tips" style="display:none;">
          <h4>💡 ${AI_STR.tipsTitle}</h4>
          <ul></ul>
        </div>
        <footer class="ai-shop-foot">
          <button type="button" class="btn btn-ghost ai-shop-copy">${AI_STR.copy}</button>
          <button type="button" class="btn btn-primary ai-shop-close-btn">${AI_STR.close}</button>
        </footer>
      </div>
    `;
    const itemsEl = modal.querySelector('.ai-shop-items');
    (data.items || []).forEach(it => {
      const li = document.createElement('li');
      li.className = 'ai-shop-item';
      const stores = storesForQuery(it.searchQuery || it.material);
      li.innerHTML = `
        <div class="ai-shop-row">
          <div class="ai-shop-main">
            <strong>${escapeHtml(it.material)}</strong>
            <span class="ai-shop-qty">${escapeHtml(it.quantity || '')}</span>
          </div>
          <div class="ai-shop-links">
            <span class="ai-shop-search">${AI_STR.searchAt}:</span>
            ${stores.map(s => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`).join(' · ')}
          </div>
          ${it.notes ? `<p class="ai-shop-notes">${escapeHtml(it.notes)}</p>` : ''}
        </div>
      `;
      itemsEl.appendChild(li);
    });

    if (Array.isArray(data.tips) && data.tips.length) {
      const tipsBlock = modal.querySelector('.ai-shop-tips');
      tipsBlock.style.display = 'block';
      const ul = tipsBlock.querySelector('ul');
      data.tips.forEach(t => {
        const li = document.createElement('li');
        li.textContent = t;
        ul.appendChild(li);
      });
    }

    const close = () => modal.remove();
    modal.querySelector('.ai-shop-backdrop').addEventListener('click', close);
    modal.querySelector('.ai-shop-close').addEventListener('click', close);
    modal.querySelector('.ai-shop-close-btn').addEventListener('click', close);

    modal.querySelector('.ai-shop-copy').addEventListener('click', (ev) => {
      const lines = [AI_STR.modalTitle, ''];
      (data.items || []).forEach(it => {
        lines.push(`• ${it.material} — ${it.quantity}`);
        if (it.notes) lines.push(`  (${it.notes})`);
      });
      if (data.tips && data.tips.length) {
        lines.push('', AI_STR.tipsTitle);
        data.tips.forEach(t => lines.push(`- ${t}`));
      }
      try {
        navigator.clipboard.writeText(lines.join('\n'));
        ev.target.textContent = AI_STR.copied;
        setTimeout(() => { ev.target.textContent = AI_STR.copy; }, 2000);
      } catch (_) {}
    });

    document.body.appendChild(modal);
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
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

    btn.addEventListener('click', async () => {
      msg.style.display = 'none';
      const results = (typeof getResults === 'function') ? getResults() : {};
      if (!results || !Object.keys(results).length) return;

      if (!window.BE.credits.consumeN(AI_SHOP_COST)) {
        msg.style.display = 'block';
        msg.style.color = 'var(--err)';
        msg.textContent = AI_STR.needCredits;
        return;
      }

      btn.disabled = true;
      const originalLabel = btn.textContent;
      btn.textContent = AI_STR.btnBusy;

      try {
        const r = await fetch(AI_SHOP_API, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            calcType,
            title:   (typeof titleBuilder === 'function') ? titleBuilder() : '',
            inputs:  (typeof getInputs === 'function') ? getInputs() : {},
            results,
          }),
        });
        const data = await r.json();
        if (data.ok && Array.isArray(data.items)) {
          renderModal(data);
        } else {
          window.BE.credits.add(AI_SHOP_COST); // refund
          msg.style.display = 'block';
          msg.style.color = 'var(--err)';
          msg.textContent = AI_STR.error + (data.reason ? ' (' + data.reason + ')' : '');
        }
      } catch (e) {
        window.BE.credits.add(AI_SHOP_COST); // refund on network error
        msg.style.display = 'block';
        msg.style.color = 'var(--err)';
        msg.textContent = AI_STR.error;
      } finally {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
    });
  };
})();
