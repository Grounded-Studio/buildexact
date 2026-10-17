(function () {
  function recalc() {
    const l = BE.v('length', 0);
    const h = BE.v('height', 0);
    const perM2 = BE.v('perM2', 50);
    const waste = BE.v('waste', 5);
    const mortarKgM2 = BE.v('mortarKg', 35);
    const bagKg = BE.v('bagKg', 25);
    const openW = BE.v('openW', 0);
    const openH = BE.v('openH', 0);
    const openCount = BE.v('openCount', 0);
    const cavity = BE.checked('cavity');
    const tiesPerM2 = BE.v('tiesPerM2', 5);

    const grossArea = l * h;
    const openingsArea = openW * openH * openCount;
    const netArea = Math.max(grossArea - openingsArea, 0);
    const bricks = Math.ceil(netArea * perM2 * (1 + waste / 100));
    const mortarKg = netArea * mortarKgM2;
    const bags = bagKg > 0 ? Math.ceil(mortarKg / bagKg) : 0;
    const ties = cavity ? Math.ceil(netArea * tiesPerM2) : 0;
    const lintelPerOpening = openW + 0.4;
    const totalLintelM = openCount * lintelPerOpening;

    BE.set('rBricks', bricks);
    BE.set('rNet', netArea, 2);
    BE.set('rMortarBags', bags);
    BE.set('rMortarKg', mortarKg, 1);
    BE.set('rLintels', openCount);
    BE.set('rLintelM', totalLintelM, 2);
    BE.set('rTies', cavity ? ties : '—');
  }
  BE.bindAll(['length', 'height', 'perM2', 'waste', 'mortarKg', 'bagKg', 'openW', 'openH', 'openCount', 'tiesPerM2'], recalc);
  document.getElementById('cavity').addEventListener('change', recalc);
})();
