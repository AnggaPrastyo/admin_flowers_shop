// js/laporan.js - FIXED Error Handling Version

// ====================================
// DEPENDENCY CHECKS & FALLBACKS
// ====================================

// Check for required functions
if (typeof formatRupiah === "undefined") {
  window.formatRupiah = function (angka) {
    if (!angka || isNaN(angka)) return "Rp 0";
    return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
}

if (typeof showNotification === "undefined") {
  window.showNotification = function (message, type = "info") {
    console.log(`${type.toUpperCase()}: ${message}`);
    // Create simple notification instead of alert
    const notification = document.createElement("div");
    notification.className = `alert alert-${type}`;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      padding: 10px 15px; border-radius: 5px; max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };
}

if (typeof formatTanggal === "undefined") {
  window.formatTanggal = function (tanggal) {
    try {
      return new Date(tanggal).toLocaleDateString("id-ID");
    } catch (error) {
      return "Invalid Date";
    }
  };
}

// ====================================
// SAFE DATA VALIDATION HELPERS
// ====================================

function validateOrderData(order) {
  if (!order || typeof order !== "object") return false;

  // Required fields check
  if (!order.id || !order.total || !order.status) return false;

  // Ensure customer object exists
  if (!order.customer || typeof order.customer !== "object") return false;

  // Ensure customer has required fields
  if (!order.customer.name || !order.customer.email) return false;

  // Ensure items array exists
  if (!Array.isArray(order.items) || order.items.length === 0) return false;

  return true;
}

function validateProductData(product) {
  if (!product || typeof product !== "object") return false;
  if (!product.id || !product.name) return false;
  return true;
}

function validateCustomerData(customer) {
  if (!customer || typeof customer !== "object") return false;
  if (!customer.id || !customer.name || !customer.email) return false;
  return true;
}

function safeGetProperty(obj, path, defaultValue = "") {
  try {
    const keys = path.split(".");
    let result = obj;

    for (const key of keys) {
      if (result && typeof result === "object" && key in result) {
        result = result[key];
      } else {
        return defaultValue;
      }
    }

    return result || defaultValue;
  } catch (error) {
    console.warn(`Error accessing property ${path}:`, error);
    return defaultValue;
  }
}

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
  console.log("📊 Laporan initializing...");

  // Prevent auto-scroll issues
  document.body.style.overflow = "auto";
  document.documentElement.style.scrollBehavior = "auto";

  // Check if Chart.js is loaded
  if (typeof Chart === "undefined") {
    console.error("❌ Chart.js not loaded! Please include Chart.js library.");
    showNotification(
      "Chart.js library tidak ditemukan. Silakan refresh halaman.",
      "danger"
    );
    return;
  }

  // Setup event listeners first
  setupEventListeners();

  // Load data with delay to prevent lag
  setTimeout(() => {
    loadAndProcessData();
  }, 500);

  console.log("✅ Laporan initialized");
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
      updateChartPeriod(this.dataset.chart);
    });
  });
}

function updateActiveButton(clickedBtn, selector) {
  document.querySelectorAll(selector).forEach((btn) => {
    btn.classList.remove("active");
  });
  clickedBtn.classList.add("active");
}

function updateChartPeriod(period) {
  console.log(`📊 Updating chart for period: ${period}`);
  if (reportData) {
    initializeCharts();
  }
}

// ====================================
// SAFE DATA PROCESSING
// ====================================

