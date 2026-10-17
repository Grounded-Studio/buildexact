// Schutting calculator (NL labels) — same math as fence.js
(function () {
  const SEGMENT_LABELS = {
    straight: ['Totale lengte (cm)'],
    L: ['Zijlijn (cm)', 'Achterlijn (cm)'],
    U: ['Zijlijn (cm)', 'Achterlijn (cm)', 'Zijlijn (cm)'],
  };

  let shape = 'straight';
  let segmentValues = [500];

  function renderSegments() {
    const wrap = document.getElementById('segments');
    const labels = SEGMENT_LABELS[shape];
    segmentValues = segmentValues.slice(0, labels.length);
    while (segmentValues.length < labels.length) segmentValues.push(400);
    wrap.innerHTML = labels.map((lbl, i) => `
      <div class="field">
        <label for="seg${i}">${lbl}</label>
        <input type="number" id="seg${i}" value="${segmentValues[i]}" min="100" step="10">
      </div>
    `).join('');
    labels.forEach((_, i) => {
      document.getElementById('seg' + i).addEventListener('input', () => {
        segmentValues[i] = +document.getElementById('seg' + i).value || 0;
        recalc();
      });
    });
  }

  function computeSegment(lengthCm, panelCm, postCm, gateReservedCm, hasStartEndPost, hasFinishEndPost) {
    const startPost = hasStartEndPost ? postCm : postCm / 2;
    const finishPost = hasFinishEndPost ? postCm : postCm / 2;
    let usable = lengthCm - startPost - finishPost - gateReservedCm;
    if (usable < 0) usable = 0;
    const panels = Math.floor(usable / panelCm);
    const remainder = usable - panels * panelCm;
    const pasvak = remainder >= 15 ? 1 : 0;
    return { panels, pasvak };
  }

  function recalc() {
    const panelCm = +document.getElementById('panelCm').value || 180;
    const postCm = +document.getElementById('postCm').value || 9;
    const singleGates = +document.getElementById('singleGates').value || 0;
    const doubleGates = +document.getElementById('doubleGates').value || 0;
    const singleGateCm = +document.getElementById('singleGateCm').value || 100;
    const doubleGateCm = +document.getElementById('doubleGateCm').value || 300;
    const useEndPosts = document.getElementById('endPosts').checked;

    const totalGateReservedCm = singleGates * singleGateCm + doubleGates * doubleGateCm;
    const totalGates = singleGates + doubleGates;
    const endPostsCount = useEndPosts ? totalGates * 2 : 0;
    const totalLen = segmentValues.reduce((a, b) => a + b, 0);
    const segCount = segmentValues.length;

    let totalPanels = 0, totalPasvakken = 0, rawPosts = 0;
    segmentValues.forEach((segCm, i) => {
      const share = totalLen > 0 ? segCm / totalLen : 0;
      const segGateCm = totalGateReservedCm * share;
      const r = computeSegment(segCm, panelCm, postCm, segGateCm, i === 0, i === segCount - 1);
      totalPanels += r.panels;
      totalPasvakken += r.pasvak;
      rawPosts += r.panels + r.pasvak + 1;
    });
    const posts = Math.max(0, rawPosts - (segCount - 1));

    document.getElementById('rTotal').textContent = (totalLen / 100).toFixed(2);
    document.getElementById('rPosts').textContent = posts;
    document.getElementById('rPanels').textContent = totalPanels;
    document.getElementById('rCuts').textContent = totalPasvakken;
    document.getElementById('rGates').textContent = totalGates;
    document.getElementById('rEndPosts').textContent = endPostsCount;
  }

  document.getElementById('shapeChips').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    document.querySelectorAll('#shapeChips .chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    shape = btn.dataset.shape;
    renderSegments();
    recalc();
  });

  ['panelCm','postCm','singleGates','doubleGates','singleGateCm','doubleGateCm'].forEach(id => {
    document.getElementById(id).addEventListener('input', recalc);
  });
  document.getElementById('endPosts').addEventListener('change', recalc);

  renderSegments();
  recalc();
})();
