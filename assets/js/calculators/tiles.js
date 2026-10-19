(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroTiles: (n) => n + ' tegels', heroEmpty: 'Vul oppervlak in',
    rowAreaWaste: 'Oppervlak incl. snijverlies', rowBoxes: 'Dozen (incl. reserve)',
    rowBoxesPlain: 'Dozen', rowAdhesiveBags: 'Lijmzakken', rowAdhesiveKg: 'Lijm',
    rowEdge: 'Randprofiel', rowGroutM: 'Voegsel',
  } : {
    heroTiles: (n) => n + ' tiles', heroEmpty: 'Enter an area',
    rowAreaWaste: 'Area incl. waste', rowBoxes: 'Boxes (incl. spare)',
    rowBoxesPlain: 'Boxes', rowAdhesiveBags: 'Adhesive bags', rowAdhesiveKg: 'Adhesive',
    rowEdge: 'Edge trim', rowGroutM: 'Grout',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  function recalc() {
    const area = BE.v('area', 0);
    const tw = BE.v('tileW', 60);
    const th = BE.v('tileH', 60);
    const groutMm = BE.v('groutMm', 3);
    const waste = BE.v('waste', 10);
    const perBox = BE.v('perBox', 5);
    const spareBox = BE.checked('spareBox');
    const adhesive = BE.v('adhesive', 6);
    const bagKg = BE.v('bagKg', 25);
    const edgeM = BE.v('edgeM', 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');

    if (area <= 0 || tw <= 0 || th <= 0) {
      hero.textContent = STR.heroEmpty;
      rows.innerHTML = '';
      return;
    }
    // Tile face area in m² — with grout added to effective dimensions
    const twM = (tw + groutMm / 10) / 100;
    const thM = (th + groutMm / 10) / 100;
    const tileArea = twM * thM;
    const areaWaste = area * (1 + waste / 100);
    const tiles = Math.ceil(areaWaste / tileArea);
    const boxesRaw = Math.ceil(tiles / perBox);
    const boxes = spareBox ? boxesRaw + 1 : boxesRaw;
    const adhKg = area * adhesive;
    const bags = bagKg > 0 ? Math.ceil(adhKg / bagKg) : 0;

    hero.textContent = STR.heroTiles(tiles);
    const parts = [
      `<div class="result-row"><span class="k">${STR.rowAreaWaste}</span><span class="v">${fmt(areaWaste)} m²</span></div>`,
      `<div class="result-row"><span class="k">${spareBox ? STR.rowBoxes : STR.rowBoxesPlain}</span><span class="v">${boxes}</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowAdhesiveBags}</span><span class="v">${bags}</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowAdhesiveKg}</span><span class="v">${fmt(adhKg, 1)} kg</span></div>`,
    ];
    if (edgeM > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowEdge}</span><span class="v">${fmt(edgeM)} m</span></div>`);
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('patternChips', (val) => {
      const btn = document.querySelector('#patternChips .chip.active');
      const waste = btn ? +btn.dataset.waste : 10;
      document.getElementById('waste').value = waste;
      recalc();
    });
    BE.wireCalc(recalc, ['area', 'tileW', 'tileH', 'groutMm', 'waste', 'perBox', 'adhesive', 'bagKg', 'edgeM']); BE.markStaleOn("input,select,.chip,.toggle-row input");
    document.getElementById('spareBox').addEventListener('change', recalc);
  });
})();
