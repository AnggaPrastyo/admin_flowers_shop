// File: js/customers.js
document.addEventListener("DOMContentLoaded", function () {
  loadCustomers();

  document
    .getElementById("saveCustomerBtn")
    .addEventListener("click", function () {
      addCustomer();
    });

  document
    .getElementById("searchCustomer")
    .addEventListener("input", function () {
      filterCustomers(this.value);
    });

  document
    .getElementById("customerStatusFilter")
    .addEventListener("change", function () {
      filterCustomersByStatus(this.value);
    });

  document
    .getElementById("editCustomerBtn")
    .addEventListener("click", function () {
      // Ambil ID pelanggan dari modal detail
      const customerId = document.getElementById("customerId").textContent;
      editCustomer(customerId);
    });
});

function loadCustomers() {
  // Data dummy untuk demo
  if (!localStorage.getItem("customers")) {
    const customers = [
      {
        id: "C001",
        name: "Anita Susanti",
        email: "anita@example.com",
        phone: "08123456789",
        address: "Jl. Sultan Alimuddin No. 123, Samarinda Seberang",
        joinDate: "2024-10-15",
        status: "active",
      },
      {
        id: "C002",
        name: "Budi Santoso",
        email: "budi@example.com",
        phone: "08234567890",
        address: "Jl. Pahlawan No. 45, Samarinda Kota",
        joinDate: "2024-11-20",
        status: "active",
      },
      {
        id: "C003",
        name: "Maya Wijaya",
        email: "maya@example.com",
        phone: "08345678901",
        address: "Jl. Diponegoro No. 78, Tenggarong",
        joinDate: "2024-12-05",
        status: "active",
      },
      {
        id: "C004",
        name: "Dian Purnama",
        email: "dian@example.com",
        phone: "08456789012",
        address: "Jl. Gajah Mada No. 55, Samarinda Kota",
        joinDate: "2025-01-10",
        status: "active",
      },
      {
        id: "C005",
        name: "Rudi Hermawan",
        email: "rudi@example.com",
        phone: "08567890123",
        address: "Jl. Ahmad Yani No. 123, Samarinda Seberang",
        joinDate: "2025-02-15",
        status: "inactive",
      },
    ];

    localStorage.setItem("customers", JSON.stringify(customers));
  }

  renderCustomers(JSON.parse(localStorage.getItem("customers")));
}

function renderCustomers(customers) {
  const tbody = document.querySelector("#customersTable tbody");
  tbody.innerHTML = "";

  customers.forEach((customer) => {
    const row = document.createElement("tr");

    const joinDate = new Date(customer.joinDate);
    const formattedDate = joinDate.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const statusClass = customer.status === "active" ? "active" : "inactive";
    const statusText = customer.status === "active" ? "Aktif" : "Tidak Aktif";

    row.innerHTML = `
      <td>${customer.id}</td>
      <td>${customer.name}</td>
      <td>${customer.email}</td>
      <td>${customer.phone}</td>
      <td>${customer.address}</td>
      <td>${formattedDate}</td>
      <td><span class="product-status ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-info btn-sm" onclick="viewCustomerDetails('${customer.id}')">
            <i class="bi bi-eye"></i>
          </button>
          <button class="btn btn-warning btn-sm" onclick="editCustomer('${customer.id}')">
            <i class="bi bi-pencil-square"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteCustomer('${customer.id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `;

    tbody.appendChild(row);
  });
}

function addCustomer() {
  const name = document.getElementById("customerName").value;
  const email = document.getElementById("customerEmail").value;
  const phone = document.getElementById("customerPhone").value;
  const address = document.getElementById("customerAddress").value;
  const status = document.getElementById("customerStatus").value;

  if (!name || !email || !phone || !address) {
    alert("Mohon isi semua field yang diperlukan");
    return;
  }

  // Validasi email sederhana
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Format email tidak valid");
    return;
  }

  const customers = JSON.parse(localStorage.getItem("customers") || "[]");

  // Validasi email unik
  const emailExists = customers.some((customer) => customer.email === email);
  if (emailExists) {
    alert("Email sudah digunakan, silakan gunakan email lain");
    return;
  }

  // Buat ID baru
  const lastId =
    customers.length > 0 ? customers[customers.length - 1].id : "C000";
  const idNumber = parseInt(lastId.substr(1)) + 1;
  const newId = "C" + idNumber.toString().padStart(3, "0");

  const newCustomer = {
    id: newId,
    name: name,
    email: email,
    phone: phone,
    address: address,
    joinDate: new Date().toISOString().split("T")[0],
    status: status,
  };

  customers.push(newCustomer);
  localStorage.setItem("customers", JSON.stringify(customers));

  renderCustomers(customers);

  // Tutup modal
  const modal = bootstrap.Modal.getInstance(
    document.getElementById("addCustomerModal")
  );
  modal.hide();

  // Reset form
  document.getElementById("addCustomerForm").reset();

  // Tampilkan pesan sukses
  alert("Pelanggan berhasil ditambahkan");
}

