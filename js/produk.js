// js/produk.js - FINAL FIX: Image loading & Add product functionality

// ====================================
// DATA MANAGEMENT
// ====================================

// Data produk default dengan placeholder images yang valid
const defaultProducts = [
  {
    id: "P001",
    name: "Bunga Mawar",
    category: "bunga_potong",
    price: 100000,
    stock: 25,
    status: "active",
    description: "Bunga mawar segar dengan warna merah yang menawan",
    imageUrl: "https://via.placeholder.com/80x80/ff6b6b/ffffff?text=🌹",
    createdAt: "2025-01-15",
  },
  {
    id: "P002",
    name: "Bunga Lily",
    category: "bunga_potong",
    price: 120000,
    stock: 18,
    status: "active",
    description: "Bunga lily putih yang elegan dan harum",
    imageUrl: "https://via.placeholder.com/80x80/4ecdc4/ffffff?text=🌸",
    createdAt: "2025-01-14",
  },
  {
    id: "P003",
    name: "Bunga Matahari",
    category: "bunga_potong",
    price: 95000,
    stock: 5,
    status: "active",
    description: "Bunga matahari segar dengan warna kuning cerah",
    imageUrl: "https://via.placeholder.com/80x80/ffe066/ffffff?text=🌻",
    createdAt: "2025-01-13",
  },
  {
    id: "P004",
    name: "Bunga Tulip",
    category: "bunga_potong",
    price: 150000,
    stock: 12,
    status: "active",
    description: "Bunga tulip impor dengan berbagai pilihan warna",
    imageUrl: "https://via.placeholder.com/80x80/ff7675/ffffff?text=🌷",
    createdAt: "2025-01-12",
  },
  {
    id: "P005",
    name: "Bunga Anggrek",
    category: "bunga_pot",
    price: 200000,
    stock: 8,
    status: "active",
    description: "Tanaman anggrek dalam pot yang tahan lama",
    imageUrl: "https://via.placeholder.com/80x80/a29bfe/ffffff?text=🌺",
    createdAt: "2025-01-11",
  },
  {
    id: "P006",
    name: "Bunga Krisan",
    category: "bunga_potong",
    price: 85000,
    stock: 0,
    status: "inactive",
    description: "Bunga krisan dengan warna-warni cerah",
    imageUrl: "https://via.placeholder.com/80x80/fd79a8/ffffff?text=🌼",
    createdAt: "2025-01-10",
  },
];

// Pemetaan kategori
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

// Global variables
let allProducts = [];
let currentProduct = null;

// ====================================
// INITIALIZATION
// ====================================

document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Produk page initializing...");

  // Load products immediately
  loadProducts();

  // Setup event listeners
  setupEventListeners();

  console.log("✅ Produk page initialized");
});

// ====================================
// DATA LOADING
// ====================================

function loadProducts() {
  try {
    console.log("📦 Loading products from localStorage...");

    let products = JSON.parse(localStorage.getItem("products"));

    // Jika tidak ada data atau data kosong, gunakan default
    if (!products || products.length === 0) {
      console.log("📝 No existing products, loading defaults...");
      products = defaultProducts;
      localStorage.setItem("products", JSON.stringify(products));
      console.log("✅ Default products saved to localStorage");
    }

    allProducts = products;
    console.log(`📊 Loaded ${products.length} products`);

    // Render products
    renderProducts(products);
  } catch (error) {
    console.error("❌ Error loading products:", error);
    showErrorState();
  }
}

function showErrorState() {
  const tableBody = document.getElementById("productTableBody");
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle fs-2"></i>
            <p class="mt-2">Gagal memuat data produk</p>
            <button class="btn btn-primary btn-sm" onclick="loadProducts()">
              <i class="bi bi-arrow-clockwise"></i> Coba Lagi
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}

// ====================================
// RENDERING
// ====================================

