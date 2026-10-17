(function () {
  function recalc() {
    const mode = BE.activeChip('modeChips') || 'ceiling';
    const area = BE.v('area', 0);
    const bw = BE.v('boardW', 120);
    const bh = BE.v('boardH', 260);
    const waste = BE.v('waste', 10);
    const screwsPerBoard = BE.v('screws', 32);
    const compoundKgM2 = BE.v('compound', 0.6);
    const tapePerM2 = BE.v('tape', 1.5);
    const twoLayers = BE.checked('twoLayers');

    const boardArea = (bw / 100) * (bh / 100);
    const areaInclWaste = area * (1 + waste / 100);
    const layerMul = twoLayers ? 2 : 1;
    const boards = boardArea > 0 ? Math.ceil((area / boardArea) * (1 + waste / 100) * layerMul) : 0;
    const screws = boards * screwsPerBoard;
    const compoundKg = areaInclWaste * compoundKgM2;
    const tapeM = areaInclWaste * tapePerM2;

    BE.set('rBoards', boards);
    BE.set('rAreaInclWaste', areaInclWaste, 2);
    BE.set('rScrews', screws);
    BE.set('rCompound', compoundKg, 1);
    BE.set('rTape', tapeM, 1);

    const partitionFields = document.getElementById('partitionFields');
    if (partitionFields) partitionFields.style.display = mode === 'partition' ? '' : 'none';
    const partitionResults = document.getElementById('partitionResults');
    if (partitionResults) partitionResults.style.display = mode === 'partition' ? '' : 'none';

    if (mode === 'partition') {
      const wallLen = BE.v('wallLen', 0);
      const studSpacing = BE.v('studSpacing', 60);
      const studs = studSpacing > 0 ? Math.ceil((wallLen * 100) / studSpacing) + 1 : 0;
      const tracks = wallLen * 2;
      BE.set('rStuds', studs);
      BE.set('rTracks', tracks, 2);
    }
  }
  BE.chip('modeChips', recalc);
  BE.bindAll(['area', 'boardW', 'boardH', 'waste', 'screws', 'compound', 'tape', 'wallLen', 'studSpacing'], recalc);
  document.getElementById('twoLayers').addEventListener('change', recalc);
})();
