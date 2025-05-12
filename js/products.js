document.addEventListener("DOMContentLoaded", function () {
  loadProducts();

  document
    .getElementById("saveProductBtn")
    .addEventListener("click", function () {
      addProduct();
    });

  document
    .getElementById("updateProductBtn")
    .addEventListener("click", function () {
      updateProduct();
    });

  document
    .getElementById("searchProduct")
    .addEventListener("input", function () {
      filterProducts(this.value);
    });

  document
    .getElementById("productImageUpload")
    .addEventListener("click", function () {
      document.getElementById("productImage").click();
    });

  document
    .getElementById("productImage")
    .addEventListener("change", function (e) {
      if (e.target.files[0]) {
        readImagePreview(e.target.files[0], "productImageUpload");
      }
    });

  document
    .getElementById("editProductImageUpload")
    .addEventListener("click", function () {
      document.getElementById("editProductImage").click();
    });

  document
    .getElementById("editProductImage")
    .addEventListener("change", function (e) {
      if (e.target.files[0]) {
        readImagePreview(e.target.files[0], "editProductImagePreview");
      }
    });
});

function loadProducts() {
  const products = [
    {
      id: "P001",
      name: "Bunga Mawar",
      category: "bunga_potong",
      price: 100000,
      stock: 25,
      status: "active",
    },
    {
      id: "P002",
      name: "Bunga Lily",
      category: "bunga_potong",
      price: 120000,
      stock: 18,
      status: "active",
    },
    {
      id: "P003",
      name: "Bunga Matahari",
      category: "bunga_potong",
      price: 95000,
      stock: 5,
      status: "active",
    },
    {
      id: "P004",
      name: "Bunga Tulip",
      category: "bunga_potong",
      price: 150000,
      stock: 12,
      status: "active",
    },
    {
      id: "P005",
      name: "Bunga Anggrek",
      category: "bunga_pot",
      price: 200000,
      stock: 8,
      status: "active",
    },
    {
      id: "P006",
      name: "Bunga Krisan",
      category: "bunga_potong",
      price: 85000,
      stock: 0,
      status: "inactive",
    },
  ];

  localStorage.setItem("products", JSON.stringify(products));

  renderProducts(products);
}

function renderProducts(products) {
  const tbody = document.querySelector("#productsTable tbody");
  tbody.innerHTML = "";

  products.forEach((product) => {
    const row = document.createElement("tr");

    let statusClass = "active";
    if (product.status === "inactive") {
      statusClass = "inactive";
    } else if (product.stock <= 5 && product.stock > 0) {
      statusClass = "low-stock";
    } else if (product.stock === 0) {
      statusClass = "inactive";
    }

    let statusText = "Aktif";
    if (product.status === "inactive") {
      statusText = "Nonaktif";
    } else if (product.stock <= 5 && product.stock > 0) {
      statusText = "Stok Rendah";
    } else if (product.stock === 0) {
      statusText = "Habis";
    }

    row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="img/products/${product.id.toLowerCase()}.jpg" alt="${
      product.name
    }" class="product-img" onerror="this.src='img/placeholder.jpg'"></td>
            <td>${product.name}</td>
            <td>${getCategoryName(product.category)}</td>
            <td>Rp ${product.price.toLocaleString()}</td>
            <td>${product.stock}</td>
            <td><span class="product-status ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" onclick="editProduct('${
                      product.id
                    }')">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct('${
                      product.id
                    }')">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        `;

    tbody.appendChild(row);
  });
}

