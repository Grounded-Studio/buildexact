// Fence calculator — mirrors lib/features/fence/fence_calculator.dart
// Exact app parity: multi-segment with corners, gates list, long panels toggle,
// start/end-with-post, cover caps, unfilled gap warning.
(function () {
  const MIN_PASVAK_CM = 15;
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');

  const STR = isNl ? {
    cornersSubtitle: 'Elke hoek splitst de lijn in extra lijnen. Voorbeeld: 2 hoeken = U-vorm = 3 lijnen.',
    totalLengthSingle: 'Totale lengte zijlijn (cm)',
    noGates: 'Geen poorten. Tik hieronder om er een toe te voegen.',
    gatePrefix: 'Poort',
    removeGate: 'Verwijderen',
    gateWidth: 'Poortbreedte (cm)',
    gateBeam: 'Balk dikte (cm, per kant)',
    doubleGate: 'Dubbele poort',
    addGate: '+ Poort toevoegen',
    heroEmpty: 'Vul een lengte in',
    heroPostsPanels: (p, pa) => `${p} palen · ${pa} schermen`,
    rowRegularPosts: 'Palen (10×10)',
    rowGatePosts: 'Eindpalen zonder sponning (voor poort)',
    rowCornerPosts: 'Hoekpalen',
    rowStandardPanels: (w) => `Standaard schermen (${w} cm)`,
    rowLongPanels: (w) => `Lange schermen (${w} cm)`,
    rowPasvak: (base) => `Pasvak (ingekort van ${base} cm)`,
    rowPasvakTwoEnd: (base) => `2× pasvak (begin + eind, ingekort van ${base} cm)`,
    twoEndLabel: '2 gelijke pasvakken (begin + eind)',
    twoEndSub: 'App rekent uit welke breedte beide pasvakken moeten hebben',
    rowCoverCaps: 'Afdekkappen (op schermen)',
    rowGate: (i, w, b, dbl) => `${dbl ? 'Dubbele p' : 'P'}oort ${i} (${w} cm + 2×${b} cm balk)`,
    rowGateBeam: (i) => `Bovenbalk poort ${i}`,
    rowUnfilled: 'Niet opgevuld (te klein voor pasvak)',
  } : {
    cornersSubtitle: 'Each corner splits the run into extra lines. Example: 2 corners = U-shape = 3 lines.',
    totalLengthSingle: 'Total side line length (cm)',
    noGates: 'No gates yet. Tap below to add one.',
    gatePrefix: 'Gate',
    removeGate: 'Remove',
    gateWidth: 'Gate width (cm)',
    gateBeam: 'Beam thickness (cm, each side)',
    doubleGate: 'Double gate',
    addGate: '+ Add gate',
    heroEmpty: 'Enter a length',
    heroPostsPanels: (p, pa) => `${p} posts · ${pa} panels`,
    rowRegularPosts: 'Posts (10×10)',
    rowGatePosts: 'End posts without rebate (for gate)',
    rowCornerPosts: 'Corner posts',
    rowStandardPanels: (w) => `Standard panels (${w} cm)`,
    rowLongPanels: (w) => `Long panels (${w} cm)`,
    rowPasvak: (base) => `End cut (from ${base} cm panel)`,
    rowPasvakTwoEnd: (base) => `2× end panel (begin + end, cut from ${base} cm)`,
    twoEndLabel: '2 equal end panels (begin + end)',
    twoEndSub: 'App figures out the width both end panels need',
    rowCoverCaps: 'Cover caps (on panels)',
    rowGate: (i, w, b, dbl) => `${dbl ? 'Double g' : 'G'}ate ${i} (${w} cm + 2×${b} cm beam)`,
    rowGateBeam: (i) => `Top beam gate ${i}`,
    rowUnfilled: 'Unfilled gap (too small for a pasvak)',
  };

  function fmt(v) {
    if (v === Math.round(v)) return v.toFixed(0);
    return v.toFixed(1);
  }

  function segmentLabel(index, total) {
    const n = index + 1;
    if (total === 2) {
      if (isNl) return index === 0 ? 'Totale lengte zijlijn (cm)' : 'Totale lengte achterlijn (cm)';
      return index === 0 ? 'Total length side line (cm)' : 'Total length back line (cm)';
    }
    if (total === 3) {
      if (isNl) {
        if (index === 2) return 'Totale lengte achterlijn (cm)';
        return `Totale lengte zijlijn ${n} (cm)`;
      } else {
        if (index === 2) return 'Total length back line (cm)';
        return `Total length side line ${n} (cm)`;
      }
    }
    return isNl ? `Totale lengte lijn ${n} (cm)` : `Total length line ${n} (cm)`;
  }

  // State
  let cornerCount = 0;
  let segments = [500];
  let twoEndPerSegment = [false];
  let gates = [];
  let gateSeq = 0;

  // ---------- Algorithm (mirrors Dart _computeStraight) ----------
  function computeStraight(length, postW, panelW, startWithPost, endWithPost, allowLongPanels, longPanelMaxCm, segGates) {
    const gateCount = segGates.length;
    const gateSpanSum = segGates.reduce((s, g) => s + g.widthCm + 2 * g.beamCm, 0);
    const startAdj = startWithPost ? 0 : 1;
    const endAdj = endWithPost ? 0 : 1;
    const endMissing = startAdj + endAdj;

    const denom = panelW + postW;
    const numerator = length - gateSpanSum - (gateCount + 1 - endMissing) * postW;
    let n = denom <= 0 ? 0 : Math.floor(numerator / denom);
    if (n < 0) n = 0;

    const minPosts = gateCount + 1 - endMissing;
    const minUsed = gateSpanSum + Math.max(minPosts, 0) * postW;
    if (minUsed > length) {
      return { postCount: 0, standardPanelCount: 0, longPanelCount: 0, longPanelWidthCm: 0, pasvakWidthsCm: [], totalUsedCm: 0, unfilledGapCm: length };
    }

    let sections = n + gateCount;
    let postCount = sections + 1 - endMissing;
    if (postCount < 0) postCount = 0;
    let used = n * panelW + gateSpanSum + postCount * postW;
    let leftover = Math.max(length - used, 0);

    let longPanelCount = 0, longPanelWidth = 0, pasvakWidth = 0, standardPanels = n, unfilled = 0;

    if (leftover >= MIN_PASVAK_CM) {
      const maxExtension = longPanelMaxCm - panelW;
      let absorbed = false;
      if (allowLongPanels && maxExtension > 0) {
        if (standardPanels >= 1 && leftover <= maxExtension) {
          longPanelCount = 1;
          longPanelWidth = panelW + leftover;
          standardPanels -= 1;
          used = length;
          absorbed = true;
        } else if (standardPanels >= 2 && (leftover / 2) <= maxExtension) {
          longPanelCount = 2;
          longPanelWidth = panelW + (leftover / 2);
          standardPanels -= 2;
          used = length;
          absorbed = true;
        }
      }
      if (!absorbed) {
        const pasvakNeedsPost = endWithPost;
        const pasvakAvailable = pasvakNeedsPost ? leftover - postW : leftover;
        if (pasvakAvailable >= MIN_PASVAK_CM) {
          pasvakWidth = pasvakAvailable;
          if (pasvakNeedsPost) postCount += 1;
          used = length - (leftover - pasvakAvailable - (pasvakNeedsPost ? postW : 0));
          used = Math.max(0, Math.min(length, used));
        } else {
          unfilled = leftover;
        }
      }
    } else if (leftover > 0) {
      unfilled = leftover;
    }

    return { postCount, standardPanelCount: standardPanels, longPanelCount, longPanelWidthCm: longPanelWidth, pasvakWidthsCm: pasvakWidth > 0 ? [pasvakWidth] : [], totalUsedCm: used, unfilledGapCm: unfilled };
  }

  // Two end-pasvakken layout: start-post, pasvak(x), post, panel×n, post, pasvak(x), end-post.
  // Mirror of _computeTwoEndPasvakken in fence_calculator.dart.
  function computeTwoEndPasvakken(length, postW, panelW) {
    if (length <= 0 || panelW <= 0 || postW < 0) {
      return { postCount: 0, standardPanelCount: 0, longPanelCount: 0, longPanelWidthCm: 0, pasvakWidthsCm: [], totalUsedCm: 0, unfilledGapCm: length < 0 ? 0 : length };
    }
    const pasvakFor = (n) => (length - (n + 3) * postW - n * panelW) / 2;
    let n = 0;
    while (pasvakFor(n) > panelW) {
      n += 1;
      if (n > 500) break;
    }
    const x = pasvakFor(n);
    if (x < MIN_PASVAK_CM) {
      return { postCount: 0, standardPanelCount: 0, longPanelCount: 0, longPanelWidthCm: 0, pasvakWidthsCm: [], totalUsedCm: 0, unfilledGapCm: length };
    }
    const postCount = n + 3;
    const used = postCount * postW + n * panelW + 2 * x;
    return { postCount, standardPanelCount: n, longPanelCount: 0, longPanelWidthCm: 0, pasvakWidthsCm: [x, x], totalUsedCm: used, unfilledGapCm: 0 };
  }

  function calculateFence(inputs) {
    const segs = inputs.segmentLengthsCm;
    const twoEnd = inputs.twoEndPasvakkenPerSegment || [];
    const totalLength = segs.reduce((a, b) => a + b, 0);
    if (totalLength <= 0) {
      return { postCount: 0, standardPanelCount: 0, longPanelCount: 0, longPanelWidthCm: 0, pasvakWidthsCm: [], gates: [], totalUsedCm: 0, unfilledGapCm: 0, totalLengthCm: 0, cornerCount: inputs.cornerCount };
    }
    if (segs.length === 1) {
      const useTwoEnd = twoEnd[0] === true && inputs.gates.length === 0;
      const r = useTwoEnd
        ? computeTwoEndPasvakken(segs[0], inputs.postWidthCm, inputs.panelWidthCm)
        : computeStraight(segs[0], inputs.postWidthCm, inputs.panelWidthCm, inputs.startWithPost, inputs.endWithPost, inputs.allowLongPanels, inputs.longPanelMaxCm, inputs.gates);
      return { ...r, gates: inputs.gates, totalLengthCm: segs[0], cornerCount: inputs.cornerCount };
    }
    let totalPosts = 0, totalStandard = 0, totalLong = 0, longWidthLatest = 0, allPasvakWidths = [], totalUnfilled = 0, usedSum = 0;
    for (let s = 0; s < segs.length; s++) {
      const isFirst = s === 0;
      const isLast = s === segs.length - 1;
      const segGates = isLast ? inputs.gates : [];
      // Toggle is ignored when gates sit on that segment (the gate claims
      // the end — a pasvak can't share that spot).
      const useTwoEnd = twoEnd[s] === true && segGates.length === 0;
      const r = useTwoEnd
        ? computeTwoEndPasvakken(segs[s], inputs.postWidthCm, inputs.panelWidthCm)
        : computeStraight(segs[s], inputs.postWidthCm, inputs.panelWidthCm,
            isFirst ? inputs.startWithPost : false,
            isLast ? inputs.endWithPost : false,
            inputs.allowLongPanels, inputs.longPanelMaxCm, segGates);
      totalPosts += r.postCount;
      totalStandard += r.standardPanelCount;
      totalLong += r.longPanelCount;
      if (r.longPanelWidthCm > longWidthLatest) longWidthLatest = r.longPanelWidthCm;
      if (r.pasvakWidthsCm && r.pasvakWidthsCm.length) allPasvakWidths.push(...r.pasvakWidthsCm);
      totalUnfilled += r.unfilledGapCm;
      usedSum += r.totalUsedCm;
    }
    return { postCount: totalPosts, standardPanelCount: totalStandard, longPanelCount: totalLong, longPanelWidthCm: longWidthLatest, pasvakWidthsCm: allPasvakWidths, gates: inputs.gates, totalUsedCm: usedSum, unfilledGapCm: totalUnfilled, totalLengthCm: totalLength, cornerCount: inputs.cornerCount };
  }

  // ---------- UI builders ----------
  function renderSegments() {
    const wrap = document.getElementById('segments');
    const total = cornerCount + 1;
    while (segments.length < total) segments.push(400);
    if (segments.length > total) segments = segments.slice(0, total);
    while (twoEndPerSegment.length < total) twoEndPerSegment.push(false);
    if (twoEndPerSegment.length > total) twoEndPerSegment = twoEndPerSegment.slice(0, total);
    const segmentBlock = (i, label, value, twoEnd) => `
      <div class="field">
        <label for="seg${i}">${label}</label>
        <input type="number" id="seg${i}" value="${value}" min="0" step="10">
      </div>
      <label class="toggle-row">
        <span class="toggle-stacked">
          <span>${STR.twoEndLabel}</span>
          <span class="toggle-sub">${STR.twoEndSub}</span>
        </span>
        <input type="checkbox" class="two-end-toggle" data-idx="${i}" ${twoEnd ? 'checked' : ''}>
      </label>`;
    if (total === 1) {
      wrap.innerHTML = segmentBlock(0, STR.totalLengthSingle, segments[0], twoEndPerSegment[0]);
    } else {
      wrap.innerHTML = segments.map((v, i) =>
        segmentBlock(i, segmentLabel(i, total), v, twoEndPerSegment[i])
      ).join('');
    }
    for (let i = 0; i < total; i++) {
      document.getElementById('seg' + i).addEventListener('input', (e) => {
        segments[i] = parseFloat(e.target.value) || 0;
        recalc();
      });
    }
    wrap.querySelectorAll('.two-end-toggle').forEach(el => {
      el.addEventListener('change', (e) => {
        const idx = parseInt(e.target.dataset.idx, 10);
        twoEndPerSegment[idx] = e.target.checked;
        recalc();
      });
    });
  }

  function renderCornerStepper() {
    document.getElementById('cornerCount').textContent = cornerCount;
  }

  function renderGates() {
    const wrap = document.getElementById('gates');
    if (gates.length === 0) {
      wrap.innerHTML = `<p class="hint" style="margin-bottom:12px;">${STR.noGates}</p>`;
    } else {
      wrap.innerHTML = gates.map((g, i) => `
        <div class="gate-card" data-id="${g.id}">
          <div class="gate-head">
            <span class="gate-title">🚪 ${STR.gatePrefix} ${i + 1}</span>
            <button type="button" class="gate-remove" data-id="${g.id}" aria-label="${STR.removeGate}">✕</button>
          </div>
          <div class="field-row">
            <div class="field">
              <label>${STR.gateWidth}</label>
              <input type="number" class="g-width" value="${g.widthCm}" min="40" step="5">
            </div>
            <div class="field">
              <label>${STR.gateBeam}</label>
              <input type="number" class="g-beam" value="${g.beamCm}" min="2" step="0.5">
            </div>
          </div>
          <label class="toggle-row">
            <span>${STR.doubleGate}</span>
            <input type="checkbox" class="g-double" ${g.isDouble ? 'checked' : ''}>
          </label>
        </div>`).join('');
    }
    // Rebind
    wrap.querySelectorAll('.gate-card').forEach(card => {
      const id = card.dataset.id;
      const g = gates.find(x => x.id === id);
      if (!g) return;
      card.querySelector('.g-width').addEventListener('input', (e) => { g.widthCm = parseFloat(e.target.value) || 0; recalc(); });
      card.querySelector('.g-beam').addEventListener('input', (e) => { g.beamCm = parseFloat(e.target.value) || 0; recalc(); });
      card.querySelector('.g-double').addEventListener('change', (e) => { g.isDouble = e.target.checked; recalc(); });
      card.querySelector('.gate-remove').addEventListener('click', () => {
        gates = gates.filter(x => x.id !== id);
        renderGates();
        recalc();
      });
    });
  }

  function addGate() {
    gates.push({ id: 'g' + (++gateSeq), widthCm: 100, beamCm: 5, isDouble: false });
    renderGates();
    recalc();
  }

  function renderLongPanelField() {
    const allowLong = document.getElementById('allowLong').checked;
    document.getElementById('longMaxField').style.display = allowLong ? '' : 'none';
  }

  // ---------- Result rendering ----------
  function renderResult(result) {
    const hero = document.getElementById('heroValue');
    const hasInput = result.totalLengthCm > 0;
    hero.textContent = hasInput
      ? STR.heroPostsPanels(result.postCount, standardPlusLongPlusPasvak(result))
      : STR.heroEmpty;

    const rows = document.getElementById('resultRows');
    if (!hasInput) { rows.innerHTML = ''; return; }
    const totalPanels = standardPlusLongPlusPasvak(result);
    const gatePosts = 2 * result.gates.length;
    const regularPosts = Math.max(result.postCount - gatePosts, 0);
    const panelW = parseFloat(document.getElementById('panelCm').value) || 180;
    const parts = [];
    parts.push(line(STR.rowRegularPosts, regularPosts));
    if (gatePosts > 0) parts.push(line(STR.rowGatePosts, gatePosts));
    if (result.cornerCount > 0) parts.push(line(STR.rowCornerPosts, result.cornerCount));
    parts.push(line(STR.rowStandardPanels(fmt(panelW)), result.standardPanelCount));
    if (result.longPanelCount > 0) parts.push(line(STR.rowLongPanels(fmt(result.longPanelWidthCm)), result.longPanelCount));
    const pasvakList = result.pasvakWidthsCm || [];
    if (pasvakList.length === 1) {
      parts.push(line(STR.rowPasvak(fmt(panelW)), fmt(pasvakList[0]) + ' cm'));
    } else if (pasvakList.length >= 2) {
      // Width is the same for a two-end layout — show it once.
      parts.push(line(STR.rowPasvakTwoEnd(fmt(panelW)), fmt(pasvakList[0]) + ' cm'));
    }
    if (totalPanels > 0) parts.push(line(STR.rowCoverCaps, totalPanels));
    for (let i = 0; i < result.gates.length; i++) {
      const g = result.gates[i];
      const span = g.widthCm + 2 * g.beamCm;
      parts.push(line(STR.rowGate(i + 1, fmt(g.widthCm), fmt(g.beamCm), g.isDouble), 1));
      parts.push(line(STR.rowGateBeam(i + 1), fmt(span) + ' cm'));
    }
    if (result.unfilledGapCm > 0) parts.push(line(STR.rowUnfilled, fmt(result.unfilledGapCm) + ' cm', true));
    rows.innerHTML = parts.join('');
  }

  function standardPlusLongPlusPasvak(r) {
    const pasvakCount = (r.pasvakWidthsCm || []).length;
    return r.standardPanelCount + r.longPanelCount + pasvakCount;
  }

  function line(label, value, isError) {
    const cls = isError ? ' class="result-row err"' : ' class="result-row"';
    return `<div${cls}><span class="k">${label}</span><span class="v">${value}</span></div>`;
  }

  function currentInputs() {
    return {
      segmentLengthsCm: segments.slice(0, cornerCount + 1),
      twoEndPasvakkenPerSegment: twoEndPerSegment.slice(0, cornerCount + 1),
      postWidthCm: parseFloat(document.getElementById('postCm').value) || 10,
      panelWidthCm: parseFloat(document.getElementById('panelCm').value) || 180,
      startWithPost: document.getElementById('startWithPost').checked,
      endWithPost: document.getElementById('endWithPost').checked,
      allowLongPanels: document.getElementById('allowLong').checked,
      longPanelMaxCm: parseFloat(document.getElementById('longMaxCm').value) || 200,
      gates: gates.map(g => ({ widthCm: g.widthCm, beamCm: g.beamCm, isDouble: g.isDouble })),
      cornerCount,
    };
  }

  function recalc() {
    const result = calculateFence(currentInputs());
    renderResult(result);
  }

  // ---------- Wiring ----------
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('cornersSubtitle').textContent = STR.cornersSubtitle;
    document.getElementById('addGateBtn').textContent = STR.addGate;
    renderCornerStepper();
    renderSegments();
    renderGates();
    renderLongPanelField();
    recalc();

    document.getElementById('cornerMinus').addEventListener('click', () => {
      if (cornerCount > 0) { cornerCount--; renderCornerStepper(); renderSegments(); recalc(); }
    });
    document.getElementById('cornerPlus').addEventListener('click', () => {
      if (cornerCount < 10) { cornerCount++; renderCornerStepper(); renderSegments(); recalc(); }
    });
    ['postCm', 'panelCm', 'longMaxCm'].forEach(id => {
      document.getElementById(id).addEventListener('input', recalc);
    });
    ['startWithPost', 'endWithPost'].forEach(id => {
      document.getElementById(id).addEventListener('change', recalc);
    });
    document.getElementById('allowLong').addEventListener('change', () => {
      renderLongPanelField(); recalc();
    });
    document.getElementById('addGateBtn').addEventListener('click', addGate);

    BE.wireShoppingList(
      'schutting',
      () => ({
        aantal_hoeken: cornerCount,
        aantal_lijnen: cornerCount + 1,
        totale_lengte_cm: segments.slice(0, cornerCount + 1).reduce((a, b) => a + b, 0),
        paal_breedte_cm: parseFloat(document.getElementById('postCm').value) || 10,
        scherm_breedte_cm: parseFloat(document.getElementById('panelCm').value) || 180,
        start_met_paal: document.getElementById('startWithPost').checked,
        eind_met_paal: document.getElementById('endWithPost').checked,
        lange_schermen_toegestaan: document.getElementById('allowLong').checked,
        aantal_poorten: gates.length,
      }),
      () => {
        const inputs = currentInputs();
        const result = calculateFence(inputs);
        if (result.totalLengthCm <= 0) return null;
        const gatePosts = 2 * result.gates.length;
        const regularPosts = Math.max(result.postCount - gatePosts, 0);
        const panelW = inputs.panelWidthCm;
        const pasvakCount = (result.pasvakWidthsCm || []).length;
        const totalPanels = result.standardPanelCount + result.longPanelCount + pasvakCount;
        const r = {
          totale_lengte_m: (result.totalLengthCm / 100).toFixed(2),
          palen_regulier_10x10_aantal: regularPosts,
          schermen_standaard_aantal: result.standardPanelCount,
          scherm_breedte_cm: panelW,
          afdekkappen_aantal: totalPanels,
          hoekpalen_aantal: result.cornerCount,
          eindpalen_zonder_sponning_voor_poort: gatePosts,
        };
        if (result.longPanelCount > 0) {
          r.schermen_lang_aantal = result.longPanelCount;
          r.scherm_lang_breedte_cm = result.longPanelWidthCm.toFixed(1);
        }
        if (pasvakCount === 1) {
          r.pasvak_breedte_cm = result.pasvakWidthsCm[0].toFixed(1);
        } else if (pasvakCount >= 2) {
          r.pasvakken_aantal = pasvakCount;
          r.pasvak_breedte_cm = result.pasvakWidthsCm[0].toFixed(1);
        }
        if (result.gates.length > 0) {
          r.poorten = result.gates.map((g, i) =>
            `${g.isDouble ? 'dubbel' : 'enkel'} ${g.widthCm}cm + ${2 * g.beamCm}cm balk`
          ).join('; ');
        }
        if (result.unfilledGapCm > 0) r.waarschuwing_niet_opgevuld_cm = result.unfilledGapCm.toFixed(1);
        return r;
      },
      () => `Schutting ${(segments.slice(0, cornerCount + 1).reduce((a, b) => a + b, 0) / 100).toFixed(1)}m${cornerCount > 0 ? ` (${cornerCount} hoek${cornerCount === 1 ? '' : 'en'})` : ''}`
    );
  });
})();
