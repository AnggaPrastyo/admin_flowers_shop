// Check if admin is logged in (for demo purposes)
document.addEventListener("DOMContentLoaded", function () {
  if (!localStorage.getItem("adminLoggedIn")) {
    window.location.href = "index.html";
  }

  // Setup logout functionality
  document.getElementById("logout-button").addEventListener("click", logout);
  document.getElementById("header-logout").addEventListener("click", logout);

  function logout(e) {
    e.preventDefault();
    localStorage.removeItem("adminLoggedIn");
    window.location.href = "index.html";
  }

  // Initialize charts
  const salesCtx = document.getElementById("salesChart");
  const productsCtx = document.getElementById("productsChart");

  // Sales chart
  new Chart(salesCtx, {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"],
      datasets: [
        {
          label: "Penjualan (Rp)",
          data: [1500000, 1800000, 2200000, 1900000, 2500000, 2800000],
          fill: false,
          borderColor: "#4e73df",
          tension: 0.1,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
    },
  });

  // Products chart
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
            "#4e73df",
            "#1cc88a",
            "#36b9cc",
            "#f6c23e",
            "#e74a3b",
          ],
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
    },
  });
});
