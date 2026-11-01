(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    block: 'Blok / laag', cyl: 'Cilinder', l: 'Lengte (m)', w: 'Breedte (m)', h: 'Hoogte of dikte (m)',
    d: 'Diameter (m)', ch: 'Hoogte (m)', empty: 'Vul afmetingen in', total: 'Totaal',
    extra: 'Incl. extra', litres: 'Liters', weight: 'Gewicht', bigbags: 'Big bags (1 m³)',
  } : {
    block: 'Block / layer', cyl: 'Cylinder', l: 'Length (m)', w: 'Width (m)', h: 'Height or depth (m)',
    d: 'Diameter (m)', ch: 'Height (m)', empty: 'Enter dimensions', total: 'Total',
    extra: 'Incl. extra', litres: 'Litres', weight: 'Weight', bigbags: 'Bulk bags (1 m³)',
  };
  function input(k, label, v) {
    return `<div class="field"><label>${label}</label><input type="number" data-k="${k}" value="${v ?? ''}" min="0" step="0.01"></div>`;
  }
  function fields(type, d) {
    return type === 'cyl'
      ? `<div class="field-row">${input('x', T.d, d.x)}${input('y', T.ch, d.y)}</div>`
      : `<div class="field-row three">${input('x', T.l, d.x)}${input('y', T.w, d.y)}${input('z', T.h, d.z)}</div>`;
  }
  function template(d) {
    const type = d.type || 'block';
    const opts = ['block', 'cyl'].map(t => `<option value="${t}"${t === type ? ' selected' : ''}>${T[t]}</option>`).join('');
    return `<div class="dyn-head"><select data-k="type">${opts}</select>{{remove}}</div><div class="dyn-fields">${fields(type, d)}</div>`;
  }

  function recalc() {
    const shapes = BE.listValues('shapes');
    const extra = BE.v('waste', 0);
    const density = BE.v('density', 0);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    let total = 0;
    const out = shapes.map((s, i) => {
      const v = s.type === 'cyl' ? Math.PI * Math.pow(s.x / 2, 2) * s.y : s.x * s.y * s.z;
      total += v;
      return [`${i + 1}. ${T[s.type]}`, BE.num(v, 3) + ' m³'];
    });
    if (total <= 0) { hero.textContent = T.empty; rows.innerHTML = BE.rows(out); return; }
    const withExtra = total * (1 + extra / 100);
    hero.innerHTML = BE.num(withExtra, 2) + ' m<sup>3</sup>';
    out.push([T.total, BE.num(total, 3) + ' m³', 'total']);
    if (extra > 0) out.push([`${T.extra} (${BE.num(extra, 0)}%)`, BE.num(withExtra, 3) + ' m³', 'total']);
    out.push([T.litres, BE.num(withExtra * 1000, 0) + ' L']);
    if (density > 0) out.push([T.weight, BE.num(withExtra * density, 2) + (isNl ? ' ton' : ' t')]);
    if (density > 0) out.push([T.bigbags, Math.ceil(withExtra)]);
    rows.innerHTML = BE.rows(out);
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.list('shapes', template, [{ type: 'block', x: 5, y: 4, z: 0.1 }], () => ({ type: 'block' }), recalc);
    document.getElementById('shapes').addEventListener('change', (e) => {
      if (e.target.dataset.k !== 'type') return;
      e.target.closest('.dyn-row').querySelector('.dyn-fields').innerHTML = fields(e.target.value, {});
      recalc();
    });
    BE.chip('matChips', () => {
      const b = document.querySelector('#matChips .chip.active');
      document.getElementById('density').value = b ? b.dataset.t : 0;
      recalc();
    });
    BE.bindAll(['waste', 'density'], recalc);
  });
})();
