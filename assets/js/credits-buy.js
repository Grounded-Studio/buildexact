// Credits page: buy flow with billing details. Uses window.BEAuth (main.js).
//   Logged out      → buy button goes to login
//   No billing info → billing form opens first, then checkout
//   Complete        → straight to Mollie (billing form can still be edited)
(function () {
  const A = window.BEAuth;
  const buyBtn = document.getElementById('buyBtn');
  const buyMsg = document.getElementById('buyMsg');
  const card = document.getElementById('billingCard');
  const form = document.getElementById('billingForm');
  if (!A || !buyBtn || !card || !form) return;
  const nl = A.isNl;
  const API = 'https://api.buildexact.app';

  const EU = [
    ['AT', 'Oostenrijk', 'Austria'], ['BE', 'België', 'Belgium'], ['BG', 'Bulgarije', 'Bulgaria'],
    ['HR', 'Kroatië', 'Croatia'], ['CY', 'Cyprus', 'Cyprus'], ['CZ', 'Tsjechië', 'Czechia'],
    ['DK', 'Denemarken', 'Denmark'], ['EE', 'Estland', 'Estonia'], ['FI', 'Finland', 'Finland'],
    ['FR', 'Frankrijk', 'France'], ['DE', 'Duitsland', 'Germany'], ['GR', 'Griekenland', 'Greece'],
    ['HU', 'Hongarije', 'Hungary'], ['IE', 'Ierland', 'Ireland'], ['IT', 'Italië', 'Italy'],
    ['LV', 'Letland', 'Latvia'], ['LT', 'Litouwen', 'Lithuania'], ['LU', 'Luxemburg', 'Luxembourg'],
    ['MT', 'Malta', 'Malta'], ['NL', 'Nederland', 'Netherlands'], ['PL', 'Polen', 'Poland'],
    ['PT', 'Portugal', 'Portugal'], ['RO', 'Roemenië', 'Romania'], ['SK', 'Slowakije', 'Slovakia'],
    ['SI', 'Slovenië', 'Slovenia'], ['ES', 'Spanje', 'Spain'], ['SE', 'Zweden', 'Sweden'],
  ];

  const T = nl ? {
    wait: 'Even geduld…', saving: 'Opslaan…', loginToBuy: 'Log in om te kopen',
    payFail: '✗ Kon betaling niet starten — probeer het opnieuw of neem contact op.',
    saveFail: '✗ Opslaan mislukt — probeer het opnieuw.',
    required: 'Vul dit veld in.', eu_only: 'Kies een EU-land.', format: 'Dit btw-nummer klopt niet.',
    vatValid: '✓ Btw-nummer gecontroleerd bij VIES — de btw wordt verlegd.',
    vatInvalid: '✗ Dit btw-nummer is volgens VIES niet geldig. Je betaalt €2,99 incl. 21% btw. Pas het aan of laat het leeg.',
    vatUnchecked: 'VIES (het EU-register) reageert nu niet. Je betaalt €2,99 incl. 21% btw; sla later opnieuw op om het nummer te laten controleren.',
    editBilling: 'Factuurgegevens wijzigen', choose: 'Kies je land…',
  } : {
    wait: 'One moment…', saving: 'Saving…', loginToBuy: 'Log in to buy',
    payFail: '✗ Could not start payment — please try again or contact us.',
    saveFail: '✗ Saving failed — please try again.',
    required: 'Please fill in this field.', eu_only: 'Choose an EU country.', format: "This VAT number doesn't look right.",
    vatValid: '✓ VAT number verified with VIES — VAT will be reverse charged.',
    vatInvalid: "✗ VIES says this VAT number isn't valid. You'll pay €2.99 incl. 21% VAT. Fix it or leave it empty.",
    vatUnchecked: "VIES (the EU register) isn't responding right now. You'll pay €2.99 incl. 21% VAT; save again later to have the number checked.",
    editBilling: 'Edit billing details', choose: 'Choose your country…',
  };

  const sel = form.elements.country;
  sel.innerHTML = '';
  const ph = document.createElement('option');
  ph.value = ''; ph.textContent = T.choose;
  sel.appendChild(ph);
  EU.slice().sort((a, b) => (nl ? a[1] : a[2]).localeCompare(nl ? b[1] : b[2]))
    .forEach(([code, n, e]) => {
      const o = document.createElement('option');
      o.value = code; o.textContent = nl ? n : e;
      sel.appendChild(o);
    });

  let me = null, profile = null, complete = false;
  const buyLabel = buyBtn.textContent;
  const editLink = document.getElementById('editBilling');
  const formMsg = document.getElementById('billingMsg');
  const vatMsg = document.getElementById('vatMsg');

  async function api(path, opts) {
    const r = await fetch(API + path, Object.assign({
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    }, opts || {}));
    const data = await r.json().catch(() => ({}));
    return { status: r.status, data: data };
  }

  function fill(p) {
    if (!p) return;
    ['name', 'company', 'address', 'postcode', 'city', 'vat_number'].forEach(k => { form.elements[k].value = p[k] || ''; });
    sel.value = p.country || '';
  }

  function showVat(status) {
    vatMsg.style.display = status && status !== 'none' ? 'block' : 'none';
    vatMsg.style.color = status === 'valid' ? 'var(--ok)' : (status === 'invalid' ? 'var(--err)' : 'var(--muted)');
    vatMsg.textContent = status === 'valid' ? T.vatValid : status === 'invalid' ? T.vatInvalid : status === 'unchecked' ? T.vatUnchecked : '';
  }

  function openForm() {
    card.hidden = false;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
    const first = Array.from(form.elements).find(el => el.required && !el.value);
    if (first) setTimeout(() => first.focus(), 300);
  }

  function clearErrors() {
    form.querySelectorAll('.field-error').forEach(e => e.remove());
    formMsg.textContent = '';
  }

  function showErrors(errors) {
    Object.keys(errors || {}).forEach(k => {
      const el = form.elements[k];
      if (!el) return;
      const p = document.createElement('p');
      p.className = 'field-error';
      p.textContent = T[errors[k]] || T.required;
      el.insertAdjacentElement('afterend', p);
    });
  }

  async function startCheckout() {
    buyBtn.disabled = true;
    buyBtn.textContent = T.wait;
    buyMsg.style.display = 'none';
    try {
      const r = await api('/checkout.php', { method: 'POST', body: JSON.stringify({ lang: nl ? 'nl' : 'en' }) });
      if (r.status === 401) { location.href = A.loginUrl(); return; }
      if (r.status === 409) { complete = false; buyBtn.disabled = false; buyBtn.textContent = buyLabel; openForm(); return; }
      if (r.data.ok && r.data.id && r.data.checkoutUrl) {
        try { localStorage.setItem('be_pending_payment', r.data.id); } catch (_) {}
        location.href = r.data.checkoutUrl;
        return;
      }
      throw new Error(r.data.reason || 'checkout failed');
    } catch (e) {
      buyBtn.disabled = false;
      buyBtn.textContent = buyLabel;
      buyMsg.textContent = T.payFail;
      buyMsg.style.display = 'block';
    }
  }

  buyBtn.addEventListener('click', () => {
    if (!me || !me.loggedIn) { location.href = A.loginUrl(); return; }
    if (!complete) { openForm(); return; }
    startCheckout();
  });

  if (editLink) editLink.addEventListener('click', (e) => { e.preventDefault(); openForm(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();
    const btn = form.querySelector('button[type=submit]');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = T.saving;
    const body = {};
    ['name', 'company', 'address', 'postcode', 'city', 'country', 'vat_number'].forEach(k => { body[k] = form.elements[k].value; });
    try {
      const r = await api('/billing-profile.php', { method: 'POST', body: JSON.stringify(body) });
      if (r.status === 401) { location.href = A.loginUrl(); return; }
      if (r.status === 400) { showErrors(r.data.errors); return; }
      if (!r.data.ok) throw new Error('save failed');
      profile = r.data.profile; complete = r.data.complete;
      fill(profile);
      showVat(r.data.vatStatus);
      if (editLink) editLink.hidden = false;
      // Bij een ongeldig/ongecontroleerd btw-nummer eerst laten lezen, anders door naar betalen.
      if (complete && (r.data.vatStatus === 'none' || r.data.vatStatus === 'valid')) {
        card.hidden = true;
        startCheckout();
      } else if (complete) {
        btn.textContent = label;
        btn.disabled = false;
        const go = document.getElementById('billingContinue');
        if (go) go.hidden = false;
      }
    } catch (_) {
      formMsg.textContent = T.saveFail;
    } finally {
      btn.disabled = false;
      btn.textContent = label;
    }
  });

  const cont = document.getElementById('billingContinue');
  if (cont) cont.addEventListener('click', () => { card.hidden = true; startCheckout(); });

  A.me().then(async (m) => {
    me = m;
    if (!m || !m.loggedIn) { buyBtn.textContent = T.loginToBuy; return; }
    try {
      const r = await api('/billing-profile.php');
      if (r.data.ok) {
        profile = r.data.profile; complete = !!r.data.complete;
        fill(profile);
        if (profile && editLink) editLink.hidden = false;
      }
    } catch (_) {}
  });
})();
