(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    empty: 'Vul diameter en hoogte in', per: 'Per kolom', total: 'Beton incl. verlies', litres: 'Liters',
    bags: (kg) => `Zakken beton van ${kg} kg`, weight: 'Gewicht zakken', tube: 'Bekistingsbuis', cost: 'Kosten betonmortel',
  } : {
    empty: 'Enter diameter and height', per: 'Per column', total: 'Concrete incl. waste', litres: 'Litres',
    bags: (kg) => `Bags of ${kg} kg concrete`, weight: 'Weight of bags', tube: 'Form tube', cost: 'Ready-mix cost',
  };
  let last = null;

  function recalc() {
    const r = BE.v('dia', 0) / 200, h = BE.v('h', 0), n = Math.max(BE.v('n', 1), 1);
    let area = Math.PI * r * r;
    if (BE.checked('hollow')) {
      const ri = Math.max(r - BE.v('wall', 0) / 100, 0);
      area -= Math.PI * ri * ri;
    }
    const one = area * h;
    const m3 = one * n * (1 + BE.v('waste', 0) / 100);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (m3 <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; last = null; return; }
    const yieldL = BE.v('yield', 0), bagKg = BE.v('bagKg', 25), price = BE.v('price', 0);
    const bags = yieldL > 0 ? Math.ceil(m3 * 1000 / yieldL) : 0;
    hero.innerHTML = BE.num(m3, 3) + ' m<sup>3</sup>';
    rows.innerHTML = BE.rows([
      [T.per, BE.num(one, 3) + ' m³'],
      [T.total, BE.num(m3, 3) + ' m³', 'total'],
      [T.litres, BE.num(m3 * 1000, 0) + ' L'],
      bags > 0 && [T.bags(BE.num(bagKg, 0)), bags, 'total'],
      bags > 0 && [T.weight, BE.num(bags * bagKg, 0) + ' kg'],
      !BE.checked('hollow') && [T.tube, `${n} × ${BE.num(h, 2)} m (Ø${BE.num(BE.v('dia', 0), 0)} cm)`],
      price > 0 && [T.cost, BE.money(m3 * price)],
    ]);
    last = { beton_m3: m3.toFixed(3), zakken: bags, aantal_kolommen: n, diameter_cm: BE.v('dia', 0), hoogte_m: h };
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('diaChips', (d) => { document.getElementById('dia').value = d; });
    document.getElementById('hollow').addEventListener('change', () => BE.show('wallField', BE.checked('hollow')));
    BE.wireCalc(recalc, ['dia', 'h', 'n', 'waste', 'wall', 'yield', 'bagKg', 'price']);
    BE.markStaleOn('.chip,.toggle-row input');
    BE.wireShoppingList('ronde kolom beton', () => ({ hol: BE.checked('hollow') }), () => last,
      () => `${isNl ? 'Ronde kolom' : 'Round column'} Ø${BE.v('dia', 0)} cm`);
  });
})();
