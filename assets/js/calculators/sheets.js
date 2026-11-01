(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    empty: 'Vul afmetingen in', sheets: (n) => `${n} platen`, net: 'Netto oppervlak', withWaste: 'Incl. verlies',
    per: 'Per plaat', count: 'Platen', screws: 'Schroeven', cost: 'Kosten platen', spare: 'Over na zagen',
  } : {
    empty: 'Enter dimensions', sheets: (n) => `${n} sheets`, net: 'Net area', withWaste: 'Incl. waste',
    per: 'Per sheet', count: 'Sheets', screws: 'Screws', cost: 'Sheet cost', spare: 'Left over',
  };
  let last = null;

  function recalc() {
    const area = Math.max(BE.v('l', 0) * BE.v('w', 0) - BE.v('openings', 0), 0);
    const sheet = BE.v('sl', 0) * BE.v('sw', 0) / 1e6;
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (area <= 0 || sheet <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; last = null; return; }
    const total = area * (1 + BE.v('waste', 0) / 100);
    const n = Math.ceil(total / sheet);
    const screws = n * BE.v('screws', 0), price = BE.v('price', 0);
    hero.textContent = T.sheets(n);
    rows.innerHTML = BE.rows([
      [T.net, BE.num(area, 2) + ' m²'],
      [T.withWaste, BE.num(total, 2) + ' m²'],
      [T.per, `${BE.num(BE.v('sl', 0), 0)} × ${BE.num(BE.v('sw', 0), 0)} mm = ${BE.num(sheet, 2)} m²`],
      [T.count, n, 'total'],
      [T.spare, BE.num(n * sheet - area, 2) + ' m²'],
      screws > 0 && [T.screws, screws],
      price > 0 && [T.cost, BE.money(n * price)],
    ]);
    last = { platen: n, plaatmaat_mm: `${BE.v('sl', 0)}x${BE.v('sw', 0)}`, oppervlak_m2: area.toFixed(1), schroeven: screws };
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('sizeChips', (v) => {
      const [a, b] = v.split('x');
      document.getElementById('sl').value = a;
      document.getElementById('sw').value = b;
    });
    BE.wireCalc(recalc, ['l', 'w', 'openings', 'sl', 'sw', 'waste', 'screws', 'price']);
    BE.markStaleOn('.chip');
    BE.wireShoppingList('plaatmateriaal', () => ({}), () => last,
      () => `${isNl ? 'Plaatmateriaal' : 'Sheet material'} ${last ? last.oppervlak_m2 : ''} m²`);
  });
})();
