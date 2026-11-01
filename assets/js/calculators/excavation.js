(function () {
  const isNl = BE.isNl();
  const T = isNl ? {
    empty: 'Vul afmetingen in', loose: 'Losse grond (na opbulking)', skips: (s) => `Containers van ${s} m³`,
    weight: 'Gewicht', trucks: (t) => `Vrachten van ${t} ton`, cost: 'Kosten containers', solid: 'Vaste grond', t: 'ton',
  } : {
    empty: 'Enter dimensions', loose: 'Loose soil (after bulking)', skips: (s) => `Skips of ${s} m³`,
    weight: 'Weight', trucks: (t) => `Truck loads of ${t} t`, cost: 'Skip cost', solid: 'Solid soil', t: 't',
  };
  let last = null;

  function recalc() {
    const shape = BE.activeChip('shapeChips') || 'pit';
    const d = BE.v('d', 0);
    const vol = shape === 'round'
      ? Math.PI * Math.pow(BE.v('dia', 0) / 2, 2) * d * Math.max(BE.v('count', 1), 1)
      : BE.v('l', 0) * BE.v('w', 0) * d;
    const hero = document.getElementById('heroValue');
    const rows = document.getElementById('resultRows');
    if (vol <= 0) { hero.textContent = T.empty; rows.innerHTML = ''; last = null; return; }
    const loose = vol * (1 + BE.v('swell', 0) / 100);
    const tonnes = vol * BE.v('density', 0);
    const cont = BE.v('cont', 0), truck = BE.v('truck', 0), cp = BE.v('contPrice', 0);
    const skips = cont > 0 ? Math.ceil(loose / cont) : 0;
    hero.innerHTML = BE.num(vol, 2) + ' m<sup>3</sup>';
    rows.innerHTML = BE.rows([
      [T.solid, BE.num(vol, 2) + ' m³'],
      [T.loose, BE.num(loose, 2) + ' m³', 'total'],
      skips > 0 && [T.skips(BE.num(cont, 0)), skips, 'total'],
      tonnes > 0 && [T.weight, BE.num(tonnes, 1) + ' ' + T.t],
      truck > 0 && tonnes > 0 && [T.trucks(BE.num(truck, 0)), Math.ceil(tonnes / truck)],
      skips > 0 && cp > 0 && [T.cost, BE.money(skips * cp)],
    ]);
    last = { graafvolume_m3: vol.toFixed(2), los_m3: loose.toFixed(2), containers: skips, ton: tonnes.toFixed(1) };
  }

  document.addEventListener('DOMContentLoaded', () => {
    BE.chip('shapeChips', (s) => {
      BE.show('boxFields', s !== 'round');
      BE.show('roundFields', s === 'round');
      if (s === 'trench') { document.getElementById('w').value = 0.4; document.getElementById('l').value = 20; }
    });
    BE.wireCalc(recalc, ['l', 'w', 'dia', 'count', 'd', 'swell', 'density', 'cont', 'contPrice', 'truck']);
    BE.markStaleOn('.chip');
    BE.wireShoppingList('grondwerk', () => ({ vorm: BE.activeChip('shapeChips') }), () => last,
      () => `${isNl ? 'Grondwerk' : 'Excavation'} ${last ? last.graafvolume_m3 : ''} m³`);
  });
})();
