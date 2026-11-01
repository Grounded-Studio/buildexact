(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    wall: 'Wand', win: 'Raam', l: 'Lengte (m)', h: 'Hoogte (m)', w: 'Breedte (m)', n: 'Aantal',
    empty: 'Vul afmetingen in', gross: 'Bruto wandoppervlak', doors: 'Deuren', wins: 'Ramen',
    net: 'Netto wanden', ceiling: 'Plafond', total: 'Totaal te behandelen', waste: 'Incl. verlies',
  } : {
    wall: 'Wall', win: 'Window', l: 'Length (m)', h: 'Height (m)', w: 'Width (m)', n: 'Count',
    empty: 'Enter dimensions', gross: 'Gross wall area', doors: 'Doors', wins: 'Windows',
    net: 'Net walls', ceiling: 'Ceiling', total: 'Total to cover', waste: 'Incl. waste',
  };
  const inp = (k, label, v, step) => `<div class="field"><label>${label}</label><input type="number" data-k="${k}" value="${v ?? ''}" min="0" step="${step || 0.01}"></div>`;
  const wallTpl = (d) => `<div class="dyn-head"><span class="dyn-title">${T.wall}</span>{{remove}}</div><div class="field-row">${inp('l', T.l, d.l)}${inp('h', T.h, d.h)}</div>`;
  const winTpl = (d) => `<div class="dyn-head"><span class="dyn-title">${T.win}</span>{{remove}}</div><div class="field-row three">${inp('w', T.w, d.w)}${inp('h', T.h, d.h)}${inp('n', T.n, d.n ?? 1, 1)}</div>`;

  function recalc() {
    const mode = BE.activeChip('modeChips') || 'room';
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    let gross = 0, ceiling = 0;
    if (mode === 'room') {
      const l = BE.v('rl', 0), w = BE.v('rw', 0), h = BE.v('rh', 0);
      gross = 2 * (l + w) * h;
      if (BE.checked('ceiling')) ceiling = l * w;
    } else {
      BE.listValues('walls').forEach(x => { gross += x.l * x.h; });
    }
    const doors = BE.v('doors', 0) * BE.v('doorSize', 0);
    let wins = 0;
    BE.listValues('wins').forEach(x => { wins += x.w * x.h * Math.max(x.n, 0); });
    const net = Math.max(gross - doors - wins, 0);
    const waste = BE.v('waste', 0);
    if (gross <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; return; }
    const total = (net + ceiling) * (1 + waste / 100);
    hero.innerHTML = BE.num(total, 2) + ' m<sup>2</sup>';
    rows.innerHTML = BE.rows([
      [T.gross, BE.num(gross, 2) + ' m²'],
      doors > 0 && [T.doors, '− ' + BE.num(doors, 2) + ' m²'],
      wins > 0 && [T.wins, '− ' + BE.num(wins, 2) + ' m²'],
      [T.net, BE.num(net, 2) + ' m²', 'total'],
      ceiling > 0 && [T.ceiling, BE.num(ceiling, 2) + ' m²'],
      (ceiling > 0 || waste > 0) && [waste > 0 ? `${T.waste} (${BE.num(waste, 0)}%)` : T.total, BE.num(total, 2) + ' m²', 'total'],
    ]);
  }
  document.addEventListener('DOMContentLoaded', () => {
    BE.list('walls', wallTpl, [{ l: 5, h: 2.6 }, { l: 4, h: 2.6 }], () => ({}), recalc);
    BE.list('wins', winTpl, [{ w: 1.2, h: 1.4, n: 2 }], () => ({ n: 1 }), recalc);
    BE.chip('modeChips', (m) => { BE.show('roomFields', m === 'room'); BE.show('wallFields', m === 'walls'); recalc(); });
    document.getElementById('ceiling').addEventListener('change', recalc);
    BE.bindAll(['rl', 'rw', 'rh', 'doors', 'doorSize', 'waste'], recalc);
  });
})();
