// js/testimoni.js - PURE JavaScript untuk Manajemen Testimoni

// ====================================
// DATA MANAGEMENT
// ====================================

// Data testimoni default
const defaultTestimonials = [
  {
    id: "T001",
    customerId: "C001",
    customerName: "Anita Susanti",
    customerEmail: "anita@example.com",
    productId: "P001",
    productName: "Bunga Mawar",
    rating: 5,
    content:
      "Sangat puas dengan kualitas bunga mawar yang saya beli. Segar dan tahan lama. Pelayanannya juga sangat baik. Pasti akan order lagi!",
    date: "2025-05-10",
    status: "approved",
    rejectionReason: "",
  },
  {
    id: "T002",
    customerId: "C002",
    customerName: "Budi Santoso",
    customerEmail: "budi@example.com",
    productId: "P002",
    productName: "Bunga Lily",
    rating: 4,
    content:
      "Bunga lily nya bagus dan harum. Packaging juga rapi. Cuma pengiriman agak lama sih, tapi overall puas.",
    date: "2025-05-08",
    status: "approved",
    rejectionReason: "",
  },
  {
    id: "T003",
    customerId: "C003",
    customerName: "Maya Wijaya",
    customerEmail: "maya@example.com",
    productId: "P005",
    productName: "Bunga Anggrek",
    rating: 5,
    content:
      "Anggrek yang saya beli masih segar dan sehat sampai sekarang. Sudah 2 minggu dan masih cantik. Terima kasih!",
    date: "2025-05-05",
    status: "pending",
    rejectionReason: "",
  },
  {
    id: "T004",
    customerId: "C004",
    customerName: "Dian Purnama",
    customerEmail: "dian@example.com",
    productId: "P003",
    productName: "Bunga Matahari",
    rating: 3,
    content:
      "Bunga matahari ok sih, tapi ukurannya lebih kecil dari yang di foto. Mungkin bisa diperbaiki untuk foto produknya.",
    date: "2025-05-03",
    status: "pending",
    rejectionReason: "",
  },
  {
    id: "T005",
    customerId: "C005",
    customerName: "Rudi Hermawan",
    customerEmail: "rudi@example.com",
    productId: "P004",
    productName: "Bunga Tulip",
    rating: 2,
    content:
      "Kecewa dengan bunga tulip nya. Tidak fresh dan ada yang sudah layu. Pelayanan customer service juga lambat.",
    date: "2025-05-01",
    status: "rejected",
    rejectionReason: "Testimoni mengandung keluhan yang belum terverifikasi",
  },
];

// Variabel global
let currentTestimoni = null;
let allTestimonials = [];

// ====================================
// INITIALIZATION
// ====================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Testimoni page initializing...");

  // Load data
  loadTestimonials();

  // Setup events
  setupEventListeners();

  console.log("✅ Testimoni page initialized");
});

// ====================================
// DATA LOADING
// ====================================

function loadTestimonials() {
  try {
    let testimonials = JSON.parse(localStorage.getItem("testimonials"));

    // Jika tidak ada data, gunakan default
    if (!testimonials || testimonials.length === 0) {
      testimonials = defaultTestimonials;
      localStorage.setItem("testimonials", JSON.stringify(testimonials));
      console.log("📝 Default testimonials loaded");
    }

    allTestimonials = testimonials;
    renderTestimonials(testimonials);
  } catch (error) {
    console.error("❌ Error loading testimonials:", error);
    showNotification("Gagal memuat data testimoni", "danger");
  }
}

function saveTestimonials() {
  try {
    localStorage.setItem("testimonials", JSON.stringify(allTestimonials));
    console.log("💾 Testimonials saved to localStorage");
  } catch (error) {
    console.error("❌ Error saving testimonials:", error);
    showNotification("Gagal menyimpan data testimoni", "danger");
  }
}

// ====================================
// RENDERING
// ====================================