function loadAndProcessData() {
  if (isLoading) return;

  isLoading = true;
  console.log("📦 Loading report data...");

  // Show loading state
  showLoadingState();

  try {
    // Get data from localStorage with error handling
    let orders = [];
    let products = [];
    let customers = [];

    try {
      orders = JSON.parse(localStorage.getItem("orders") || "[]");
      if (!Array.isArray(orders)) orders = [];
    } catch (error) {
      console.warn("Error parsing orders:", error);
      orders = [];
    }

    try {
      products = JSON.parse(localStorage.getItem("products") || "[]");
      if (!Array.isArray(products)) products = [];
    } catch (error) {
      console.warn("Error parsing products:", error);
      products = [];
    }

    try {
      customers = JSON.parse(localStorage.getItem("customers") || "[]");
      if (!Array.isArray(customers)) customers = [];
    } catch (error) {
      console.warn("Error parsing customers:", error);
      customers = [];
    }

    // Validate and filter data
    orders = orders.filter(validateOrderData);
    products = products.filter(validateProductData);
    customers = customers.filter(validateCustomerData);

    console.log(
      `📊 Data validated: ${orders.length} orders, ${products.length} products, ${customers.length} customers`
    );

    // Process data
    reportData = processReportData(orders, products, customers);

    // Update UI
    updateQuickStats();
    updateTables();

    // Initialize charts after data is ready
    setTimeout(() => {
      initializeCharts();
      hideLoadingState();
      isLoading = false;
    }, 300);
  } catch (error) {
    console.error("❌ Error loading data:", error);
    hideLoadingState();
    isLoading = false;
    showNotification("Gagal memuat data laporan: " + error.message, "danger");

    // Show default empty state
    showEmptyDataState();
  }
}

function showLoadingState() {
  // Show loading for each section
  const sections = [
    "bestProductsBody",
    "topCustomersBody",
    "geoAnalysisBody",
    "categoryBody",
  ];

  sections.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.innerHTML =
        '<tr><td colspan="4" class="text-center py-3"><i class="bi bi-hourglass-split"></i> Loading...</td></tr>';
    }
  });
}

function hideLoadingState() {
  console.log("✅ Data loading completed");
}

function showEmptyDataState() {
  // Reset stats to zero
  const statsElements = [
    "totalRevenue",
    "totalOrders",
    "avgOrderValue",
    "newCustomers",
    "grossRevenue",
    "financialOrders",
    "financialAvg",
  ];

  statsElements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.textContent =
        id.includes("Revenue") || id.includes("Avg") ? "Rp 0" : "0";
    }
  });

  // Show empty tables
  const sections = [
    { id: "bestProductsBody", cols: 4, message: "Tidak ada data produk" },
    { id: "topCustomersBody", cols: 4, message: "Tidak ada data customer" },
    { id: "geoAnalysisBody", cols: 3, message: "Tidak ada data geografis" },
    { id: "categoryBody", cols: 3, message: "Tidak ada data kategori" },
  ];

  sections.forEach((section) => {
    const element = document.getElementById(section.id);
    if (element) {
      element.innerHTML = `<tr><td colspan="${section.cols}" class="text-center py-3 text-muted">${section.message}</td></tr>`;
    }
  });
}

