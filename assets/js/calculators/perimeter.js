(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  function recalc() {
    const l = BE.v('length', 0);
    const w = BE.v('width', 0);
    const waste = BE.v('waste', 5);
    const perim = 2 * (l + w);
    const withWaste = perim * (1 + waste / 100);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (perim > 0) {
      const num = withWaste.toFixed(2);
      hero.textContent = (isNl ? num.replace('.', ',') : num) + ' m';
      const fmt = (v) => isNl ? v.toFixed(2).replace('.', ',') : v.toFixed(2);
      rows.innerHTML = `
        <div class="result-row"><span class="k">${isNl ? 'Omtrek (zonder snijverlies)' : 'Perimeter (no waste)'}</span><span class="v">${fmt(perim)} m</span></div>
        <div class="result-row"><span class="k">${isNl ? 'Snijverlies toegepast' : 'Waste applied'}</span><span class="v">${waste}%</span></div>
      `;
    } else {
      hero.textContent = isNl ? 'Vul afmetingen in' : 'Enter dimensions';
      rows.innerHTML = '';
    }
  }
  BE.bindAll(['length', 'width', 'waste'], recalc);
})();
