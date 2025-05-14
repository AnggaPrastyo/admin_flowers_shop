/**
 * PERBAIKAN HALAMAN PRODUK ADMIN
 * Silakan ganti seluruh isi file js/products.js dengan kode ini
 * atau buat file baru products-fixed.js dan import di halaman products.html
 */

// Data produk default jika localStorage kosong atau rusak
const defaultProducts = [
  {
    id: "P001",
    name: "Bunga Mawar",
    category: "bunga_potong",
    price: 100000,
    stock: 25,
    status: "active",
    description: "Bunga mawar segar dengan warna merah yang menawan",
  },
  {
    id: "P002",
    name: "Bunga Lily",
    category: "bunga_potong",
    price: 120000,
    stock: 18,
    status: "active",
    description: "Bunga lily putih yang elegan dan harum",
  },
  {
    id: "P003",
    name: "Bunga Matahari",
    category: "bunga_potong",
    price: 95000,
    stock: 5,
    status: "active",
    description: "Bunga matahari segar dengan warna kuning cerah",
  },
  {
    id: "P004",
    name: "Bunga Tulip",
    category: "bunga_potong",
    price: 150000,
    stock: 12,
    status: "active",
    description: "Bunga tulip impor dengan berbagai pilihan warna",
  },
  {
    id: "P005",
    name: "Bunga Anggrek",
    category: "bunga_pot",
    price: 200000,
    stock: 8,
    status: "active",
    description: "Tanaman anggrek dalam pot yang tahan lama",
  },
  {
    id: "P006",
    name: "Bunga Krisan",
    category: "bunga_potong",
    price: 85000,
    stock: 0,
    status: "inactive",
    description: "Bunga krisan dengan warna-warni cerah",
  },
];

// Pemetaan kategori untuk tampilan yang lebih baik
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

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  console.log("Produk: Halaman dimuat, menyiapkan tampilan...");

  // Periksa login admin
  checkLoginStatus();

  // Stabilkan tabel untuk mencegah getaran
  stabilizeTables();

  // Mulai loading dengan sedikit delay untuk memastikan DOM siap
  setTimeout(() => {
    console.log("Memuat data produk...");
    loadProducts();
    setupEventListeners();
  }, 100);
});

