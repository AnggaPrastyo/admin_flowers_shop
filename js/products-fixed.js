// File: products-fixed.js
// Script untuk halaman manajemen produk yang diperbaiki

// Jalankan ketika DOM sudah siap
document.addEventListener("DOMContentLoaded", function () {
  // Verifikasi login admin
  checkAdminLogin();

  // Setup event listener untuk tombol dan interaksi
  setupEventListeners();
});

// Fungsi untuk memverifikasi login admin
function checkAdminLogin() {
  if (
    !localStorage.getItem("adminSudahLogin") &&
    !localStorage.getItem("adminLoggedIn")
  ) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

// Fungsi untuk mengatur semua event listener dalam satu tempat
function setupEventListeners() {
  // Tombol tambah produk
  const btnAddProduct = document.getElementById("btnAddProduct");
  if (btnAddProduct) {
    btnAddProduct.addEventListener("click", function () {
      const modal = new bootstrap.Modal(
        document.getElementById("addProductModal")
      );
      modal.show();
    });
  }

  // Tombol simpan produk
  const saveProductBtn = document.getElementById("saveProductBtn");
  if (saveProductBtn) {
    saveProductBtn.addEventListener("click", function () {
      if (validateProductForm()) {
        saveProduct();
      }
    });
  }

  // Tombol edit pada setiap produk
  document.querySelectorAll(".edit-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      editProduct(productId);
    });
  });

  // Tombol hapus pada setiap produk
  document.querySelectorAll(".delete-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const productId = this.getAttribute("data-id");
      deleteProduct(productId);
    });
  });

  // Input pencarian produk
  const searchInput = document.getElementById("searchProduct");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      filterProducts(this.value);
    });
  }

  // Setup form upload gambar
  const productImageUpload = document.getElementById("productImageUpload");
  const productImage = document.getElementById("productImage");

  if (productImageUpload && productImage) {
    productImageUpload.addEventListener("click", function () {
      productImage.click();
    });

    productImage.addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = function (event) {
          productImageUpload.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 180px;" alt="Preview">`;
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    });
  }
}

// Fungsi untuk validasi form produk
function validateProductForm() {
  const name = document.getElementById("productName").value;
  const category = document.getElementById("productCategory").value;
  const price = document.getElementById("productPrice").value;
  const stock = document.getElementById("productStock").value;

  if (!name || !category || !price || !stock) {
    alert("Silakan lengkapi semua field yang diperlukan");
    return false;
  }

  // Validasi harga dan stok harus angka dan positif
  if (isNaN(price) || parseFloat(price) < 0) {
    alert("Harga harus berupa angka positif");
    return false;
  }

  if (isNaN(stock) || parseInt(stock) < 0) {
    alert("Stok harus berupa angka positif");
    return false;
  }

  return true;
}

// Fungsi untuk menyimpan produk baru
function saveProduct() {
  // Dalam implementasi demo ini kita hanya akan menampilkan notifikasi
  alert("Produk baru berhasil ditambahkan");

  // Sembunyikan modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addProductModal")
  );
  if (modal) {
    modal.hide();
  }

  // Reset form
  document.getElementById("addProductForm").reset();
  document.getElementById("productImageUpload").innerHTML = `
    <i class="bi bi-cloud-upload"></i>
    <p>Klik atau seret file untuk upload</p>
    <small>PNG, JPG, atau JPEG (Maks. 2MB)</small>
  `;
}

// Fungsi untuk mengedit produk
function editProduct(productId) {
  // Dalam implementasi demo ini kita hanya akan menampilkan notifikasi
  alert(`Akan mengedit produk dengan ID: ${productId}`);
}

// Fungsi untuk menghapus produk
function deleteProduct(productId) {
  // Konfirmasi penghapusan
  if (
    confirm(`Apakah Anda yakin ingin menghapus produk dengan ID: ${productId}?`)
  ) {
    alert(`Produk dengan ID: ${productId} berhasil dihapus`);
    // Dalam implementasi sebenarnya, kita akan menghapus baris dari tabel
    // dan update data di server/localStorage
  }
}

// Fungsi untuk filter produk berdasarkan input pencarian
function filterProducts(keyword) {
  const lowerKeyword = keyword.toLowerCase();
  const rows = document.querySelectorAll("#productTableBody tr");

  rows.forEach((row) => {
    const id = row.cells[0].textContent.toLowerCase();
    const name = row.cells[2].textContent.toLowerCase();
    const category = row.cells[3].textContent.toLowerCase();

    // Tampilkan baris jika keyword cocok dengan id, nama, atau kategori
    if (
      id.includes(lowerKeyword) ||
      name.includes(lowerKeyword) ||
      category.includes(lowerKeyword)
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}