function renderProducts(products) {
  const tableBody = document.getElementById("productTableBody");
  if (!tableBody) {
    console.error("❌ Product table body not found!");
    return;
  }

  // Clear existing content
  tableBody.innerHTML = "";

  if (products.length === 0) {
    showEmptyState();
    return;
  }

  // Create table rows
  products.forEach((product) => {
    const row = createProductRow(product);
    tableBody.appendChild(row);
  });

  // Setup action buttons after rendering
  setupActionButtons();

  console.log(`✅ Rendered ${products.length} products`);
}

function showEmptyState() {
  const tableBody = document.getElementById("productTableBody");
  if (tableBody) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-5">
          <div class="text-center">
            <i class="bi bi-box-seam fs-1 text-muted"></i>
            <p class="mt-3 text-muted">Belum ada produk</p>
            <button class="btn btn-primary" onclick="openAddProductModal()">
              <i class="bi bi-plus-lg"></i> Tambah Produk Pertama
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}

function createProductRow(product) {
  const row = document.createElement("tr");

  // Determine status
  const { statusClass, statusText } = getProductStatus(product);

  // Format data
  const categoryName = getCategoryName(product.category);
  const formattedPrice = formatRupiah(product.price);

  // FIXED: Stable image with proper fallback
  const imageHtml = `
    <div class="product-img-container" style="width: 60px; height: 60px;">
      <img src="${product.imageUrl}" 
           class="product-img" 
           alt="${product.name}"
           style="width: 100%; height: 100%; object-fit: cover; border-radius: 5px; border: 1px solid #dee2e6;"
           onload="this.style.opacity='1'"
           onerror="this.src='https://via.placeholder.com/60x60/cccccc/ffffff?text=No+Image'; this.style.opacity='1'">
    </div>
  `;

  row.innerHTML = `
    <td>${product.id}</td>
    <td>${imageHtml}</td>
    <td>
      <div class="fw-semibold">${product.name}</div>
      <small class="text-muted">${truncateText(
        product.description || "",
        50
      )}</small>
    </td>
    <td>${categoryName}</td>
    <td>${formattedPrice}</td>
    <td>
      <span class="badge ${product.stock <= 5 ? "bg-warning" : "bg-success"}">
        ${product.stock}
      </span>
    </td>
    <td>
      <span class="product-status ${statusClass}">${statusText}</span>
    </td>
    <td>
      <div class="action-buttons">
        <button class="btn btn-info btn-sm edit-product" 
                data-id="${product.id}" 
                title="Edit Produk">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-danger btn-sm delete-product" 
                data-id="${product.id}" 
                title="Hapus Produk">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    </td>
  `;

  return row;
}

function getProductStatus(product) {
  if (product.status === "inactive") {
    return { statusClass: "inactive", statusText: "Nonaktif" };
  } else if (product.stock === 0) {
    return { statusClass: "inactive", statusText: "Habis" };
  } else if (product.stock <= 5) {
    return { statusClass: "low-stock", statusText: "Stok Rendah" };
  } else {
    return { statusClass: "active", statusText: "Aktif" };
  }
}

function getCategoryName(categoryCode) {
  return categoryMap[categoryCode] || categoryCode || "Tidak Dikategorikan";
}

function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// ====================================
// EVENT LISTENERS
// ====================================

function setupEventListeners() {
  console.log("🔧 Setting up event listeners...");

  // FIXED: Tambah Produk button - Pastikan event listener terpasang
  setupAddProductButton();

  // Search functionality
  setupSearchFunctionality();

  // Modal controls
  setupModalControls();

  // Form validations
  setupFormValidations();
}

function setupAddProductButton() {
  // Cari semua kemungkinan tombol tambah produk
  const addButtons = [
    document.getElementById("btnAddProduct"),
    document.querySelector("[data-bs-target='#addProductModal']"),
    document.querySelector(".btn[onclick*='addProduct']"),
  ];

  addButtons.forEach((btn) => {
    if (btn) {
      // Remove existing listeners untuk avoid duplicate
      btn.removeEventListener("click", openAddProductModal);

      // Add new listener
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        console.log("🔥 Add product button clicked!");
        openAddProductModal();
      });

      console.log("✅ Add product button setup:", btn.id || btn.className);
    }
  });
}

