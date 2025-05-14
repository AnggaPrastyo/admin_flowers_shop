// produk.js - Logika untuk halaman manajemen produk

// Data produk default jika localStorage kosong
const defaultProducts = [
  {
    id: "P001",
    name: "Bunga Mawar",
    category: "bunga_potong",
    price: 100000,
    stock: 25,
    status: "active",
    description: "Bunga mawar segar dengan warna merah yang menawan",
    imageUrl: "img/products/p001.jpg",
  },
  {
    id: "P002",
    name: "Bunga Lily",
    category: "bunga_potong",
    price: 120000,
    stock: 18,
    status: "active",
    description: "Bunga lily putih yang elegan dan harum",
    imageUrl: "img/products/p002.jpg",
  },
  {
    id: "P003",
    name: "Bunga Matahari",
    category: "bunga_potong",
    price: 95000,
    stock: 5,
    status: "active",
    description: "Bunga matahari segar dengan warna kuning cerah",
    imageUrl: "img/products/p003.jpg",
  },
  {
    id: "P004",
    name: "Bunga Tulip",
    category: "bunga_potong",
    price: 150000,
    stock: 12,
    status: "active",
    description: "Bunga tulip impor dengan berbagai pilihan warna",
    imageUrl: "img/products/p004.jpg",
  },
  {
    id: "P005",
    name: "Bunga Anggrek",
    category: "bunga_pot",
    price: 200000,
    stock: 8,
    status: "active",
    description: "Tanaman anggrek dalam pot yang tahan lama",
    imageUrl: "img/products/p005.jpg",
  },
  {
    id: "P006",
    name: "Bunga Krisan",
    category: "bunga_potong",
    price: 85000,
    stock: 0,
    status: "inactive",
    description: "Bunga krisan dengan warna-warni cerah",
    imageUrl: "img/products/p006.jpg",
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

// Variabel untuk menyimpan produk yang akan dihapus
let productToDelete = null;

// Inisialisasi saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Muat produk
  loadProducts();

  // Setup event listener
  setupEventListeners();
});

// Muat produk dari localStorage atau gunakan data default
function loadProducts() {
  let products = JSON.parse(localStorage.getItem("products"));

  // Jika tidak ada produk di localStorage, gunakan data default
  if (!products) {
    products = defaultProducts;
    localStorage.setItem("products", JSON.stringify(products));
  }

  renderProducts(products);
}

// Render produk ke tabel
function renderProducts(products) {
  const tableBody = document.getElementById("productTableBody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  products.forEach((product) => {
    // Tentukan status display
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

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.id}</td>
      <td>
        <img src="${product.imageUrl || "img/placeholder.jpg"}" 
             class="product-img" 
             alt="${product.name}" 
             onerror="this.src='img/placeholder.jpg'">
      </td>
      <td>${product.name}</td>
      <td>${getCategoryName(product.category)}</td>
      <td>${formatRupiah(product.price)}</td>
      <td>${product.stock}</td>
      <td><span class="product-status ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-info btn-sm edit-product" data-id="${
            product.id
          }">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-danger btn-sm delete-product" data-id="${
            product.id
          }">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;

    tableBody.appendChild(row);
  });

  // Tambahkan event listeners ke tombol aksi
  addActionButtonsListeners();
}

// Mendapatkan nama kategori dari kode kategori
function getCategoryName(categoryCode) {
  return categoryMap[categoryCode] || categoryCode || "Tidak Dikategorikan";
}

// Tambahkan event listeners
function setupEventListeners() {
  // Event untuk pencarian produk
  const searchInput = document.getElementById("searchProduct");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterProducts(this.value);
    });
  }

  // Event untuk modal tambah produk
  const productImageUpload = document.getElementById("productImageUpload");
  const productImage = document.getElementById("productImage");

  if (productImageUpload && productImage) {
    productImageUpload.addEventListener("click", function () {
      productImage.click();
    });

    productImage.addEventListener("change", function (e) {
      if (e.target.files[0]) {
        previewImage(e.target.files[0], "productImageUpload");
      }
    });
  }

  // Event untuk modal edit produk
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
        previewImage(e.target.files[0], "editProductPreview");
      }
    });
  }

  // Event untuk tombol simpan produk
  const saveProductBtn = document.getElementById("saveProductBtn");
  if (saveProductBtn) {
    saveProductBtn.addEventListener("click", addProduct);
  }

  // Event untuk tombol update produk
  const updateProductBtn = document.getElementById("updateProductBtn");
  if (updateProductBtn) {
    updateProductBtn.addEventListener("click", updateProduct);
  }

  // Event untuk tombol konfirmasi hapus
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", function () {
      if (productToDelete) {
        deleteProduct(productToDelete);
      }
    });
  }
}

// Tambahkan event listeners ke tombol aksi
function addActionButtonsListeners() {
  // Tombol edit
  document.querySelectorAll(".edit-product").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      openEditModal(productId);
    });
  });

  // Tombol hapus
  document.querySelectorAll(".delete-product").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      openDeleteConfirmModal(productId);
    });
  });
}

// Filter produk berdasarkan keyword
function filterProducts(keyword) {
  if (!keyword || keyword.trim() === "") {
    loadProducts();
    return;
  }

  const products = JSON.parse(localStorage.getItem("products"));

  const filteredProducts = products.filter((product) => {
    const searchString = keyword.toLowerCase();
    return (
      product.id.toLowerCase().includes(searchString) ||
      product.name.toLowerCase().includes(searchString) ||
      getCategoryName(product.category).toLowerCase().includes(searchString)
    );
  });

  renderProducts(filteredProducts);
}

