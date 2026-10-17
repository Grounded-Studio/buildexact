(function () {
  function recalc() {
    const area = BE.v('area', 0);
    const w = BE.v('tileW', 0);
    const h = BE.v('tileH', 0);
    const waste = BE.v('waste', 10);
    const tileArea = (w / 100) * (h / 100);
    const areaInclWaste = area * (1 + waste / 100);
    const tiles = tileArea > 0 ? Math.ceil((area / tileArea) * (1 + waste / 100)) : 0;
    BE.set('rTiles', tiles);
    BE.set('rAreaInclWaste', areaInclWaste, 2);
    BE.set('rTileArea', tileArea * 10000, 0); // cm²
  }
  BE.bindAll(['area', 'tileW', 'tileH', 'waste'], recalc);
})();