// Periksa status login admin
function checkLoginStatus() {
  if (!localStorage.getItem("adminSudahLogin")) {
    console.log("Admin belum login, redirect ke halaman login");
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Stabilkan tabel produk
function stabilizeTables() {
  const tableContainer = document.querySelector(".data-table");
  if (tableContainer) {
    tableContainer.style.minHeight = "400px";
  }

  const table = document.getElementById("productsTable");
  if (table) {
    table.style.width = "100%";
    table.style.tableLayout = "fixed";
  }

  // Tambahkan CSS untuk mencegah flicker
  const style = document.createElement("style");
  style.textContent = `
    .data-table { min-height: 400px; }
    #productsTable { width: 100%; table-layout: fixed; }
    #productsTable tbody td { 
      vertical-align: middle; 
      overflow: hidden; 
      text-overflow: ellipsis;
      transition: none !important;
    }
    .action-buttons { display: flex; gap: 5px; justify-content: center; }
  `;
  document.head.appendChild(style);
}

// Setup semua event listener
function setupEventListeners() {
  // Event untuk tombol Save Product baru
  const saveProductBtn = document.getElementById("saveProductBtn");
  if (saveProductBtn) {
    saveProductBtn.addEventListener("click", function () {
      addProduct();
    });
  }

  // Event untuk tombol Update Product (edit)
  const updateProductBtn = document.getElementById("updateProductBtn");
  if (updateProductBtn) {
    updateProductBtn.addEventListener("click", function () {
      updateProduct();
    });
  }

  // Event untuk pencarian produk
  const searchProduct = document.getElementById("searchProduct");
  if (searchProduct) {
    searchProduct.addEventListener("input", function () {
      filterProducts(this.value);
    });
  }

  // Event untuk upload gambar produk baru
  setupImageUploadEvents();
}

// Setup event untuk upload gambar
function setupImageUploadEvents() {
  // Upload gambar produk baru
  const productImageUpload = document.getElementById("productImageUpload");
  const productImage = document.getElementById("productImage");

  if (productImageUpload && productImage) {
    productImageUpload.addEventListener("click", function () {
      productImage.click();
    });

    productImage.addEventListener("change", function (e) {
      if (e.target.files[0]) {
        readImagePreview(e.target.files[0], "productImageUpload");
      }
    });
  }

  // Upload gambar edit produk
  const editProductImageUpload = document.getElementById(
    "editProductImageUpload"
  );
  const editProductImage = document.getElementById("editProductImage");

  if (editProductImageUpload && editProductImage) {
    editProductImageUpload.addEventListener("click", function () {
      editProductImage.click();
    });

    editProductImage.addEventListener("change", function (e) {
      if (e.target.files[0]) {
        readImagePreview(e.target.files[0], "editProductImagePreview");
      }
    });
  }
}

// Fungsi untuk memuat produk dari localStorage
function loadProducts() {
  try {
    console.log("Mengambil data produk dari localStorage");

    // Coba ambil dari localStorage
    let products = [];

    try {
      const storedProducts = localStorage.getItem("products");
      products = storedProducts ? JSON.parse(storedProducts) : [];
      console.log(`${products.length} produk ditemukan di localStorage`);
    } catch (e) {
      console.error("Error saat parsing produk dari localStorage:", e);
      products = [];
    }

    // Jika tidak ada produk, gunakan data default
    if (!products || !Array.isArray(products) || products.length === 0) {
      console.log("Tidak ada data produk, menggunakan data default");
      products = defaultProducts;

      // Simpan data default ke localStorage
      localStorage.setItem("products", JSON.stringify(products));
    }

    // Render produk ke tampilan
    renderProducts(products);
    return products;
  } catch (err) {
    console.error("Error saat memuat produk:", err);
    showErrorMessage("Terjadi kesalahan saat memuat data produk");
    return [];
  }
}

// Tampilkan pesan error di tabel
function showErrorMessage(message) {
  const tbody = document.querySelector("#productsTable tbody");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center py-4">
          <div class="alert alert-danger">
            <i class="bi bi-exclamation-triangle me-2"></i> ${message}
          </div>
          <button class="btn btn-primary" onclick="loadProducts()">
            <i class="bi bi-arrow-clockwise me-2"></i> Coba Lagi
          </button>
        </td>
      </tr>
    `;
  }
}

// Fungsi untuk render produk ke tabel
function renderProducts(products) {
  try {
    console.log("Rendering produk ke tabel...");

    const tbody = document.querySelector("#productsTable tbody");
    if (!tbody) {
      console.error("Elemen tbody tidak ditemukan");
      return;
    }

    // Kosongkan tbody
    tbody.innerHTML = "";

    // Jika tidak ada produk, tampilkan pesan
    if (!products || !Array.isArray(products) || products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-4">
            <div class="text-muted">
              <i class="bi bi-inbox fs-1 d-block mb-2"></i>
              Tidak ada produk tersedia
            </div>
          </td>
        </tr>
      `;
      return;
    }

    // Loop melalui setiap produk
    products.forEach((product) => {
      // Tentukan status dan text
      let statusClass = "active";
      let statusText = "Aktif";

      if (product.status === "inactive") {
        statusClass = "inactive";
        statusText = "Nonaktif";
      } else if (product.stock <= 5 && product.stock > 0) {
        statusClass = "low-stock";
        statusText = "Stok Rendah";
      } else if (product.stock === 0) {
        statusClass = "inactive";
        statusText = "Habis";
      }

      // Buat dan tambahkan baris produk
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${product.id || ""}</td>
        <td>
          <img 
            src="img/products/${(product.id || "").toLowerCase()}.jpg" 
            alt="${product.name || ""}" 
            class="product-img" 
            onerror="this.src='img/placeholder.jpg'"
          >
        </td>
        <td>${product.name || ""}</td>
        <td>${getCategoryName(product.category) || ""}</td>
        <td>Rp ${(product.price || 0).toLocaleString()}</td>
        <td>${product.stock || 0}</td>
        <td>
          <span class="product-status ${statusClass}">${statusText}</span>
        </td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-info btn-sm edit-btn" data-id="${
              product.id
            }">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-btn" data-id="${
              product.id
            }">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;

      tbody.appendChild(row);
    });

    // Tambahkan event listeners untuk tombol edit dan delete
    addRowButtonListeners();
  } catch (err) {
    console.error("Error saat render produk:", err);
    showErrorMessage("Terjadi kesalahan saat menampilkan data produk");
  }
}

