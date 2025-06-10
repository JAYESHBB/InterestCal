function addRow() {
  const tbody = document.getElementById('tableBody');
  const row = document.createElement('tr');

  row.innerHTML = `
    <td><input type="date" class="form-control receipt-date" onchange="calculateRow(this)"></td>
    <td class="overdue-days">0</td>
    <td><input type="number" class="form-control receipt-amount" onchange="calculateRow(this)"></td>
    <td class="interest-amount">0</td>
    <td><button class="btn btn-sm btn-danger" onclick="removeRow(this)">Remove</button></td>
  `;

  tbody.appendChild(row);
}

function removeRow(btn) {
  btn.closest('tr').remove();
  updateTotals();
}

function calculateRow(input) {
  const row = input.closest('tr');
  const invoiceDate = new Date(document.getElementById('invoiceDate').value);
  const termDays = parseInt(document.getElementById('termDays').value);
  const interestRate = parseFloat(document.getElementById('interestRate').value);
  const rateType = document.getElementById('rateType').value;
  const invoiceAmount = parseFloat(document.getElementById('invoiceAmount').value);

  const receiptDateInput = row.querySelector('.receipt-date').value;
  const receiptAmount = parseFloat(row.querySelector('.receipt-amount').value) || 0;

  if (!receiptDateInput || isNaN(receiptAmount)) return;

  const receiptDate = new Date(receiptDateInput);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + termDays);

  let overdueDays = Math.max(0, Math.floor((receiptDate - dueDate) / (1000 * 60 * 60 * 24)));
  row.querySelector('.overdue-days').textContent = overdueDays;

  let interest = 0;
  if (overdueDays > 0) {
    let ratePerDay = rateType === 'monthly'
      ? (interestRate / 100) / 30
      : (interestRate / 100) / 365;
    interest = receiptAmount * ratePerDay * overdueDays;
  }

  row.querySelector('.interest-amount').textContent = Math.round(interest);
  updateTotals();
}

function updateTotals() {
  const rows = document.querySelectorAll('#tableBody tr');
  let totalReceipt = 0, totalInterest = 0;

  rows.forEach(row => {
    const receipt = parseFloat(row.querySelector('.receipt-amount')?.value || 0);
    const interest = parseFloat(row.querySelector('.interest-amount')?.textContent || 0);
    totalReceipt += receipt;
    totalInterest += interest;
  });

  document.getElementById('totalReceipt').textContent = totalReceipt.toFixed(2);
  document.getElementById('totalInterest').textContent = totalInterest.toFixed(2);

  const invoiceAmount = parseFloat(document.getElementById('invoiceAmount').value) || 0;
  const balance = invoiceAmount - totalReceipt;
  document.getElementById('balanceAmount').textContent = balance.toFixed(2);
}

function shareEmail() {
  const totalReceipt = document.getElementById('totalReceipt').textContent;
  const totalInterest = document.getElementById('totalInterest').textContent;
  const balanceAmount = document.getElementById('balanceAmount').textContent;

  const subject = 'Interest Calculation Summary';
  const body = `Total Receipt: ${totalReceipt}\nTotal Interest: ${totalInterest}\nBalance Amount: ${balanceAmount}`;

  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
function updateDueDate() {
  const invoiceDateValue = document.getElementById('invoiceDate').value;
  const termDays = parseInt(document.getElementById('termDays').value);

  if (!invoiceDateValue || isNaN(termDays)) {
    document.getElementById('dueDate').value = '';
    return;
  }

  const invoiceDate = new Date(invoiceDateValue);
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + termDays);

  const yyyy = dueDate.getFullYear();
  const mm = String(dueDate.getMonth() + 1).padStart(2, '0');
  const dd = String(dueDate.getDate()).padStart(2, '0');
  document.getElementById('dueDate').value = `${yyyy}-${mm}-${dd}`;

  // Recalculate all overdue days
  document.querySelectorAll('#tableBody tr').forEach(row => calculateRow(row));
  // Auto-update due date when invoice date or term days change


}
document.getElementById('invoiceDate').addEventListener('change', updateDueDate);
document.getElementById('termDays').addEventListener('input', updateDueDate);
