(function () {
  function recalc() {
    const area = BE.v('area', 0);
    const thickness = BE.v('thickness', 100);
    const lambda = BE.v('lambda', 0.035);
    const coveragePack = BE.v('coveragePack', 5);
    const waste = BE.v('waste', 10);
    const vapour = BE.checked('vapour');
    const fastenersPerM2 = BE.v('fasteners', 4);
    const tapePerM2 = BE.v('tape', 0.8);

    const areaInclWaste = area * (1 + waste / 100);
    const rValue = lambda > 0 ? (thickness / 1000) / lambda : 0;
    const packs = coveragePack > 0 ? Math.ceil(areaInclWaste / coveragePack) : 0;
    const fasteners = Math.ceil(area * fastenersPerM2);
    const tapeM = area * tapePerM2;

    BE.set('rR', rValue, 2);
    BE.set('rPacks', packs);
    BE.set('rAreaInclWaste', areaInclWaste, 2);
    BE.set('rFasteners', fasteners);
    BE.set('rTape', tapeM, 1);
    BE.set('rVapour', vapour ? areaInclWaste.toFixed(2) + ' m²' : '—');
  }
  BE.bindAll(['area', 'thickness', 'lambda', 'coveragePack', 'waste', 'fasteners', 'tape'], recalc);
  document.getElementById('vapour').addEventListener('change', recalc);
})();
