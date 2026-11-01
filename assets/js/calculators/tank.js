(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    empty: 'Vul de maten in', cap: 'Totale inhoud', m3: 'In m³', now: (h) => `Inhoud bij ${h} cm`, pct: 'Vulling',
    free: 'Nog bij te vullen', perCm: 'Liter per cm (midden)', l: 'liter',
  } : {
    empty: 'Enter the dimensions', cap: 'Total capacity', m3: 'In m³', now: (h) => `Contents at ${h} cm`, pct: 'Fill level',
    free: 'Room left', perCm: 'Litres per cm (middle)', l: 'litres',
  };

  // Area of a circle segment of height h in a circle of radius r.
  function segment(r, h) {
    h = Math.min(Math.max(h, 0), 2 * r);
    return r * r * Math.acos((r - h) / r) - (r - h) * Math.sqrt(2 * r * h - h * h);
  }

  function recalc() {
    const shape = BE.activeChip('shapeChips') || 'upright';
    const level = BE.v('level', 0);
    let cap = 0, now = 0, perCm = 0, top = 0;
    if (shape === 'box') {
      const l = BE.v('bl', 0), w = BE.v('bw', 0), h = BE.v('bh', 0);
      cap = l * w * h / 1000; top = h;
      perCm = l * w / 1000;
      now = level > 0 ? l * w * Math.min(level, h) / 1000 : cap;
    } else {
      const r = BE.v('dia', 0) / 2, len = BE.v('len', 0);
      cap = Math.PI * r * r * len / 1000;
      if (shape === 'upright') {
        top = len; perCm = Math.PI * r * r / 1000;
        now = level > 0 ? Math.PI * r * r * Math.min(level, len) / 1000 : cap;
      } else {
        top = 2 * r; perCm = 2 * r * len / 1000;
        now = level > 0 ? segment(r, level) * len / 1000 : cap;
      }
    }
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (cap <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; return; }
    hero.textContent = BE.num(level > 0 ? now : cap, 0) + ' ' + T.l;
    rows.innerHTML = BE.rows([
      [T.cap, BE.num(cap, 0) + ' L', 'total'],
      [T.m3, BE.num(cap / 1000, 3) + ' m³'],
      level > 0 && [T.now(BE.num(Math.min(level, top), 0)), BE.num(now, 0) + ' L', 'total'],
      level > 0 && [T.pct, BE.num(now / cap * 100, 0) + '%'],
      level > 0 && [T.free, BE.num(cap - now, 0) + ' L'],
      [T.perCm, BE.num(perCm, 1) + ' L'],
    ]);
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('shapeChips', (s) => { BE.show('roundFields', s !== 'box'); BE.show('boxFields', s === 'box'); });
    BE.wireCalc(recalc, ['dia', 'len', 'bl', 'bw', 'bh', 'level']);
    BE.markStaleOn('.chip');
  });
})();
