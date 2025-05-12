// File: js/admin.js

// Fungsi untuk memeriksa apakah admin sudah login
function checkAdminLogin() {
  if (!localStorage.getItem("adminSudahLogin")) {
    window.location.href = "index.html";
  }
}

// Fungsi untuk logout admin
function adminLogout() {
  localStorage.removeItem("adminSudahLogin");
  localStorage.removeItem("adminAktif");
  window.location.href = "index.html";
}

// Fungsi untuk toggle sidebar
function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("collapsed");
  document.querySelector(".main-content").classList.toggle("expanded");
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Periksa status login
  checkAdminLogin();

  // Setup tombol logout
  const logoutBtns = document.querySelectorAll(".logout-btn");
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", adminLogout);
  });

  // Setup toggle sidebar
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }

  // Setup menu sesuai peran
  aturMenuAdmin();
});
