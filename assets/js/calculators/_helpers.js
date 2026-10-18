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

// Freemium lock: wraps every .result-rows block (with 2+ rows) in a blurred
// container with an "Install the app for the full breakdown" overlay.
// Headline .result-hero stays untouched so visitors see the main number.
// Pages that opt out can set data-no-lock="true" on .calc-result.
(function lockFreemium() {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    title: 'Volledig overzicht ontgrendelen',
    body:  'Alle materiaalregels, projecten opslaan, PDF exporteren — allemaal in de BuildExact Android app.',
    cta:   'BuildExact installeren',
  } : {
    title: 'Unlock the full breakdown',
    body:  'Every material line, save projects, export branded PDF — all in the BuildExact Android app.',
    cta:   'Install BuildExact',
  };
  const PLAY = 'https://play.google.com/store/apps/details?id=com.metenweten.bouw';

  document.addEventListener('DOMContentLoaded', () => {
    const results = document.querySelectorAll('.calc-result');
    results.forEach(result => {
      if (result.dataset.noLock === 'true') return;
      const rowGroups = result.querySelectorAll('.result-rows');
      // Count total rows across all groups — skip tiny results (e.g. area, perimeter)
      let totalRows = 0;
      rowGroups.forEach(g => { totalRows += g.querySelectorAll('.result-row').length; });
      if (totalRows < 2) return;

      // Lock each .result-rows block
      rowGroups.forEach(rows => {
        if (rows.closest('.locked-section')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'locked-section';
        rows.parentNode.insertBefore(wrapper, rows);
        wrapper.appendChild(rows);
      });

      // Add ONE overlay on top of the first locked section
      const firstLocked = result.querySelector('.locked-section');
      if (!firstLocked) return;
      const overlay = document.createElement('div');
      overlay.className = 'locked-overlay';
      overlay.innerHTML = `
        <div class="lock-icon">🔒</div>
        <h4>${STR.title}</h4>
        <p>${STR.body}</p>
        <a href="${PLAY}" class="btn btn-primary btn-sm">${STR.cta}</a>
      `;
      firstLocked.appendChild(overlay);
    });
  });
})();
