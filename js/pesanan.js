// pesanan.js - Logika untuk halaman manajemen pesanan

// Data pesanan default jika localStorage kosong
const defaultOrders = [
  {
    id: "FS2505001",
    date: "2025-05-12",
    customer: {
      name: "Anita Susanti",
      email: "anita@example.com",
      phone: "08123456789",
      address: "Jl. Sultan Alimuddin No. 123, Samarinda Seberang",
    },
    items: [
      { product: "Bunga Mawar", price: 100000, quantity: 2, total: 200000 },
    ],
    subtotal: 200000,
    shipping: 15000,
    total: 215000,
    status: "pending",
    payment: {
      method: "transfer",
      status: "menunggu konfirmasi",
      proof: "img/payment-proof-sample.jpg",
    },
  },
  {
    id: "FS2504212",
    date: "2025-05-10",
    customer: {
      name: "Budi Santoso",
      email: "budi@example.com",
      phone: "08234567890",
      address: "Jl. Pahlawan No. 45, Samarinda Kota",
    },
    items: [
      { product: "Bunga Lily", price: 120000, quantity: 2, total: 240000 },
      { product: "Bunga Matahari", price: 95000, quantity: 1, total: 95000 },
    ],
    subtotal: 335000,
    shipping: 15000,
    total: 350000,
    status: "processing",
    payment: {
      method: "transfer",
      status: "dibayar",
      proof: "img/payment-proof-sample.jpg",
    },
  },
  {
    id: "FS2504210",
    date: "2025-05-09",
    customer: {
      name: "Maya Wijaya",
      email: "maya@example.com",
      phone: "08345678901",
      address: "Jl. Diponegoro No. 78, Tenggarong",
    },
    items: [
      { product: "Bunga Anggrek", price: 200000, quantity: 1, total: 200000 },
    ],
    subtotal: 200000,
    shipping: 45000,
    total: 245000,
    status: "shipped",
    payment: {
      method: "qris",
      status: "dibayar",
      proof: "img/payment-proof-sample.jpg",
    },
  },
  {
    id: "FS2504208",
    date: "2025-05-08",
    customer: {
      name: "Dian Purnama",
      email: "dian@example.com",
      phone: "08456789012",
      address: "Jl. Gajah Mada No. 55, Samarinda Kota",
    },
    items: [
      { product: "Bunga Tulip", price: 150000, quantity: 1, total: 150000 },
      { product: "Bunga Mawar", price: 100000, quantity: 1, total: 100000 },
    ],
    subtotal: 250000,
    shipping: 25000,
    total: 275000,
    status: "completed",
    payment: {
      method: "transfer",
      status: "dibayar",
      proof: "img/payment-proof-sample.jpg",
    },
  },
  {
    id: "FS2504205",
    date: "2025-05-07",
    customer: {
      name: "Rudi Hermawan",
      email: "rudi@example.com",
      phone: "08567890123",
      address: "Jl. Ahmad Yani No. 123, Samarinda Seberang",
    },
    items: [
      { product: "Bunga Krisan", price: 85000, quantity: 2, total: 170000 },
    ],
    subtotal: 170000,
    shipping: 15000,
    total: 185000,
    status: "cancelled",
    payment: {
      method: "transfer",
      status: "dibatalkan",
      proof: "",
    },
  },
];

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Muat pesanan
  loadOrders();

  // Setup event listeners untuk filter dan detail
  setupEventListeners();

  // Cek apakah ada parameter ID di URL (untuk membuka detail pesanan langsung)
  checkUrlParams();
});

// Muat pesanan dari localStorage atau gunakan data default
function loadOrders() {
  let orders = JSON.parse(localStorage.getItem("orders"));

  // Jika tidak ada pesanan di localStorage, gunakan data default
  if (!orders) {
    orders = defaultOrders;
    localStorage.setItem("orders", JSON.stringify(orders));
  }

  renderOrders(orders);
}

