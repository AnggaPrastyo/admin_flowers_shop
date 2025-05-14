// dashboard.js - Logika untuk halaman dashboard

document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi grafik
  initCharts();

  // Muat data pesanan terbaru
  loadRecentOrders();
});

// Inisialisasi grafik
function initCharts() {
  // Grafik penjualan
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  new Chart(salesCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
      datasets: [
        {
          label: "Penjualan (Rp)",
          data: [1500000, 1800000, 2200000, 1900000, 2500000, 2800000],
          fill: false,
          borderColor: "#89aaaf",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });

  // Grafik produk terlaris
  const productsCtx = document.getElementById("productsChart").getContext("2d");
  new Chart(productsCtx, {
    type: "doughnut",
    data: {
      labels: [
        "Bunga Mawar",
        "Bunga Lily",
        "Bunga Matahari",
        "Bunga Tulip",
        "Bunga Anggrek",
      ],
      datasets: [
        {
          data: [35, 20, 15, 15, 15],
          backgroundColor: [
            "#89aaaf",
            "#f3c9b1",
            "#36486b",
            "#a6c1c5",
            "#6d878c",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

// Muat data pesanan terbaru
function loadRecentOrders() {
  // Contoh data pesanan (dalam implementasi sebenarnya, ini akan diambil dari localStorage atau API)
  const recentOrders = [
    {
      id: "FS2505001",
      date: "2025-05-12",
      customer: "Anita Susanti",
      total: 215000,
      status: "pending",
    },
    {
      id: "FS2504212",
      date: "2025-05-10",
      customer: "Budi Santoso",
      total: 350000,
      status: "processing",
    },
    {
      id: "FS2504210",
      date: "2025-05-09",
      customer: "Maya Wijaya",
      total: 245000,
      status: "shipped",
    },
  ];

  const ordersTableBody = document.getElementById("recent-orders");
  if (!ordersTableBody) return;

  ordersTableBody.innerHTML = "";

  recentOrders.forEach((order) => {
    const row = document.createElement("tr");

    // Format tanggal
    const orderDate = new Date(order.date);
    const formattedDate = formatTanggal(orderDate);

    // Status text
    const statusText = getStatusText(order.status);

    row.innerHTML = `
      <td>${order.id}</td>
      <td>${formattedDate}</td>
      <td>${order.customer}</td>
      <td>${formatRupiah(order.total)}</td>
      <td><span class="status-badge ${order.status}">${statusText}</span></td>
      <td>
        <a href="pesanan.html?id=${
          order.id
        }" class="btn btn-primary btn-sm">Detail</a>
      </td>
    `;

    ordersTableBody.appendChild(row);
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
