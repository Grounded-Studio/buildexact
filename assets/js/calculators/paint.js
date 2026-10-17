(function () {
  function recalc() {
    const area = BE.v('area', 0);
    const coverage = BE.v('coverage', 10);
    const coats = BE.v('coats', 2);
    const wasteMode = BE.activeChip('methodChips') || 'brush';
    const waste = wasteMode === 'spray' ? 25 : 5;
    const primer = BE.checked('primer');
    const primerCov = BE.v('primerCoverage', 10);

    const topcoat = coverage > 0 ? (area / coverage) * coats * (1 + waste / 100) : 0;
    const primerL = primer && primerCov > 0 ? (area / primerCov) * (1 + waste / 100) : 0;

    BE.set('rPaint', topcoat, 2);
    BE.set('rPrimer', primerL, 2);
    BE.set('rWaste', waste);

    // Can breakdown
    const sizes = [10, 5, 2.5, 1];
    let remaining = topcoat;
    const counts = {};
    sizes.forEach(s => {
      counts[s] = Math.floor(remaining / s);
      remaining -= counts[s] * s;
    });
    if (remaining > 0) counts[1] += 1; // round up to nearest 1L
    document.getElementById('rCans').innerHTML = sizes
      .filter(s => counts[s] > 0)
      .map(s => `<span class="k">${s} L cans</span><span class="v">${counts[s]}</span>`)
      .join('</div><div class="result-row">')
      || '<span class="k">—</span><span class="v">0</span>';
  }
  BE.chip('methodChips', recalc);
  BE.bindAll(['area', 'coverage', 'coats', 'primerCoverage'], recalc);
  document.getElementById('primer').addEventListener('change', recalc);
})();
