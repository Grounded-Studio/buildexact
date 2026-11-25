// BuildExact — site-wide behavior
(function () {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
  }
})();

// ─── Account: inloggen met e-mailcode ──────────────────────────────────
// Sessie = httpOnly-cookie op .buildexact.app, gezet door api.buildexact.app.
// Deze code praat alleen met de API en tekent de inlogknop in de header.
(function () {
  const API = 'https://api.buildexact.app';
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const CACHE_KEY = 'be_me_v1';
  const CACHE_MS = 5 * 60 * 1000;

  async function call(path, opts) {
    const res = await fetch(API + path, Object.assign({
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    }, opts || {}));
    const data = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok && data.ok !== false, data: data };
  }

  function cacheGet() {
    try {
      const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || 'null');
      if (c && Date.now() - c.t < CACHE_MS) return c.v;
    } catch (_) {}
    return null;
  }
  function cacheSet(v) { try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), v: v })); } catch (_) {} }
  function cacheClear() { try { sessionStorage.removeItem(CACHE_KEY); } catch (_) {} }

  const BEAuth = {
    isNl: isNl,
    async me(force) {
      if (!force) { const c = cacheGet(); if (c) return c; }
      try {
        const r = await call('/me.php');
        const v = r.ok ? r.data : { loggedIn: false };
        if (r.ok) cacheSet(v);
        return v;
      } catch (_) {
        return { loggedIn: false, offline: true };
      }
    },
    requestCode(email) {
      return call('/auth-request-code.php', { method: 'POST', body: JSON.stringify({ email: email, lang: isNl ? 'nl' : 'en' }) });
    },
    async verify(email, code) {
      const r = await call('/auth-verify.php', { method: 'POST', body: JSON.stringify({ email: email, code: code }) });
      cacheClear();
      return r;
    },
    async logout() {
      try { await call('/auth-logout.php', { method: 'POST' }); } catch (_) {}
      cacheClear();
    },
    // Schrijft 1 credit af op de server. status 401 = niet ingelogd, 402 = op.
    async spend(calc) {
      const r = await call('/spend.php', { method: 'POST', body: JSON.stringify({ calc: calc || '' }) });
      if (typeof r.data.credits === 'number') BEAuth.setCredits(r.data.credits);
      return r;
    },
    // Nieuw saldo van de server doorgeven aan cache, header en calculators.
    setCredits(n) {
      const c = cacheGet();
      if (c && c.loggedIn) { c.credits = n; cacheSet(c); }
      document.dispatchEvent(new CustomEvent('be:credits', { detail: { credits: n } }));
    },
    // Na een fetch die credits wijzigde (betaling, code, AI): opnieuw ophalen.
    async refresh() {
      const me = await BEAuth.me(true);
      if (me && me.loggedIn) BEAuth.setCredits(me.credits);
      return me;
    },
    loginUrl() {
      return (isNl ? '/nl/login/' : '/login/') + '?next=' + encodeURIComponent(location.pathname + location.search);
    },
  };
  window.BEAuth = BEAuth;

  // Oude browser-credits (vóór accounts) opruimen.
  try { localStorage.removeItem('be_credits_v2'); localStorage.removeItem('be_auth_preview'); } catch (_) {}

  // ── Inlogknop in de header ──
  const navRight = document.querySelector('.nav-right');
  if (!navRight || /\/login\/?$/.test(location.pathname)) return;

  const slot = document.createElement('div');
  slot.className = 'nav-account-slot';
  navRight.insertBefore(slot, navRight.firstChild);

  const ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>';

  function renderLoggedOut() {
    slot.innerHTML = '';
    const a = document.createElement('a');
    a.className = 'nav-account';
    a.href = BEAuth.loginUrl();
    a.innerHTML = ICON;
    const label = document.createElement('span');
    label.className = 'nav-account-label';
    label.textContent = isNl ? 'Inloggen' : 'Log in';
    a.appendChild(label);
    slot.appendChild(a);
  }

  function renderLoggedIn(me) {
    slot.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'nav-account-wrap';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-account';
    btn.setAttribute('aria-haspopup', 'true');
    btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = ICON;
    const label = document.createElement('span');
    label.className = 'nav-account-label';
    label.textContent = String(me.credits) + ' credits';
    btn.appendChild(label);

    const menu = document.createElement('div');
    menu.className = 'nav-account-menu';
    menu.hidden = true;

    const who = document.createElement('div');
    who.className = 'nav-account-email';
    who.textContent = me.email;
    const bal = document.createElement('div');
    bal.className = 'nav-account-balance';
    bal.textContent = (isNl ? 'Saldo: ' : 'Balance: ') + me.credits + ' credits';
    const links = document.createElement('div');
    [[isNl ? 'Mijn account' : 'My account', isNl ? '/nl/account/' : '/account/'],
     [isNl ? 'Credits kopen' : 'Buy credits', isNl ? '/nl/credits/' : '/credits/']].forEach(([text, href]) => {
      const a = document.createElement('a');
      a.className = 'nav-account-link';
      a.href = href;
      a.textContent = text;
      links.appendChild(a);
    });
    const out = document.createElement('button');
    out.type = 'button';
    out.className = 'nav-account-logout';
    out.textContent = isNl ? 'Uitloggen' : 'Log out';
    out.addEventListener('click', async () => {
      out.disabled = true;
      await BEAuth.logout();
      location.reload();
    });
    menu.append(who, bal, links, out);

    function setOpen(open) {
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.hidden); });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    document.addEventListener('be:credits', (e) => {
      label.textContent = e.detail.credits + ' credits';
      bal.textContent = (isNl ? 'Saldo: ' : 'Balance: ') + e.detail.credits + ' credits';
    });

    wrap.append(btn, menu);
    slot.appendChild(wrap);
  }

  renderLoggedOut();
  BEAuth.me().then((me) => { if (me && me.loggedIn) renderLoggedIn(me); });
})();

