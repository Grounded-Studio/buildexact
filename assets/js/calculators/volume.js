(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  function recalc() {
    const l = BE.v('length', 0);
    const w = BE.v('width', 0);
    const h = BE.v('height', 0);
    const vol = l * w * h;
    const hero = document.getElementById('heroValue');
    if (vol > 0) {
      const num = vol.toFixed(3);
      hero.innerHTML = (isNl ? num.replace('.', ',') : num) + ' m<sup>3</sup>';
    } else {
      hero.textContent = isNl ? 'Vul afmetingen in' : 'Enter dimensions';
    }
  }
  BE.bindAll(['length', 'width', 'height'], recalc);
})();