function setupSearchFunctionality() {
  const searchInput = document.getElementById("searchProduct");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", function () {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        filterProducts(this.value);
      }, 300);
    });
    console.log("✅ Search functionality setup");
  }
}

function setupModalControls() {
  // Save product button
  const saveProductBtn = document.getElementById("saveProductBtn");
  if (saveProductBtn) {
    saveProductBtn.removeEventListener("click", saveProduct);
    saveProductBtn.addEventListener("click", function (e) {
      e.preventDefault();
      console.log("💾 Save product button clicked!");
      saveProduct();
    });
    console.log("✅ Save product button setup");
  }

  // Update product button
  const updateProductBtn = document.getElementById("updateProductBtn");
  if (updateProductBtn) {
    updateProductBtn.addEventListener("click", updateProduct);
  }

  // Delete confirmation button
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", confirmDeleteProduct);
  }

  console.log("✅ Modal controls setup");
}

function setupFormValidations() {
  // Image upload handlers
  setupImageUploads();

  // Form reset on modal close
  setupModalResets();
}

function setupImageUploads() {
  // Add product image upload
  const productImageUpload = document.getElementById("productImageUpload");
  const productImage = document.getElementById("productImage");

  if (productImageUpload && productImage) {
    productImageUpload.addEventListener("click", () => productImage.click());
    productImage.addEventListener("change", function (e) {
      if (e.target.files[0]) {
        previewImage(e.target.files[0], "productImageUpload");
      }
    });
  }

  // Edit product image upload
  const editProductImageUpload = document.getElementById(
    "editProductImageUpload"
  );
  const editProductImage = document.getElementById("editProductImage");

  if (editProductImageUpload && editProductImage) {
    editProductImageUpload.addEventListener("click", () =>
      editProductImage.click()
    );
    editProductImage.addEventListener("change", function (e) {
      if (e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById("editProductPreview").src =
            event.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
}

function setupModalResets() {
  // Reset add modal when closed
  const addModal = document.getElementById("addProductModal");
  if (addModal) {
    addModal.addEventListener("hidden.bs.modal", resetAddProductForm);
  }

  // Reset edit modal when closed
  const editModal = document.getElementById("editProductModal");
  if (editModal) {
    editModal.addEventListener("hidden.bs.modal", resetEditProductForm);
  }
}

function setupActionButtons() {
  // Edit buttons
  document.querySelectorAll(".edit-product").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      openEditModal(productId);
    });
  });

  // Delete buttons
  document.querySelectorAll(".delete-product").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      openDeleteConfirmModal(productId);
    });
  });
}

// ====================================
// FILTERING & SEARCH
// ====================================

function filterProducts(keyword) {
  if (!keyword || keyword.trim() === "") {
    renderProducts(allProducts);
    return;
  }

  const searchTerm = keyword.toLowerCase().trim();
  const filteredProducts = allProducts.filter((product) => {
    return (
      product.id.toLowerCase().includes(searchTerm) ||
      product.name.toLowerCase().includes(searchTerm) ||
      getCategoryName(product.category).toLowerCase().includes(searchTerm) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm))
    );
  });

  renderProducts(filteredProducts);
  console.log(`🔍 Search results: ${filteredProducts.length} products found`);
}

// ====================================
// MODAL MANAGEMENT
// ====================================

function openAddProductModal() {
  console.log("🎯 Opening add product modal...");

  // Reset form first
  resetAddProductForm();

  // Open modal
  const modal = new bootstrap.Modal(document.getElementById("addProductModal"));
  modal.show();

  console.log("✅ Add product modal opened");
}