// Preview gambar
function previewImage(file, elementId) {
  const reader = new FileReader();

  reader.onload = function (e) {
    if (elementId === "productImageUpload") {
      // Untuk modal tambah
      const imageContainer = document.getElementById(elementId);
      imageContainer.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 180px;">`;
    } else if (elementId === "editProductPreview") {
      // Untuk modal edit
      document.getElementById(elementId).src = e.target.result;
    }
  };

  reader.readAsDataURL(file);
}

// Buka modal edit
function openEditModal(productId) {
  const products = JSON.parse(localStorage.getItem("products"));
  const product = products.find((p) => p.id === productId);

  if (!product) return;

  // Isi form dengan data produk
  document.getElementById("editProductId").value = product.id;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductCategory").value = product.category;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductStock").value = product.stock;
  document.getElementById("editProductDescription").value =
    product.description || "";
  document.getElementById("editProductStatus").value = product.status;

  // Tampilkan gambar produk
  const productPreview = document.getElementById("editProductPreview");
  if (productPreview) {
    productPreview.src = product.imageUrl || "img/placeholder.jpg";
    productPreview.onerror = function () {
      this.src = "img/placeholder.jpg";
    };
  }

  // Buka modal
  const editModal = new bootstrap.Modal(
    document.getElementById("editProductModal")
  );
  editModal.show();
}

// Buka modal konfirmasi hapus
function openDeleteConfirmModal(productId) {
  const products = JSON.parse(localStorage.getItem("products"));
  const product = products.find((p) => p.id === productId);

  if (!product) return;

  // Simpan ID produk yang akan dihapus
  productToDelete = productId;

  // Tampilkan nama produk di modal
  document.getElementById("deleteProductName").textContent = product.name;

  // Buka modal
  const deleteModal = new bootstrap.Modal(
    document.getElementById("deleteConfirmModal")
  );
  deleteModal.show();
}

// Tambah produk baru
function addProduct() {
  // Validasi form
  const productName = document.getElementById("productName").value;
  const productCategory = document.getElementById("productCategory").value;
  const productPrice = document.getElementById("productPrice").value;
  const productStock = document.getElementById("productStock").value;

  if (!productName || !productCategory || !productPrice || !productStock) {
    alert("Mohon lengkapi semua field yang diperlukan");
    return;
  }

  // Ambil produk dari localStorage
  const products = JSON.parse(localStorage.getItem("products"));

  // Buat ID baru
  const lastId =
    products.length > 0 ? products[products.length - 1].id : "P000";
  const newId =
    "P" + (parseInt(lastId.substring(1)) + 1).toString().padStart(3, "0");

  // Buat objek produk baru
  const newProduct = {
    id: newId,
    name: productName,
    category: productCategory,
    price: parseInt(productPrice),
    stock: parseInt(productStock),
    description: document.getElementById("productDescription").value,
    status: document.getElementById("productStatus").value,
    imageUrl: "img/placeholder.jpg", // Default gambar
  };

  // Tambahkan produk baru ke array
  products.push(newProduct);

  // Simpan ke localStorage
  localStorage.setItem("products", JSON.stringify(products));

  // Reload tampilan
  renderProducts(products);

  // Tutup modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addProductModal")
  );
  modal.hide();

  // Reset form
  document.getElementById("addProductForm").reset();
  document.getElementById("productImageUpload").innerHTML = `
    <i class="bi bi-cloud-upload"></i>
    <p>Klik atau seret file untuk upload</p>
    <small>PNG, JPG, atau JPEG (Maks. 2MB)</small>
  `;

  // Tampilkan notifikasi
  alert("Produk berhasil ditambahkan!");
}

// Update produk
function updateProduct() {
  // Validasi form
  const productId = document.getElementById("editProductId").value;
  const productName = document.getElementById("editProductName").value;
  const productCategory = document.getElementById("editProductCategory").value;
  const productPrice = document.getElementById("editProductPrice").value;
  const productStock = document.getElementById("editProductStock").value;

  if (
    !productId ||
    !productName ||
    !productCategory ||
    !productPrice ||
    !productStock
  ) {
    alert("Mohon lengkapi semua field yang diperlukan");
    return;
  }

  // Ambil produk dari localStorage
  let products = JSON.parse(localStorage.getItem("products"));

  // Cari index produk yang akan diupdate
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    alert("Produk tidak ditemukan");
    return;
  }

  // Update produk
  products[productIndex] = {
    ...products[productIndex],
    name: productName,
    category: productCategory,
    price: parseInt(productPrice),
    stock: parseInt(productStock),
    description: document.getElementById("editProductDescription").value,
    status: document.getElementById("editProductStatus").value,
  };

  // Simpan ke localStorage
  localStorage.setItem("products", JSON.stringify(products));

  // Reload tampilan
  renderProducts(products);

  // Tutup modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("editProductModal")
  );
  modal.hide();

  // Tampilkan notifikasi
  alert("Produk berhasil diperbarui!");
}

// Hapus produk
function deleteProduct(productId) {
  // Ambil produk dari localStorage
  let products = JSON.parse(localStorage.getItem("products"));

  // Filter produk yang akan dihapus
  products = products.filter((p) => p.id !== productId);

  // Simpan ke localStorage
  localStorage.setItem("products", JSON.stringify(products));

  // Reload tampilan
  renderProducts(products);

  // Tutup modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("deleteConfirmModal")
  );
  modal.hide();

  // Reset variabel
  productToDelete = null;

  // Tampilkan notifikasi
  alert("Produk berhasil dihapus!");
}
