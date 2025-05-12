document.addEventListener("DOMContentLoaded", function () {
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
});
// Di file dashboard.js
document.addEventListener("DOMContentLoaded", function () {
  // Cek apakah user sudah login
  if (!localStorage.getItem("adminSudahLogin")) {
    window.location.href = "index.html";
    return;
  }

  // Tampilkan informasi admin yang login
  const adminAktif = JSON.parse(localStorage.getItem("adminAktif") || "{}");
  const elemenNamaAdmin = document.getElementById("nama-admin");
  if (elemenNamaAdmin && adminAktif.nama) {
    elemenNamaAdmin.textContent = adminAktif.nama;
  }

  // Setup menu sesuai peran
  aturMenuAdmin();

  // Tambahkan event listener untuk tombol logout
  document
    .getElementById("tombol-logout")
    .addEventListener("click", function () {
      localStorage.removeItem("adminSudahLogin");
      localStorage.removeItem("adminAktif");
      window.location.href = "index.html";
    });
});