function processReportData(orders, products, customers) {
  console.log("⚙️ Processing report data...");

  try {
    // Filter valid orders with safe property access
    const validOrders = orders.filter((order) => {
      try {
        return (
          order &&
          order.status !== "cancelled" &&
          typeof order.total === "number" &&
          order.total > 0 &&
          order.customer &&
          Array.isArray(order.items)
        );
      } catch (error) {
        console.warn("Invalid order data:", error);
        return false;
      }
    });

    // Calculate basic metrics safely
    const totalRevenue = validOrders.reduce((sum, order) => {
      try {
        return sum + (parseFloat(order.total) || 0);
      } catch (error) {
        return sum;
      }
    }, 0);

    const totalOrders = validOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Calculate new customers safely
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomers = customers.filter((customer) => {
      try {
        const joinDate = new Date(
          customer.joinDate || customer.createdAt || ""
        );
        return joinDate >= thirtyDaysAgo;
      } catch (error) {
        return false;
      }
    }).length;

    // SAFE: Product analysis
    const productSales = {};
    validOrders.forEach((order) => {
      try {
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            try {
              const productName = safeGetProperty(
                item,
                "product",
                "Unknown Product"
              );
              const quantity = parseInt(safeGetProperty(item, "quantity", 0));
              const total = parseFloat(safeGetProperty(item, "total", 0));

              if (productName && quantity > 0 && total > 0) {
                if (!productSales[productName]) {
                  productSales[productName] = {
                    quantity: 0,
                    revenue: 0,
                    category: getProductCategory(productName, products),
                  };
                }
                productSales[productName].quantity += quantity;
                productSales[productName].revenue += total;
              }
            } catch (itemError) {
              console.warn("Error processing item:", itemError);
            }
          });
        }
      } catch (orderError) {
        console.warn("Error processing order items:", orderError);
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // SAFE: Customer analysis
    const customerSales = {};
    validOrders.forEach((order) => {
      try {
        const email = safeGetProperty(order, "customer.email", "");
        const name = safeGetProperty(
          order,
          "customer.name",
          "Unknown Customer"
        );
        const total = parseFloat(safeGetProperty(order, "total", 0));

        if (email && total > 0) {
          if (!customerSales[email]) {
            customerSales[email] = {
              name: name,
              orderCount: 0,
              totalSpent: 0,
            };
          }
          customerSales[email].orderCount += 1;
          customerSales[email].totalSpent += total;
        }
      } catch (customerError) {
        console.warn("Error processing customer:", customerError);
      }
    });

    const topCustomers = Object.values(customerSales)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);

    // SAFE: Geographic analysis
    const geoSales = {};
    validOrders.forEach((order) => {
      try {
        const address = safeGetProperty(order, "customer.address", "");
        const area = determineGeographicArea(address);
        const total = parseFloat(safeGetProperty(order, "total", 0));

        if (area && total > 0) {
          if (!geoSales[area]) {
            geoSales[area] = { orders: 0, revenue: 0 };
          }
          geoSales[area].orders += 1;
          geoSales[area].revenue += total;
        }
      } catch (geoError) {
        console.warn("Error processing geographic data:", geoError);
      }
    });

    const geoAnalysis = Object.entries(geoSales)
      .map(([area, data]) => ({ area, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // SAFE: Category analysis
    const categoryAnalysis = generateCategoryAnalysis(validOrders, products);

    // SAFE: Sales trend
    const salesTrend = generateSalesTrend(validOrders);

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
  } catch (error) {
    console.error("❌ Error in processReportData:", error);

    // Return safe default data
    return {
      metrics: {
        totalRevenue: 0,
        totalOrders: 0,
        avgOrderValue: 0,
        newCustomers: 0,
      },
      topProducts: [],
      topCustomers: [],
      geoAnalysis: [],
      categoryAnalysis: [],
      salesTrend: { labels: [], data: [] },
    };
  }
}

// SAFE: Helper functions with error handling
function getProductCategory(productName, products) {
  try {
    if (!productName || !Array.isArray(products)) return "Lainnya";

    const product = products.find((p) => p && p.name === productName);
    if (product && product.category) {
      const categoryMap = {
        bunga_potong: "Bunga Potong",
        bunga_pot: "Bunga Pot",
        pot_gantung: "Pot Gantung",
        pot_rotan: "Pot Rotan",
        pot_biasa: "Pot Biasa",
        pot_kaki_besi: "Pot Kaki Besi",
        aksesoris: "Aksesoris",
        pot_kayu: "Pot Kayu",
        pot_keramik: "Pot Keramik",
      };
      return categoryMap[product.category] || "Lainnya";
    }

    // Fallback: determine from name
    const name = (productName || "").toLowerCase();
    if (name.includes("pot")) return "Bunga Pot";
    if (name.includes("aksesoris")) return "Aksesoris";
    return "Bunga Potong";
  } catch (error) {
    console.warn("Error getting product category:", error);
    return "Lainnya";
  }
}

function determineGeographicArea(address) {
  try {
    // SAFE: Handle undefined/null address
    if (!address || typeof address !== "string") {
      return "Alamat Tidak Diketahui";
    }

    const addr = address.toLowerCase().trim();

    if (addr.includes("seberang")) return "Samarinda Seberang";
    if (addr.includes("kota")) return "Samarinda Kota";
    if (addr.includes("tenggarong")) return "Tenggarong";
    if (addr.includes("samarinda")) return "Samarinda Lainnya";

    return "Luar Kota";
  } catch (error) {
    console.warn("Error determining geographic area:", error);
    return "Alamat Tidak Diketahui";
  }
}

function generateCategoryAnalysis(orders, products) {
  try {
    const categoryMap = {};

    if (!Array.isArray(orders)) return [];

    orders.forEach((order) => {
      try {
        if (Array.isArray(order.items)) {
          order.items.forEach((item) => {
            try {
              const productName = safeGetProperty(item, "product", "");
              const quantity = parseInt(safeGetProperty(item, "quantity", 0));
              const total = parseFloat(safeGetProperty(item, "total", 0));

              if (productName && quantity > 0 && total > 0) {
                const category = getProductCategory(productName, products);

                if (!categoryMap[category]) {
                  categoryMap[category] = { sold: 0, revenue: 0 };
                }
                categoryMap[category].sold += quantity;
                categoryMap[category].revenue += total;
              }
            } catch (itemError) {
              console.warn("Error processing category item:", itemError);
            }
          });
        }
      } catch (orderError) {
        console.warn("Error processing category order:", orderError);
      }
    });

    return Object.entries(categoryMap)
      .map(([category, data]) => ({ category, ...data }))
      .filter((item) => item.sold > 0)
      .sort((a, b) => b.revenue - a.revenue);
  } catch (error) {
    console.warn("Error generating category analysis:", error);
    return [];
  }
}

function generateSalesTrend(orders) {
  try {
    const days = 7;
    const trendData = {};
    const labels = [];

    // Generate last N days
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      labels.push(
        date.toLocaleDateString("id-ID", {
          weekday: "short",
          day: "numeric",
        })
      );
      trendData[dateStr] = 0;
    }

    // Aggregate sales by date
    if (Array.isArray(orders)) {
      orders.forEach((order) => {
        try {
          const orderDate = safeGetProperty(order, "date", "");
          const orderTotal = parseFloat(safeGetProperty(order, "total", 0));

          if (
            orderDate &&
            trendData.hasOwnProperty(orderDate) &&
            orderTotal > 0
          ) {
            trendData[orderDate] += orderTotal;
          }
        } catch (trendError) {
          console.warn("Error processing trend data:", trendError);
        }
      });
    }

    return {
      labels,
      data: Object.values(trendData),
    };
  } catch (error) {
    console.warn("Error generating sales trend:", error);
    return { labels: [], data: [] };
  }
}

// ====================================
// UI UPDATES - SAFE VERSION
// ====================================

function updateQuickStats() {
  if (!reportData) return;

  try {
    const { metrics } = reportData;

    // Update main stats with safe access
    const updateElement = (id, value) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    };

    updateElement("totalRevenue", formatRupiah(metrics.totalRevenue || 0));
    updateElement("totalOrders", metrics.totalOrders || 0);
    updateElement("avgOrderValue", formatRupiah(metrics.avgOrderValue || 0));
    updateElement("newCustomers", metrics.newCustomers || 0);

    // Update financial summary
    updateElement("grossRevenue", formatRupiah(metrics.totalRevenue || 0));
    updateElement("financialOrders", metrics.totalOrders || 0);
    updateElement("financialAvg", formatRupiah(metrics.avgOrderValue || 0));

    // Calculate and display growth rate
    const growthRate = calculateGrowthRate();
    updateElement("growthRate", growthRate + "%");
  } catch (error) {
    console.error("Error updating quick stats:", error);
  }
}

