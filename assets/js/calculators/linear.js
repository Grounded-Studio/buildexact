(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    len: 'Lengte (m)', count: 'Aantal', name: 'Omschrijving', ph: 'bijv. plint woonkamer',
    empty: 'Vul een lengte in', total: 'Totaal', waste: 'Incl. snijverlies', pieces: (s) => `Stuks van ${s} m`,
    cost: 'Kosten', run: 'Lengte',
  } : {
    len: 'Length (m)', count: 'Count', name: 'Description', ph: 'e.g. living room skirting',
    empty: 'Enter a length', total: 'Total', waste: 'Incl. waste', pieces: (s) => `Pieces of ${s} m`,
    cost: 'Cost', run: 'Run',
  };
  function template(d) {
    return `<div class="dyn-head"><span class="dyn-title">${T.run}</span>{{remove}}</div>` +
      `<div class="field-row"><div class="field"><label>${T.len}</label><input type="number" data-k="len" value="${d.len ?? ''}" min="0" step="0.01"></div>` +
      `<div class="field"><label>${T.count}</label><input type="number" data-k="n" value="${d.n ?? 1}" min="1" step="1"></div></div>`;
  }
  function recalc() {
    const segs = BE.listValues('segs');
    const stock = BE.v('stock', 0), waste = BE.v('waste', 0), price = BE.v('price', 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    let total = 0;
    const out = segs.map((s, i) => {
      const n = Math.max(s.n, 1);
      total += s.len * n;
      return [`${i + 1}. ${n} × ${BE.num(s.len, 2)} m`, BE.num(s.len * n, 2) + ' m'];
    });
    if (total <= 0) { hero.textContent = T.empty; rows.innerHTML = BE.rows(out); return; }
    const withWaste = total * (1 + waste / 100);
    hero.textContent = BE.num(withWaste, 2) + ' m';
    out.push([T.total, BE.num(total, 2) + ' m', 'total']);
    if (waste > 0) out.push([`${T.waste} (${BE.num(waste, 0)}%)`, BE.num(withWaste, 2) + ' m', 'total']);
    if (stock > 0) out.push([T.pieces(BE.num(stock, 2)), Math.ceil(withWaste / stock)]);
    if (price > 0) out.push([T.cost, BE.money(withWaste * price)]);
    rows.innerHTML = BE.rows(out);
  }
  document.addEventListener('DOMContentLoaded', () => {
    BE.list('segs', template, [{ len: 4.2, n: 2 }, { len: 3.6, n: 2 }], () => ({ n: 1 }), recalc);
    BE.bindAll(['stock', 'waste', 'price'], recalc);
  });
})();
