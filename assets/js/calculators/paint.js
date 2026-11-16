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

  // Tins in litres, or in US gallons and quarts when imperial is chosen.
  const SIZES = BE.imp() ? [5, 1, 0.25] : [10, 5, 2.5, 1];
  function canBreakdown(liters) {
    const sizes = SIZES;
    const counts = {};
    let remaining = BE.fromMetric('L', liters);
    sizes.forEach(s => { counts[s] = Math.floor(remaining / s + 1e-9); remaining -= counts[s] * s; });
    if (remaining > 0.01) counts[sizes[sizes.length - 1]] += 1;
    return counts;
  }
  function canLabel(s) {
    if (!BE.imp()) return STR.rowCansSize(s);
    if (s === 0.25) return isNl ? 'Quarts (0,25 gal)' : 'Quarts';
    return isNl ? `Blikken van ${s} gal` : `${s} gal ${s === 5 ? 'buckets' : 'cans'}`;
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
    hero.textContent = BE.q('L', topcoat, 1);

    const parts = [
      `<div class="result-row"><span class="k">${STR.rowTopcoat}</span><span class="v">${BE.q('L', topcoat, 1)}</span></div>`,
    ];
    if (primer) {
      parts.push(`<div class="result-row"><span class="k">${STR.rowPrimer}</span><span class="v">${BE.q('L', primerL, 1)}</span></div>`);
    }
    parts.push(`<div class="result-row"><span class="k">${STR.rowWaste}</span><span class="v">${waste}%</span></div>`);
    const counts = canBreakdown(topcoat);
    Object.keys(counts).map(Number).sort((a, b) => b - a).forEach(s => {
      if (counts[s] > 0) {
        parts.push(`<div class="result-row"><span class="k">${canLabel(s)}</span><span class="v">${counts[s]}</span></div>`);
      }
    });
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.units({ area: 'm2', coverage: 'm2L', primerCov: 'm2L' }, { area: 430, coverage: 400, primerCov: 400 });
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
    BE.wireCalc(recalc, ['area', 'coats', 'coverage', 'primerCov', 'waste']); BE.markStaleOn("input,select,.chip,.toggle-row input");

    BE.wireShoppingList(
      'verf',
      () => ({
        oppervlak_m2: BE.v('area', 0),
        aantal_lagen: BE.v('coats', 2),
        dekking_m2_per_liter: BE.v('coverage', 10),
        met_grondverf: BE.checked('primer'),
        snijverlies_percent: BE.v('waste', 5),
      }),
      () => {
        const hero = document.getElementById('heroValue');
        if (!hero || !hero.textContent || hero.textContent === STR.heroEmpty) return null;
        const area = BE.v('area', 0);
        const coats = BE.v('coats', 2);
        const coverage = BE.v('coverage', 10);
        const primer = BE.checked('primer');
        const primerCov = BE.v('primerCov', 10);
        const waste = BE.v('waste', 5);
        const topcoat = (area / coverage) * coats * (1 + waste / 100);
        const primerL = primer && primerCov > 0 ? (area / primerCov) * (1 + waste / 100) : 0;
        const r = { dekverf_liter: topcoat.toFixed(1), aantal_lagen: coats, oppervlak_m2: area };
        if (primer) r.grondverf_liter = primerL.toFixed(1);
        return r;
      },
      () => `Verfproject ${BE.v('area', 0)}m² (${BE.v('coats', 2)} lagen)`
    );
  });
})();
