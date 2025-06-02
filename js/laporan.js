// js/laporan-optimized.js - Lightweight & Performance Optimized

// ====================================
// GLOBAL VARIABLES
// ====================================

let salesChart = null;
let productsChart = null;
let reportData = null;
let isLoading = false;

// ====================================
// INITIALIZATION
// ====================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("📊 Laporan optimized initializing...");

  // Prevent auto-scroll issues
  document.body.style.overflow = "auto";
  document.documentElement.style.scrollBehavior = "auto";

  // Setup event listeners first
  setupEventListeners();

  // Load data with delay to prevent lag
  setTimeout(() => {
    loadAndProcessData();
  }, 500);

  console.log("✅ Laporan optimized initialized");
});

// ====================================
// EVENT LISTENERS
// ====================================

function setupEventListeners() {
  // Generate report button
  const generateBtn = document.getElementById("generateReport");
  if (generateBtn) {
    generateBtn.addEventListener("click", function () {
      if (!isLoading) {
        generateReport();
      }
    });
  }

  // Export button
  const exportBtn = document.getElementById("exportReport");
  if (exportBtn) {
    exportBtn.addEventListener("click", exportReport);
  }

  // Period selector
  const reportPeriod = document.getElementById("reportPeriod");
  if (reportPeriod) {
    reportPeriod.addEventListener("change", function () {
      if (!isLoading) {
        generateReport();
      }
    });
  }

  // Chart buttons
  document.querySelectorAll("[data-chart]").forEach((btn) => {
    btn.addEventListener("click", function () {
      updateActiveButton(this, "[data-chart]");
    });
  });
}

function updateActiveButton(clickedBtn, selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.remove("active");
  });
  clickedBtn.classList.add("active");
}

// ====================================
// DATA PROCESSING
// ====================================

function loadAndProcessData() {
  if (isLoading) return;

  isLoading = true;
  console.log("📦 Loading report data...");

  try {
    // Get data from localStorage
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");

    // Process data
    reportData = processReportData(orders, products, customers);

    // Update UI
    updateQuickStats();
    updateTables();

    // Initialize charts after data is ready
    setTimeout(() => {
      initializeCharts();
      isLoading = false;
    }, 200);
  } catch (error) {
    console.error("❌ Error loading data:", error);
    isLoading = false;
    showNotification("Gagal memuat data laporan", "danger");
  }
}

function processReportData(orders, products, customers) {
  console.log("⚙️ Processing report data...");

  // Calculate basic metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const newCustomers = customers.length; // Simplified

  // Product analysis
  const productSales = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!productSales[item.product]) {
        productSales[item.product] = { quantity: 0, revenue: 0 };
      }
      productSales[item.product].quantity += item.quantity;
      productSales[item.product].revenue += item.total;
    });
  });

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  // Customer analysis
  const customerSales = {};
  orders.forEach((order) => {
    const email = order.customer.email;
    if (!customerSales[email]) {
      customerSales[email] = {
        name: order.customer.name,
        orderCount: 0,
        totalSpent: 0,
      };
    }
    customerSales[email].orderCount += 1;
    customerSales[email].totalSpent += order.total;
  });

  const topCustomers = Object.values(customerSales)
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // Geographic analysis (simplified)
  const geoSales = {
    "Samarinda Seberang": { orders: 0, revenue: 0 },
    "Samarinda Kota": { orders: 0, revenue: 0 },
    Tenggarong: { orders: 0, revenue: 0 },
    Lainnya: { orders: 0, revenue: 0 },
  };

  orders.forEach((order) => {
    const address = order.customer.address.toLowerCase();
    let area = "Lainnya";

    if (address.includes("seberang")) area = "Samarinda Seberang";
    else if (address.includes("kota")) area = "Samarinda Kota";
    else if (address.includes("tenggarong")) area = "Tenggarong";

    geoSales[area].orders += 1;
    geoSales[area].revenue += order.total;
  });

  const geoAnalysis = Object.entries(geoSales)
    .map(([area, data]) => ({ area, ...data }))
    .filter((item) => item.orders > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // Category analysis (simplified)
  const categoryMap = {
    "Bunga Potong": { sold: 0, revenue: 0 },
    "Bunga Pot": { sold: 0, revenue: 0 },
    Aksesoris: { sold: 0, revenue: 0 },
  };

  orders.forEach((order) => {
    order.items.forEach((item) => {
      // Simplified category detection
      let category = "Bunga Potong";
      if (item.product.toLowerCase().includes("pot")) category = "Bunga Pot";
      else if (item.product.toLowerCase().includes("aksesoris"))
        category = "Aksesoris";

      categoryMap[category].sold += item.quantity;
      categoryMap[category].revenue += item.total;
    });
  });

  const categoryAnalysis = Object.entries(categoryMap)
    .map(([category, data]) => ({ category, ...data }))
    .filter((item) => item.sold > 0)
    .sort((a, b) => b.revenue - a.revenue);

  // Sales trend (last 7 days)
  const salesTrend = generateSimpleTrend(orders);

  return {
    metrics: {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      newCustomers,
    },
    topProducts,
    topCustomers,
    geoAnalysis,
    categoryAnalysis,
    salesTrend,
  };
}

