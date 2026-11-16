(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    empty: 'Vul kamer en rol in', strips: (n, l) => `${n} ${n === 1 ? 'baan' : 'banen'} van ${l}`, floor: 'Vloer',
    bought: 'Afgenomen', waste: 'Verlies', seams: 'Naden', underlay: 'Ondervloer', edge: 'Afwerkprofiel', cost: 'Kosten',
    dir: 'Banen in de lengte van', buy: (m) => `${m} van de rol`,
  } : {
    empty: 'Enter room and roll', strips: (n, l) => `${n} ${n === 1 ? 'strip' : 'strips'} of ${l}`, floor: 'Floor',
    bought: 'Purchased', waste: 'Waste', seams: 'Seams', underlay: 'Underlay', edge: 'Edge strip', cost: 'Cost',
    dir: 'Strips run along', buy: (m) => `${m} of roll`,
  };
  let last = null;

  function recalc() {
    const l = BE.v('l', 0), w = BE.v('w', 0), roll = BE.v('roll', 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (l <= 0 || w <= 0 || roll <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; last = null; return; }
    // Strips along the longer wall: fewer seams.
    const long = Math.max(l, w), short = Math.min(l, w);
    const strips = Math.ceil(short / roll - 1e-9);
    let stripLen = long + BE.v('extra', 0) / 100;
    const rep = BE.v('repeat', 0) / 100;
    if (rep > 0 && strips > 1) stripLen = Math.ceil(stripLen / rep) * rep;
    const metres = strips * stripLen;
    const bought = metres * roll, floor = l * w, price = BE.v('price', 0);
    hero.textContent = T.buy(BE.q('m', metres));
    rows.innerHTML = BE.rows([
      [T.dir, BE.q('m', long)],
      [T.strips(strips, BE.q('m', stripLen)), BE.q('m', metres), 'total'],
      [T.floor, BE.q('m2', floor)],
      [T.bought, BE.q('m2', bought)],
      [T.waste, BE.q('m2', bought - floor) + ' (' + BE.num((bought - floor) / bought * 100, 0) + '%)'],
      [T.seams, strips - 1],
      BE.checked('underlay') && [T.underlay, BE.num(Math.ceil(BE.fromMetric('m2', floor * 1.05)), 0) + ' ' + BE.u('m2')],
      BE.checked('edge') && [T.edge, BE.q('m', 2 * (l + w), 1)],
      price > 0 && [T.cost, BE.money(bought * price)],
    ]);
    last = { meters_rol: metres.toFixed(2), rolbreedte_m: roll, banen: strips, vloer_m2: floor.toFixed(1), ondervloer: BE.checked('underlay') };
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.units({ l: 'm', w: 'm', roll: 'm', extra: 'cm', repeat: 'cm', price: 'eurm2' }, { l: 16, w: 11.5, roll: 12, extra: 4, repeat: 0 });
    if (BE.imp()) {
      // Common roll widths in feet; data-value stays in metres.
      const ft = [6, 12, 13.2, 15];
      document.querySelectorAll('#rollChips .chip').forEach((c, i) => {
        if (ft[i] == null) return;
        c.dataset.value = ft[i] * 0.3048;
        c.textContent = BE.num(ft[i], ft[i] % 1 ? 1 : 0) + ' ft';
        c.classList.toggle('active', ft[i] === 12);
      });
    }
    BE.chip('rollChips', (v) => { BE.setU('roll', +v); });
    BE.wireCalc(recalc, ['l', 'w', 'roll', 'extra', 'repeat', 'price']);
    BE.markStaleOn('.chip,.toggle-row input');
    BE.wireShoppingList('vloerbedekking', () => ({}), () => last,
      () => `${isNl ? 'Vloerbedekking' : 'Flooring'} ${BE.v('l', 0)} × ${BE.v('w', 0)} m`);
  });
})();