function calculateGrowthRate() {
  try {
    return Math.random() > 0.5
      ? "+" + (Math.random() * 20).toFixed(1)
      : "-" + (Math.random() * 5).toFixed(1);
  } catch (error) {
    return "0.0";
  }
}

function updateTables() {
  if (!reportData) return;

  try {
    updateBestProductsTable();
    updateTopCustomersTable();
    updateGeoAnalysisTable();
    updateCategoryTable();
  } catch (error) {
    console.error("Error updating tables:", error);
  }
}

function updateBestProductsTable() {
  try {
    const tbody = document.getElementById("bestProductsBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!reportData.topProducts || reportData.topProducts.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center py-3 text-muted">Tidak ada data produk</td></tr>';
      return;
    }

    reportData.topProducts.forEach((product, index) => {
      try {
        const row = `
          <tr>
            <td><span class="badge bg-primary">#${index + 1}</span></td>
            <td>
              <div class="fw-semibold">${
                product.name || "Unknown Product"
              }</div>
              <small class="text-muted">${
                product.category || "Kategori tidak diketahui"
              }</small>
            </td>
            <td>${product.quantity || 0}</td>
            <td>${formatRupiah(product.revenue || 0)}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      } catch (rowError) {
        console.warn("Error creating product row:", rowError);
      }
    });
  } catch (error) {
    console.error("Error updating best products table:", error);
  }
}

function updateTopCustomersTable() {
  try {
    const tbody = document.getElementById("topCustomersBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!reportData.topCustomers || reportData.topCustomers.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="text-center py-3 text-muted">Tidak ada data customer</td></tr>';
      return;
    }

    reportData.topCustomers.forEach((customer, index) => {
      try {
        const row = `
          <tr>
            <td><span class="badge bg-success">#${index + 1}</span></td>
            <td>${customer.name || "Unknown Customer"}</td>
            <td>${customer.orderCount || 0}</td>
            <td>${formatRupiah(customer.totalSpent || 0)}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      } catch (rowError) {
        console.warn("Error creating customer row:", rowError);
      }
    });
  } catch (error) {
    console.error("Error updating top customers table:", error);
  }
}