function generateSimpleTrend(orders) {
  const last7Days = [];
  const trendData = {};

  // Generate last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    last7Days.push(dateStr);
    trendData[dateStr] = 0;
  }

  // Count sales per day
  orders.forEach((order) => {
    if (trendData.hasOwnProperty(order.date)) {
      trendData[order.date] += order.total;
    }
  });

  return {
    labels: last7Days.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString("id-ID", { weekday: "short" });
    }),
    data: last7Days.map((date) => trendData[date]),
  };
}

// ====================================
// UI UPDATES
// ====================================

function updateQuickStats() {
  if (!reportData) return;

  const { metrics } = reportData;

  document.getElementById("totalRevenue").textContent = formatRupiah(
    metrics.totalRevenue
  );
  document.getElementById("totalOrders").textContent = metrics.totalOrders;
  document.getElementById("avgOrderValue").textContent = formatRupiah(
    metrics.avgOrderValue
  );
  document.getElementById("newCustomers").textContent = metrics.newCustomers;

  // Financial summary
  document.getElementById("grossRevenue").textContent = formatRupiah(
    metrics.totalRevenue
  );
  document.getElementById("financialOrders").textContent = metrics.totalOrders;
  document.getElementById("financialAvg").textContent = formatRupiah(
    metrics.avgOrderValue
  );
}

function updateTables() {
  if (!reportData) return;

  updateBestProductsTable();
  updateTopCustomersTable();
  updateGeoAnalysisTable();
  updateCategoryTable();
}

function updateBestProductsTable() {
  const tbody = document.getElementById("bestProductsBody");
  tbody.innerHTML = "";

  if (reportData.topProducts.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center py-3 text-muted">Tidak ada data</td></tr>';
    return;
  }

  reportData.topProducts.forEach((product, index) => {
    const row = `
      <tr>
        <td><span class="badge bg-primary">#${index + 1}</span></td>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>${formatRupiah(product.revenue)}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function updateTopCustomersTable() {
  const tbody = document.getElementById("topCustomersBody");
  tbody.innerHTML = "";

  if (reportData.topCustomers.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="4" class="text-center py-3 text-muted">Tidak ada data</td></tr>';
    return;
  }

  reportData.topCustomers.forEach((customer, index) => {
    const row = `
      <tr>
        <td><span class="badge bg-success">#${index + 1}</span></td>
        <td>${customer.name}</td>
        <td>${customer.orderCount}</td>
        <td>${formatRupiah(customer.totalSpent)}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function updateGeoAnalysisTable() {
  const tbody = document.getElementById("geoAnalysisBody");
  tbody.innerHTML = "";

  if (reportData.geoAnalysis.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="text-center py-3 text-muted">Tidak ada data</td></tr>';
    return;
  }

  reportData.geoAnalysis.forEach((geo) => {
    const row = `
      <tr>
        <td>${geo.area}</td>
        <td>${geo.orders}</td>
        <td>${formatRupiah(geo.revenue)}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

function updateCategoryTable() {
  const tbody = document.getElementById("categoryBody");
  tbody.innerHTML = "";

  if (reportData.categoryAnalysis.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="3" class="text-center py-3 text-muted">Tidak ada data</td></tr>';
    return;
  }

  reportData.categoryAnalysis.forEach((category) => {
    const row = `
      <tr>
        <td>${category.category}</td>
        <td>${category.sold}</td>
        <td>${formatRupiah(category.revenue)}</td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// ====================================
// CHARTS (OPTIMIZED)
// ====================================

function initializeCharts() {
  if (!reportData) return;

  console.log("📊 Initializing optimized charts...");

  // Destroy existing charts to prevent memory leaks
  if (salesChart) {
    salesChart.destroy();
  }
  if (productsChart) {
    productsChart.destroy();
  }

  createSalesChart();
  createProductsChart();
}

function createSalesChart() {
  const canvas = document.getElementById("salesTrendChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  salesChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: reportData.salesTrend.labels,
      datasets: [
        {
          label: "Penjualan",
          data: reportData.salesTrend.data,
          borderColor: "#89aaaf",
          backgroundColor: "rgba(137, 170, 175, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0, // Disable animation for performance
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(0,0,0,0.1)",
          },
          ticks: {
            callback: function (value) {
              return "Rp " + value.toLocaleString();
            },
          },
        },
      },
    },
  });
}

function createProductsChart() {
  const canvas = document.getElementById("topProductsChart");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");

  const colors = ["#89aaaf", "#f3c9b1", "#36486b", "#a6c1c5", "#6d878c"];

  productsChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: reportData.topProducts.map((p) => p.name),
      datasets: [
        {
          data: reportData.topProducts.map((p) => p.quantity),
          backgroundColor: colors.slice(0, reportData.topProducts.length),
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 0, // Disable animation for performance
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            fontSize: 12,
            padding: 10,
          },
        },
      },
    },
  });
}

