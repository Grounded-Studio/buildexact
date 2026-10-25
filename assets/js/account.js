// Account page: balance, billing details and invoices. Uses window.BEAuth (main.js).
(function () {
  const A = window.BEAuth;
  if (!A) return;
  const nl = A.isNl;
  const API = 'https://api.buildexact.app';
  const $ = (id) => document.getElementById(id);

  const T = nl ? {
    loggedInAs: 'Ingelogd als ', none: 'Nog niet ingevuld — dat doe je bij je eerste aankoop.',
    noOrders: 'Nog geen aankopen.', view: 'Bekijken', bonus: 'bonus', error: 'Kon gegevens niet laden.',
  } : {
    loggedInAs: 'Logged in as ', none: 'Not filled in yet — you do this with your first purchase.',
    noOrders: 'No purchases yet.', view: 'View', bonus: 'bonus', error: "Couldn't load your details.",
  };

  async function get(path) {
    const r = await fetch(API + path, { credentials: 'include', headers: { 'Accept': 'application/json' } });
    return r.json().catch(() => ({}));
  }

  function line(text) {
    const d = document.createElement('div');
    d.textContent = text;
    return d;
  }

  function eur(cents) {
    const s = (cents / 100).toFixed(2);
    return '€ ' + (nl ? s.replace('.', ',') : s);
  }

  function date(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString(nl ? 'nl-NL' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function renderBilling(p) {
    const box = $('accBilling');
    box.innerHTML = '';
    if (!p) { box.textContent = T.none; return; }
    box.classList.remove('muted');
    let country = p.country;
    try { country = new Intl.DisplayNames([nl ? 'nl' : 'en'], { type: 'region' }).of(p.country) || p.country; } catch (_) {}
    [p.company, p.name, p.address, p.postcode + ' ' + p.city, country, p.vat_number]
      .filter(Boolean).forEach(v => box.appendChild(line(v)));
  }

  function renderOrders(orders) {
    const box = $('accOrders');
    box.innerHTML = '';
    if (!orders.length) { box.textContent = T.noOrders; return; }
    box.classList.remove('muted');
    const list = document.createElement('div');
    list.className = 'acc-orders';
    orders.forEach(o => {
      const row = document.createElement('div');
      row.className = 'acc-order';
      const left = document.createElement('div');
      const num = document.createElement('strong');
      num.textContent = o.invoice;
      left.appendChild(num);
      left.appendChild(line(date(o.date) + ' · ' + o.credits + ' credits' + (o.bonus ? ' + ' + o.bonus + ' ' + T.bonus : '') + ' · ' + eur(o.total_cents)));
      const acts = document.createElement('div');
      acts.className = 'acc-order-actions';
      const a = document.createElement('a');
      a.href = o.invoiceUrl; a.target = '_blank'; a.rel = 'noopener';
      a.textContent = T.view;
      const pdf = document.createElement('a');
      pdf.href = o.pdfUrl;
      pdf.textContent = '⬇ PDF';
      acts.append(a, pdf);
      row.append(left, acts);
      list.appendChild(row);
    });
    box.appendChild(list);
  }

  $('accLogout').addEventListener('click', async () => {
    await A.logout();
    location.href = nl ? '/nl/' : '/';
  });

  A.me(true).then(async (me) => {
    if (!me || !me.loggedIn) { location.href = A.loginUrl(); return; }
    $('accEmail').textContent = T.loggedInAs + me.email;
    $('accBalance').textContent = me.credits + ' credits';
    document.addEventListener('be:credits', (e) => { $('accBalance').textContent = e.detail.credits + ' credits'; });
    try {
      const [b, o] = await Promise.all([get('/billing-profile.php'), get('/account-orders.php')]);
      renderBilling(b.ok ? b.profile : null);
      renderOrders(o.ok ? o.orders : []);
    } catch (_) {
      $('accBilling').textContent = T.error;
      $('accOrders').textContent = T.error;
    }
  });
})();
