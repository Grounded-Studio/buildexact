(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul oppervlak in',
    rowAreaWaste: 'Oppervlak incl. snijverlies', rowSubBase: 'Onderlaag',
    rowBedding: 'Straatzand (bedding)', rowJointSand: 'Voegzand', rowEdge: 'Kantopsluiting',
  } : {
    heroEmpty: 'Enter an area',
    rowAreaWaste: 'Area incl. waste', rowSubBase: 'Sub-base',
    rowBedding: 'Bedding sand', rowJointSand: 'Joint sand', rowEdge: 'Edge restraint',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  function recalc() {
    const area = BE.v('area', 0);
    const sw = BE.v('stoneW', 20);
    const sh = BE.v('stoneH', 10);
    const waste = BE.v('waste', 7);
    const bedding = BE.v('bedding', 5) / 100;
    const subBase = BE.v('subBase', 20) / 100;
    const jointSand = BE.v('jointSand', 3);
    const edge = BE.checked('edge');
    const perim = BE.v('perimeter', 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');

    if (area <= 0 || sw <= 0 || sh <= 0) { hero.textContent = STR.heroEmpty; rows.innerHTML = ''; return; }
    const stoneArea = (sw / 100) * (sh / 100);
    const areaWaste = area * (1 + waste / 100);
    const stones = Math.ceil(areaWaste / stoneArea);
    const beddingM3 = area * bedding;
    const subBaseM3 = area * subBase;
    const jointKg = area * jointSand;
    const edgeM = edge ? (perim > 0 ? perim : 4 * Math.sqrt(area)) : 0;

    hero.textContent = stones.toString();
    const parts = [
      `<div class="result-row"><span class="k">${STR.rowAreaWaste}</span><span class="v">${fmt(areaWaste)} m²</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowSubBase}</span><span class="v">${fmt(subBaseM3)} m³</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowBedding}</span><span class="v">${fmt(beddingM3)} m³</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowJointSand}</span><span class="v">${fmt(jointKg, 1)} kg</span></div>`,
    ];
    if (edge) parts.push(`<div class="result-row"><span class="k">${STR.rowEdge}</span><span class="v">${fmt(edgeM)} m</span></div>`);
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('patternChips', () => {
      const btn = document.querySelector('#patternChips .chip.active');
      if (btn && btn.dataset.waste) document.getElementById('waste').value = btn.dataset.waste;
      recalc();
    });
    BE.bindAll(['area', 'stoneW', 'stoneH', 'waste', 'bedding', 'subBase', 'jointSand', 'perimeter'], recalc);
    document.getElementById('edge').addEventListener('change', () => {
      document.getElementById('perimField').style.display = BE.checked('edge') ? '' : 'none';
      recalc();
    });
  });
})();