function getCategoryName(categoryKey) {
  const categories = {
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

  return categories[categoryKey] || categoryKey;
}

function addProduct() {
  const productName = document.getElementById("productName").value;
  const productCategory = document.getElementById("productCategory").value;
  const productPrice = parseInt(document.getElementById("productPrice").value);
  const productStock = parseInt(document.getElementById("productStock").value);
  const productDescription =
    document.getElementById("productDescription").value;
  const productStatus = document.getElementById("productStatus").value;

  if (
    !productName ||
    !productCategory ||
    isNaN(productPrice) ||
    isNaN(productStock)
  ) {
    alert("Mohon isi semua field yang diperlukan");
    return;
  }

  const products = JSON.parse(localStorage.getItem("products")) || [];

  const lastId =
    products.length > 0 ? products[products.length - 1].id : "P000";
  const idNumber = parseInt(lastId.substr(1)) + 1;
  const newId = "P" + idNumber.toString().padStart(3, "0");

  const newProduct = {
    id: newId,
    name: productName,
    category: productCategory,
    price: productPrice,
    stock: productStock,
    description: productDescription,
    status: productStatus,
  };

  products.push(newProduct);
  localStorage.setItem("products", JSON.stringify(products));

  renderProducts(products);

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addProductModal")
  );
  modal.hide();

  document.getElementById("addProductForm").reset();

  alert("Produk berhasil ditambahkan");
}

function editProduct(id) {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const product = products.find((p) => p.id === id);

  if (!product) return;

  document.getElementById("editProductId").value = product.id;
  document.getElementById("editProductName").value = product.name;
  document.getElementById("editProductCategory").value = product.category;
  document.getElementById("editProductPrice").value = product.price;
  document.getElementById("editProductStock").value = product.stock;
  document.getElementById("editProductDescription").value =
    product.description || "";
  document.getElementById("editProductStatus").value = product.status;

  document.getElementById(
    "editProductImagePreview"
  ).src = `img/products/${product.id.toLowerCase()}.jpg`;
  document.getElementById("editProductImagePreview").onerror = function () {
    this.src = "img/placeholder.jpg";
  };

  const editModal = new bootstrap.Modal(
    document.getElementById("editProductModal")
  );
  editModal.show();
}

function updateProduct() {
  const productId = document.getElementById("editProductId").value;
  const productName = document.getElementById("editProductName").value;
  const productCategory = document.getElementById("editProductCategory").value;
  const productPrice = parseInt(
    document.getElementById("editProductPrice").value
  );
  const productStock = parseInt(
    document.getElementById("editProductStock").value
  );
  const productDescription = document.getElementById(
    "editProductDescription"
  ).value;
  const productStatus = document.getElementById("editProductStatus").value;

  if (
    !productName ||
    !productCategory ||
    isNaN(productPrice) ||
    isNaN(productStock)
  ) {
    alert("Mohon isi semua field yang diperlukan");
    return;
  }

  let products = JSON.parse(localStorage.getItem("products")) || [];
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) return;

  products[productIndex] = {
    ...products[productIndex],
    name: productName,
    category: productCategory,
    price: productPrice,
    stock: productStock,
    description: productDescription,
    status: productStatus,
  };

  localStorage.setItem("products", JSON.stringify(products));

  renderProducts(products);

  const modal = bootstrap.Modal.getInstance(
    document.getElementById("editProductModal")
  );
  modal.hide();

  alert("Produk berhasil diperbarui");
}

function deleteProduct(id) {
  if (confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
    let products = JSON.parse(localStorage.getItem("products")) || [];
    products = products.filter((p) => p.id !== id);

    localStorage.setItem("products", JSON.stringify(products));

    renderProducts(products);

    alert("Produk berhasil dihapus");
  }
}

function filterProducts(keyword) {
  const products = JSON.parse(localStorage.getItem("products")) || [];

  if (!keyword) {
    renderProducts(products);
    return;
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(keyword.toLowerCase()) ||
      product.id.toLowerCase().includes(keyword.toLowerCase()) ||
      getCategoryName(product.category)
        .toLowerCase()
        .includes(keyword.toLowerCase())
  );

  renderProducts(filteredProducts);
}

function readImagePreview(file, elementId) {
  const reader = new FileReader();

  reader.onload = function (e) {
    if (elementId === "productImageUpload") {
      const imageUpload = document.getElementById(elementId);
      imageUpload.innerHTML = "";

      const img = document.createElement("img");
      img.src = e.target.result;
      img.alt = "Preview";
      img.style.maxWidth = "100%";
      img.style.maxHeight = "185px";

      imageUpload.appendChild(img);
    } else {
      document.getElementById(elementId).src = e.target.result;
    }
  };

  reader.readAsDataURL(file);
}
