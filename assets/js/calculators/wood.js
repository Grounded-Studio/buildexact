(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul afmetingen in',
    rowPlanks: 'Aantal planken', rowBeams: 'Aantal balken',
    rowLinearM: 'Strekkende meter', rowSurface: 'Oppervlak', rowScrews: 'Schroeven',
    rowFinish: 'Afwerking',
  } : {
    heroEmpty: 'Enter dimensions',
    rowPlanks: 'Planks', rowBeams: 'Beams',
    rowLinearM: 'Linear meters', rowSurface: 'Surface area', rowScrews: 'Screws',
    rowFinish: 'Finish',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  function showMode(mode) {
    document.getElementById('volumeMode').style.display = mode === 'volume' ? '' : 'none';
    document.getElementById('planksMode').style.display = mode === 'planks' ? '' : 'none';
    document.getElementById('beamsMode').style.display = mode === 'beams' ? '' : 'none';
  }

  function recalc() {
    const mode = BE.activeChip('modeChips') || 'volume';
    showMode(mode);
    const applyFinish = BE.checked('finish');
    const finishCov = BE.v('finishCov', 10);
    const finishCoats = BE.v('finishCoats', 2);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');

    let volume = 0, surface = 0, count = 0, linearM = 0, screws = 0;
    if (mode === 'volume') {
      const l = BE.v('vl', 0), w = BE.v('vw', 0), h = BE.v('vh', 0);
      volume = l * w * h;
      surface = 2 * (l * w + l * h + w * h);
    } else if (mode === 'planks') {
      const target = BE.v('target', 0);
      const t = BE.v('pT', 18) / 1000;
      const pw = BE.v('pW', 140) / 1000;
      const pl = BE.v('pL', 2.4);
      const plankVol = t * pw * pl;
      count = plankVol > 0 ? Math.ceil(target / plankVol) : 0;
      volume = count * plankVol;
      linearM = count * pl;
      surface = count * pl * pw * 2;
    } else {
      count = BE.v('bCount', 10);
      const bl = BE.v('bLen', 3);
      const bw = BE.v('bW', 70) / 1000;
      const bh = BE.v('bH', 170) / 1000;
      const screwsPer = BE.v('bScrews', 4);
      linearM = count * bl;
      volume = linearM * bw * bh;
      surface = count * 2 * bl * (bw + bh);
      screws = count * screwsPer;
    }
    const finishL = applyFinish && finishCov > 0 ? (surface * finishCoats) / finishCov : 0;
    document.getElementById('finishFields').style.display = applyFinish ? '' : 'none';

    if (volume <= 0 && count <= 0) { hero.textContent = STR.heroEmpty; rows.innerHTML = ''; return; }

    if (mode === 'planks') {
      hero.textContent = (isNl ? `${count} planken` : `${count} planks`);
    } else if (mode === 'beams') {
      hero.innerHTML = fmt(volume, 3) + ' m<sup>3</sup>';
    } else {
      hero.innerHTML = fmt(volume, 3) + ' m<sup>3</sup>';
    }

    const parts = [];
    if (count > 0 && mode !== 'volume') {
      parts.push(`<div class="result-row"><span class="k">${mode === 'planks' ? STR.rowPlanks : STR.rowBeams}</span><span class="v">${count}</span></div>`);
    }
    if (linearM > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowLinearM}</span><span class="v">${fmt(linearM)} m</span></div>`);
    if (volume > 0) {
      parts.push(`<div class="result-row"><span class="k">Volume</span><span class="v">${fmt(volume, 3)} m³</span></div>`);
    }
    if (surface > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowSurface}</span><span class="v">${fmt(surface)} m²</span></div>`);
    if (screws > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowScrews}</span><span class="v">${screws}</span></div>`);
    if (applyFinish && finishL > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowFinish}</span><span class="v">${fmt(finishL, 1)} L</span></div>`);
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('modeChips', recalc);
    BE.bindAll(['vl', 'vw', 'vh', 'target', 'pT', 'pW', 'pL', 'bCount', 'bLen', 'bW', 'bH', 'bScrews', 'finishCov', 'finishCoats'], recalc);
    document.getElementById('finish').addEventListener('change', recalc);
  });
})();