function openEditModal(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) {
    showNotification("Produk tidak ditemukan", "danger");
    return;
  }

  currentProduct = product;
  populateEditForm(product);

  const modal = new bootstrap.Modal(
    document.getElementById("editProductModal")
  );
  modal.show();

  console.log(`✏️ Edit modal opened for product: ${productId}`);
}

function openDeleteConfirmModal(productId) {
  const product = allProducts.find((p) => p.id === productId);
  if (!product) {
    showNotification("Produk tidak ditemukan", "danger");
    return;
  }

  currentProduct = product;
  document.getElementById("deleteProductName").textContent = product.name;

  const modal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  modal.show();

  console.log(`🗑️ Delete confirmation modal opened for: ${productId}`);
}

function populateEditForm(product) {
  document.getElementById("editProductId").value = product.id;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductCategory").value = product.category;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductStock").value = product.stock;
  document.getElementById("editProductDescription").value =
    product.description || "";
  document.getElementById("editProductStatus").value = product.status;

  // Set preview image
  const preview = document.getElementById("editProductPreview");
  if (preview) {
    preview.src =
      product.imageUrl ||
      "https://via.placeholder.com/150x150/cccccc/ffffff?text=No+Image";
    preview.onerror = () =>
      (preview.src =
        "https://via.placeholder.com/150x150/cccccc/ffffff?text=No+Image");
  }
}

// ====================================
// CRUD OPERATIONS
// ====================================

function saveProduct() {
  console.log("💾 Attempting to save product...");

  // Validate form
  if (!validateProductForm("add")) {
    console.log("❌ Form validation failed");
    return;
  }

  // Get form data
  const formData = getAddFormData();
  console.log("📝 Form data:", formData);

  // Generate new ID
  const newId = generateProductId();
  console.log("🆔 Generated ID:", newId);

  // Create new product
  const newProduct = {
    id: newId,
    ...formData,
    createdAt: new Date().toISOString().split("T")[0],
    imageUrl: `https://via.placeholder.com/80x80/89aaaf/ffffff?text=${encodeURIComponent(
      formData.name.substring(0, 2)
    )}`,
  };

  console.log("🆕 New product:", newProduct);

  // Add to array
  allProducts.push(newProduct);

  // Save to localStorage
  saveProductsToStorage();

  // Refresh display
  renderProducts(allProducts);

  // Close modal and reset form
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addProductModal")
  );
  if (modal) {
    modal.hide();
  }

  showNotification("Produk berhasil ditambahkan!", "success");
  console.log(`✅ New product added: ${newId}`);
}

function updateProduct() {
  if (!currentProduct) return;

  // Validate form
  if (!validateProductForm("edit")) return;

  // Get form data
  const formData = getEditFormData();

  // Find and update product
  const index = allProducts.findIndex((p) => p.id === currentProduct.id);
  if (index === -1) {
    showNotification("Produk tidak ditemukan", "danger");
    return;
  }

  // Update product
  allProducts[index] = {
    ...allProducts[index],
    ...formData,
  };

  // Save to localStorage
  saveProductsToStorage();

  // Refresh display
  renderProducts(allProducts);

  // Close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("editProductModal")
  );
  modal.hide();

  showNotification("Produk berhasil diperbarui!", "success");
  console.log(`✅ Product updated: ${currentProduct.id}`);
}

function confirmDeleteProduct() {
  if (!currentProduct) return;

  // Remove from array
  allProducts = allProducts.filter((p) => p.id !== currentProduct.id);

  // Save to localStorage
  saveProductsToStorage();

  // Refresh display
  renderProducts(allProducts);

  // Close modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("deleteConfirmModal")
  );
  modal.hide();

  showNotification("Produk berhasil dihapus!", "success");
  console.log(`🗑️ Product deleted: ${currentProduct.id}`);

  currentProduct = null;
}

// ====================================
// UTILITY FUNCTIONS
// ====================================

