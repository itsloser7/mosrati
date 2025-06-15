
document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.href.endsWith(".html") === false) {
    const form = document.querySelector("form");
    if (form) {
      form.addEventListener("submit", login);
    }
  } else if (window.location.pathname.includes("dashboard.html")) {
    updateStats('all');
  }
});

let operations = JSON.parse(localStorage.getItem('operations')) || [];

function saveToStorage() {
  localStorage.setItem('operations', JSON.stringify(operations));
}

function login(event) {
  event.preventDefault();
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;
  if (user === '1234' && pass === '1234') {
    window.location.href = 'dashboard.html';
  } else {
    alert('بيانات الدخول غير صحيحة');
  }
}

function clearForm() {
  document.getElementById('name').value = '';
  document.getElementById('carType').value = '';
  document.getElementById('operationType').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('status').value = 'قيد التنفيذ';
  document.getElementById('operationCost').value = '';
  document.getElementById('materialCost').value = '';
  document.getElementById('laborCost').value = '';
}

function showAddForm() {
  document.getElementById('addForm').style.display = 'block';
  document.getElementById('operationsList').style.display = 'none';
  clearForm();
}

function showOperations() {
  document.getElementById('addForm').style.display = 'none';
  document.getElementById('operationsList').style.display = 'block';
  displayOperations();
}

function goBack() {
  document.getElementById('addForm').style.display = 'none';
  document.getElementById('operationsList').style.display = 'none';
}

function addOperation() {
  const name = document.getElementById('name').value;
  const carType = document.getElementById('carType').value;
  const operationType = document.getElementById('operationType').value;
  const phone = document.getElementById('phone').value;
  const status = document.getElementById('status').value;
  const operationCost = parseFloat(document.getElementById('operationCost').value) || 0;
  const materialCost = parseFloat(document.getElementById('materialCost').value) || 0;
  const laborCost = parseFloat(document.getElementById('laborCost').value) || 0;
  const profit = operationCost - (materialCost + laborCost);
  const date = new Date().toISOString();

  const op = {
    name, carType, operationType, phone, status,
    operationCost, materialCost, laborCost, profit, date
  };
  operations.push(op);
  saveToStorage();
  updateStats();
  alert('تمت إضافة العملية بنجاح');
  clearForm();
}

function displayOperations(data = operations) {
  const container = document.getElementById('cardsContainer');
  container.innerHTML = '';
  data.forEach((op, index) => {
    container.innerHTML += `
      <div class="card">
        <p><strong>الاسم:</strong> ${op.name}</p>
        <p><strong>السيارة:</strong> ${op.carType}</p>
        <p><strong>العملية:</strong> ${op.operationType}</p>
        <p><strong>الهاتف:</strong> ${op.phone}</p>
        <p><strong>الحالة:</strong> ${op.status}</p>
        <p><strong>تكلفة العملية:</strong> ${op.operationCost} د.ل</p>
        <p><strong>المواد:</strong> ${op.materialCost} د.ل</p>
        <p><strong>اليد العاملة:</strong> ${op.laborCost} د.ل</p>
        <p><strong>صافي الربح:</strong> ${op.profit.toFixed(2)} د.ل</p>
        <button onclick="editOperation(${index})">تعديل</button>
        <button onclick="deleteOperation(${index})">حذف</button>
        <button onclick="printInvoice(${index})">فاتورة</button>
      </div>
    `;
  });
}

function deleteOperation(index) {
  operations.splice(index, 1);
  saveToStorage();
  displayOperations();
  updateStats();
}

function editOperation(index) {
  const op = operations[index];
  document.getElementById('name').value = op.name;
  document.getElementById('carType').value = op.carType;
  document.getElementById('operationType').value = op.operationType;
  document.getElementById('phone').value = op.phone;
  document.getElementById('status').value = op.status;
  document.getElementById('operationCost').value = op.operationCost;
  document.getElementById('materialCost').value = op.materialCost;
  document.getElementById('laborCost').value = op.laborCost;
  operations.splice(index, 1);
  saveToStorage();
  updateStats();
  showAddForm();
}

function updateStats(filter = 'all') {
  let filtered = operations;
  const now = new Date();

  if (filter === 'daily') {
    filtered = operations.filter(op => new Date(op.date).toDateString() === now.toDateString());
  } else if (filter === 'weekly') {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    filtered = operations.filter(op => new Date(op.date) > weekAgo);
  } else if (filter === 'monthly') {
    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);
    filtered = operations.filter(op => new Date(op.date) > monthAgo);
  }

  if (document.getElementById('operationCount')) {
    document.getElementById('operationCount').innerText = filtered.length;
    const total = filtered.reduce((sum, op) => sum + op.operationCost, 0);
    document.getElementById('totalCost').innerText = total.toFixed(2);
    const profit = filtered.reduce((sum, op) => sum + op.profit, 0);
    document.getElementById('profit').innerText = profit.toFixed(2);
  }
}

function searchOperations() {
  const keyword = document.getElementById('searchInput').value.toLowerCase();
  const filtered = operations.filter(op =>
    op.name.toLowerCase().includes(keyword) ||
    op.phone.includes(keyword)
  );
  displayOperations(filtered);
}

function printInvoice(index) {
  const op = operations[index];
  const win = window.open('', '_blank');
  win.document.write(`
    <html><head><title>فاتورة</title></head>
    <body style="font-family: Cairo, sans-serif; direction: rtl; padding: 40px; font-size: 18px; text-align:center; position: relative;">
      <img src="logo.png" style="width: 100px; margin-bottom: 20px;">
      <div style="position:absolute; top:30%; left:35%; opacity: 0.04; z-index:0;">
        <img src="logo.png" style="width: 300px;">
      </div>
      <div style="position: relative; z-index:1;">
        <h2>مركز مهندس السيارات - فاتورة عملية</h2>
        <table border='1' cellspacing='0' cellpadding='10' style='width:80%; margin:auto; border-collapse: collapse; background-color:white;'>
          <tr><th style="width:40%;">الاسم</th><td>${op.name}</td></tr>
          <tr><th>رقم الهاتف</th><td>${op.phone}</td></tr>
          <tr><th>نوع السيارة</th><td>${op.carType}</td></tr>
          <tr><th>نوع العملية</th><td>${op.operationType}</td></tr>
          <tr><th>إجمالي التكلفة</th><td>${op.operationCost} د.ل</td></tr>
        </table>
        <p style="margin-top: 60px; font-size: 16px;">شكراً لزيارتكم، لأي استفسار يمكنكم الاتصال على 0941501212</p>
      </div>
    </body></html>
  `);
  win.document.close();
  win.print();
}
