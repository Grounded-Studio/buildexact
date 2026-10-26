// Language choice. Loaded in <head> so the redirect happens before the page paints.
//
// First visit with Dutch as the browser's preferred language on an English page
// that has a Dutch version (hreflang="nl") → go to the Dutch page. Without this,
// browsers machine-translate the English page while the switch still says EN.
// A click on the EN/NL switch is remembered, so a chosen language always wins.
(function () {
  var KEY = 'be_lang';
  function get() { try { return localStorage.getItem(KEY); } catch (_) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (_) {} }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.lang-switch a');
    if (a) set(/^nl$/i.test(a.textContent.trim()) ? 'nl' : 'en');
  });

  if (get()) return;
  var pageNl = /^nl/i.test(document.documentElement.lang || '');
  var first = (navigator.languages && navigator.languages[0]) || navigator.language || '';
  var wantsNl = /^nl\b/i.test(first);
  set(pageNl ? 'nl' : (wantsNl ? 'nl' : 'en'));
  if (pageNl || !wantsNl) return;

  var alt = document.querySelector('link[rel="alternate"][hreflang="nl"]');
  if (!alt) return;
  var target = new URL(alt.href, location.href);
  if (target.pathname !== location.pathname) {
    location.replace(target.pathname + location.search + location.hash);
  }
})();