// Render pesanan ke tabel
function renderOrders(orders) {
  const tableBody = document.getElementById("ordersTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  orders.forEach((order) => {
    const row = document.createElement("tr");

    // Format tanggal
    const orderDate = new Date(order.date);
    const formattedDate = formatTanggal(orderDate);

    row.innerHTML = `
      <td>${order.id}</td>
      <td>${formattedDate}</td>
      <td>${order.customer.name}</td>
      <td>${formatRupiah(order.total)}</td>
      <td><span class="status-badge ${order.status}">${getStatusText(
      order.status
    )}</span></td>
      <td>${getPaymentMethodText(order.payment.method)}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="viewOrderDetails('${
          order.id
        }')">
          Detail
        </button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

// Mendapatkan teks status pesanan
function getStatusText(status) {
  const statusMap = {
    pending: "Menunggu Pembayaran",
    processing: "Diproses",
    shipped: "Dikirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return statusMap[status] || status;
}

// Mendapatkan teks metode pembayaran
function getPaymentMethodText(method) {
  const methodMap = {
    transfer: "Transfer Bank",
    qris: "QRIS",
  };

  return methodMap[method] || method;
}

// Setup event listeners
function setupEventListeners() {
  // Filter berdasarkan status
  const statusFilter = document.getElementById("orderStatusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", function () {
      filterOrdersByStatus(this.value);
    });
  }

  // Filter berdasarkan tanggal
  const filterDateBtn = document.getElementById("filterDate");
  if (filterDateBtn) {
    filterDateBtn.addEventListener("click", function () {
      const dateFrom = document.getElementById("dateFrom").value;
      const dateTo = document.getElementById("dateTo").value;
      filterOrdersByDate(dateFrom, dateTo);
    });
  }

  // Pencarian pesanan
  const searchInput = document.getElementById("searchOrder");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterOrders(this.value);
    });
  }

  // Update status pesanan
  const updateStatusBtn = document.getElementById("updateStatusBtn");
  if (updateStatusBtn) {
    updateStatusBtn.addEventListener("click", function () {
      const orderId = document.getElementById("orderIdInfo").textContent;
      const newStatus = document.getElementById("orderStatusSelect").value;
      updateOrderStatus(orderId, newStatus);
    });
  }

  // Cetak invoice
  const printInvoiceBtn = document.getElementById("printInvoiceBtn");
  if (printInvoiceBtn) {
    printInvoiceBtn.addEventListener("click", function () {
      const orderId = document.getElementById("orderIdInfo").textContent;
      printInvoice(orderId);
    });
  }
}

// Cek parameter URL
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("id");

  if (orderId) {
    viewOrderDetails(orderId);
  }
}

// Tampilkan detail pesanan
function viewOrderDetails(id) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find((o) => o.id === id);

  if (!order) {
    alert("Pesanan tidak ditemukan");
    return;
  }

  document.getElementById("orderIdDetail").textContent = order.id;
  document.getElementById("orderIdInfo").textContent = order.id;

  const orderDate = new Date(order.date);
  const formattedDate = formatTanggal(orderDate);
  document.getElementById("orderDateInfo").textContent = formattedDate;

  document.getElementById("orderStatusSelect").value = order.status;

  document.getElementById("customerNameInfo").textContent = order.customer.name;
  document.getElementById("customerEmailInfo").textContent =
    order.customer.email;
  document.getElementById("customerPhoneInfo").textContent =
    order.customer.phone;
  document.getElementById("customerAddressInfo").textContent =
    order.customer.address;

  const orderItemsList = document.getElementById("orderItemsList");
  orderItemsList.innerHTML = "";

  order.items.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.product}</td>
      <td>${formatRupiah(item.price)}</td>
      <td>${item.quantity}</td>
      <td>${formatRupiah(item.total)}</td>
    `;
    orderItemsList.appendChild(row);
  });

  document.getElementById("orderSubtotal").textContent = formatRupiah(
    order.subtotal
  );
  document.getElementById("orderShipping").textContent = formatRupiah(
    order.shipping
  );
  document.getElementById("orderTotal").textContent = formatRupiah(order.total);

  document.getElementById("paymentMethodInfo").textContent =
    getPaymentMethodText(order.payment.method);
  document.getElementById("paymentStatusInfo").textContent =
    order.payment.status;

  if (order.payment.proof) {
    document.getElementById("paymentProofImg").src = order.payment.proof;
    document.getElementById("paymentProofImg").style.display = "block";
  } else {
    document.getElementById("paymentProofImg").src = "img/placeholder.jpg";
    document.getElementById("paymentProofImg").style.display = "block";
  }

  const orderDetailModal = new bootstrap.Modal(
    document.getElementById("orderDetailModal")
  );
  orderDetailModal.show();
}

