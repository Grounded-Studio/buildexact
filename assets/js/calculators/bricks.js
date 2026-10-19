(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul wandafmetingen in', heroBricks: (n) => `${n} bakstenen`,
    openingTitle: (n) => `Opening ${n}`, openingW: 'Breedte (m)', openingH: 'Hoogte (m)',
    lintelFor: (len) => `Latei ${len} m`,
    rowNet: 'Netto wandoppervlak', rowMortarBags: 'Mortelzakken',
    rowMortarKg: 'Mortel', rowLintels: 'Lateien', rowLintelTotal: 'Totale latei-lengte',
    rowTies: 'Spouwankers',
  } : {
    heroEmpty: 'Enter wall dimensions', heroBricks: (n) => `${n} bricks`,
    openingTitle: (n) => `Opening ${n}`, openingW: 'Width (m)', openingH: 'Height (m)',
    lintelFor: (len) => `Lintel ${len} m`,
    rowNet: 'Net wall area', rowMortarBags: 'Mortar bags',
    rowMortarKg: 'Mortar', rowLintels: 'Lintels', rowLintelTotal: 'Total lintel length',
    rowTies: 'Wall ties',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  let openings = [];

  function renderOpenings() {
    const wrap = document.getElementById('openings');
    if (openings.length === 0) {
      wrap.innerHTML = `<p class="hint" style="margin-bottom:12px;">${isNl ? 'Geen openingen. Klik hieronder om er een toe te voegen.' : 'No openings. Tap below to add one.'}</p>`;
      return;
    }
    wrap.innerHTML = openings.map((o, i) => {
      const lintelLen = o.width + 0.4;
      return `
        <div class="gate-card" data-idx="${i}">
          <div class="gate-head">
            <span class="gate-title">${STR.openingTitle(i + 1)} <span style="color:var(--muted);font-weight:500;">· ${STR.lintelFor(fmt(lintelLen))}</span></span>
            <button type="button" class="gate-remove" data-rm="${i}">✕</button>
          </div>
          <div class="field-row">
            <div class="field"><label>${STR.openingW}</label><input type="number" class="o-w" value="${o.width}" min="0" step="0.05"></div>
            <div class="field"><label>${STR.openingH}</label><input type="number" class="o-h" value="${o.height}" min="0" step="0.05"></div>
          </div>
        </div>`;
    }).join('');
    wrap.querySelectorAll('.gate-card').forEach(card => {
      const i = +card.dataset.idx;
      card.querySelector('.o-w').addEventListener('input', e => { openings[i].width = +e.target.value || 0; recalc(); });
      card.querySelector('.o-h').addEventListener('input', e => { openings[i].height = +e.target.value || 0; recalc(); });
      card.querySelector('.gate-remove').addEventListener('click', () => { openings.splice(i, 1); renderOpenings(); recalc(); });
    });
  }

  function recalc() {
    const l = BE.v('length', 0);
    const h = BE.v('height', 0);
    const perM2 = BE.v('perM2', 50);
    const waste = BE.v('waste', 5);
    const mortarKg = BE.v('mortarKg', 35);
    const bagKg = BE.v('bagKg', 25);
    const cavity = BE.checked('cavity');
    const tiesPerM2 = BE.v('tiesPerM2', 5);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');

    const gross = l * h;
    if (gross <= 0) { hero.textContent = STR.heroEmpty; rows.innerHTML = ''; return; }
    const openingsArea = openings.reduce((s, o) => s + o.width * o.height, 0);
    const net = Math.max(gross - openingsArea, 0);
    const bricks = Math.ceil(net * perM2 * (1 + waste / 100));
    const mortarKgTotal = net * mortarKg;
    const bags = bagKg > 0 ? Math.ceil(mortarKgTotal / bagKg) : 0;
    const lintelLenTotal = openings.reduce((s, o) => s + (o.width + 0.4), 0);
    const ties = cavity ? Math.ceil(net * tiesPerM2) : 0;

    hero.textContent = STR.heroBricks(bricks);
    const parts = [
      `<div class="result-row"><span class="k">${STR.rowNet}</span><span class="v">${fmt(net)} m²</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowMortarBags}</span><span class="v">${bags}</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowMortarKg}</span><span class="v">${fmt(mortarKgTotal, 1)} kg</span></div>`,
    ];
    if (openings.length > 0) {
      parts.push(`<div class="result-row"><span class="k">${STR.rowLintels}</span><span class="v">${openings.length}</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowLintelTotal}</span><span class="v">${fmt(lintelLenTotal)} m</span></div>`);
    }
    if (cavity) parts.push(`<div class="result-row"><span class="k">${STR.rowTies}</span><span class="v">${ties}</span></div>`);
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderOpenings();
    recalc();
    document.getElementById('addOpening').addEventListener('click', () => {
      openings.push({ width: 0.9, height: 2.1 });
      renderOpenings();
      recalc();
    });
    document.getElementById('cavity').addEventListener('change', () => {
      document.getElementById('tiesField').style.display = BE.checked('cavity') ? '' : 'none';
      recalc();
    });
    BE.wireCalc(recalc, ['length', 'height', 'perM2', 'waste', 'mortarKg', 'bagKg', 'tiesPerM2']); BE.markStaleOn("input,select,.chip,.toggle-row input");
  });
})();
