(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul oppervlak in',
    rowTopcoat: 'Dekverf nodig', rowPrimer: 'Grondverf', rowWaste: 'Snijverlies toegepast',
    rowCans: 'Blikken-indeling', rowCansSize: (s) => `${s} L blikken`,
  } : {
    heroEmpty: 'Enter an area',
    rowTopcoat: 'Topcoat needed', rowPrimer: 'Primer', rowWaste: 'Waste applied',
    rowCans: 'Can breakdown', rowCansSize: (s) => `${s} L cans`,
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  function canBreakdown(liters) {
    const sizes = [10, 5, 2.5, 1];
    const counts = {};
    let remaining = liters;
    sizes.forEach(s => { counts[s] = Math.floor(remaining / s); remaining -= counts[s] * s; });
    if (remaining > 0.01) counts[1] += 1;
    return counts;
  }

  function recalc() {
    const area = BE.v('area', 0);
    const coats = BE.v('coats', 2);
    const coverage = BE.v('coverage', 10);
    const primer = BE.checked('primer');
    const primerCov = BE.v('primerCov', 10);
    const waste = BE.v('waste', 5);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');

    if (area <= 0 || coverage <= 0) {
      hero.textContent = STR.heroEmpty;
      rows.innerHTML = '';
      return;
    }
    const topcoat = (area / coverage) * coats * (1 + waste / 100);
    const primerL = primer && primerCov > 0 ? (area / primerCov) * (1 + waste / 100) : 0;
    hero.textContent = fmt(topcoat, 1) + ' L';

    const parts = [
      `<div class="result-row"><span class="k">${STR.rowTopcoat}</span><span class="v">${fmt(topcoat, 1)} L</span></div>`,
    ];
    if (primer) {
      parts.push(`<div class="result-row"><span class="k">${STR.rowPrimer}</span><span class="v">${fmt(primerL, 1)} L</span></div>`);
    }
    parts.push(`<div class="result-row"><span class="k">${STR.rowWaste}</span><span class="v">${waste}%</span></div>`);
    const counts = canBreakdown(topcoat);
    Object.keys(counts).map(Number).sort((a, b) => b - a).forEach(s => {
      if (counts[s] > 0) {
        parts.push(`<div class="result-row"><span class="k">${STR.rowCansSize(s)}</span><span class="v">${counts[s]}</span></div>`);
      }
    });
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('methodChips', () => {
      const btn = document.querySelector('#methodChips .chip.active');
      const waste = btn ? +btn.dataset.waste : 5;
      document.getElementById('waste').value = waste;
      recalc();
    });
    document.getElementById('primer').addEventListener('change', () => {
      document.getElementById('primerField').style.display = BE.checked('primer') ? '' : 'none';
      recalc();
    });
    BE.bindAll(['area', 'coats', 'coverage', 'primerCov', 'waste'], recalc);
  });
})();