// ─── Blog: share buttons (WhatsApp + copy link) ───────────────────────
(function () {
  const wa = document.getElementById('share-wa');
  const copy = document.getElementById('share-copy');
  if (!wa && !copy) return;
  const nl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const url = location.href.split('#')[0];
  const h1 = document.querySelector('h1');
  const title = (h1 ? h1.textContent : document.title).trim();
  if (wa) wa.href = 'https://wa.me/?text=' + encodeURIComponent(title + ' ' + url);
  if (copy) {
    copy.addEventListener('click', async () => {
      const original = copy.innerHTML;
      try {
        await navigator.clipboard.writeText(url);
        copy.textContent = nl ? 'Link gekopieerd ✓' : 'Link copied ✓';
      } catch (_) {
        window.prompt(nl ? 'Kopieer deze link:' : 'Copy this link:', url);
      }
      setTimeout(() => { copy.innerHTML = original; }, 2000);
    });
  }
})();

// ─── Measuring ────────────────────────────────────────────────────────
// Google Play links carry the page they were clicked on, so the Play Console
// (Acquisition reports → UTM) shows which pages bring installs.
(function () {
  const page = location.pathname.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
  const referrer = encodeURIComponent('utm_source=buildexact.app&utm_medium=website&utm_campaign=' + page);
  document.querySelectorAll('a[href*="play.google.com/store/apps/details?id=com.metenweten.bouw"]').forEach((a) => {
    if (!/[?&]referrer=/.test(a.href)) a.href += '&referrer=' + referrer;
  });
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href*="play.google.com/store/apps/details?id=com.metenweten.bouw"]');
    if (a && !/[?&]referrer=/.test(a.href)) a.href += '&referrer=' + referrer;
  }, true);

  // Cloudflare Web Analytics: cookie-free visitor counts. Empty token = off.
  const CF_TOKEN = '2ac2030d525d454dbdd58ae5126df80d';
  if (CF_TOKEN) {
    const s = document.createElement('script');
    s.defer = true;
    s.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    s.setAttribute('data-cf-beacon', JSON.stringify({ token: CF_TOKEN }));
    document.head.appendChild(s);
  }
})();

