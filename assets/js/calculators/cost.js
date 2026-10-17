(function () {
  const list = document.getElementById('items');
  let seq = 0;

  function rowTemplate(id) {
    return `
      <div class="cost-row" data-id="${id}">
        <input type="text" class="desc" placeholder="Description">
        <input type="number" class="qty" placeholder="Qty" step="0.01" min="0">
        <input type="number" class="price" placeholder="Unit price" step="0.01" min="0">
        <span class="total">€ 0,00</span>
        <button type="button" class="chip remove" aria-label="Remove">✕</button>
      </div>`;
  }

  function recalc() {
    let total = 0;
    document.querySelectorAll('.cost-row').forEach(row => {
      const qty = parseFloat(row.querySelector('.qty').value) || 0;
      const price = parseFloat(row.querySelector('.price').value) || 0;
      const line = qty * price;
      row.querySelector('.total').textContent = '€ ' + line.toFixed(2).replace('.', ',');
      total += line;
    });
    const vat = BE.v('vat', 21);
    const sub = total;
    const vatAmt = sub * (vat / 100);
    BE.set('rSubtotal', '€ ' + sub.toFixed(2).replace('.', ','));
    BE.set('rVat', '€ ' + vatAmt.toFixed(2).replace('.', ','));
    BE.set('rGrand', '€ ' + (sub + vatAmt).toFixed(2).replace('.', ','));
  }

  function addRow() {
    seq++;
    list.insertAdjacentHTML('beforeend', rowTemplate(seq));
    recalc();
  }

  list.addEventListener('input', recalc);
  list.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) {
      e.target.closest('.cost-row').remove();
      recalc();
    }
  });
  document.getElementById('addItem').addEventListener('click', addRow);
  document.getElementById('vat').addEventListener('input', recalc);

  // Seed 2 rows
  addRow();
  addRow();
})();
