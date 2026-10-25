// Login page: email → 6-digit code → logged in. Uses window.BEAuth (main.js).
(function () {
  const A = window.BEAuth;
  if (!A) return;
  const nl = A.isNl;

  const T = nl ? {
    send: 'Stuur code', sending: 'Versturen…',
    login: 'Inloggen', checking: 'Controleren…',
    resend: 'Code opnieuw sturen', resendIn: (s) => `Opnieuw sturen (${s}s)`,
    sent: 'Er is een nieuwe code verstuurd.',
    badEmail: 'Vul een geldig e-mailadres in.',
    wait: 'Je hebt net al een code gekregen. Wacht een minuutje en probeer het opnieuw.',
    tooMany: 'Te veel aanvragen. Probeer het over 10 minuten opnieuw.',
    mailFail: 'De mail kon niet worden verstuurd. Probeer het later opnieuw of mail contact@buildexact.app.',
    badCode: 'Vul de 6 cijfers uit de mail in.',
    wrong: (n) => `Die code klopt niet. Nog ${n} ${n === 1 ? 'poging' : 'pogingen'}.`,
    expired: 'Deze code is verlopen of al gebruikt. Vraag een nieuwe code aan.',
    tooManyAttempts: 'Te veel pogingen. Wacht 10 minuten en vraag een nieuwe code aan.',
    error: 'Er ging iets mis. Probeer het opnieuw.',
    network: 'Geen verbinding met de server. Controleer je internet en probeer het opnieuw.',
  } : {
    send: 'Send code', sending: 'Sending…',
    login: 'Log in', checking: 'Checking…',
    resend: 'Resend code', resendIn: (s) => `Resend (${s}s)`,
    sent: 'A new code has been sent.',
    badEmail: 'Please enter a valid email address.',
    wait: 'You just received a code. Please wait a minute and try again.',
    tooMany: 'Too many requests. Please try again in 10 minutes.',
    mailFail: "We couldn't send the email. Please try again later or email contact@buildexact.app.",
    badCode: 'Enter the 6 digits from the email.',
    wrong: (n) => `That code is wrong. ${n} ${n === 1 ? 'attempt' : 'attempts'} left.`,
    expired: 'This code has expired or was already used. Please request a new one.',
    tooManyAttempts: 'Too many attempts. Wait 10 minutes and request a new code.',
    error: 'Something went wrong. Please try again.',
    network: "Can't reach the server. Check your connection and try again.",
  };

  const $ = (id) => document.getElementById(id);
  const stepEmail = $('stepEmail'), stepCode = $('stepCode'), stepDone = $('stepDone');
  const emailInput = $('authEmail'), codeInput = $('authCode');
  const emailStatus = $('emailStatus'), codeStatus = $('codeStatus');
  const emailBtn = $('emailBtn'), codeBtn = $('codeBtn'), resendBtn = $('resendBtn');
  let email = '';
  let timer = null;

  function nextUrl() {
    const n = new URLSearchParams(location.search).get('next') || '';
    return n.startsWith('/') && !n.startsWith('//') ? n : (nl ? '/nl/' : '/');
  }
  function show(step) { [stepEmail, stepCode, stepDone].forEach((s) => { s.hidden = s !== step; }); }
  function status(el, kind, msg) { el.className = 'form-status show ' + kind; el.textContent = msg; }
  function clear(el) { el.className = 'form-status'; el.textContent = ''; }
  function busy(btn, on, label) { btn.disabled = on; btn.querySelector('span').textContent = label; }

  function startResendTimer(seconds) {
    clearInterval(timer);
    let s = seconds;
    resendBtn.disabled = true;
    const tick = () => {
      if (s <= 0) { clearInterval(timer); resendBtn.disabled = false; resendBtn.textContent = T.resend; return; }
      resendBtn.textContent = T.resendIn(s);
      s -= 1;
    };
    tick();
    timer = setInterval(tick, 1000);
  }

  function requestError(r) {
    if (r.status === 400) return T.badEmail;
    if (r.status === 429) return r.data.reason === 'wait' ? T.wait : T.tooMany;
    if (r.status === 502) return T.mailFail;
    return T.error;
  }

  stepEmail.addEventListener('submit', async (e) => {
    e.preventDefault();
    clear(emailStatus);
    const value = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { status(emailStatus, 'err', T.badEmail); return; }
    busy(emailBtn, true, T.sending);
    try {
      const r = await A.requestCode(value);
      if (r.ok) {
        email = value;
        $('codeEmail').textContent = email;
        codeInput.value = '';
        clear(codeStatus);
        show(stepCode);
        codeInput.focus();
        startResendTimer(60);
      } else {
        status(emailStatus, 'err', requestError(r));
      }
    } catch (_) {
      status(emailStatus, 'err', T.network);
    } finally {
      busy(emailBtn, false, T.send);
    }
  });

  stepCode.addEventListener('submit', async (e) => {
    e.preventDefault();
    clear(codeStatus);
    const code = codeInput.value.replace(/\D/g, '');
    if (code.length !== 6) { status(codeStatus, 'err', T.badCode); return; }
    busy(codeBtn, true, T.checking);
    try {
      const r = await A.verify(email, code);
      if (r.ok) { location.href = nextUrl(); return; }
      if (r.status === 429) status(codeStatus, 'err', T.tooManyAttempts);
      else if (r.data.reason === 'wrong code') status(codeStatus, 'err', T.wrong(r.data.attemptsLeft));
      else if (r.data.reason === 'expired') status(codeStatus, 'err', T.expired);
      else status(codeStatus, 'err', T.error);
      codeInput.select();
    } catch (_) {
      status(codeStatus, 'err', T.network);
    }
    busy(codeBtn, false, T.login);
  });

  codeInput.addEventListener('input', () => {
    const digits = codeInput.value.replace(/\D/g, '').slice(0, 6);
    if (codeInput.value !== digits) codeInput.value = digits;
    if (digits.length === 6 && !codeBtn.disabled) {
      if (stepCode.requestSubmit) stepCode.requestSubmit();
      else stepCode.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });

  resendBtn.addEventListener('click', async () => {
    clear(codeStatus);
    resendBtn.disabled = true;
    try {
      const r = await A.requestCode(email);
      if (r.ok) { status(codeStatus, 'ok', T.sent); codeInput.value = ''; codeInput.focus(); startResendTimer(60); }
      else { status(codeStatus, 'err', requestError(r)); startResendTimer(60); }
    } catch (_) {
      status(codeStatus, 'err', T.network);
      resendBtn.disabled = false;
    }
  });

  $('changeEmailBtn').addEventListener('click', () => {
    clearInterval(timer);
    clear(emailStatus);
    show(stepEmail);
    emailInput.focus();
    emailInput.select();
  });

  $('doneLogout').addEventListener('click', async () => {
    await A.logout();
    show(stepEmail);
    emailInput.focus();
  });

  A.me(true).then((me) => {
    if (me && me.loggedIn) {
      $('doneEmail').textContent = me.email;
      $('doneContinue').href = nextUrl();
      show(stepDone);
    } else {
      emailInput.focus();
    }
  });
})();
