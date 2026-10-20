(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul hoogte in',
    rowRiser: 'Werkelijke optrede', rowRun: 'Totale uitslag', rowSlope: 'Hellingshoek',
    rowRisers: 'Stootborden', rowStringers: (c, len) => `${c} bomen × ${len} m`,
    rowHandrail: 'Leuning', rowBalusters: 'Spijlen',
  } : {
    heroEmpty: 'Enter height',
    rowRiser: 'Actual riser', rowRun: 'Total run', rowSlope: 'Slope angle',
    rowRisers: 'Risers', rowStringers: (c, len) => `${c} stringers × ${len} m`,
    rowHandrail: 'Handrail', rowBalusters: 'Balusters',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  function recalc() {
    const heightCm = BE.v('height', 0);
    const targetRiser = BE.v('riser', 17);
    const treadCm = BE.v('tread', 26);
    const stringers = BE.v('stringers', 2);
    const includeRisers = BE.checked('includeRisers');
    const handrail = BE.checked('handrail');
    const handrailOverride = BE.v('handrailM', 0);
    const baluster = BE.v('baluster', 12);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    document.getElementById('handrailFields').style.display = handrail ? '' : 'none';

    if (heightCm <= 0) { hero.textContent = STR.heroEmpty; rows.innerHTML = ''; return; }
    const steps = Math.max(1, Math.round(heightCm / targetRiser));
    const actualRiser = heightCm / steps;
    const totalRun = steps * treadCm;
    const slopeDeg = totalRun > 0 ? Math.atan(heightCm / totalRun) * 180 / Math.PI : 0;
    const stringerM = Math.sqrt(Math.pow(heightCm / 100, 2) + Math.pow(totalRun / 100, 2));
    const handrailM = handrailOverride > 0 ? handrailOverride : stringerM;
    const balusters = handrail && baluster > 0 ? Math.ceil((handrailM * 100) / baluster) + 1 : 0;

    hero.textContent = steps.toString();
    const parts = [
      `<div class="result-row"><span class="k">${STR.rowRiser}</span><span class="v">${fmt(actualRiser)} cm</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowRun}</span><span class="v">${fmt(totalRun, 1)} cm</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowSlope}</span><span class="v">${fmt(slopeDeg, 1)}°</span></div>`,
    ];
    if (includeRisers) parts.push(`<div class="result-row"><span class="k">${STR.rowRisers}</span><span class="v">${steps}</span></div>`);
    parts.push(`<div class="result-row"><span class="k">${STR.rowStringers(stringers, fmt(stringerM))}</span><span class="v">—</span></div>`);
    if (handrail) {
      parts.push(`<div class="result-row"><span class="k">${STR.rowHandrail}</span><span class="v">${fmt(handrailM)} m</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowBalusters}</span><span class="v">${balusters}</span></div>`);
    }
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('shapeChips', () => {
      const btn = document.querySelector('#shapeChips .chip.active');
      if (btn && btn.dataset.stringers) document.getElementById('stringers').value = btn.dataset.stringers;
      recalc();
    });
    BE.wireCalc(recalc, ['height', 'riser', 'tread', 'swidth', 'stringers', 'handrailM', 'baluster']); BE.markStaleOn("input,select,.chip,.toggle-row input");
    document.getElementById('includeRisers').addEventListener('change', recalc);
    document.getElementById('handrail').addEventListener('change', recalc);

    BE.wireShoppingList(
      'trap',
      () => ({
        totale_hoogte_cm: BE.v('height', 0),
        gewenste_optrede_cm: BE.v('riser', 17),
        aantrede_cm: BE.v('tread', 26),
        breedte_cm: BE.v('swidth', 0),
        aantal_bomen: BE.v('stringers', 2),
        met_stootborden: BE.checked('includeRisers'),
        met_leuning: BE.checked('handrail'),
      }),
      () => {
        const hero = document.getElementById('heroValue');
        if (!hero || !hero.textContent || hero.textContent === STR.heroEmpty) return null;
        const heightCm = BE.v('height', 0);
        const targetRiser = BE.v('riser', 17);
        const treadCm = BE.v('tread', 26);
        const stringers = BE.v('stringers', 2);
        const steps = Math.max(1, Math.round(heightCm / targetRiser));
        const totalRun = steps * treadCm;
        const stringerM = Math.sqrt(Math.pow(heightCm / 100, 2) + Math.pow(totalRun / 100, 2));
        const r = {
          aantal_treden: steps,
          werkelijke_optrede_cm: (heightCm / steps).toFixed(1),
          totale_uitslag_cm: totalRun.toFixed(0),
          traphoogte_cm: heightCm,
          aantal_bomen: stringers,
          lengte_per_boom_m: stringerM.toFixed(2),
        };
        if (BE.checked('includeRisers')) r.stootborden_aantal = steps;
        if (BE.checked('handrail')) {
          const handrailOverride = BE.v('handrailM', 0);
          const handrailM = handrailOverride > 0 ? handrailOverride : stringerM;
          const baluster = BE.v('baluster', 12);
          r.leuning_meter = handrailM.toFixed(2);
          if (baluster > 0) r.spijlen_aantal = Math.ceil((handrailM * 100) / baluster) + 1;
        }
        return r;
      },
      () => `Trap ${BE.v('height', 0)}cm hoogte (${Math.max(1, Math.round(BE.v('height',0)/BE.v('riser',17)))} treden)`
    );
  });
})();
