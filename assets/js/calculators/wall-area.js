(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  function recalc() {
    const l = BE.v('length', 0);
    const h = BE.v('height', 0);
    const o = BE.v('openings', 0);
    const gross = l * h;
    const net = Math.max(gross - o, 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (gross > 0) {
      const num = net.toFixed(2);
      hero.innerHTML = (isNl ? num.replace('.', ',') : num) + ' m<sup>2</sup>';
      const fmt = (v) => isNl ? v.toFixed(2).replace('.', ',') : v.toFixed(2);
      rows.innerHTML = `
        <div class="result-row"><span class="k">${isNl ? 'Bruto wandoppervlak' : 'Gross wall area'}</span><span class="v">${fmt(gross)} m²</span></div>
        <div class="result-row"><span class="k">${isNl ? 'Af te trekken openingen' : 'Openings subtracted'}</span><span class="v">${fmt(o)} m²</span></div>
      `;
    } else {
      hero.textContent = isNl ? 'Vul afmetingen in' : 'Enter dimensions';
      rows.innerHTML = '';
    }
  }
  BE.bindAll(['length', 'height', 'openings'], recalc);
})();
