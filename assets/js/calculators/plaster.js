(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    empty: 'Vul oppervlak in', bags: (n) => `${n} zakken`, net: 'Netto oppervlak', kg: 'Pleister',
    bagsRow: (kg) => `Zakken van ${kg} kg`, primer: 'Voorstrijkmiddel', cost: 'Kosten pleister', layer: 'Laagdikte',
  } : {
    empty: 'Enter an area', bags: (n) => `${n} bags`, net: 'Net area', kg: 'Plaster',
    bagsRow: (kg) => `Bags of ${kg} kg`, primer: 'Primer / bonding agent', cost: 'Plaster cost', layer: 'Layer thickness',
  };
  let last = null;

  function recalc() {
    const area = Math.max(BE.v('area', 0) - BE.v('openings', 0), 0);
    const mm = BE.v('mm', 0), use = BE.v('kg', 0), bag = BE.v('bag', 25), waste = BE.v('waste', 0), price = BE.v('price', 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (area <= 0 || mm <= 0 || use <= 0 || bag <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; last = null; return; }
    const kg = area * mm * use * (1 + waste / 100);
    const bags = Math.ceil(kg / bag);
    const primerL = BE.checked('primer') ? area * BE.v('primerCov', 0) * (1 + waste / 100) : 0;
    hero.textContent = T.bags(bags);
    rows.innerHTML = BE.rows([
      [T.net, BE.num(area, 2) + ' m²'],
      [T.layer, BE.num(mm, 0) + ' mm'],
      [T.kg, BE.num(kg, 0) + ' kg'],
      [T.bagsRow(BE.num(bag, 0)), bags, 'total'],
      primerL > 0 && [T.primer, BE.num(primerL, 1) + ' L'],
      price > 0 && [T.cost, BE.money(bags * price)],
    ]);
    last = { oppervlak_m2: area.toFixed(1), laagdikte_mm: mm, pleister_kg: Math.round(kg), zakken: bags, zak_kg: bag };
    if (primerL > 0) last.voorstrijk_liter = primerL.toFixed(1);
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('typeChips', () => {
      const b = document.querySelector('#typeChips .chip.active');
      document.getElementById('kg').value = b.dataset.kg;
      document.getElementById('mm').value = b.dataset.mm;
    });
    document.getElementById('primer').addEventListener('change', () => BE.show('primerField', BE.checked('primer')));
    BE.wireCalc(recalc, ['area', 'openings', 'mm', 'kg', 'bag', 'waste', 'price', 'primerCov']);
    BE.markStaleOn('.chip,.toggle-row input');
    BE.wireShoppingList('stucwerk', () => ({ type: BE.activeChip('typeChips') }), () => last,
      () => `${isNl ? 'Stucwerk' : 'Plastering'} ${BE.v('area', 0)} m²`);
  });
})();
