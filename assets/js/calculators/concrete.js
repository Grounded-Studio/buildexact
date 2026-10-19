(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul afmetingen in',
    rowReadymix: 'Bestel bij betonmolen', rowCement: 'Cementzakken (25 kg)',
    rowSand: 'Zand', rowGravel: 'Grind', rowRebar: 'Wapening',
    rowBars: 'Staven nodig', rowFormwork: 'Bekisting omtrek',
  } : {
    heroEmpty: 'Enter dimensions',
    rowReadymix: 'Order from ready-mix supplier', rowCement: 'Cement bags (25 kg)',
    rowSand: 'Sand', rowGravel: 'Gravel', rowRebar: 'Rebar',
    rowBars: 'Rebar bars', rowFormwork: 'Formwork perimeter',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  function recalc() {
    const l = BE.v('length', 0);
    const w = BE.v('width', 0);
    const depth = BE.v('depth', 12) / 100;
    const waste = BE.v('waste', 10);
    const rebarKgPerM3 = BE.v('rebar', 60);
    const barLen = BE.v('barLen', 12);
    const formwork = BE.checked('formwork');
    const supply = BE.activeChip('supplyChips') || 'readymix';
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');

    const raw = l * w * depth;
    const volume = raw * (1 + waste / 100);
    if (volume <= 0) { hero.textContent = STR.heroEmpty; rows.innerHTML = ''; return; }

    hero.innerHTML = fmt(volume) + ' m<sup>3</sup>';
    const parts = [];
    if (supply === 'readymix') {
      // Round up to nearest 0.5 m³ (truck delivery minimum)
      const order = Math.ceil(volume * 2) / 2;
      parts.push(`<div class="result-row"><span class="k">${STR.rowReadymix}</span><span class="v">${fmt(order)} m³</span></div>`);
    } else {
      const cementBags = Math.ceil(volume * 14);
      const sand = volume * 0.5;
      const gravel = volume * 0.8;
      parts.push(`<div class="result-row"><span class="k">${STR.rowCement}</span><span class="v">${cementBags}</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowSand}</span><span class="v">${fmt(sand)} m³</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowGravel}</span><span class="v">${fmt(gravel)} m³</span></div>`);
    }
    if (rebarKgPerM3 > 0) {
      const rebarKg = volume * rebarKgPerM3;
      const rebarMeters = rebarKg / 0.617;
      const bars = barLen > 0 ? Math.ceil(rebarMeters / barLen) : 0;
      parts.push(`<div class="result-row"><span class="k">${STR.rowRebar}</span><span class="v">${fmt(rebarKg, 1)} kg</span></div>`);
      if (bars > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowBars}</span><span class="v">${bars}</span></div>`);
    }
    if (formwork) {
      parts.push(`<div class="result-row"><span class="k">${STR.rowFormwork}</span><span class="v">${fmt((l + w) * 2)} m</span></div>`);
    }
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('presetChips', () => {
      const btn = document.querySelector('#presetChips .chip.active');
      if (!btn) return;
      document.getElementById('depth').value = btn.dataset.depth;
      document.getElementById('waste').value = btn.dataset.waste;
      document.getElementById('rebar').value = btn.dataset.rebar;
      recalc();
    });
    BE.chip('supplyChips', recalc);
    BE.wireCalc(recalc, ['length', 'width', 'depth', 'waste', 'rebar', 'barLen']); BE.markStaleOn("input,select,.chip,.toggle-row input");
    document.getElementById('formwork').addEventListener('change', recalc);
  });
})();