function renderTestimonials(testimonials) {
  const tableBody = document.getElementById("testimoniTableBody");
  if (!tableBody) {
    console.error("❌ Table body not found!");
    return;
  }

  // Clear existing content
  tableBody.innerHTML = "";

  if (testimonials.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">
          <i class="bi bi-inbox fs-1 text-muted"></i>
          <p class="text-muted mt-2">Tidak ada testimoni ditemukan</p>
        </td>
      </tr>
    `;
    return;
  }

  testimonials.forEach((testimoni) => {
    const row = createTestimoniRow(testimoni);
    tableBody.appendChild(row);
  });

  // Setup action buttons
  setupActionButtons();

  console.log(`📊 Rendered ${testimonials.length} testimonials`);
}

function createTestimoniRow(testimoni) {
  const row = document.createElement("tr");

  // Format data
  const formattedDate = formatTanggal(new Date(testimoni.date));
  const stars = createStarRating(testimoni.rating);
  const shortContent = truncateText(testimoni.content, 100);
  const statusBadge = createStatusBadge(testimoni.status);
  const actionButtons = createActionButtons(testimoni);

  row.innerHTML = `
    <td>${testimoni.id}</td>
    <td>${testimoni.customerName}</td>
    <td>${testimoni.productName}</td>
    <td>${stars}</td>
    <td>
      <div class="testimoni-preview" title="${testimoni.content}">
        ${shortContent}
      </div>
    </td>
    <td>${formattedDate}</td>
    <td>${statusBadge}</td>
    <td>${actionButtons}</td>
  `;

  return row;
}

function createStarRating(rating) {
  const fullStars = "★".repeat(rating);
  const emptyStars = "☆".repeat(5 - rating);
  return `
    <span class="rating-stars" style="color: #ffc107;">${fullStars}${emptyStars}</span>
    <small class="text-muted d-block">(${rating}/5)</small>
  `;
}

function createStatusBadge(status) {
  const statusText = getStatusText(status);
  return `<span class="status-badge ${status}">${statusText}</span>`;
}

function createActionButtons(testimoni) {
  let buttons = `
    <div class="action-buttons">
      <button class="btn btn-info btn-sm view-testimoni" data-id="${testimoni.id}" title="Lihat Detail">
        <i class="bi bi-eye"></i>
      </button>
  `;

  // Tambah tombol approve/reject hanya untuk status pending
  if (testimoni.status === "pending") {
    buttons += `
      <button class="btn btn-success btn-sm approve-testimoni" data-id="${testimoni.id}" title="Setujui">
        <i class="bi bi-check-lg"></i>
      </button>
      <button class="btn btn-danger btn-sm reject-testimoni" data-id="${testimoni.id}" title="Tolak">
        <i class="bi bi-x-lg"></i>
      </button>
    `;
  }

  buttons += `</div>`;
  return buttons;
}

// ====================================
// EVENT LISTENERS
// ====================================

function setupEventListeners() {
  // Filter controls
  setupFilterControls();

  // Search functionality
  setupSearchFunctionality();

  // Bulk actions
  setupBulkActions();

  // Modal controls
  setupModalControls();
}

function setupFilterControls() {
  const statusFilter = document.getElementById("testimoniStatusFilter");
  const ratingFilter = document.getElementById("testimoniRatingFilter");

  if (statusFilter) {
    statusFilter.addEventListener("change", applyFilters);
  }

  if (ratingFilter) {
    ratingFilter.addEventListener("change", applyFilters);
  }
}

function setupSearchFunctionality() {
  const searchInput = document.getElementById("searchTestimoni");
  if (searchInput) {
    // Debounce search untuk performance
    let searchTimeout;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        applyFilters();
      }, 300);
    });
  }
}

function setupBulkActions() {
  const approveAllBtn = document.getElementById("approveAllBtn");
  if (approveAllBtn) {
    approveAllBtn.addEventListener("click", approveAllPending);
  }
}

function setupModalControls() {
  // Status select change
  const statusSelect = document.getElementById("testimoniStatusSelect");
  if (statusSelect) {
    statusSelect.addEventListener("change", function () {
      toggleRejectionReason(this.value === "rejected");
    });
  }

  // Update status button
  const updateStatusBtn = document.getElementById("updateStatusTestimoniBtn");
  if (updateStatusBtn) {
    updateStatusBtn.addEventListener("click", updateTestimoniStatus);
  }

  // Quick action buttons
  const quickApproveBtn = document.getElementById("quickApproveBtn");
  const quickRejectBtn = document.getElementById("quickRejectBtn");

  if (quickApproveBtn) {
    quickApproveBtn.addEventListener("click", () =>
      quickUpdateStatus("approved")
    );
  }

  if (quickRejectBtn) {
    quickRejectBtn.addEventListener("click", () =>
      quickUpdateStatus("rejected")
    );
  }
}

function setupActionButtons() {
  // View buttons
  document.querySelectorAll(".view-testimoni").forEach((button) => {
    button.addEventListener("click", function () {
      const testimoniId = this.getAttribute("data-id");
      viewTestimoniDetails(testimoniId);
    });
  });

  // Quick approve buttons
  document.querySelectorAll(".approve-testimoni").forEach((button) => {
    button.addEventListener("click", function () {
      const testimoniId = this.getAttribute("data-id");
      confirmAndUpdateStatus(testimoniId, "approved");
    });
  });

  // Quick reject buttons
  document.querySelectorAll(".reject-testimoni").forEach((button) => {
    button.addEventListener("click", function () {
      const testimoniId = this.getAttribute("data-id");
      confirmAndUpdateStatus(testimoniId, "rejected");
    });
  });
}

// ====================================
// FILTERING & SEARCHING
// ====================================

function applyFilters() {
  const statusFilter = document.getElementById("testimoniStatusFilter").value;
  const ratingFilter = document.getElementById("testimoniRatingFilter").value;
  const searchKeyword = document
    .getElementById("searchTestimoni")
    .value.toLowerCase()
    .trim();

  let filteredTestimonials = [...allTestimonials];

  // Filter by status
  if (statusFilter !== "all") {
    filteredTestimonials = filteredTestimonials.filter(
      (t) => t.status === statusFilter
    );
  }

  // Filter by rating
  if (ratingFilter !== "all") {
    filteredTestimonials = filteredTestimonials.filter(
      (t) => t.rating === parseInt(ratingFilter)
    );
  }

  // Filter by search keyword
  if (searchKeyword) {
    filteredTestimonials = filteredTestimonials.filter(
      (t) =>
        t.customerName.toLowerCase().includes(searchKeyword) ||
        t.productName.toLowerCase().includes(searchKeyword) ||
        t.content.toLowerCase().includes(searchKeyword) ||
        t.id.toLowerCase().includes(searchKeyword)
    );
  }

  renderTestimonials(filteredTestimonials);

  console.log(`🔍 Filters applied: ${filteredTestimonials.length} results`);
}

// ====================================
// MODAL MANAGEMENT
// ====================================

function viewTestimoniDetails(id) {
  const testimoni = allTestimonials.find((t) => t.id === id);

  if (!testimoni) {
    showNotification("Testimoni tidak ditemukan", "danger");
    return;
  }

  currentTestimoni = testimoni;
  populateModal(testimoni);

  const modal = new bootstrap.Modal(
    document.getElementById("testimoniDetailModal")
  );
  modal.show();

  console.log(`👁️ Viewing details for testimoni: ${id}`);
}

function populateModal(testimoni) {
  // Customer info
  document.getElementById("customerNameDetail").textContent =
    testimoni.customerName;
  document.getElementById("customerEmailDetail").textContent =
    testimoni.customerEmail;
  document.getElementById("customerJoinDetail").textContent =
    "Data tidak tersedia";

  // Testimoni info
  document.getElementById("testimoniIdDetail").textContent = testimoni.id;
  document.getElementById("productNameDetail").textContent =
    testimoni.productName;
  document.getElementById("ratingDetail").innerHTML = createStarRating(
    testimoni.rating
  );
  document.getElementById("dateDetail").textContent = formatTanggal(
    new Date(testimoni.date)
  );
  document.getElementById("testimoniContentDetail").textContent =
    testimoni.content;

  // Status controls
  document.getElementById("testimoniStatusSelect").value = testimoni.status;
  document.getElementById("rejectionReason").value =
    testimoni.rejectionReason || "";

  // Show/hide rejection reason
  toggleRejectionReason(testimoni.status === "rejected");
}

function toggleRejectionReason(show) {
  const rejectionDiv = document.getElementById("rejectionReasonDiv");
  if (rejectionDiv) {
    rejectionDiv.style.display = show ? "block" : "none";
  }
}

// ====================================
// STATUS MANAGEMENT
// ====================================

function updateTestimoniStatus() {
  if (!currentTestimoni) return;

  const newStatus = document.getElementById("testimoniStatusSelect").value;
  const rejectionReason = document
    .getElementById("rejectionReason")
    .value.trim();

  // Validate rejection reason
  if (newStatus === "rejected" && !rejectionReason) {
    showNotification("Mohon masukkan alasan penolakan", "warning");
    return;
  }

  // Update testimoni
  const success = updateTestimoniStatusData(
    currentTestimoni.id,
    newStatus,
    rejectionReason
  );

  if (success) {
    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("testimoniDetailModal")
    );
    modal.hide();

    // Refresh display
    applyFilters();

    showNotification(
      `Status testimoni berhasil diubah menjadi ${getStatusText(newStatus)}`,
      "success"
    );
  }
}

function quickUpdateStatus(status) {
  if (!currentTestimoni) return;

  let rejectionReason = "";
  if (status === "rejected") {
    rejectionReason = prompt("Masukkan alasan penolakan (opsional):");
    if (rejectionReason === null) return; // User cancelled
  }

  const success = updateTestimoniStatusData(
    currentTestimoni.id,
    status,
    rejectionReason
  );

  if (success) {
    // Close modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("testimoniDetailModal")
    );
    modal.hide();

    // Refresh display
    applyFilters();

    const statusText = status === "approved" ? "disetujui" : "ditolak";
    showNotification(`Testimoni berhasil ${statusText}`, "success");
  }
}

function confirmAndUpdateStatus(id, status) {
  const testimoni = allTestimonials.find((t) => t.id === id);
  if (!testimoni) return;

  const action = status === "approved" ? "menyetujui" : "menolak";
  if (
    !confirm(
      `Apakah Anda yakin ingin ${action} testimoni dari ${testimoni.customerName}?`
    )
  ) {
    return;
  }

  let rejectionReason = "";
  if (status === "rejected") {
    rejectionReason = prompt("Masukkan alasan penolakan (opsional):") || "";
  }

  const success = updateTestimoniStatusData(id, status, rejectionReason);

  if (success) {
    applyFilters();
    const statusText = status === "approved" ? "disetujui" : "ditolak";
    showNotification(`Testimoni berhasil ${statusText}`, "success");
  }
}

function updateTestimoniStatusData(id, status, rejectionReason = "") {
  try {
    const index = allTestimonials.findIndex((t) => t.id === id);

    if (index === -1) {
      showNotification("Testimoni tidak ditemukan", "danger");
      return false;
    }

    // Update data
    allTestimonials[index].status = status;
    allTestimonials[index].rejectionReason = rejectionReason;

    // Save to localStorage
    saveTestimonials();

    // Update notification count
    if (typeof updateNotificationCount === "function") {
      updateNotificationCount();
    }

    console.log(`✅ Testimoni ${id} status updated to: ${status}`);
    return true;
  } catch (error) {
    console.error("❌ Error updating testimoni status:", error);
    showNotification("Gagal mengupdate status testimoni", "danger");
    return false;
  }
}

// ====================================
// BULK OPERATIONS
// ====================================

function approveAllPending() {
  const pendingTestimonials = allTestimonials.filter(
    (t) => t.status === "pending"
  );

  if (pendingTestimonials.length === 0) {
    showNotification("Tidak ada testimoni pending untuk disetujui", "info");
    return;
  }

  if (
    !confirm(
      `Apakah Anda yakin ingin menyetujui ${pendingTestimonials.length} testimoni yang pending?`
    )
  ) {
    return;
  }

  try {
    let approvedCount = 0;

    allTestimonials.forEach((testimoni) => {
      if (testimoni.status === "pending") {
        testimoni.status = "approved";
        testimoni.rejectionReason = "";
        approvedCount++;
      }
    });

    saveTestimonials();
    applyFilters();

    if (typeof updateNotificationCount === "function") {
      updateNotificationCount();
    }

    showNotification(
      `${approvedCount} testimoni berhasil disetujui`,
      "success"
    );
    console.log(`✅ Bulk approved ${approvedCount} testimonials`);
  } catch (error) {
    console.error("❌ Error in bulk approve:", error);
    showNotification("Gagal menyetujui testimoni secara massal", "danger");
  }
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

function getStatusText(status) {
  const statusMap = {
    pending: "Menunggu Review",
    approved: "Disetujui",
    rejected: "Ditolak",
  };
  return statusMap[status] || status;
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// ====================================
// EXPORTS (untuk debugging)
// ====================================

if (localStorage.getItem("debug") === "true") {
  window.testimoniDebug = {
    allTestimonials,
    currentTestimoni,
    loadTestimonials,
    applyFilters,
    updateTestimoniStatusData,
  };
  console.log("🐛 Testimoni debug mode enabled");
}
