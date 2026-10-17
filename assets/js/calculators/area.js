(function () {
  function recalc() {
    const l = BE.v('length', 0);
    const w = BE.v('width', 0);
    BE.set('rArea', l * w, 2);
  }
  BE.bindAll(['length', 'width'], recalc);
})();
