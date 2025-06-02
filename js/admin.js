// js/admin.js - Fixed dengan fallback yang lebih robust

// ====================================
// AUTHENTICATION & SESSION MANAGEMENT
// ====================================

function checkAdminLogin() {
  if (!localStorage.getItem("adminSudahLogin")) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function logoutAdmin() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    localStorage.removeItem("adminSudahLogin");
    localStorage.removeItem("adminAktif");
    window.location.href = "index.html";
  }
}

// ====================================
// UI COMPONENTS MANAGEMENT
// ====================================

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const mainContent = document.querySelector(".main-content");

  if (sidebar) sidebar.classList.toggle("collapsed");
  if (mainContent) mainContent.classList.toggle("expanded");
}

async function loadSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) {
    console.error("❌ Sidebar container not found!");
    return;
  }

  try {
    // Method 1: Try to load from components/sidebar.html
    console.log(
      "🔄 Attempting to load sidebar from components/sidebar.html..."
    );
    const response = await fetch("components/sidebar.html");

    if (response.ok) {
      const html = await response.text();
      sidebarContainer.innerHTML = html;
      console.log("✅ Sidebar loaded successfully from external file");
      setupSidebarEvents();
      return;
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  } catch (error) {
    console.warn("⚠️ External sidebar loading failed:", error.message);
    console.log("🔄 Falling back to inline sidebar...");
    loadInlineSidebar();
  }
}

function loadInlineSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) return;

  // Simplified inline sidebar for fallback
  sidebarContainer.innerHTML = `
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="dashboard.html" class="sidebar-brand">Flowers <span>Shop</span></a>
        <div class="sidebar-toggle" id="sidebarToggle">
          <i class="bi bi-list"></i>
        </div>
      </div>
      <ul class="sidebar-menu">
        <li class="sidebar-item">
          <a href="dashboard.html" class="sidebar-link" data-page="dashboard">
            <i class="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="produk.html" class="sidebar-link" data-page="produk">
            <i class="bi bi-box-seam"></i>
            <span>Produk</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="pesanan.html" class="sidebar-link" data-page="pesanan">
            <i class="bi bi-cart3"></i>
            <span>Pesanan</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="pelanggan.html" class="sidebar-link" data-page="pelanggan">
            <i class="bi bi-people"></i>
            <span>Pelanggan</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="testimoni.html" class="sidebar-link" data-page="testimoni">
            <i class="bi bi-chat-left-text"></i>
            <span>Testimoni</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="laporan.html" class="sidebar-link" data-page="laporan">
            <i class="bi bi-bar-chart"></i>
            <span>Laporan</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="pengaturan.html" class="sidebar-link" data-page="pengaturan">
            <i class="bi bi-gear"></i>
            <span>Pengaturan</span>
          </a>
        </li>
        <li class="sidebar-item">
          <a href="#" class="sidebar-link logout-btn">
            <i class="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </a>
        </li>
      </ul>
    </aside>
  `;

  console.log("✅ Fallback inline sidebar loaded");
  setupSidebarEvents();
}

function setupSidebarEvents() {
  // Set active page
  setActivePage();

  // Setup event listeners
  setupSidebarToggle();
  setupLogoutButton();

  // Set menu based on role
  setMenuByRole();
}

function setActivePage() {
  const currentPage = document.body.getAttribute("data-page");
  if (!currentPage) return;

  const activeLink = document.querySelector(
    `.sidebar-link[data-page="${currentPage}"]`
  );

  if (activeLink) {
    activeLink.classList.add("active");
    console.log(`✅ Active page set: ${currentPage}`);
  }
}

function setupSidebarToggle() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
    console.log("✅ Sidebar toggle setup complete");
  }
}

function setupLogoutButton() {
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      logoutAdmin();
    });
    console.log("✅ Logout button setup complete");
  }
}

// ====================================
// ROLE-BASED ACCESS CONTROL
// ====================================

function setMenuByRole() {
  const adminAktif = JSON.parse(localStorage.getItem("adminAktif") || "{}");
  const role = adminAktif.peran || "staff";

  // Update admin info
  updateAdminInfo(adminAktif);

  console.log(`🔐 Setting menu permissions for role: ${role}`);

  // Apply role-based restrictions
  switch (role) {
    case "superadmin":
      console.log("👑 Superadmin: Full access granted");
      break;

    case "manajer":
      console.log("👔 Manager: Hiding settings menu");
      hideMenuItems(["pengaturan"]);
      break;

    case "staff":
      console.log("👷 Staff: Limited access to products and orders only");
      showOnlyMenuItems(["produk", "pesanan"]);
      break;

    default:
      console.warn(`❓ Unknown role: ${role}, defaulting to staff permissions`);
      showOnlyMenuItems(["produk", "pesanan"]);
  }
}

