(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    heroEmpty: 'Vul oppervlak in', heroBoards: (n) => `${n} platen`,
    rowAreaWaste: 'Oppervlak incl. snijverlies', rowScrews: 'Schroeven',
    rowCompound: 'Voegsel', rowTape: 'Voegband',
    rowStuds: 'Verticale profielen', rowTracks: 'Horizontale rails',
  } : {
    heroEmpty: 'Enter area', heroBoards: (n) => `${n} boards`,
    rowAreaWaste: 'Area incl. waste', rowScrews: 'Screws',
    rowCompound: 'Joint compound', rowTape: 'Joint tape',
    rowStuds: 'Vertical studs', rowTracks: 'Horizontal tracks',
  };
  function fmt(v, d) { d = d == null ? 2 : d; return isNl ? v.toFixed(d).replace('.', ',') : v.toFixed(d); }

  function recalc() {
    const mode = BE.activeChip('modeChips') || 'ceiling';
    const area = BE.v('area', 0);
    const bw = BE.v('boardW', 120);
    const bh = BE.v('boardH', 260);
    const waste = BE.v('waste', 10);
    const twoLayers = BE.checked('twoLayers');
    const screwsPerBoard = BE.v('screws', 32);
    const compoundKg = BE.v('compound', 0.6);
    const tape = BE.v('tape', 1.5);
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');

    document.getElementById('partitionSection').style.display = mode === 'partition' ? '' : 'none';

    if (area <= 0 || bw <= 0 || bh <= 0) { hero.textContent = STR.heroEmpty; rows.innerHTML = ''; return; }
    const boardArea = (bw / 100) * (bh / 100);
    const areaWaste = area * (1 + waste / 100);
    const layerMul = twoLayers ? 2 : 1;
    const boards = Math.ceil((area / boardArea) * (1 + waste / 100) * layerMul);
    const screws = boards * screwsPerBoard;
    const compoundTotal = areaWaste * compoundKg;
    const tapeTotal = areaWaste * tape;

    hero.textContent = STR.heroBoards(boards);
    const parts = [
      `<div class="result-row"><span class="k">${STR.rowAreaWaste}</span><span class="v">${fmt(areaWaste)} m²</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowScrews}</span><span class="v">${screws}</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowCompound}</span><span class="v">${fmt(compoundTotal, 1)} kg</span></div>`,
      `<div class="result-row"><span class="k">${STR.rowTape}</span><span class="v">${fmt(tapeTotal, 1)} m</span></div>`,
    ];
    if (mode === 'partition') {
      const wallLen = BE.v('wallLen', 0);
      const spacing = BE.v('studSpacing', 60);
      if (wallLen > 0 && spacing > 0) {
        const studs = Math.ceil((wallLen * 100) / spacing) + 1;
        const tracks = wallLen * 2;
        parts.push(`<div class="result-row"><span class="k">${STR.rowStuds}</span><span class="v">${studs}</span></div>`);
        parts.push(`<div class="result-row"><span class="k">${STR.rowTracks}</span><span class="v">${fmt(tracks)} m</span></div>`);
      }
    }
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('modeChips', recalc);
    BE.wireCalc(recalc, ['area', 'boardW', 'boardH', 'waste', 'screws', 'compound', 'tape', 'wallLen', 'wallHt', 'studSpacing']); BE.markStaleOn("input,select,.chip,.toggle-row input");
    document.getElementById('twoLayers').addEventListener('change', recalc);

    BE.wireShoppingList(
      'gipsplaten',
      () => ({
        toepassing: BE.activeChip('modeChips') || 'ceiling',
        oppervlak_m2: BE.v('area', 0),
        plaat_breedte_cm: BE.v('boardW', 120),
        plaat_hoogte_cm: BE.v('boardH', 260),
        snijverlies_percent: BE.v('waste', 10),
        twee_lagen: BE.checked('twoLayers'),
      }),
      () => {
        const hero = document.getElementById('heroValue');
        if (!hero || !hero.textContent || hero.textContent === STR.heroEmpty) return null;
        const mode = BE.activeChip('modeChips') || 'ceiling';
        const area = BE.v('area', 0);
        const bw = BE.v('boardW', 120);
        const bh = BE.v('boardH', 260);
        const waste = BE.v('waste', 10);
        const twoLayers = BE.checked('twoLayers');
        const boardArea = (bw / 100) * (bh / 100);
        const layerMul = twoLayers ? 2 : 1;
        const boards = Math.ceil((area / boardArea) * (1 + waste / 100) * layerMul);
        const areaWaste = area * (1 + waste / 100);
        const r = {
          platen_aantal: boards,
          platen_formaat: `${bw}x${bh}cm`,
          schroeven_aantal: boards * BE.v('screws', 32),
          voegsel_kg: (areaWaste * BE.v('compound', 0.6)).toFixed(1),
          voegband_m: (areaWaste * BE.v('tape', 1.5)).toFixed(1),
          toepassing: mode === 'partition' ? 'wand' : 'plafond',
        };
        if (mode === 'partition') {
          const wallLen = BE.v('wallLen', 0);
          const spacing = BE.v('studSpacing', 60);
          if (wallLen > 0 && spacing > 0) {
            r.verticale_profielen = Math.ceil((wallLen * 100) / spacing) + 1;
            r.horizontale_rails_m = (wallLen * 2).toFixed(1);
          }
        }
        return r;
      },
      () => `Gipsplaten ${BE.v('area', 0)}m² (${BE.activeChip('modeChips') === 'partition' ? 'wand' : 'plafond'})`
    );
  });
})();