// ─── PRO discount popup. Switched by _tools/promo_prices.py ───────────
(function () {
  const PROMO_ON = false;
  const KEY = 'be_promo25_seen';
  const REPEAT_MS = 7 * 24 * 60 * 60 * 1000;
  const PROMO_END = Date.UTC(2026, 11, 2, 14); // Safety stop. Move this if the Google Play offer is extended.
  if (!PROMO_ON || Date.now() >= PROMO_END || typeof HTMLDialogElement === 'undefined') return;
  if (/\/(login|account|credits|privacy|terms|delete-data)(\/|$)/.test(location.pathname)) return;

  // Without storage we can't remember a dismissal, so don't show it at all.
  try {
    if (Date.now() - Number(localStorage.getItem(KEY) || 0) < REPEAT_MS) return;
  } catch (_) { return; }

  const nl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const t = nl ? {
    tag: '25% korting op PRO', title: 'BuildExact PRO nu €5,99', was: '€7,99',
    text: 'Eén keer betalen, geen abonnement: alle 25 calculators, offertes, facturen en werkbonnen.',
    alt: 'Ontdek het op Google Play', badge: 'nl', close: 'Sluiten',
    note: 'Tijdelijke actie. Android-app. De prijs in Google Play is leidend.',
  } : {
    tag: '25% off PRO', title: 'BuildExact PRO now €5.99', was: '€7.99',
    text: 'Pay once, no subscription: all 25 calculators, quotes, invoices and work orders.',
    alt: 'Get it on Google Play', badge: 'en', close: 'Close',
    note: 'Limited-time offer. Android app. The price shown in Google Play applies.',
  };

  function show() {
    // Never interrupt someone who is typing in a calculator or form.
    if (document.activeElement && /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      setTimeout(show, 5000);
      return;
    }
    const d = document.createElement('dialog');
    d.className = 'promo-dialog';
    d.setAttribute('aria-labelledby', 'promoTitle');
    d.innerHTML =
      '<button type="button" class="promo-close" aria-label="' + t.close + '">&times;</button>' +
      '<span class="badge">' + t.tag + '</span>' +
      '<h2 id="promoTitle">' + t.title + ' <s class="price-was">' + t.was + '</s></h2>' +
      '<p>' + t.text + '</p>' +
      '<a class="store-badge store-badge-img" href="https://play.google.com/store/apps/details?id=com.metenweten.bouw" target="_blank" rel="noopener">' +
      '<img src="/assets/icons/google-play-badge-' + t.badge + '.svg" alt="' + t.alt + '"></a>' +
      '<p class="promo-note">' + t.note + '</p>';
    d.querySelector('.promo-close').addEventListener('click', () => d.close());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => d.remove());
    document.body.appendChild(d);
    d.tabIndex = -1;
    d.showModal();
    d.focus();
    try { localStorage.setItem(KEY, String(Date.now())); } catch (_) {}
  }
  setTimeout(show, 6000);
})();

