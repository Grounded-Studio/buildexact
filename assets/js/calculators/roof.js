(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    rowSlopePct: 'Helling %', rowSlopeM: 'Zijde-lengte', rowArea: 'Dak-oppervlak',
    rowAreaWaste: 'Oppervlak incl. snijverlies',
    rowTiles: 'Pannen', rowBattens: 'Panlatten', rowRidge: 'Nokvorsten',
    rowMembrane: 'Membraan nodig',
  } : {
    rowSlopePct: 'Slope %', rowSlopeM: 'Slope length per side', rowArea: 'Roof area',
    rowAreaWaste: 'Area incl. waste',
    rowTiles: 'Roof tiles', rowBattens: 'Battens', rowRidge: 'Ridge caps',
    rowMembrane: 'Membrane needed',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  function recalc() {
    const rise = BE.v('rise', 0);
    const run = BE.v('run', 0);
    const widthM = BE.v('rwidth', 0);
    const waste = BE.v('waste', 10);
    const material = BE.activeChip('materialChips') || 'tiles';
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    document.getElementById('tileFields').style.display = material === 'tiles' ? '' : 'none';

    if (rise <= 0 || run <= 0) { hero.textContent = '0°'; rows.innerHTML = ''; return; }
    const angleDeg = Math.atan(rise / run) * 180 / Math.PI;
    const slopePct = (rise / run) * 100;
    const slopeM = Math.sqrt(Math.pow(rise / 100, 2) + Math.pow(run / 100, 2));
    const areaM2 = slopeM * widthM;
    const areaWaste = areaM2 * (1 + waste / 100);

    hero.textContent = fmt(angleDeg, 1) + '°';
    const parts = [
      `<div class="result-row"><span class="k">${STR.rowSlopePct}</span><span class="v">${fmt(slopePct, 1)}%</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowSlopeM}</span><span class="v">${fmt(slopeM)} m</span></div>`,
    ];
    if (widthM > 0) {
      parts.push(`<div class="result-row"><span class="k">${STR.rowArea}</span><span class="v">${fmt(areaM2)} m²</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowAreaWaste}</span><span class="v">${fmt(areaWaste)} m²</span></div>`);
      if (material === 'tiles') {
        const tilesPerM2 = BE.v('tilesPerM2', 10);
        const battenCm = BE.v('batten', 32);
        const ridgeM = BE.v('ridge', 0);
        const tiles = Math.ceil(areaWaste * tilesPerM2);
        const battensM = battenCm > 0 ? widthM * Math.ceil((slopeM * 100) / battenCm) : 0;
        const ridgeCaps = Math.ceil(ridgeM * 3);
        parts.push(`<div class="result-row"><span class="k">${STR.rowTiles}</span><span class="v">${tiles}</span></div>`);
        if (battensM > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowBattens}</span><span class="v">${fmt(battensM)} m</span></div>`);
        if (ridgeCaps > 0) parts.push(`<div class="result-row"><span class="k">${STR.rowRidge}</span><span class="v">${ridgeCaps}</span></div>`);
      } else {
        parts.push(`<div class="result-row"><span class="k">${STR.rowMembrane}</span><span class="v">${fmt(areaWaste)} m²</span></div>`);
      }
    }
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('materialChips', recalc);
    BE.wireCalc(recalc, ['rise', 'run', 'rwidth', 'waste', 'tilesPerM2', 'batten', 'ridge']); BE.markStaleOn("input,select,.chip,.toggle-row input");

    BE.wireShoppingList(
      'dak',
      () => ({
        stijghoogte_cm: BE.v('rise', 0),
        aanloop_cm: BE.v('run', 0),
        breedte_m: BE.v('rwidth', 0),
        snijverlies_percent: BE.v('waste', 10),
        materiaal: BE.activeChip('materialChips') || 'tiles',
      }),
      () => {
        const rise = BE.v('rise', 0);
        const run = BE.v('run', 0);
        const widthM = BE.v('rwidth', 0);
        const waste = BE.v('waste', 10);
        const material = BE.activeChip('materialChips') || 'tiles';
        if (rise <= 0 || run <= 0 || widthM <= 0) return null;
        const angleDeg = Math.atan(rise / run) * 180 / Math.PI;
        const slopeM = Math.sqrt(Math.pow(rise / 100, 2) + Math.pow(run / 100, 2));
        const areaWaste = slopeM * widthM * (1 + waste / 100);
        const r = {
          dakhelling_graden: angleDeg.toFixed(1),
          dakvlak_m2_per_zijde: (slopeM * widthM).toFixed(2),
          totaal_incl_snijverlies_m2: areaWaste.toFixed(2),
        };
        if (material === 'tiles') {
          r.pannen_aantal = Math.ceil(areaWaste * BE.v('tilesPerM2', 10));
          const battenCm = BE.v('batten', 32);
          if (battenCm > 0) r.panlatten_meter = (widthM * Math.ceil((slopeM * 100) / battenCm)).toFixed(1);
          const ridgeM = BE.v('ridge', 0);
          if (ridgeM > 0) r.nokvorsten_aantal = Math.ceil(ridgeM * 3);
          r.materiaal = 'dakpannen';
        } else {
          r.membraan_m2 = areaWaste.toFixed(2);
          r.materiaal = 'membraan/bitumen';
        }
        return r;
      },
      () => `Dakproject ${BE.v('rwidth', 0)}m breed (${(Math.atan(BE.v('rise',0)/BE.v('run',1))*180/Math.PI).toFixed(0)}°)`
    );
  });
})();
