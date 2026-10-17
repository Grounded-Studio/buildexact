(function () {
  function show(mode) {
    document.getElementById('volumeFields').style.display = mode === 'volume' ? '' : 'none';
    document.getElementById('planksFields').style.display = mode === 'planks' ? '' : 'none';
    document.getElementById('beamsFields').style.display = mode === 'beams' ? '' : 'none';
  }
  function recalc() {
    const mode = BE.activeChip('modeChips') || 'volume';
    show(mode);

    const applyFinish = BE.checked('finish');
    const finishCov = BE.v('finishCov', 10);
    const finishCoats = BE.v('finishCoats', 2);

    let volume = 0, surface = 0, count = 0, meters = 0, screws = 0;

    if (mode === 'volume') {
      const l = BE.v('length', 0), w = BE.v('vwidth', 0), h = BE.v('vheight', 0);
      volume = l * w * h;
      surface = 2 * (l * w + l * h + w * h);
    } else if (mode === 'planks') {
      const target = BE.v('target', 0);
      const t = BE.v('plankT', 18) / 1000;
      const pw = BE.v('plankW', 140) / 1000;
      const pl = BE.v('plankL', 2.4);
      const plankVol = t * pw * pl;
      count = plankVol > 0 ? Math.ceil(target / plankVol) : 0;
      volume = count * plankVol;
      surface = count * pl * pw * 2;
      meters = count * pl;
    } else { // beams
      count = BE.v('beamCount', 10);
      const bl = BE.v('beamL', 3);
      const bw = BE.v('beamW', 70) / 1000;
      const bh = BE.v('beamH', 170) / 1000;
      const scrPer = BE.v('screwsPerBeam', 4);
      meters = count * bl;
      volume = meters * bw * bh;
      surface = count * 2 * bl * (bw + bh);
      screws = count * scrPer;
    }

    const finishL = applyFinish && finishCov > 0 ? (surface * finishCoats) / finishCov : 0;

    BE.set('rVolume', volume, 3);
    BE.set('rSurface', surface, 2);
    BE.set('rCount', count || '—');
    BE.set('rMeters', meters, 2);
    BE.set('rScrews', screws || '—');
    BE.set('rFinish', applyFinish ? finishL.toFixed(2) + ' L' : '—');
  }
  BE.chip('modeChips', recalc);
  BE.bindAll(['length','vwidth','vheight','target','plankT','plankW','plankL','beamCount','beamL','beamW','beamH','screwsPerBeam','finishCov','finishCoats'], recalc);
  document.getElementById('finish').addEventListener('change', recalc);
})();