// Update status pesanan
function updateOrderStatus(id, newStatus) {
  let orders = JSON.parse(localStorage.getItem("orders")) || [];
  const orderIndex = orders.findIndex((o) => o.id === id);

  if (orderIndex === -1) {
    alert("Pesanan tidak ditemukan");
    return;
  }

  orders[orderIndex].status = newStatus;

  localStorage.setItem("orders", JSON.stringify(orders));

  renderOrders(orders);

  alert(
    `Status pesanan ${id} berhasil diubah menjadi ${getStatusText(newStatus)}`
  );

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("orderDetailModal")
  );
  modal.hide();
}

// Filter pesanan berdasarkan status
function filterOrdersByStatus(status) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (status === "all") {
    renderOrders(orders);
    return;
  }

  const filteredOrders = orders.filter((order) => order.status === status);

  renderOrders(filteredOrders);
}

// Filter pesanan berdasarkan tanggal
function filterOrdersByDate(dateFrom, dateTo) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (!dateFrom && !dateTo) {
    renderOrders(orders);
    return;
  }

  let filteredOrders = [...orders];

  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.date) >= fromDate
    );
  }

  if (dateTo) {
    const toDate = new Date(dateTo);
    toDate.setHours(23, 59, 59);
    filteredOrders = filteredOrders.filter(
      (order) => new Date(order.date) <= toDate
    );
  }

  renderOrders(filteredOrders);
}

// Filter pesanan berdasarkan keyword
function filterOrders(keyword) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];

  if (!keyword || keyword.trim() === "") {
    renderOrders(orders);
    return;
  }

  const searchText = keyword.toLowerCase();
  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchText) ||
      order.customer.name.toLowerCase().includes(searchText) ||
      order.customer.email.toLowerCase().includes(searchText)
  );

  renderOrders(filteredOrders);
}

// Cetak invoice
function printInvoice(id) {
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const order = orders.find((o) => o.id === id);

  if (!order) {
    alert("Pesanan tidak ditemukan");
    return;
  }

  const invoiceWindow = window.open("", "_blank");

  let invoiceContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice #${order.id}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info-item { flex: 1; }
            .invoice-info-title { font-weight: bold; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; }
            @media print {
                body { padding: 0; }
                .no-print { display: none; }
            }
        </style>
    </head>
    <body>
        <div class="invoice-header">
            <div class="invoice-title">INVOICE</div>
            <div>Flowers Shop</div>
            <div>Jl. Sultan Alimuddin, Samarinda Seberang</div>
        </div>
        
        <div class="invoice-info">
            <div class="invoice-info-item">
                <div class="invoice-info-title">Ditagihkan Kepada:</div>
                <div>${order.customer.name}</div>
                <div>${order.customer.address}</div>
                <div>${order.customer.phone}</div>
                <div>${order.customer.email}</div>
            </div>
            <div class="invoice-info-item">
                <div class="invoice-info-title">Detail Invoice:</div>
                <div>Invoice #: ${order.id}</div>
                <div>Tanggal: ${formatTanggal(new Date(order.date))}</div>
                <div>Status: ${getStatusText(order.status)}</div>
                <div>Metode Pembayaran: ${getPaymentMethodText(
                  order.payment.method
                )}</div>
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Produk</th>
                    <th>Harga</th>
                    <th>Jumlah</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
    `;

  order.items.forEach((item) => {
    invoiceContent += `
                <tr>
                    <td>${item.product}</td>
                    <td>${formatRupiah(item.price)}</td>
                    <td>${item.quantity}</td>
                    <td>${formatRupiah(item.total)}</td>
                </tr>
        `;
  });

  invoiceContent += `
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3" style="text-align: right;">Subtotal:</td>
                    <td>${formatRupiah(order.subtotal)}</td>
                </tr>
                <tr>
                    <td colspan="3" style="text-align: right;">Ongkos Kirim:</td>
                    <td>${formatRupiah(order.shipping)}</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3" style="text-align: right;">Total:</td>
                    <td>${formatRupiah(order.total)}</td>
                </tr>
            </tfoot>
        </table>
        
        <div class="footer">
            <p>Terima kasih telah berbelanja di Flowers Shop!</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()">Cetak Invoice</button>
        </div>
    </body>
    </html>
    `;

  invoiceWindow.document.open();
  invoiceWindow.document.write(invoiceContent);
  invoiceWindow.document.close();
}

// Expose functions untuk digunakan di HTML
window.viewOrderDetails = viewOrderDetails;
window.updateOrderStatus = updateOrderStatus;
window.filterOrdersByStatus = filterOrdersByStatus;
window.filterOrdersByDate = filterOrdersByDate;
window.filterOrders = filterOrders;
window.printInvoice = printInvoice;
