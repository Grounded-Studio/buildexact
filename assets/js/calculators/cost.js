(function () {
  const isNl = (document.documentElement.lang || '').toLowerCase().startsWith('nl');
  const STR = isNl ? {
    desc: 'Omschrijving', qty: 'Aantal', unit: 'Eenheid', price: 'Prijs per stuk', total: 'Totaal',
    rowDesc: 'Omschrijving', rowQty: 'Aantal', rowUnit: 'Eenheid', rowPrice: 'Prijs', rowTotal: 'Totaal',
    rowSubtotal: 'Subtotaal', rowDiscount: 'Korting', rowAfterDiscount: 'Subtotaal na korting', rowVat: 'BTW',
    heroEmpty: '€ —',
  } : {
    desc: 'Description', qty: 'Qty', unit: 'Unit', price: 'Unit price', total: 'Total',
    rowSubtotal: 'Subtotal', rowDiscount: 'Discount', rowAfterDiscount: 'Subtotal after discount', rowVat: 'VAT',
    heroEmpty: '€ —',
  };
  let items = [{ desc: '', qty: 1, unit: isNl ? 'stuks' : 'pcs', price: 0 }];
  let seq = 0;

  function fmtMoney(v) {
    const s = v.toFixed(2);
    return isNl ? '€ ' + s.replace('.', ',') : '€ ' + s;
  }

  function renderItems() {
    const wrap = document.getElementById('items');
    wrap.innerHTML = items.map((it, i) => `
      <div class="gate-card" data-idx="${i}">
        <div class="gate-head">
          <span class="gate-title">${isNl ? 'Regel' : 'Line'} ${i + 1}</span>
          <button type="button" class="gate-remove" data-rm="${i}" aria-label="Remove">✕</button>
        </div>
        <div class="field"><label>${STR.desc}</label><input type="text" class="i-desc" value="${it.desc.replace(/"/g, '&quot;')}" placeholder="${isNl ? 'Bijv. Tegels leggen' : 'e.g. Tiling'}"></div>
        <div class="field-row">
          <div class="field"><label>${STR.qty}</label><input type="number" class="i-qty" value="${it.qty}" min="0" step="0.1"></div>
          <div class="field"><label>${STR.unit}</label><input type="text" class="i-unit" value="${it.unit.replace(/"/g, '&quot;')}"></div>
        </div>
        <div class="field"><label>${STR.price} (€)</label><input type="number" class="i-price" value="${it.price}" min="0" step="0.01"></div>
      </div>
    `).join('');
    wrap.querySelectorAll('.gate-card').forEach(card => {
      const i = +card.dataset.idx;
      card.querySelector('.i-desc').addEventListener('input', e => { items[i].desc = e.target.value; recalc(); });
      card.querySelector('.i-qty').addEventListener('input', e => { items[i].qty = +e.target.value || 0; recalc(); });
      card.querySelector('.i-unit').addEventListener('input', e => { items[i].unit = e.target.value; });
      card.querySelector('.i-price').addEventListener('input', e => { items[i].price = +e.target.value || 0; recalc(); });
      card.querySelector('.gate-remove').addEventListener('click', () => {
        if (items.length > 1) { items.splice(i, 1); renderItems(); recalc(); }
      });
    });
  }

  function recalc() {
    let subtotal = 0;
    items.forEach(it => { subtotal += it.qty * it.price; });
    const disc = BE.v('discount', 0);
    const vat = BE.v('vat', 21);
    const discountAmt = subtotal * (disc / 100);
    const afterDisc = subtotal - discountAmt;
    const vatAmt = afterDisc * (vat / 100);
    const grand = afterDisc + vatAmt;
    const hero = document.getElementById('heroValue');
    hero.textContent = grand > 0 ? fmtMoney(grand) : STR.heroEmpty;
    const rows = document.getElementById('resultRows');
    if (subtotal <= 0) { rows.innerHTML = ''; return; }
    const parts = [`<div class="result-row"><span class="k">${STR.rowSubtotal}</span><span class="v">${fmtMoney(subtotal)}</span></div>`];
    if (disc > 0) {
      parts.push(`<div class="result-row"><span class="k">${STR.rowDiscount} (${disc}%)</span><span class="v">− ${fmtMoney(discountAmt)}</span></div>`);
      parts.push(`<div class="result-row"><span class="k">${STR.rowAfterDiscount}</span><span class="v">${fmtMoney(afterDisc)}</span></div>`);
    }
    parts.push(`<div class="result-row"><span class="k">${STR.rowVat} (${vat}%)</span><span class="v">${fmtMoney(vatAmt)}</span></div>`);
    rows.innerHTML = parts.join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderItems();
    recalc();
    document.getElementById('addItem').addEventListener('click', () => {
      items.push({ desc: '', qty: 1, unit: isNl ? 'stuks' : 'pcs', price: 0 });
      renderItems();
      recalc();
    });
    document.getElementById('discount').addEventListener('input', recalc);
    document.getElementById('vat').addEventListener('input', recalc);
  });
})();