// Tambahkan event listeners untuk tombol di setiap baris
function addRowButtonListeners() {
  // Tombol edit
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      editProduct(id);
    });
  });

  // Tombol delete
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const id = this.getAttribute("data-id");
      deleteProduct(id);
    });
  });
}

// Fungsi untuk mendapatkan nama kategori
function getCategoryName(categoryKey) {
  return categoryMap[categoryKey] || categoryKey || "Tidak Dikategorikan";
}

// Fungsi untuk menambah produk baru
function addProduct() {
  try {
    console.log("Menambahkan produk baru...");

    // Ambil nilai dari form
    const productName = document.getElementById("productName")?.value;
    const productCategory = document.getElementById("productCategory")?.value;
    const productPrice = parseInt(
      document.getElementById("productPrice")?.value
    );
    const productStock = parseInt(
      document.getElementById("productStock")?.value
    );
    const productDescription =
      document.getElementById("productDescription")?.value;
    const productStatus = document.getElementById("productStatus")?.value;

    // Validasi input
    if (
      !productName ||
      !productCategory ||
      isNaN(productPrice) ||
      isNaN(productStock)
    ) {
      alert("Mohon isi semua field yang diperlukan");
      return;
    }

    // Ambil produk yang ada
    const products = JSON.parse(localStorage.getItem("products")) || [];

    // Buat ID baru
    const lastId =
      products.length > 0 ? products[products.length - 1].id : "P000";
    const idNumber = parseInt(lastId.substr(1)) + 1;
    const newId = "P" + idNumber.toString().padStart(3, "0");

    // Buat objek produk baru
    const newProduct = {
      id: newId,
      name: productName,
      category: productCategory,
      price: productPrice,
      stock: productStock,
      description: productDescription || "",
      status: productStatus || "active",
    };

    // Tambahkan ke array produk
    products.push(newProduct);

    // Simpan kembali ke localStorage
    localStorage.setItem("products", JSON.stringify(products));

    // Render produk kembali
    renderProducts(products);

    // Tutup modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addProductModal")
    );
    if (modal) {
      modal.hide();
    }

    // Reset form
    document.getElementById("addProductForm")?.reset();

    // Tampilkan pesan sukses
    alert("Produk berhasil ditambahkan");
  } catch (err) {
    console.error("Error saat menambah produk:", err);
    alert("Terjadi kesalahan saat menambahkan produk");
  }
}

// Fungsi untuk mengedit produk
function editProduct(id) {
  try {
    console.log(`Mengedit produk dengan ID: ${id}`);

    // Ambil produk dari localStorage
    const products = JSON.parse(localStorage.getItem("products")) || [];
    const product = products.find((p) => p.id === id);

    if (!product) {
      console.error(`Produk dengan ID ${id} tidak ditemukan`);
      return;
    }

    // Isi form dengan data produk
    document.getElementById("editProductId").value = product.id;
    document.getElementById("editProductName").value = product.name || "";
    document.getElementById("editProductCategory").value =
      product.category || "";
    document.getElementById("editProductPrice").value = product.price || 0;
    document.getElementById("editProductStock").value = product.stock || 0;
    document.getElementById("editProductDescription").value =
      product.description || "";
    document.getElementById("editProductStatus").value =
      product.status || "active";

    // Set gambar preview
    const previewImg = document.getElementById("editProductImagePreview");
    if (previewImg) {
      previewImg.src = `img/products/${product.id.toLowerCase()}.jpg`;
      previewImg.onerror = function () {
        this.src = "img/placeholder.jpg";
      };
    }

    // Tampilkan modal edit
    const editModal = new bootstrap.Modal(
      document.getElementById("editProductModal")
    );
    editModal.show();
  } catch (err) {
    console.error("Error saat mengedit produk:", err);
    alert("Terjadi kesalahan saat memuat data produk untuk diedit");
  }
}

