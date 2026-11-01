(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    empty: 'Vul kamer en rol in', strips: (n, l) => `${n} ${n === 1 ? 'baan' : 'banen'} van ${l} m`, floor: 'Vloer',
    bought: 'Afgenomen', waste: 'Verlies', seams: 'Naden', underlay: 'Ondervloer', edge: 'Afwerkprofiel', cost: 'Kosten',
    dir: 'Banen in de lengte van', buy: (m) => `${m} m van de rol`,
  } : {
    empty: 'Enter room and roll', strips: (n, l) => `${n} ${n === 1 ? 'strip' : 'strips'} of ${l} m`, floor: 'Floor',
    bought: 'Purchased', waste: 'Waste', seams: 'Seams', underlay: 'Underlay', edge: 'Edge strip', cost: 'Cost',
    dir: 'Strips run along', buy: (m) => `${m} m of roll`,
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
    hero.textContent = T.buy(BE.num(metres, 2));
    rows.innerHTML = BE.rows([
      [T.dir, BE.num(long, 2) + ' m'],
      [T.strips(strips, BE.num(stripLen, 2)), BE.num(metres, 2) + ' m', 'total'],
      [T.floor, BE.num(floor, 2) + ' m²'],
      [T.bought, BE.num(bought, 2) + ' m²'],
      [T.waste, BE.num(bought - floor, 2) + ' m² (' + BE.num((bought - floor) / bought * 100, 0) + '%)'],
      [T.seams, strips - 1],
      BE.checked('underlay') && [T.underlay, BE.num(Math.ceil(floor * 1.05), 0) + ' m²'],
      BE.checked('edge') && [T.edge, BE.num(2 * (l + w), 1) + ' m'],
      price > 0 && [T.cost, BE.money(bought * price)],
    ]);
    last = { meters_rol: metres.toFixed(2), rolbreedte_m: roll, banen: strips, vloer_m2: floor.toFixed(1), ondervloer: BE.checked('underlay') };
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('rollChips', (v) => { document.getElementById('roll').value = v; });
    BE.wireCalc(recalc, ['l', 'w', 'roll', 'extra', 'repeat', 'price']);
    BE.markStaleOn('.chip,.toggle-row input');
    BE.wireShoppingList('vloerbedekking', () => ({}), () => last,
      () => `${isNl ? 'Vloerbedekking' : 'Flooring'} ${BE.v('l', 0)} × ${BE.v('w', 0)} m`);
  });
})();
