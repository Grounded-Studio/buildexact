(function () {
  function recalc() {
    const l = BE.v('length', 0);
    const w = BE.v('width', 0);
    const depth = BE.v('depth', 10) / 100;
    const waste = BE.v('waste', 10);
    const rebarKgPerM3 = BE.v('rebar', 60);
    const barLen = BE.v('barLength', 12);
    const formwork = BE.checked('formwork');

    const raw = l * w * depth;
    const volume = raw * (1 + waste / 100);
    const cementBags = Math.ceil(volume * 14);
    const sand = volume * 0.5;
    const gravel = volume * 0.8;
    const rebarKg = volume * rebarKgPerM3;
    const rebarMeters = rebarKg / 0.617;
    const rebarLengths = barLen > 0 ? Math.ceil(rebarMeters / barLen) : 0;
    const formworkM = formwork ? (l + w) * 2 : 0;

    BE.set('rVolume', volume, 2);
    BE.set('rCement', cementBags);
    BE.set('rSand', sand, 2);
    BE.set('rGravel', gravel, 2);
    BE.set('rRebar', rebarKg, 1);
    BE.set('rRebarBars', rebarLengths);
    BE.set('rFormwork', formwork ? formworkM.toFixed(2) + ' m' : '—');
  }
  BE.bindAll(['length', 'width', 'depth', 'waste', 'rebar', 'barLength'], recalc);
  document.getElementById('formwork').addEventListener('change', recalc);
})();