function hideMenuItems(pageNames) {
  pageNames.forEach((pageName) => {
    const menuItem = document.querySelector(
      `.sidebar-link[data-page="${pageName}"]`
    );
    if (menuItem && menuItem.parentElement) {
      menuItem.parentElement.style.display = "none";
      console.log(`🚫 Hidden menu: ${pageName}`);
    }
  });
}

function showOnlyMenuItems(allowedPages) {
  document.querySelectorAll(".sidebar-link").forEach((link) => {
    const page = link.getAttribute("data-page");

    if (
      page &&
      !allowedPages.includes(page) &&
      !link.classList.contains("logout-btn")
    ) {
      if (link.parentElement) {
        link.parentElement.style.display = "none";
        console.log(`🚫 Hidden menu: ${page}`);
      }
    }
  });
}

function updateAdminInfo(adminAktif) {
  const namaAdminElements = document.querySelectorAll("#nama-admin");
  namaAdminElements.forEach((element) => {
    if (adminAktif.nama) {
      element.textContent = adminAktif.nama;
    }
  });

  if (adminAktif.nama) {
    console.log(
      `👤 Admin info updated: ${adminAktif.nama} (${adminAktif.peran})`
    );
  }
}

// ====================================
// NOTIFICATION SYSTEM
// ====================================

function showNotification(message, type = "success", duration = 3000) {
  // Remove existing notifications
  document.querySelectorAll(".notification-toast").forEach((toast) => {
    toast.remove();
  });

  const notification = document.createElement("div");
  notification.className = `alert alert-${type} notification-toast`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    max-width: 400px;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-radius: 8px;
  `;

  const iconMap = {
    success: "check-circle",
    danger: "exclamation-triangle",
    warning: "exclamation-circle",
    info: "info-circle",
  };

  notification.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="bi bi-${iconMap[type] || "info-circle"} me-2"></i>
      <span>${message}</span>
      <button type="button" class="btn-close ms-auto" aria-label="Close"></button>
    </div>
  `;

  document.body.appendChild(notification);

  // Show animation
  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
  }, 100);

  // Close button event
  notification.querySelector(".btn-close").addEventListener("click", () => {
    removeNotification(notification);
  });

  // Auto remove
  setTimeout(() => {
    removeNotification(notification);
  }, duration);
}

function removeNotification(notification) {
  if (!notification || !notification.parentNode) return;

  notification.style.opacity = "0";
  notification.style.transform = "translateX(100%)";

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// ====================================
// NOTIFICATION COUNTER
// ====================================

function updateNotificationCount() {
  try {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const testimonials = JSON.parse(
      localStorage.getItem("testimonials") || "[]"
    );

    const pendingOrders = orders.filter(
      (order) => order.status === "pending"
    ).length;
    const pendingTestimonials = testimonials.filter(
      (t) => t.status === "pending"
    ).length;

    const totalNotifications = pendingOrders + pendingTestimonials;

    const notificationBadges = document.querySelectorAll(".notification-badge");
    notificationBadges.forEach((badge) => {
      badge.textContent = totalNotifications;
      badge.style.display = totalNotifications === 0 ? "none" : "flex";
    });

    console.log(
      `🔔 Notifications updated: ${totalNotifications} pending items`
    );
  } catch (error) {
    console.error("❌ Error updating notification count:", error);
  }
}

// ====================================
// ERROR HANDLING
// ====================================

function handleComponentLoadError(componentName, error) {
  console.error(`❌ Failed to load ${componentName}:`, error);
  showNotification(
    `Gagal memuat komponen ${componentName}. Menggunakan fallback.`,
    "warning",
    5000
  );
}

// ====================================
// INITIALIZATION
// ====================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Admin dashboard initializing...");

  // Check login except on index page
  const currentPath = window.location.pathname;
  if (!currentPath.includes("index.html") && !currentPath.endsWith("/")) {
    if (!checkAdminLogin()) {
      console.log("❌ Authentication failed, redirecting to login");
      return;
    }
    console.log("✅ Authentication passed");
  }

  // Load core components
  loadSidebar();

  // Update notification count immediately
  updateNotificationCount();

  // Set up periodic updates (every 30 seconds)
  setInterval(updateNotificationCount, 30000);

  console.log("✅ Admin dashboard initialized successfully");
});

// ====================================
// GLOBAL EXPORTS
// ====================================

// Make functions available globally
window.showNotification = showNotification;
window.updateNotificationCount = updateNotificationCount;
window.checkAdminLogin = checkAdminLogin;

// Debug mode
if (localStorage.getItem("debug") === "true") {
  window.adminDebug = {
    loadSidebar,
    setMenuByRole,
    updateNotificationCount,
    loadInlineSidebar,
  };
  console.log("🐛 Debug mode enabled. Use window.adminDebug for debugging.");
}
