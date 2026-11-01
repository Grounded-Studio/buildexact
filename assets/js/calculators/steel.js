(function () {
  const isNl = BE.isNl();
  const DENSITY = 7850; // kg/m³
  const T = isNl ? {
    empty: 'Vul staaf of plaat in', perM: (d) => `Ø${d} mm per meter`, bars: (n, l) => `${n} staven × ${l} m`,
    totalLen: 'Totale lengte', plate: (n) => `Plaatstaal (${n}×)`, total: 'Totaal gewicht', cost: 'Kosten staal',
  } : {
    empty: 'Enter a bar or a plate', perM: (d) => `Ø${d} mm per metre`, bars: (n, l) => `${n} bars × ${l} m`,
    totalLen: 'Total length', plate: (n) => `Steel plate (${n}×)`, total: 'Total weight', cost: 'Steel cost',
  };

  function recalc() {
    const d = BE.v('d', 0), l = BE.v('l', 0), n = Math.max(BE.v('n', 0), 0);
    const r = d / 2000;
    const perM = Math.PI * r * r * DENSITY;
    const bars = perM * l * n;
    const plate = BE.v('pl', 0) * BE.v('pw', 0) * BE.v('pt', 0) / 1e9 * DENSITY * Math.max(BE.v('pn', 1), 1);
    const total = bars + plate, price = BE.v('price', 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (total <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; return; }
    hero.textContent = BE.num(total, 1) + ' kg';
    rows.innerHTML = BE.rows([
      d > 0 && [T.perM(BE.num(d, 0)), BE.num(perM, 3) + ' kg/m'],
      bars > 0 && [T.totalLen, BE.num(l * n, 1) + ' m'],
      bars > 0 && [T.bars(n, BE.num(l, 2)), BE.num(bars, 1) + ' kg'],
      plate > 0 && [T.plate(Math.max(BE.v('pn', 1), 1)), BE.num(plate, 1) + ' kg'],
      [T.total, BE.num(total, 1) + ' kg', 'total'],
      price > 0 && [T.cost, BE.money(total * price)],
    ]);
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('diaChips', (v) => { document.getElementById('d').value = v; });
    BE.wireCalc(recalc, ['d', 'l', 'n', 'pl', 'pw', 'pt', 'pn', 'price']);
    BE.markStaleOn('.chip');
  });
})();