function viewCustomerDetails(id) {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");
  const customer = customers.find((c) => c.id === id);

  if (!customer) return;

  // Set informasi pelanggan
  document.getElementById("customerId").textContent = customer.id;
  document.getElementById("customerNameDetail").textContent = customer.name;
  document.getElementById("customerEmailDetail").textContent = customer.email;
  document.getElementById("customerPhoneDetail").textContent = customer.phone;
  document.getElementById("customerAddressDetail").textContent =
    customer.address;

  const joinDate = new Date(customer.joinDate);
  document.getElementById("customerJoinDateDetail").textContent =
    joinDate.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const statusText = customer.status === "active" ? "Aktif" : "Tidak Aktif";
  document.getElementById("customerStatusDetail").textContent = statusText;

  // Hitung total pesanan dan pembelian
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");
  const customerOrders = orders.filter(
    (order) => order.customer.email === customer.email
  );

  document.getElementById("totalOrders").textContent = customerOrders.length;

  const totalSpent = customerOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );
  document.getElementById(
    "totalSpent"
  ).textContent = `Rp ${totalSpent.toLocaleString()}`;

  // Tampilkan riwayat pesanan
  const ordersList = document.getElementById("customerOrdersList");
  ordersList.innerHTML = "";

  if (customerOrders.length === 0) {
    ordersList.innerHTML = `<tr><td colspan="5" class="text-center">Belum ada pesanan</td></tr>`;
  } else {
    customerOrders.forEach((order) => {
      const orderDate = new Date(order.date);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${order.id}</td>
        <td>${orderDate.toLocaleDateString("id-ID")}</td>
        <td>Rp ${order.total.toLocaleString()}</td>
        <td><span class="status-badge ${order.status}">${getOrderStatusText(
        order.status
      )}</span></td>
        <td>
          <button class="btn btn-primary btn-sm" onclick="viewOrderDetails('${
            order.id
          }')">
            Detail
          </button>
        </td>
      `;
      ordersList.appendChild(row);
    });
  }

  // Tampilkan modal
  const detailModal = new bootstrap.Modal(
    document.getElementById("customerDetailModal")
  );
  detailModal.show();
}

function getOrderStatusText(status) {
  const statusMap = {
    pending: "Menunggu Pembayaran",
    processing: "Diproses",
    shipped: "Dikirim",
    completed: "Selesai",
    cancelled: "Dibatalkan",
  };

  return statusMap[status] || status;
}

function editCustomer(id) {
  // Implementasi fungsi edit pelanggan
  // Akan menampilkan modal dengan form yang sudah terisi data pelanggan
  alert("Fitur edit pelanggan akan segera tersedia");
}

function deleteCustomer(id) {
  if (confirm("Apakah Anda yakin ingin menghapus pelanggan ini?")) {
    let customers = JSON.parse(localStorage.getItem("customers") || "[]");
    customers = customers.filter((c) => c.id !== id);

    localStorage.setItem("customers", JSON.stringify(customers));

    renderCustomers(customers);

    alert("Pelanggan berhasil dihapus");
  }
}

function filterCustomers(keyword) {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");

  if (!keyword) {
    renderCustomers(customers);
    return;
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(keyword.toLowerCase()) ||
      customer.email.toLowerCase().includes(keyword.toLowerCase()) ||
      customer.phone.includes(keyword)
  );

  renderCustomers(filteredCustomers);
}

function filterCustomersByStatus(status) {
  const customers = JSON.parse(localStorage.getItem("customers") || "[]");

  if (status === "all") {
    renderCustomers(customers);
    return;
  }

  const filteredCustomers = customers.filter(
    (customer) => customer.status === status
  );

  renderCustomers(filteredCustomers);
}

function viewOrderDetails(id) {
  // Implementasi fungsi untuk melihat detail pesanan
  // Ideal nya akan membuka modal detail pesanan yang sama dengan halaman orders.html
  window.location.href = `orders.html?id=${id}`;
}
