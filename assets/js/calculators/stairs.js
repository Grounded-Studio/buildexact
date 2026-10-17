(function () {
  function recalc() {
    const heightCm = BE.v('height', 0);
    const targetRiser = BE.v('riser', 17);
    const treadCm = BE.v('tread', 26);
    const widthCm = BE.v('swidth', 90);
    const stringers = BE.v('stringers', 2);
    const includeRisers = BE.checked('includeRisers');
    const handrail = BE.checked('handrail');
    const handrailOverride = BE.v('handrailM', 0);
    const balusterCm = BE.v('baluster', 12);

    const steps = Math.max(1, Math.round(heightCm / targetRiser));
    const actualRiser = heightCm / steps;
    const totalRun = steps * treadCm;
    const slopeDeg = totalRun > 0 ? Math.atan(heightCm / totalRun) * 180 / Math.PI : 0;
    const stringerM = Math.sqrt(Math.pow(heightCm / 100, 2) + Math.pow(totalRun / 100, 2));
    const handrailM = handrailOverride > 0 ? handrailOverride : stringerM;
    const balusters = handrail && balusterCm > 0 ? Math.ceil((handrailM * 100) / balusterCm) + 1 : 0;

    BE.set('rTreads', steps);
    BE.set('rRiser', actualRiser, 2);
    BE.set('rRun', totalRun, 1);
    BE.set('rSlope', slopeDeg, 1);
    BE.set('rRisers', includeRisers ? steps : '—');
    BE.set('rStringers', `${stringers} × ${stringerM.toFixed(2)} m`);
    BE.set('rHandrail', handrail ? handrailM.toFixed(2) + ' m' : '—');
    BE.set('rBalusters', handrail ? balusters : '—');
  }
  BE.bindAll(['height','riser','tread','swidth','stringers','handrailM','baluster'], recalc);
  document.getElementById('includeRisers').addEventListener('change', recalc);
  document.getElementById('handrail').addEventListener('change', recalc);
})();
