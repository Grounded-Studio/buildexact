(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    rect: 'Rechthoek', tri: 'Driehoek', circle: 'Cirkel', trap: 'Trapezium',
    l: 'Lengte (m)', w: 'Breedte (m)', base: 'Basis (m)', h: 'Hoogte (m)', d: 'Diameter (m)',
    a: 'Zijde a (m)', b: 'Zijde b (m)', minus: 'aftrekken', empty: 'Vul afmetingen in',
    shape: 'Vorm', total: 'Totaal', waste: 'Incl. snijverlies',
  } : {
    rect: 'Rectangle', tri: 'Triangle', circle: 'Circle', trap: 'Trapezoid',
    l: 'Length (m)', w: 'Width (m)', base: 'Base (m)', h: 'Height (m)', d: 'Diameter (m)',
    a: 'Side a (m)', b: 'Side b (m)', minus: 'subtract', empty: 'Enter dimensions',
    shape: 'Shape', total: 'Total', waste: 'Incl. waste',
  };
  const LABELS = { rect: [T.l, T.w], tri: [T.base, T.h], circle: [T.d], trap: [T.a, T.b, T.h] };

  function input(k, label, v) {
    return `<div class="field"><label>${label}</label><input type="number" data-k="${k}" value="${v ?? ''}" min="0" step="0.01"></div>`;
  }
  function fields(type, d) {
    const ls = LABELS[type];
    const keys = ['x', 'y', 'z'];
    return `<div class="field-row${ls.length === 3 ? ' three' : ''}">` + ls.map((l, i) => input(keys[i], l, d[keys[i]])).join('') + '</div>';
  }
  function template(d) {
    const type = d.type || 'rect';
    const opts = ['rect', 'tri', 'circle', 'trap'].map(t => `<option value="${t}"${t === type ? ' selected' : ''}>${T[t]}</option>`).join('');
    return `<div class="dyn-head"><select data-k="type">${opts}</select>` +
      `<label class="dyn-minus"><input type="checkbox" data-k="minus"${d.minus ? ' checked' : ''}> ${T.minus}</label>{{remove}}</div>` +
      `<div class="dyn-fields">${fields(type, d)}</div>`;
  }
  function areaOf(s) {
    switch (s.type) {
      case 'tri': return s.x * s.y / 2;
      case 'circle': return Math.PI * Math.pow(s.x / 2, 2);
      case 'trap': return (s.x + s.y) / 2 * s.z;
      default: return s.x * s.y;
    }
  }

  function recalc() {
    const shapes = BE.listValues('shapes');
    const waste = BE.v('waste', 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    let total = 0;
    const out = shapes.map((s, i) => {
      const a = areaOf(s);
      total += s.minus ? -a : a;
      return [`${i + 1}. ${T[s.type]}`, (s.minus ? '− ' : '') + BE.num(a, 2) + ' m²'];
    });
    total = Math.max(total, 0);
    if (total <= 0) { hero.textContent = T.empty; rows.innerHTML = BE.rows(out); return; }
    const withWaste = total * (1 + waste / 100);
    hero.innerHTML = BE.num(waste > 0 ? withWaste : total, 2) + ' m<sup>2</sup>';
    out.push([T.total, BE.num(total, 2) + ' m²', 'total']);
    if (waste > 0) out.push([`${T.waste} (${BE.num(waste, 0)}%)`, BE.num(withWaste, 2) + ' m²', 'total']);
    rows.innerHTML = BE.rows(out);
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.list('shapes', template, [{ type: 'rect', x: 5, y: 4 }], () => ({ type: 'rect' }), recalc);
    // Changing the shape type swaps the input fields of that row.
    document.getElementById('shapes').addEventListener('change', (e) => {
      if (e.target.dataset.k !== 'type') return;
      const row = e.target.closest('.dyn-row');
      row.querySelector('.dyn-fields').innerHTML = fields(e.target.value, {});
      recalc();
    });
    document.getElementById('waste').addEventListener('input', recalc);
    recalc();
  });
})();
