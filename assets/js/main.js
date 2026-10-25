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
    loginUrl() {
      return (isNl ? '/nl/login/' : '/login/') + '?next=' + encodeURIComponent(location.pathname + location.search);
    },
  };
  window.BEAuth = BEAuth;

  // ── Inlogknop in de header ──
  // TIJDELIJK (stap 1 van het account-systeem): de knop is alleen zichtbaar
  // voor wie /login/ heeft bezocht (login.js zet de vlag). Zo kan het live
  // getest worden zonder dat bezoekers een half-af systeem zien. Bij stap 2
  // (saldo op de server) gaat deze regel eruit.
  let preview = false;
  try { preview = localStorage.getItem('be_auth_preview') === '1'; } catch (_) {}
  if (!preview) return;

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
    const out = document.createElement('button');
    out.type = 'button';
    out.className = 'nav-account-logout';
    out.textContent = isNl ? 'Uitloggen' : 'Log out';
    out.addEventListener('click', async () => {
      out.disabled = true;
      await BEAuth.logout();
      location.reload();
    });
    menu.append(who, bal, out);

    function setOpen(open) {
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }
    btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(menu.hidden); });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

    wrap.append(btn, menu);
    slot.appendChild(wrap);
  }

  renderLoggedOut();
  BEAuth.me().then((me) => { if (me && me.loggedIn) renderLoggedIn(me); });
})();
