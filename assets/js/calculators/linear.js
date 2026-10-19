(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  function recalc() {
    const l = BE.v('length', 0);
    const hero = document.getElementById('heroValue');
    if (l > 0) {
      hero.textContent = l.toFixed(2) + ' m';
    } else {
      hero.textContent = isNl ? 'Vul een lengte in' : 'Enter a length';
    }
  }
  BE.bindAll(['length'], recalc);
})();
