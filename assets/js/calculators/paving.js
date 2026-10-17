(function () {
  const PATTERN_WASTE = { block: 5, halfbrick: 7, herringbone45: 15, herringbone90: 10 };
  function recalc() {
    const area = BE.v('area', 0);
    const sw = BE.v('stoneW', 20);
    const sh = BE.v('stoneH', 10);
    const pattern = BE.activeChip('patternChips') || 'halfbrick';
    const waste = BE.v('waste', PATTERN_WASTE[pattern] || 10);
    const bed = BE.v('bedding', 5) / 100;
    const subBase = BE.v('subBase', 20) / 100;
    const jointSand = BE.v('jointSand', 3);
    const edgeRestraint = BE.checked('edge');
    const perimOverride = BE.v('perimeter', 0);

    const stoneArea = (sw / 100) * (sh / 100);
    const areaInclWaste = area * (1 + waste / 100);
    const stones = stoneArea > 0 ? Math.ceil((area / stoneArea) * (1 + waste / 100)) : 0;
    const bedM3 = area * bed;
    const subBaseM3 = area * subBase;
    const jointSandKg = area * jointSand;
    const edgeM = edgeRestraint ? (perimOverride > 0 ? perimOverride : 4 * Math.sqrt(Math.max(area, 0))) : 0;

    BE.set('rStones', stones);
    BE.set('rAreaInclWaste', areaInclWaste, 2);
    BE.set('rSubBase', subBaseM3, 2);
    BE.set('rBedding', bedM3, 2);
    BE.set('rJointSand', jointSandKg, 1);
    BE.set('rEdge', edgeRestraint ? edgeM.toFixed(2) + ' m' : '—');

    // Auto-fill waste when pattern changes & waste equals the previous default (user hasn't typed)
    const wasteEl = document.getElementById('waste');
    if (wasteEl && !wasteEl.dataset.touched) wasteEl.value = PATTERN_WASTE[pattern];
  }
  BE.chip('patternChips', recalc);
  BE.bindAll(['area', 'stoneW', 'stoneH', 'bedding', 'subBase', 'jointSand', 'perimeter'], recalc);
  const wasteEl = document.getElementById('waste');
  wasteEl.addEventListener('input', () => { wasteEl.dataset.touched = '1'; recalc(); });
  document.getElementById('edge').addEventListener('change', recalc);
})();
