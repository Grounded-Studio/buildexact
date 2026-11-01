(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    side: 'Zijde', len: 'Lengte (m)', empty: 'Vul afmetingen in', perim: 'Omtrek', doors: 'Deuropeningen',
    net: 'Netto plintlengte', waste: 'Incl. snijverlies', pieces: (s) => `Stuks van ${s} m`, cost: 'Kosten',
    corners: 'Hoeken (verstek)',
  } : {
    side: 'Side', len: 'Length (m)', empty: 'Enter dimensions', perim: 'Perimeter', doors: 'Door openings',
    net: 'Net skirting length', waste: 'Incl. waste', pieces: (s) => `Pieces of ${s} m`, cost: 'Cost',
    corners: 'Corners (mitre)',
  };
  const tpl = (d) => `<div class="dyn-head"><span class="dyn-title">${T.side}</span>{{remove}}</div>` +
    `<div class="field"><label>${T.len}</label><input type="number" data-k="len" value="${d.len ?? ''}" min="0" step="0.01"></div>`;

  function recalc() {
    const mode = BE.activeChip('modeChips') || 'rect';
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    let perim = 0, corners = 4;
    if (mode === 'rect') perim = 2 * (BE.v('length', 0) + BE.v('width', 0));
    else {
      const sides = BE.listValues('sides');
      sides.forEach(s => { perim += s.len; });
      corners = sides.length;
    }
    const doors = BE.v('doors', 0) * BE.v('doorW', 0);
    const net = Math.max(perim - doors, 0);
    const waste = BE.v('waste', 0), stock = BE.v('stock', 0), price = BE.v('price', 0);
    if (perim <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; return; }
    const withWaste = net * (1 + waste / 100);
    const pieces = stock > 0 ? Math.ceil(withWaste / stock) : 0;
    hero.textContent = pieces > 0 ? `${pieces} × ${BE.num(stock, 2)} m` : BE.num(withWaste, 2) + ' m';
    rows.innerHTML = BE.rows([
      [T.perim, BE.num(perim, 2) + ' m'],
      doors > 0 && [T.doors, '− ' + BE.num(doors, 2) + ' m'],
      [T.net, BE.num(net, 2) + ' m', 'total'],
      waste > 0 && [`${T.waste} (${BE.num(waste, 0)}%)`, BE.num(withWaste, 2) + ' m', 'total'],
      pieces > 0 && [T.pieces(BE.num(stock, 2)), pieces],
      [T.corners, corners],
      price > 0 && [T.cost, BE.money(withWaste * price)],
    ]);
  }
  document.addEventListener('DOMContentLoaded', () => {
    BE.list('sides', tpl, [{ len: 5 }, { len: 4 }, { len: 2 }, { len: 1.5 }, { len: 3 }, { len: 2.5 }], () => ({}), recalc);
    BE.chip('modeChips', (m) => { BE.show('rectFields', m === 'rect'); BE.show('sideFields', m === 'sides'); recalc(); });
    BE.bindAll(['length', 'width', 'doors', 'doorW', 'stock', 'waste', 'price'], recalc);
  });
})();
