(function () {
  // Density presets: kg per m³
  const DENSITIES = {
    gravel: 1600,
    sand:   1500,
    topsoil: 1300,
    rubble: 1400,
  };
  function recalc() {
    const l = BE.v('length', 0);
    const w = BE.v('width', 0);
    const h = BE.v('depth', 0) / 100; // cm to m
    const material = BE.activeChip('materialChips') || 'gravel';
    const volume = l * w * h;
    const kg = volume * DENSITIES[material];
    BE.set('rVolume', volume, 2);
    BE.set('rTonnage', kg / 1000, 2);
    BE.set('rKg', Math.round(kg));
  }
  BE.chip('materialChips', recalc);
  BE.bindAll(['length', 'width', 'depth'], recalc);
})();