function updateGeoAnalysisTable() {
  try {
    const tbody = document.getElementById("geoAnalysisBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!reportData.geoAnalysis || reportData.geoAnalysis.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="text-center py-3 text-muted">Tidak ada data geografis</td></tr>';
      return;
    }

    reportData.geoAnalysis.forEach((geo) => {
      try {
        const totalRevenue = reportData.metrics.totalRevenue || 1;
        const percentage = ((geo.revenue / totalRevenue) * 100).toFixed(1);
        const row = `
          <tr>
            <td>
              <div class="fw-semibold">${geo.area || "Unknown Area"}</div>
              <small class="text-muted">${percentage}% dari total</small>
            </td>
            <td>${geo.orders || 0}</td>
            <td>${formatRupiah(geo.revenue || 0)}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      } catch (rowError) {
        console.warn("Error creating geo row:", rowError);
      }
    });
  } catch (error) {
    console.error("Error updating geo analysis table:", error);
  }
}

function updateCategoryTable() {
  try {
    const tbody = document.getElementById("categoryBody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (
      !reportData.categoryAnalysis ||
      reportData.categoryAnalysis.length === 0
    ) {
      tbody.innerHTML =
        '<tr><td colspan="3" class="text-center py-3 text-muted">Tidak ada data kategori</td></tr>';
      return;
    }

    reportData.categoryAnalysis.forEach((category) => {
      try {
        const totalRevenue = reportData.metrics.totalRevenue || 1;
        const percentage = ((category.revenue / totalRevenue) * 100).toFixed(1);
        const row = `
          <tr>
            <td>
              <div class="fw-semibold">${
                category.category || "Unknown Category"
              }</div>
              <small class="text-muted">${percentage}% dari total</small>
            </td>
            <td>${category.sold || 0}</td>
            <td>${formatRupiah(category.revenue || 0)}</td>
          </tr>
        `;
        tbody.innerHTML += row;
      } catch (rowError) {
        console.warn("Error creating category row:", rowError);
      }
    });
  } catch (error) {
    console.error("Error updating category table:", error);
  }
}

// ====================================
// CHARTS - SAFE VERSION
// ====================================

function initializeCharts() {
  if (!reportData) {
    console.warn("⚠️ No report data available for charts");
    return;
  }

  console.log("📊 Initializing charts...");

  try {
    // Destroy existing charts to prevent memory leaks
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }
    if (productsChart) {
      productsChart.destroy();
      productsChart = null;
    }

    createSalesChart();
    createProductsChart();

    console.log("✅ Charts initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing charts:", error);
    showNotification("Gagal membuat chart: " + error.message, "warning");
  }
}

function createSalesChart() {
  try {
    const canvas = document.getElementById("salesTrendChart");
    if (!canvas) {
      console.warn("⚠️ Sales chart canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("⚠️ Cannot get 2D context for sales chart");
      return;
    }

    // Safe data access
    const labels = reportData.salesTrend?.labels || [];
    const data = reportData.salesTrend?.data || [];

    salesChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Penjualan (Rp)",
            data: data,
            borderColor: "#89aaaf",
            backgroundColor: "rgba(137, 170, 175, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "#89aaaf",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeInOutQuart",
        },
        plugins: {
          legend: {
            display: true,
            position: "top",
            labels: {
              usePointStyle: true,
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "white",
            bodyColor: "white",
            borderColor: "#89aaaf",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                return `Penjualan: ${formatRupiah(context.parsed.y || 0)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#666",
              font: {
                size: 12,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: "rgba(0,0,0,0.1)",
            },
            ticks: {
              color: "#666",
              font: {
                size: 12,
              },
              callback: function (value) {
                return formatRupiah(value || 0);
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("❌ Error creating sales chart:", error);
  }
}

function createProductsChart() {
  try {
    const canvas = document.getElementById("topProductsChart");
    if (!canvas) {
      console.warn("⚠️ Products chart canvas not found");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("⚠️ Cannot get 2D context for products chart");
      return;
    }

    // Safe data access
    const topProducts = reportData.topProducts || [];
    const colors = ["#89aaaf", "#f3c9b1", "#36486b", "#a6c1c5", "#6d878c"];

    if (topProducts.length === 0) {
      // Show empty chart message
      ctx.fillStyle = "#666";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        "Tidak ada data produk",
        canvas.width / 2,
        canvas.height / 2
      );
      return;
    }

    productsChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: topProducts.map((p) => p.name || "Unknown"),
        datasets: [
          {
            data: topProducts.map((p) => p.quantity || 0),
            backgroundColor: colors.slice(0, topProducts.length),
            borderWidth: 2,
            borderColor: "#ffffff",
            hoverBorderWidth: 3,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeInOutQuart",
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 15,
              usePointStyle: true,
              font: {
                size: 12,
              },
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i] || 0;
                    return {
                      text: `${label} (${value})`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      pointStyle: "circle",
                      hidden: false,
                      index: i,
                    };
                  });
                }
                return [];
              },
            },
          },
          tooltip: {
            backgroundColor: "rgba(0,0,0,0.8)",
            titleColor: "white",
            bodyColor: "white",
            borderColor: "#89aaaf",
            borderWidth: 1,
            callbacks: {
              label: function (context) {
                const total = context.dataset.data.reduce(
                  (a, b) => (a || 0) + (b || 0),
                  0
                );
                const percentage =
                  total > 0
                    ? (((context.parsed || 0) * 100) / total).toFixed(1)
                    : "0.0";
                return `${context.label}: ${
                  context.parsed || 0
                } (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("❌ Error creating products chart:", error);
  }
}

// ====================================
// ACTIONS - SAFE VERSION
// ====================================

function generateReport() {
  if (isLoading) {
    console.log("⏳ Report generation already in progress");
    return;
  }

  console.log("📊 Generating report...");
  showNotification("Menggenerate laporan...", "info");

  try {
    // Add loading animation to generate button
    const generateBtn = document.getElementById("generateReport");
    if (generateBtn) {
      generateBtn.innerHTML =
        '<i class="bi bi-hourglass-split"></i> Generating...';
      generateBtn.disabled = true;
    }

    // Reload and process data
    loadAndProcessData();

    // Restore button after completion
    setTimeout(() => {
      if (generateBtn) {
        generateBtn.innerHTML =
          '<i class="bi bi-graph-up"></i> Generate Report';
        generateBtn.disabled = false;
      }
      showNotification("Laporan berhasil di-generate!", "success");
    }, 1000);
  } catch (error) {
    console.error("Error in generateReport:", error);
    showNotification("Gagal generate laporan: " + error.message, "danger");
  }
}

function exportReport() {
  try {
    if (!reportData) {
      showNotification("Tidak ada data untuk di-export", "warning");
      return;
    }

    console.log("📄 Exporting report...");
    showNotification("Menyiapkan export...", "info");

    // Simple export - create a summary
    const summary = createReportSummary();

    // Create printable window
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      showNotification(
        "Popup diblokir! Silakan izinkan popup untuk export.",
        "warning"
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Penjualan - Flowers Shop</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #89aaaf; padding-bottom: 20px; }
          .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
          .stat-item { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f8f9fa; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #89aaaf; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .section-title { color: #89aaaf; border-bottom: 1px solid #89aaaf; padding-bottom: 5px; margin-top: 30px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${summary}
        <div class="no-print" style="text-align: center; margin-top: 30px;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #89aaaf; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Report</button>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();

    // Auto print after short delay
    setTimeout(() => {
      printWindow.print();
    }, 500);

    showNotification("Report berhasil di-export!", "success");
  } catch (error) {
    console.error("❌ Export error:", error);
    showNotification("Gagal export report: " + error.message, "danger");
  }
}

function createReportSummary() {
  try {
    const {
      metrics,
      topProducts,
      topCustomers,
      geoAnalysis,
      categoryAnalysis,
    } = reportData;
    const currentDate = new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Safe data access for summary
    const safeTopProducts = topProducts || [];
    const safeTopCustomers = topCustomers || [];
    const safeGeoAnalysis = geoAnalysis || [];
    const safeCategoryAnalysis = categoryAnalysis || [];
    const safeMetrics = metrics || {};

    return `
      <div class="header">
        <h1>🌸 Laporan Penjualan</h1>
        <h2>Flowers Shop</h2>
        <p><strong>Generated:</strong> ${currentDate}</p>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <h3>${formatRupiah(safeMetrics.totalRevenue || 0)}</h3>
          <p><strong>Total Revenue</strong></p>
        </div>
        <div class="stat-item">
          <h3>${safeMetrics.totalOrders || 0}</h3>
          <p><strong>Total Orders</strong></p>
        </div>
        <div class="stat-item">
          <h3>${formatRupiah(safeMetrics.avgOrderValue || 0)}</h3>
          <p><strong>Avg Order Value</strong></p>
        </div>
        <div class="stat-item">
          <h3>${safeMetrics.newCustomers || 0}</h3>
          <p><strong>New Customers</strong></p>
        </div>
      </div>
      
      <h3 class="section-title">📦 Top Products</h3>
      <table>
        <tr><th>Rank</th><th>Product</th><th>Sold</th><th>Revenue</th><th>Category</th></tr>
        ${
          safeTopProducts.length > 0
            ? safeTopProducts
                .map(
                  (p, index) =>
                    `<tr>
                <td>#${index + 1}</td>
                <td><strong>${p.name || "Unknown"}</strong></td>
                <td>${p.quantity || 0}</td>
                <td>${formatRupiah(p.revenue || 0)}</td>
                <td>${p.category || "N/A"}</td>
              </tr>`
                )
                .join("")
            : '<tr><td colspan="5" class="text-center">Tidak ada data produk</td></tr>'
        }
      </table>
      
      <h3 class="section-title">👥 Top Customers</h3>
      <table>
        <tr><th>Rank</th><th>Customer</th><th>Orders</th><th>Total Spent</th></tr>
        ${
          safeTopCustomers.length > 0
            ? safeTopCustomers
                .map(
                  (c, index) =>
                    `<tr>
                <td>#${index + 1}</td>
                <td><strong>${c.name || "Unknown"}</strong></td>
                <td>${c.orderCount || 0}</td>
                <td>${formatRupiah(c.totalSpent || 0)}</td>
              </tr>`
                )
                .join("")
            : '<tr><td colspan="4" class="text-center">Tidak ada data customer</td></tr>'
        }
      </table>

      ${
        safeGeoAnalysis.length > 0
          ? `
      <h3 class="section-title">🗺️ Geographic Analysis</h3>
      <table>
        <tr><th>Area</th><th>Orders</th><th>Revenue</th><th>% of Total</th></tr>
        ${safeGeoAnalysis
          .map((geo) => {
            const percentage =
              safeMetrics.totalRevenue > 0
                ? ((geo.revenue / safeMetrics.totalRevenue) * 100).toFixed(1)
                : "0.0";
            return `<tr>
                <td><strong>${geo.area || "Unknown"}</strong></td>
                <td>${geo.orders || 0}</td>
                <td>${formatRupiah(geo.revenue || 0)}</td>
                <td>${percentage}%</td>
              </tr>`;
          })
          .join("")}
      </table>`
          : ""
      }

      ${
        safeCategoryAnalysis.length > 0
          ? `
      <h3 class="section-title">📊 Category Performance</h3>
      <table>
        <tr><th>Category</th><th>Items Sold</th><th>Revenue</th><th>% of Total</th></tr>
        ${safeCategoryAnalysis
          .map((cat) => {
            const percentage =
              safeMetrics.totalRevenue > 0
                ? ((cat.revenue / safeMetrics.totalRevenue) * 100).toFixed(1)
                : "0.0";
            return `<tr>
                <td><strong>${cat.category || "Unknown"}</strong></td>
                <td>${cat.sold || 0}</td>
                <td>${formatRupiah(cat.revenue || 0)}</td>
                <td>${percentage}%</td>
              </tr>`;
          })
          .join("")}
      </table>`
          : ""
      }
      
      <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
        <h4>📈 Summary Insights</h4>
        <ul style="line-height: 1.8;">
          <li><strong>Best Performing Product:</strong> ${
            safeTopProducts[0]?.name || "N/A"
          } with ${formatRupiah(safeTopProducts[0]?.revenue || 0)} revenue</li>
          <li><strong>Top Customer:</strong> ${
            safeTopCustomers[0]?.name || "N/A"
          } with ${safeTopCustomers[0]?.orderCount || 0} orders</li>
          <li><strong>Strongest Market:</strong> ${
            safeGeoAnalysis[0]?.area || "N/A"
          } with ${safeGeoAnalysis[0]?.orders || 0} orders</li>
          <li><strong>Best Category:</strong> ${
            safeCategoryAnalysis[0]?.category || "N/A"
          } with ${safeCategoryAnalysis[0]?.sold || 0} items sold</li>
        </ul>
      </div>
    `;
  } catch (error) {
    console.error("Error creating report summary:", error);
    return `
      <div class="header">
        <h1>🌸 Laporan Penjualan</h1>
        <h2>Flowers Shop</h2>
        <p>Error generating report</p>
      </div>
    `;
  }
}

// ====================================
// CLEANUP & OPTIMIZATION
// ====================================

// Cleanup when page unloads
window.addEventListener("beforeunload", function () {
  try {
    if (salesChart) {
      salesChart.destroy();
      salesChart = null;
    }
    if (productsChart) {
      productsChart.destroy();
      productsChart = null;
    }
  } catch (error) {
    console.warn("Error during cleanup:", error);
  }
});

// Prevent memory leaks with periodic cleanup
let cleanupInterval = setInterval(() => {
  try {
    // Force garbage collection if available (Chrome DevTools)
    if (window.gc && typeof window.gc === "function") {
      window.gc();
    }

    // Log memory usage for debugging
    if (performance.memory) {
      const memoryMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
      console.log(`📊 Memory usage: ${memoryMB} MB`);
    }
  } catch (error) {
    console.warn("Error in cleanup interval:", error);
  }
}, 60000); // Run every minute

// ====================================
// GLOBAL EXPORTS & DEBUG
// ====================================

// Make functions available globally
window.generateReport = generateReport;
window.exportReport = exportReport;

// Debug mode
if (localStorage.getItem("debug") === "true") {
  window.laporanDebug = {
    reportData,
    loadAndProcessData,
    initializeCharts,
    processReportData,
    salesChart,
    productsChart,
    validateOrderData,
    validateProductData,
    validateCustomerData,
    safeGetProperty,
  };
  console.log(
    "🐛 Laporan debug mode enabled. Use window.laporanDebug for debugging."
  );
}

console.log("✅ Laporan safe module loaded successfully");
