(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul oppervlak en lagen in', heroValue: 'R-waarde:',
    layerTitle: (n) => `Laag ${n}`, layerThickness: 'Dikte (mm)',
    layerLambda: 'Lambda (W/m·K)', layerCoverage: 'Dekking per pak (m²)',
    layerRInline: (r) => `R = ${r}`,
    rowLayer: (n, mm) => `Laag ${n} (${mm} mm)`,
    rowPacks: 'pakken',
    rowVapour: 'Dampremmer', rowFasteners: 'Pluggen', rowTape: 'Tape',
  } : {
    heroEmpty: 'Enter area and layers', heroValue: 'R-value:',
    layerTitle: (n) => `Layer ${n}`, layerThickness: 'Thickness (mm)',
    layerLambda: 'Lambda (W/m·K)', layerCoverage: 'Pack coverage (m²)',
    layerRInline: (r) => `R = ${r}`,
    rowLayer: (n, mm) => `Layer ${n} (${mm} mm)`,
    rowPacks: 'packs',
    rowVapour: 'Vapour barrier', rowFasteners: 'Fasteners', rowTape: 'Tape',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  let layers = [{ thickness: 100, lambda: 0.035, coverage: 5 }];

  function renderLayers() {
    const wrap = document.getElementById('layers');
    wrap.innerHTML = layers.map((l, i) => {
      const r = l.lambda > 0 ? (l.thickness / 1000) / l.lambda : 0;
      return `
        <div class="gate-card" data-idx="${i}">
          <div class="gate-head">
            <span class="gate-title">${STR.layerTitle(i + 1)} <span style="color:var(--muted);font-weight:500;">· ${STR.layerRInline(fmt(r))}</span></span>
            ${layers.length > 1 ? `<button type="button" class="gate-remove" data-rm="${i}">✕</button>` : ''}
          </div>
          <div class="field-row">
            <div class="field"><label>${STR.layerThickness}</label><input type="number" class="l-thick" value="${l.thickness}" min="10" step="10"></div>
            <div class="field"><label>${STR.layerLambda}</label><input type="number" class="l-lambda" value="${l.lambda}" min="0.01" step="0.001"></div>
          </div>
          <div class="field"><label>${STR.layerCoverage}</label><input type="number" class="l-cov" value="${l.coverage}" min="0.1" step="0.1"></div>
        </div>`;
    }).join('');
    wrap.querySelectorAll('.gate-card').forEach(card => {
      const i = +card.dataset.idx;
      card.querySelector('.l-thick').addEventListener('input', e => { layers[i].thickness = +e.target.value || 0; recalc(); });
      card.querySelector('.l-lambda').addEventListener('input', e => { layers[i].lambda = +e.target.value || 0; recalc(); });
      card.querySelector('.l-cov').addEventListener('input', e => { layers[i].coverage = +e.target.value || 0; recalc(); });
      const rm = card.querySelector('.gate-remove');
      if (rm) rm.addEventListener('click', () => { layers.splice(i, 1); renderLayers(); recalc(); });
    });
  }

  function recalc() {
    const area = BE.v('area', 0);
    const waste = BE.v('waste', 10);
    const vapour = BE.checked('vapour');
    const fast = BE.v('fasteners', 4);
    const tape = BE.v('tape', 0.8);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');

    if (area <= 0 || layers.length === 0) { hero.textContent = STR.heroEmpty; rows.innerHTML = ''; return; }
    const areaWaste = area * (1 + waste / 100);
    let totalR = 0;
    const parts = [];
    layers.forEach((l, i) => {
      const r = l.lambda > 0 ? (l.thickness / 1000) / l.lambda : 0;
      totalR += r;
      const packs = l.coverage > 0 ? Math.ceil(areaWaste / l.coverage) : 0;
      parts.push(`<div class="result-row"><span class="k">${STR.rowLayer(i + 1, l.thickness)}</span><span class="v">${packs} ${STR.rowPacks}</span></div>`);
    });
    hero.innerHTML = fmt(totalR) + ' m<sup>2</sup>·K/W';
    if (vapour) parts.push(`<div class="result-row"><span class="k">${STR.rowVapour}</span><span class="v">${fmt(areaWaste)} m²</span></div>`);
    if (fast > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowFasteners}</span><span class="v">${Math.ceil(area * fast)}</span></div>`);
    if (tape > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowTape}</span><span class="v">${fmt(area * tape, 1)} m</span></div>`);
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderLayers();
    recalc();
    document.getElementById('addLayer').addEventListener('click', () => {
      layers.push({ thickness: 100, lambda: 0.035, coverage: 5 });
      renderLayers();
      recalc();
    });
    BE.wireCalc(recalc, ['area', 'waste', 'fasteners', 'tape']); BE.markStaleOn("input,select,.chip,.toggle-row input");
    document.getElementById('vapour').addEventListener('change', recalc);
  });
})();