// ─── Gift popup: 5 extra free website credits, once per account ───────
// Server side: api.buildexact.app/gift.php (ledger reason 'website_gift').
// Shown after 20 s or half-way down the page, at most once per 14 days,
// never while typing and never on login/account/credits/legal pages.
// Not logged in: "Claim" remembers the wish and goes to the login page;
// back on the site the gift is claimed automatically.
(function () {
  if (typeof HTMLDialogElement === 'undefined' || !window.BEAuth) return;
  const SEEN = 'be_gift_seen', DONE = 'be_gift_done', PENDING = 'be_gift_pending';
  const REPEAT_MS = 14 * 24 * 60 * 60 * 1000;
  const A = window.BEAuth;
  const nl = A.isNl;
  const calcUrl = nl ? '/nl/calculators/' : '/calculators/';
  const t = nl ? {
    tag: 'Cadeautje', title: '5 extra gratis credits',
    textOut: 'Log in met alleen je e-mailadres en reken 10 keer gratis met de calculators op deze website: 5 credits bij je eerste login, plus 5 extra van ons. Geen wachtwoord, geen betaalgegevens.',
    textIn: 'Bedankt voor je bezoek! Claim 5 extra credits voor de calculators op deze website.',
    btn: 'Claim mijn 5 credits', later: 'Nee, bedankt', close: 'Sluiten',
    note: 'Eén keer per account. Credits zijn voor de calculators op buildexact.app.',
    okTitle: 'Gelukt! +5 credits', okText: (n) => 'Je saldo is nu ' + n + ' credits.', go: 'Ga rekenen',
    already: (n) => 'Je hebt dit cadeau al ontvangen. Je saldo is ' + n + ' credits.',
    err: 'Dat lukte niet. Probeer het later nog eens.',
  } : {
    tag: 'A small gift', title: '5 extra free credits',
    textOut: 'Log in with just your email and calculate 10 times for free with the calculators on this website: 5 credits on your first login, plus 5 extra from us. No password, no payment details.',
    textIn: 'Thanks for visiting! Claim 5 extra credits for the calculators on this website.',
    btn: 'Claim my 5 credits', later: 'No, thanks', close: 'Close',
    note: 'Once per account. Credits are for the calculators on buildexact.app.',
    okTitle: 'Done! +5 credits', okText: (n) => 'Your balance is now ' + n + ' credits.', go: 'Start calculating',
    already: (n) => 'You already received this gift. Your balance is ' + n + ' credits.',
    err: 'That did not work. Please try again later.',
  };
  const get = (k) => { try { return localStorage.getItem(k); } catch (_) { return undefined; } };
  const set = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (_) {} };

  function dialog(html) {
    const d = document.createElement('dialog');
    d.className = 'promo-dialog gift-dialog';
    d.setAttribute('aria-labelledby', 'giftTitle');
    d.innerHTML = '<button type="button" class="promo-close" aria-label="' + t.close + '">&times;</button>' + html;
    d.querySelector('.promo-close').addEventListener('click', () => d.close());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.addEventListener('close', () => d.remove());
    document.body.appendChild(d);
    d.tabIndex = -1;
    d.showModal();
    d.focus();
    return d;
  }

  function result(r) {
    const n = r.data && typeof r.data.credits === 'number' ? r.data.credits : null;
    if (n !== null) A.setCredits(n);
    if (r.ok && r.data.added > 0) {
      set(DONE, '1');
      return dialog('<div class="gift-icon" aria-hidden="true">🎁</div><h2 id="giftTitle">' + t.okTitle + '</h2>' +
        '<p>' + t.okText(n) + '</p><a class="btn btn-primary" href="' + calcUrl + '">' + t.go + '</a>');
    }
    if (r.ok) {
      set(DONE, '1');
      return dialog('<h2 id="giftTitle">' + t.title + '</h2><p>' + t.already(n) + '</p>');
    }
    return dialog('<h2 id="giftTitle">' + t.title + '</h2><p>' + t.err + '</p>');
  }

  async function claim() {
    let r;
    try {
      const res = await fetch('https://api.buildexact.app/gift.php', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: '{}',
      });
      const data = await res.json().catch(() => ({}));
      r = { status: res.status, ok: res.ok && data.ok !== false, data: data };
    } catch (_) {
      r = { status: 0, ok: false, data: {} };
    }
    if (r.status === 401) { set(PENDING, String(Date.now())); location.href = A.loginUrl(); return; }
    result(r);
  }

  const blocked = /\/(login|account|credits|privacy|terms|delete-data)(\/|$)/.test(location.pathname);

  // Back from the login page with a claim waiting (max. 1 day old).
  const pending = Number(get(PENDING) || 0);
  if (pending && !/\/login(\/|$)/.test(location.pathname)) {
    if (Date.now() - pending > 24 * 60 * 60 * 1000) {
      set(PENDING, null);
    } else {
      A.me(true).then((me) => {
        if (me && me.loggedIn) { set(PENDING, null); claim(); }
      });
      return;
    }
  }

  if (blocked || get(DONE)) return;
  const seen = get(SEEN);
  if (seen === undefined) return;                       // no storage: we can't remember a "no", so stay quiet
  if (Date.now() - Number(seen || 0) < REPEAT_MS) return;

  let shown = false;
  async function show() {
    if (shown || document.querySelector('dialog[open]')) return;
    if (document.activeElement && /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      setTimeout(show, 5000);
      return;
    }
    shown = true;
    window.removeEventListener('scroll', onScroll);
    set(SEEN, String(Date.now()));
    const me = await A.me();
    const d = dialog('<span class="badge">' + t.tag + '</span>' +
      '<div class="gift-icon" aria-hidden="true">🎁</div>' +
      '<h2 id="giftTitle">' + t.title + '</h2>' +
      '<p>' + (me && me.loggedIn ? t.textIn : t.textOut) + '</p>' +
      '<button type="button" class="btn btn-primary gift-claim">' + t.btn + '</button>' +
      '<button type="button" class="gift-later">' + t.later + '</button>' +
      '<p class="promo-note">' + t.note + '</p>');
    d.querySelector('.gift-later').addEventListener('click', () => d.close());
    d.querySelector('.gift-claim').addEventListener('click', (e) => {
      e.currentTarget.disabled = true;
      d.close();
      claim();
    });
  }
  function onScroll() {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (h > 400 && scrollY / h > 0.5) show();
  }
  setTimeout(show, 20000);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