// Fungsi untuk update produk
function updateProduct() {
  try {
    console.log("Menyimpan perubahan produk...");

    // Ambil nilai dari form
    const productId = document.getElementById("editProductId")?.value;
    const productName = document.getElementById("editProductName")?.value;
    const productCategory = document.getElementById(
      "editProductCategory"
    )?.value;
    const productPrice = parseInt(
      document.getElementById("editProductPrice")?.value
    );
    const productStock = parseInt(
      document.getElementById("editProductStock")?.value
    );
    const productDescription = document.getElementById(
      "editProductDescription"
    )?.value;
    const productStatus = document.getElementById("editProductStatus")?.value;

    // Validasi input
    if (
      !productId ||
      !productName ||
      !productCategory ||
      isNaN(productPrice) ||
      isNaN(productStock)
    ) {
      alert("Mohon isi semua field yang diperlukan");
      return;
    }

    // Ambil produk dari localStorage
    let products = JSON.parse(localStorage.getItem("products")) || [];
    const productIndex = products.findIndex((p) => p.id === productId);

    if (productIndex === -1) {
      console.error(`Produk dengan ID ${productId} tidak ditemukan`);
      return;
    }

    // Update data produk
    products[productIndex] = {
      ...products[productIndex],
      name: productName,
      category: productCategory,
      price: productPrice,
      stock: productStock,
      description: productDescription || "",
      status: productStatus || "active",
    };

    // Simpan kembali ke localStorage
    localStorage.setItem("products", JSON.stringify(products));

    // Render produk kembali
    renderProducts(products);

    // Tutup modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("editProductModal")
    );
    if (modal) {
      modal.hide();
    }

    // Tampilkan pesan sukses
    alert("Produk berhasil diperbarui");
  } catch (err) {
    console.error("Error saat update produk:", err);
    alert("Terjadi kesalahan saat memperbarui produk");
  }
}

// Fungsi untuk hapus produk
function deleteProduct(id) {
  try {
    if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      console.log(`Menghapus produk dengan ID: ${id}`);

      // Ambil produk dari localStorage
      let products = JSON.parse(localStorage.getItem("products")) || [];

      // Filter produk yang akan dihapus
      products = products.filter((p) => p.id !== id);

      // Simpan kembali ke localStorage
      localStorage.setItem("products", JSON.stringify(products));

      // Render produk kembali
      renderProducts(products);

      // Tampilkan pesan sukses
      alert("Produk berhasil dihapus");
    }
  } catch (err) {
    console.error("Error saat hapus produk:", err);
    alert("Terjadi kesalahan saat menghapus produk");
  }
}

// Fungsi untuk filter produk
function filterProducts(keyword) {
  try {
    console.log(`Memfilter produk dengan keyword: ${keyword}`);

    // Ambil produk dari localStorage
    const products = JSON.parse(localStorage.getItem("products")) || [];

    // Jika tidak ada keyword, tampilkan semua produk
    if (!keyword) {
      renderProducts(products);
      return;
    }

    // Filter produk berdasarkan keyword
    const keywordLower = keyword.toLowerCase();
    const filteredProducts = products.filter(
      (product) =>
        (product.name && product.name.toLowerCase().includes(keywordLower)) ||
        (product.id && product.id.toLowerCase().includes(keywordLower)) ||
        (product.category &&
          getCategoryName(product.category)
            .toLowerCase()
            .includes(keywordLower))
    );

    // Render produk yang difilter
    renderProducts(filteredProducts);
  } catch (err) {
    console.error("Error saat filter produk:", err);
    showErrorMessage("Terjadi kesalahan saat memfilter produk");
  }
}

// Fungsi untuk preview gambar
function readImagePreview(file, elementId) {
  try {
    const reader = new FileReader();

    reader.onload = function (e) {
      if (elementId === "productImageUpload") {
        const imageUpload = document.getElementById(elementId);
        if (imageUpload) {
          imageUpload.innerHTML = "";

          const img = document.createElement("img");
          img.src = e.target.result;
          img.alt = "Preview";
          img.style.maxWidth = "100%";
          img.style.maxHeight = "185px";

          imageUpload.appendChild(img);
        }
      } else {
        const imagePreview = document.getElementById(elementId);
        if (imagePreview) {
          imagePreview.src = e.target.result;
        }
      }
    };

    reader.readAsDataURL(file);
  } catch (err) {
    console.error("Error saat membaca preview gambar:", err);
  }
}

// Ekspos fungsi ke global scope untuk bisa dipanggil dari HTML
window.loadProducts = loadProducts;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.filterProducts = filterProducts;
