(function () {
  const isNl = BE.isNl();
  // [symbol, en name, nl name, factor to the base unit]
  const CATS = {
    length: [['mm', 'millimetre', 'millimeter', 0.001], ['cm', 'centimetre', 'centimeter', 0.01], ['m', 'metre', 'meter', 1],
      ['km', 'kilometre', 'kilometer', 1000], ['in', 'inch', 'inch', 0.0254], ['ft', 'foot', 'voet', 0.3048], ['yd', 'yard', 'yard', 0.9144]],
    area: [['cm²', 'square centimetre', 'vierkante centimeter', 0.0001], ['m²', 'square metre', 'vierkante meter', 1],
      ['are', 'are', 'are', 100], ['ha', 'hectare', 'hectare', 10000], ['ft²', 'square foot', 'vierkante voet', 0.09290304],
      ['yd²', 'square yard', 'vierkante yard', 0.83612736], ['acre', 'acre', 'acre', 4046.8564224]],
    volume: [['ml', 'millilitre', 'milliliter', 0.000001], ['L', 'litre', 'liter', 0.001], ['m³', 'cubic metre', 'kubieke meter', 1],
      ['ft³', 'cubic foot', 'kubieke voet', 0.0283168466], ['yd³', 'cubic yard', 'kubieke yard', 0.764554858],
      ['gal (US)', 'gallon (US)', 'gallon (VS)', 0.00378541178], ['gal (UK)', 'gallon (UK)', 'gallon (VK)', 0.00454609]],
    weight: [['g', 'gram', 'gram', 0.001], ['kg', 'kilogram', 'kilogram', 1], ['t', 'tonne', 'ton', 1000],
      ['oz', 'ounce', 'ounce', 0.028349523125], ['lb', 'pound', 'pound', 0.45359237]],
  };
  const DEFAULT_FROM = { length: 2, area: 1, volume: 2, weight: 1, slope: 0 };
  const ALT = { length: 5, area: 4, volume: 1, weight: 4 };
  const SLOPE = isNl ? ['graden (°)', 'procent (%)', 'verhouding 1 : x'] : ['degrees (°)', 'percent (%)', 'ratio 1 : x'];
  const T = isNl
    ? { empty: 'Vul een waarde in', angle: 'Hoek', pct: 'Percentage', ratio: 'Verhouding', rise: 'Stijging per meter' }
    : { empty: 'Enter a value', angle: 'Angle', pct: 'Percentage', ratio: 'Ratio', rise: 'Rise per metre' };

  // Up to 6 significant decimals, no trailing zeros: 1 m, 3.281 ft, 0.001 km.
  function numStr(v) {
    const a = Math.abs(v);
    const d = a >= 1000 ? 1 : a >= 1 ? 3 : a >= 0.001 ? 6 : 9;
    return Number(v).toLocaleString(isNl ? 'nl-NL' : 'en-GB', { maximumFractionDigits: d });
  }

  function fillFrom(cat) {
    const sel = document.getElementById('from');
    const opts = cat === 'slope' ? SLOPE : CATS[cat].map(u => u[0]);
    sel.innerHTML = opts.map((o, i) => `<option value="${i}">${o}</option>`).join('');
    sel.value = DEFAULT_FROM[cat];
  }

  function recalc() {
    const cat = BE.activeChip('catChips') || 'length';
    const from = parseInt(document.getElementById('from').value, 10) || 0;
    const raw = document.getElementById('val').value;
    const v = parseFloat(raw);
    const hero = document.getElementById('heroValue');
    const label = document.getElementById('heroLabel');
    const rows = document.getElementById('resultRows');
    if (raw === '' || !isFinite(v)) { hero.textContent = T.empty; rows.innerHTML = ''; return; }
    if (cat === 'slope') {
      let deg = from === 0 ? v : from === 1 ? Math.atan(v / 100) * 180 / Math.PI : (v === 0 ? 90 : Math.atan(1 / v) * 180 / Math.PI);
      const pct = Math.tan(deg * Math.PI / 180) * 100;
      const ratio = pct === 0 ? Infinity : 100 / pct;
      label.textContent = T.pct;
      hero.textContent = BE.num(pct, 2) + ' %';
      rows.innerHTML = BE.rows([
        [T.angle, BE.num(deg, 2) + '°', from === 0 ? 'total' : ''],
        [T.pct, BE.num(pct, 2) + ' %', from === 1 ? 'total' : ''],
        [T.ratio, isFinite(ratio) ? '1 : ' + BE.num(ratio, 1) : '–', from === 2 ? 'total' : ''],
        [T.rise, BE.num(pct * 10, 1) + ' mm'],
      ]);
      return;
    }
    const units = CATS[cat];
    const base = v * units[from][3];
    // Hero: the value in the main unit (m, m², m³, kg), or in the alternative when that is the input.
    const target = from === DEFAULT_FROM[cat] ? units[ALT[cat]] : units[DEFAULT_FROM[cat]];
    label.style.textTransform = 'none';
    label.textContent = `${numStr(v)} ${units[from][0]} =`;
    hero.textContent = numStr(base / target[3]) + ' ' + target[0];
    rows.innerHTML = BE.rows(units.map((u, i) => [isNl ? u[2] : u[1], numStr(base / u[3]) + ' ' + u[0], i === from ? 'total' : '']));
  }

  document.addEventListener('DOMContentLoaded', () => {
    fillFrom('length');
    BE.chip('catChips', (c) => { fillFrom(c); recalc(); });
    document.getElementById('from').addEventListener('change', recalc);
    document.getElementById('val').addEventListener('input', recalc);
    recalc();
  });
})();
