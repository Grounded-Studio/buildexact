(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  function recalc() {
    const l = BE.v('length', 0);
    const w = BE.v('width', 0);
    const area = l * w;
    const hero = document.getElementById('heroValue');
    if (area > 0) {
      const num = area.toFixed(2);
      hero.innerHTML = (isNl ? num.replace('.', ',') : num) + ' m<sup>2</sup>';
    } else {
      hero.textContent = isNl ? 'Vul afmetingen in' : 'Enter dimensions';
    }
  }
  BE.bindAll(['length', 'width'], recalc);
})();