function validateProductForm(type) {
  const prefix = type === "edit" ? "edit" : "";

  const productName = document
    .getElementById(`${prefix}ProductName`)
    ?.value?.trim();
  const productCategory = document.getElementById(
    `${prefix}ProductCategory`
  )?.value;
  const productPrice = document.getElementById(`${prefix}ProductPrice`)?.value;
  const productStock = document.getElementById(`${prefix}ProductStock`)?.value;

  console.log("🔍 Validating form:", {
    productName,
    productCategory,
    productPrice,
    productStock,
  });

  if (!productName || !productCategory || !productPrice || !productStock) {
    showNotification("Mohon lengkapi semua field yang diperlukan", "warning");
    return false;
  }

  if (isNaN(productPrice) || parseFloat(productPrice) < 0) {
    showNotification("Harga harus berupa angka positif", "warning");
    return false;
  }

  if (isNaN(productStock) || parseInt(productStock) < 0) {
    showNotification("Stok harus berupa angka positif", "warning");
    return false;
  }

  console.log("✅ Form validation passed");
  return true;
}

function getAddFormData() {
  const data = {
    name: document.getElementById("productName")?.value?.trim() || "",
    category: document.getElementById("productCategory")?.value || "",
    price: parseInt(document.getElementById("productPrice")?.value) || 0,
    stock: parseInt(document.getElementById("productStock")?.value) || 0,
    description:
      document.getElementById("productDescription")?.value?.trim() || "",
    status: document.getElementById("productStatus")?.value || "active",
  };

  console.log("📋 Add form data:", data);
  return data;
}

function getEditFormData() {
  return {
    name: document.getElementById("editProductName").value.trim(),
    category: document.getElementById("editProductCategory").value,
    price: parseInt(document.getElementById("editProductPrice").value),
    stock: parseInt(document.getElementById("editProductStock").value),
    description: document.getElementById("editProductDescription").value.trim(),
    status: document.getElementById("editProductStatus").value,
  };
}

function generateProductId() {
  const lastId =
    allProducts.length > 0 ? allProducts[allProducts.length - 1].id : "P000";
  const newIdNumber = parseInt(lastId.substring(1)) + 1;
  return "P" + newIdNumber.toString().padStart(3, "0");
}

function saveProductsToStorage() {
  try {
    localStorage.setItem("products", JSON.stringify(allProducts));
    console.log("💾 Products saved to localStorage");
  } catch (error) {
    console.error("❌ Error saving products:", error);
    showNotification("Gagal menyimpan data produk", "danger");
  }
}

function previewImage(file, containerId) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = `
        <img src="${e.target.result}" 
             alt="Preview" 
             style="max-width: 100%; max-height: 180px; border-radius: 8px;">
      `;
    }
  };
  reader.readAsDataURL(file);
}

function resetAddProductForm() {
  const form = document.getElementById("addProductForm");
  if (form) {
    form.reset();
  }

  const imageUpload = document.getElementById("productImageUpload");
  if (imageUpload) {
    imageUpload.innerHTML = `
      <i class="bi bi-cloud-upload"></i>
      <p>Klik atau seret file untuk upload</p>
      <small>PNG, JPG, atau JPEG (Maks. 2MB)</small>
    `;
  }

  console.log("🔄 Add product form reset");
}

function resetEditProductForm() {
  const form = document.getElementById("editProductForm");
  if (form) {
    form.reset();
  }
  currentProduct = null;
}

// ====================================
// GLOBAL FUNCTIONS
// ====================================

// Make functions available globally for HTML onclick handlers
window.openAddProductModal = openAddProductModal;
window.loadProducts = loadProducts;

// Debug exports
if (localStorage.getItem("debug") === "true") {
  window.produkDebug = {
    allProducts,
    loadProducts,
    renderProducts,
    saveProduct,
    validateProductForm,
    getAddFormData,
  };
  console.log("🐛 Produk debug mode enabled");
}
