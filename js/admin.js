// admin.js - Fungsi-fungsi admin utama & loader komponen

// Memeriksa status login
function checkAdminLogin() {
  if (!localStorage.getItem("adminSudahLogin")) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Logout admin
function logoutAdmin() {
  localStorage.removeItem("adminSudahLogin");
  localStorage.removeItem("adminAktif");
  window.location.href = "index.html";
}

// Toggle sidebar
function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("collapsed");
  document.querySelector(".main-content").classList.toggle("expanded");
}

// Memuat sidebar ke dalam halaman
function loadSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) return;

  fetch("komponens/sidebar.html")
    .then((response) => response.text())
    .then((data) => {
      sidebarContainer.innerHTML = data;

      // Set halaman aktif di sidebar
      const currentPage = document.body.getAttribute("data-page");
      if (currentPage) {
        const activeLink = document.querySelector(
          `.sidebar-link[data-page="${currentPage}"]`
        );
        if (activeLink) {
          activeLink.classList.add("active");
        }
      }

      // Tambahkan event listener untuk toggle sidebar
      const sidebarToggle = document.getElementById("sidebarToggle");
      if (sidebarToggle) {
        sidebarToggle.addEventListener("click", toggleSidebar);
      }

      // Tambahkan event listener untuk tombol logout
      const logoutBtn = document.querySelector(".logout-btn");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutAdmin);
      }

      // Atur menu sesuai peran admin
      setMenuByRole();
    })
    .catch((error) => {
      console.error("Error loading sidebar:", error);
    });
}

// Mengatur menu berdasarkan peran admin
function setMenuByRole() {
  const adminAktif = JSON.parse(localStorage.getItem("adminAktif") || "{}");
  const role = adminAktif.peran || "staff";

  // Tampilkan nama admin
  const namaAdminElem = document.getElementById("nama-admin");
  if (namaAdminElem && adminAktif.nama) {
    namaAdminElem.textContent = adminAktif.nama;
  }

  // Atur visibilitas menu berdasarkan peran
  if (role === "superadmin") {
    // Superadmin bisa akses semua menu
    return;
  } else if (role === "manajer") {
    // Manajer tidak bisa akses pengaturan
    const settingsMenu = document.querySelector(
      '.sidebar-link[data-page="pengaturan"]'
    );
    if (settingsMenu) {
      settingsMenu.parentElement.style.display = "none";
    }
  } else {
    // Staff hanya bisa akses produk dan pesanan
    const allowedPages = ["produk", "pesanan"];
    document.querySelectorAll(".sidebar-link").forEach((link) => {
      const page = link.getAttribute("data-page");
      if (
        page &&
        !allowedPages.includes(page) &&
        !link.classList.contains("logout-btn")
      ) {
        link.parentElement.style.display = "none";
      }
    });
  }
}

// Load semua komponen ketika DOM siap
document.addEventListener("DOMContentLoaded", function () {
  // Cek login kecuali di halaman index
  if (!window.location.pathname.includes("index.html")) {
    if (!checkAdminLogin()) return;
  }

  // Muat sidebar
  loadSidebar();

  // Inisialisasi nama admin di header
  const adminAktif = JSON.parse(localStorage.getItem("adminAktif") || "{}");
  const namaAdminElem = document.getElementById("nama-admin");
  if (namaAdminElem && adminAktif.nama) {
    namaAdminElem.textContent = adminAktif.nama;
  }
});
