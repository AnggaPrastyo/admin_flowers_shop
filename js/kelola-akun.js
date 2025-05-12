// File: js/kelola-akun.js

function tampilkanDaftarAkun() {
  // Hanya tampilkan untuk superadmin
  const adminAktif = JSON.parse(localStorage.getItem("adminAktif") || "{}");
  if (adminAktif.peran !== "superadmin") {
    alert("Anda tidak memiliki akses untuk mengelola akun");
    return;
  }

  // Ambil dan tampilkan daftar akun
  const daftarAkun = JSON.parse(
    localStorage.getItem("daftarAkunAdmin") || "[]"
  );
  const tabelAkun = document.getElementById("tabel-daftar-akun");

  if (tabelAkun) {
    tabelAkun.innerHTML = "";

    daftarAkun.forEach((akun, index) => {
      const baris = document.createElement("tr");
      baris.innerHTML = `
        <td>${index + 1}</td>
        <td>${akun.username}</td>
        <td>${akun.nama}</td>
        <td>${akun.peran}</td>
        <td>
          <button class="btn btn-sm btn-warning edit-akun" data-username="${
            akun.username
          }">Edit</button>
          <button class="btn btn-sm btn-danger hapus-akun" data-username="${
            akun.username
          }">Hapus</button>
        </td>
      `;
      tabelAkun.appendChild(baris);
    });

    // Tambahkan event listener untuk tombol edit dan hapus
    tambahkanEventTombolAkun();
  }
}

function daftarFormAkunBaru() {
  const formAkunBaru = document.getElementById("form-akun-baru");

  if (formAkunBaru) {
    formAkunBaru.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username-baru").value;
      const password = document.getElementById("password-baru").value;
      const nama = document.getElementById("nama-baru").value;
      const peran = document.getElementById("peran-baru").value;

      if (tambahAkunAdmin(username, password, peran, nama)) {
        alert("Akun baru berhasil ditambahkan");
        formAkunBaru.reset();
        tampilkanDaftarAkun(); // Perbarui tampilan tabel
      } else {
        alert("Username sudah digunakan. Silakan gunakan username lain.");
      }
    });
  }
}

function tambahkanEventTombolAkun() {
  // Tambahkan event untuk tombol edit
  document.querySelectorAll(".edit-akun").forEach((tombol) => {
    tombol.addEventListener("click", function () {
      const username = this.getAttribute("data-username");
      editAkun(username);
    });
  });

  // Tambahkan event untuk tombol hapus
  document.querySelectorAll(".hapus-akun").forEach((tombol) => {
    tombol.addEventListener("click", function () {
      const username = this.getAttribute("data-username");
      hapusAkun(username);
    });
  });
}

function editAkun(username) {
  // Ambil daftar akun
  const daftarAkun = JSON.parse(
    localStorage.getItem("daftarAkunAdmin") || "[]"
  );
  const akun = daftarAkun.find((a) => a.username === username);

  if (!akun) {
    alert("Akun tidak ditemukan");
    return;
  }

  // Tampilkan form edit
  document.getElementById("username-edit").value = akun.username;
  document.getElementById("username-edit").readOnly = true; // Username tidak bisa diubah
  document.getElementById("nama-edit").value = akun.nama;
  document.getElementById("peran-edit").value = akun.peran;

  // Tampilkan modal edit
  const modalEdit = new bootstrap.Modal(
    document.getElementById("modal-edit-akun")
  );
  modalEdit.show();

  // Tangani submit form edit
  document.getElementById("form-edit-akun").onsubmit = function (e) {
    e.preventDefault();

    // Update data akun
    akun.nama = document.getElementById("nama-edit").value;
    akun.peran = document.getElementById("peran-edit").value;

    // Jika password baru diisi, update password
    const passwordBaru = document.getElementById("password-baru-edit").value;
    if (passwordBaru) {
      akun.password = passwordBaru;
    }

    // Simpan kembali ke localStorage
    localStorage.setItem("daftarAkunAdmin", JSON.stringify(daftarAkun));

    alert("Akun berhasil diperbarui");
    modalEdit.hide();
    tampilkanDaftarAkun(); // Refresh tabel
  };
}

function hapusAkun(username) {
  if (confirm(`Apakah Anda yakin ingin menghapus akun "${username}"?`)) {
    // Ambil daftar akun
    let daftarAkun = JSON.parse(
      localStorage.getItem("daftarAkunAdmin") || "[]"
    );

    // Hapus akun yang dipilih
    daftarAkun = daftarAkun.filter((akun) => akun.username !== username);

    // Simpan kembali ke localStorage
    localStorage.setItem("daftarAkunAdmin", JSON.stringify(daftarAkun));

    alert("Akun berhasil dihapus");
    tampilkanDaftarAkun(); // Refresh tabel
  }
}

// Jalankan saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Tampilkan akun jika berada di halaman manajemen akun
  if (document.getElementById("tabel-daftar-akun")) {
    tampilkanDaftarAkun();
    daftarFormAkunBaru();
  }
});
