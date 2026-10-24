// Contact form → shared Grounded Studio contact endpoint (own Strato mail).
// without opening the visitor's mail app. Same endpoint the Grounded Studio
// and FreshGarant sites use. Language comes from data-lang on the <form>.
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const T = {
    en: {
      invalid: 'Please fill in your name, a valid email address and a message.',
      sending: 'Sending…',
      send: 'Send message',
      ok: 'Thanks! Your message is on its way. We usually reply within 1–2 working days.',
      err: 'Something went wrong while sending. Please email us at <a href="mailto:contact@grounded-studio.app">contact@grounded-studio.app</a>.',
      copied: 'Copied!',
      copy: 'Copy',
    },
    nl: {
      invalid: 'Vul je naam, een geldig e-mailadres en een bericht in.',
      sending: 'Versturen…',
      send: 'Verstuur bericht',
      ok: 'Bedankt! Je bericht is onderweg. We reageren meestal binnen 1–2 werkdagen.',
      err: 'Er ging iets mis bij het versturen. Mail ons gerust via <a href="mailto:contact@grounded-studio.app">contact@grounded-studio.app</a>.',
      copied: 'Gekopieerd!',
      copy: 'Kopieer',
    },
  };
  const t = T[form.dataset.lang] || T.en;
  const statusEl = document.getElementById('formStatus');
  const sendBtn = document.getElementById('sendBtn');
  const sendLabel = sendBtn.querySelector('span');

  function showStatus(kind, html) {
    statusEl.className = 'form-status show ' + kind;
    statusEl.innerHTML = html;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    if (fd.get('_honey')) return; // bot filled the hidden field
    const name = String(fd.get('name') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const message = String(fd.get('message') || '').trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
      showStatus('err', t.invalid);
      return;
    }
    sendBtn.disabled = true;
    sendLabel.textContent = t.sending;
    const topic = fd.get('topic');
    try {
      const res = await fetch('https://api.buildexact.app/contact.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name, email, topic, message,
          product: 'BuildExact',
          language: form.dataset.lang,
          _subject: `[BuildExact] ${topic} — ${name}`,
          _replyto: email,
          _template: 'table',
          _captcha: 'false',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && String(json.success) === 'true') {
        showStatus('ok', t.ok);
        form.reset();
      } else {
        showStatus('err', t.err);
      }
    } catch (err) {
      showStatus('err', t.err);
    } finally {
      sendBtn.disabled = false;
      sendLabel.textContent = t.send;
    }
  });

  const copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText('contact@grounded-studio.app'); } catch (err) {}
      copyBtn.textContent = t.copied;
      setTimeout(() => { copyBtn.textContent = t.copy; }, 1800);
    });
  }
})();