// ====================================
// ACTIONS
// ====================================

function generateReport() {
  if (isLoading) return;

  console.log("📊 Generating report...");
  showNotification("Menggenerate laporan...", "info");

  // Reload and process data
  loadAndProcessData();

  showNotification("Laporan berhasil di-generate!", "success");
}

function exportReport() {
  if (!reportData) {
    showNotification("Tidak ada data untuk di-export", "warning");
    return;
  }

  console.log("📄 Exporting report...");

  // Simple export - create a summary
  const summary = createReportSummary();

  // Create printable window
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Laporan Penjualan - Flowers Shop</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 20px 0; }
        .stat-item { text-align: center; padding: 10px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      ${summary}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();

  showNotification("Report berhasil di-export!", "success");
}

function createReportSummary() {
  const { metrics, topProducts, topCustomers } = reportData;

  return `
    <div class="header">
      <h1>Laporan Penjualan</h1>
      <h2>Flowers Shop</h2>
      <p>Generated: ${new Date().toLocaleDateString("id-ID")}</p>
    </div>
    
    <div class="stats">
      <div class="stat-item">
        <h3>${formatRupiah(metrics.totalRevenue)}</h3>
        <p>Total Revenue</p>
      </div>
      <div class="stat-item">
        <h3>${metrics.totalOrders}</h3>
        <p>Total Orders</p>
      </div>
      <div class="stat-item">
        <h3>${formatRupiah(metrics.avgOrderValue)}</h3>
        <p>Avg Order</p>
      </div>
      <div class="stat-item">
        <h3>${metrics.newCustomers}</h3>
        <p>New Customers</p>
      </div>
    </div>
    
    <h3>Top Products</h3>
    <table>
      <tr><th>Product</th><th>Sold</th><th>Revenue</th></tr>
      ${topProducts
        .map(
          (p) =>
            `<tr><td>${p.name}</td><td>${p.quantity}</td><td>${formatRupiah(
              p.revenue
            )}</td></tr>`
        )
        .join("")}
    </table>
    
    <h3>Top Customers</h3>
    <table>
      <tr><th>Customer</th><th>Orders</th><th>Total</th></tr>
      ${topCustomers
        .map(
          (c) =>
            `<tr><td>${c.name}</td><td>${c.orderCount}</td><td>${formatRupiah(
              c.totalSpent
            )}</td></tr>`
        )
        .join("")}
    </table>
  `;
}

// ====================================
// CLEANUP & OPTIMIZATION
// ====================================

// Cleanup when page unloads
window.addEventListener("beforeunload", function () {
  if (salesChart) salesChart.destroy();
  if (productsChart) productsChart.destroy();
});

// Prevent memory leaks
setInterval(() => {
  if (window.gc && typeof window.gc === "function") {
    window.gc();
  }
}, 60000); // Run every minute

// ====================================
// GLOBAL EXPORTS
// ====================================

window.generateReport = generateReport;
window.exportReport = exportReport;

console.log("✅ Laporan optimized module loaded");
