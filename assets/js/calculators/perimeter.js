(function () {
  function recalc() {
    const l = BE.v('length', 0);
    const w = BE.v('width', 0);
    const waste = BE.v('waste', 5);
    const perim = 2 * (l + w);
    BE.set('rPerimeter', perim, 2);
    BE.set('rWithWaste', perim * (1 + waste / 100), 2);
  }
  BE.bindAll(['length', 'width', 'waste'], recalc);
})();
