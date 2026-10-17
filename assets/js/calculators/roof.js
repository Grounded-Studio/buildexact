(function () {
  function recalc() {
    const riseCm = BE.v('rise', 0);
    const runCm = BE.v('run', 0);
    const widthM = BE.v('rwidth', 0);
    const ridgeM = BE.v('ridge', 0);
    const tilesPerM2 = BE.v('tilesPerM2', 10);
    const battenCm = BE.v('batten', 32);
    const waste = BE.v('waste', 10);
    const material = BE.activeChip('materialChips') || 'tiles';

    const angleDeg = runCm > 0 ? Math.atan(riseCm / runCm) * 180 / Math.PI : 0;
    const slopePct = runCm > 0 ? (riseCm / runCm) * 100 : 0;
    const slopeM = Math.sqrt(Math.pow(riseCm / 100, 2) + Math.pow(runCm / 100, 2));
    const areaM2 = slopeM * widthM;
    const areaInclWaste = areaM2 * (1 + waste / 100);

    BE.set('rAngle', angleDeg, 1);
    BE.set('rSlopePct', slopePct, 1);
    BE.set('rSlopeM', slopeM, 2);
    BE.set('rArea', areaM2, 2);
    BE.set('rAreaInclWaste', areaInclWaste, 2);

    const tilesRows = document.getElementById('tilesRows');
    const membraneRow = document.getElementById('membraneRow');
    if (material === 'tiles') {
      tilesRows.style.display = '';
      membraneRow.style.display = 'none';
      const tiles = Math.ceil(areaInclWaste * tilesPerM2);
      const battensM = battenCm > 0 ? widthM * Math.ceil((slopeM * 100) / battenCm) : 0;
      const ridgeCaps = Math.ceil(ridgeM * 3);
      BE.set('rTiles', tiles);
      BE.set('rBattens', battensM, 2);
      BE.set('rRidgeCaps', ridgeCaps);
    } else {
      tilesRows.style.display = 'none';
      membraneRow.style.display = '';
      BE.set('rMembrane', areaInclWaste, 2);
    }
  }
  BE.chip('materialChips', recalc);
  BE.bindAll(['rise','run','rwidth','ridge','tilesPerM2','batten','waste'], recalc);
})();
