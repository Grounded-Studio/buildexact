(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul in en klik Bereken',
    heroPrice: (p) => '€ ' + p.toFixed(2).replace('.', ','),
    rowHoles: 'Aantal gaten',
    rowDrillM: 'Totaal meters diamant',
    rowTime: 'Geschatte tijd',
    rowSawM: 'Zaag-lengte',
    rowPrice: 'Totale prijs',
    hourMin: (h, m) => h > 0 && m > 0 ? `${h}u ${m}min` : h > 0 ? `${h}u` : `${m} min`,
    rowLabel: (i) => `Rij ${i + 1}`,
    diameter: 'Diameter (mm)',
    depth: 'Diepte (cm)',
    count: 'Aantal gaten',
    price: 'Prijs per gat (€)',
    reinforced: 'Gewapend beton (+40%)',
    remove: 'Verwijderen',
  } : {
    heroEmpty: 'Fill in and click Calculate',
    heroPrice: (p) => '€ ' + p.toFixed(2),
    rowHoles: 'Holes',
    rowDrillM: 'Total diamond metres',
    rowTime: 'Estimated time',
    rowSawM: 'Cut length',
    rowPrice: 'Total price',
    hourMin: (h, m) => h > 0 && m > 0 ? `${h}h ${m}min` : h > 0 ? `${h}h` : `${m} min`,
    rowLabel: (i) => `Row ${i + 1}`,
    diameter: 'Diameter (mm)',
    depth: 'Depth (cm)',
    count: 'Hole count',
    price: 'Price per hole (€)',
    reinforced: 'Reinforced concrete (+40%)',
    remove: 'Remove',
  };

  const STANDARD_DIAMETERS = [52, 82, 102, 132, 162, 182, 202, 250];

  let mode = 'coreDrill';
  let holes = [{ diameter: 102, depth: 20, count: 1, price: 65, reinforced: false }];

  function renderHoles() {
    const wrap = document.getElementById('holesList');
    if (!wrap) return;
    wrap.innerHTML = holes.map((h, i) => `
      <div class="gate-card" data-idx="${i}" style="margin-bottom:12px;">
        <div class="gate-head">
          <span class="gate-title">${STR.rowLabel(i)}</span>
          ${holes.length > 1 ? `<button type="button" class="gate-remove" data-rm="${i}" aria-label="${STR.remove}">✕</button>` : ''}
        </div>
        <div class="chips" style="margin:8px 0;">
          ${STANDARD_DIAMETERS.map(d => `
            <button type="button" class="chip ${h.diameter === d ? 'active' : ''}" data-dia="${d}" data-idx="${i}">${d}mm</button>
          `).join('')}
        </div>
        <div class="field-row">
          <div class="field"><label>${STR.diameter}</label><input type="number" class="h-dia" value="${h.diameter}" min="10" step="1" data-idx="${i}"></div>
          <div class="field"><label>${STR.depth}</label><input type="number" class="h-depth" value="${h.depth}" min="1" step="1" data-idx="${i}"></div>
        </div>
        <div class="field-row">
          <div class="field"><label>${STR.count}</label><input type="number" class="h-count" value="${h.count}" min="1" step="1" data-idx="${i}"></div>
          <div class="field"><label>${STR.price}</label><input type="number" class="h-price" value="${h.price}" min="0" step="1" data-idx="${i}"></div>
        </div>
        <label class="toggle-row" style="margin-top:8px;">
          <input type="checkbox" class="h-reinf" ${h.reinforced ? 'checked' : ''} data-idx="${i}">
          <span>${STR.reinforced}</span>
        </label>
      </div>
    `).join('');

    wrap.querySelectorAll('[data-dia]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = +e.target.dataset.idx;
        holes[i].diameter = +e.target.dataset.dia;
        renderHoles();
        BE.markStaleOn && BE.markStaleOn('[data-no-lock="false"]');
      });
    });
    wrap.querySelectorAll('.h-dia').forEach(el => el.addEventListener('input', (e) => { holes[+e.target.dataset.idx].diameter = +e.target.value || 0; }));
    wrap.querySelectorAll('.h-depth').forEach(el => el.addEventListener('input', (e) => { holes[+e.target.dataset.idx].depth = +e.target.value || 0; }));
    wrap.querySelectorAll('.h-count').forEach(el => el.addEventListener('input', (e) => { holes[+e.target.dataset.idx].count = +e.target.value || 0; }));
    wrap.querySelectorAll('.h-price').forEach(el => el.addEventListener('input', (e) => { holes[+e.target.dataset.idx].price = +e.target.value || 0; }));
    wrap.querySelectorAll('.h-reinf').forEach(el => el.addEventListener('change', (e) => { holes[+e.target.dataset.idx].reinforced = e.target.checked; }));
    wrap.querySelectorAll('.gate-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const i = +e.target.dataset.rm;
        if (holes.length <= 1) return;
        holes.splice(i, 1);
        renderHoles();
      });
    });
  }

  function computeCoreDrill() {
    let totalHoles = 0, totalM = 0, totalPrice = 0, totalMin = 0;
    holes.forEach(h => {
      const n = Math.max(h.count, 0);
      totalHoles += n;
      totalM += n * (h.depth / 100);
      const base = n * h.price;
      totalPrice += h.reinforced ? base * 1.4 : base;
      const diaFactor = Math.max(0.5, Math.min(5, h.diameter / 100));
      const minutes = h.depth * 0.6 * diaFactor * n;
      totalMin += h.reinforced ? minutes * 1.4 : minutes;
    });
    return { totalHoles, totalM, totalPrice, totalMin: Math.round(totalMin) };
  }

  function computeSaw() {
    const len = +document.getElementById('sawLen').value || 0;
    const price = +document.getElementById('sawPrice').value || 0;
    const reinf = document.getElementById('sawReinforced').checked;
    const base = len * price;
    return { len, totalPrice: reinf ? base * 1.4 : base };
  }

  function fmtTime(min) {
    if (min <= 0) return '—';
    const h = Math.floor(min / 60);
    const m = min % 60;
    return STR.hourMin(h, m);
  }

  function recalc() {
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    const parts = [];
    if (mode === 'coreDrill') {
      const r = computeCoreDrill();
      if (r.totalPrice <= 0) {
        hero.textContent = STR.heroEmpty;
        rows.innerHTML = '';
        return;
      }
      hero.textContent = STR.heroPrice(r.totalPrice);
      parts.push(`<div class="result-row"><span class="k">${STR.rowHoles}</span><span class="v">${r.totalHoles}</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowDrillM}</span><span class="v">${r.totalM.toFixed(2)} m</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowTime}</span><span class="v">${fmtTime(r.totalMin)}</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowPrice}</span><span class="v">${STR.heroPrice(r.totalPrice)}</span></div>`);
    } else {
      const r = computeSaw();
      if (r.totalPrice <= 0) {
        hero.textContent = STR.heroEmpty;
        rows.innerHTML = '';
        return;
      }
      hero.textContent = STR.heroPrice(r.totalPrice);
      parts.push(`<div class="result-row"><span class="k">${STR.rowSawM}</span><span class="v">${r.len.toFixed(2)} m</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowPrice}</span><span class="v">${STR.heroPrice(r.totalPrice)}</span></div>`);
    }
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderHoles();

    document.getElementById('addHoleBtn').addEventListener('click', () => {
      holes.push({ diameter: 102, depth: 20, count: 1, price: 65, reinforced: false });
      renderHoles();
    });

    BE.chip('modeChips', (val) => {
      mode = val;
      document.getElementById('coreDrillSection').style.display = val === 'coreDrill' ? '' : 'none';
      document.getElementById('sawSection').style.display = val === 'coreDrill' ? 'none' : '';
      const title = document.getElementById('sawTitle');
      if (title) title.textContent = val === 'wallSaw'
        ? (isNl ? 'Wandzagen' : 'Wall sawing')
        : (isNl ? 'Vloerzagen' : 'Floor sawing');
    });

    BE.wireCalc(recalc, ['sawLen', 'sawDepth', 'sawPrice']);
    BE.markStaleOn('input,select,.chip,.toggle-row input');

    BE.wireShoppingList(
      'boor_zaagwerk',
      () => ({
        modus: mode,
        aantal_rijen: holes.length,
      }),
      () => {
        const hero = document.getElementById('heroValue');
        if (!hero || !hero.textContent || hero.textContent === STR.heroEmpty) return null;
        if (mode === 'coreDrill') {
          const r = computeCoreDrill();
          const breakdown = holes.map((h, i) => `rij${i+1}_${h.diameter}mm_${h.depth}cm_x${h.count}${h.reinforced?'_gewapend':''}`).join('; ');
          return {
            type_werk: 'kernboring',
            aantal_gaten: r.totalHoles,
            totaal_meter_diamant: r.totalM.toFixed(2),
            geschatte_tijd_min: r.totalMin,
            totale_prijs: '€ ' + r.totalPrice.toFixed(2),
            per_rij: breakdown,
          };
        } else {
          const r = computeSaw();
          return {
            type_werk: mode === 'wallSaw' ? 'wandzagen' : 'vloerzagen',
            lengte_m: r.len.toFixed(2),
            diepte_cm: +document.getElementById('sawDepth').value || 0,
            totale_prijs: '€ ' + r.totalPrice.toFixed(2),
            gewapend: document.getElementById('sawReinforced').checked,
          };
        }
      },
      () => `${mode === 'coreDrill' ? 'Kernboring' : (mode === 'wallSaw' ? 'Wandzagen' : 'Vloerzagen')} opdracht`
    );
  });
})();
