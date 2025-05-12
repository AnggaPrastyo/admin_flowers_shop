// File: js/admin-login.js

// Fungsi untuk membuat daftar akun admin saat aplikasi pertama kali dijalankan
function buatAkunAdminAwal() {
  // Cek apakah daftar akun admin sudah ada di localStorage
  if (!localStorage.getItem("daftarAkunAdmin")) {
    // Buat array akun default dengan beberapa akun admin
    const akunDefault = [
      {
        username: "admin",
        password: "123",
        peran: "superadmin",
        nama: "Administrator Utama",
      },
      {
        username: "manajer",
        password: "123",
        peran: "manajer",
        nama: "Manajer Toko",
      },
      {
        username: "staff",
        password: "123",
        peran: "staff",
        nama: "Staff Operasional",
      },
    ];

    // Simpan ke localStorage sebagai string JSON
    localStorage.setItem("daftarAkunAdmin", JSON.stringify(akunDefault));
    console.log("Akun admin default telah dibuat");
  }
}

// Fungsi untuk menambah akun admin baru
function tambahAkunAdmin(username, password, peran, nama) {
  // Ambil daftar akun yang ada
  const daftarAkun = JSON.parse(
    localStorage.getItem("daftarAkunAdmin") || "[]"
  );

  // Cek apakah username sudah ada
  const akunSudahAda = daftarAkun.find((akun) => akun.username === username);
  if (akunSudahAda) {
    console.log("Username sudah digunakan");
    return false;
  }

  // Tambahkan akun baru
  daftarAkun.push({ username, password, peran, nama });

  // Simpan kembali ke localStorage
  localStorage.setItem("daftarAkunAdmin", JSON.stringify(daftarAkun));
  console.log(`Akun untuk ${nama} berhasil ditambahkan`);
  return true;
}

// Fungsi untuk validasi login
function validasiLogin(username, password) {
  // Ambil daftar akun yang ada
  const daftarAkun = JSON.parse(
    localStorage.getItem("daftarAkunAdmin") || "[]"
  );

  // Cari akun dengan username dan password yang cocok
  const akunCocok = daftarAkun.find(
    (akun) => akun.username === username && akun.password === password
  );

  if (akunCocok) {
    // Simpan info login (tanpa password) ke localStorage
    const infoLogin = {
      username: akunCocok.username,
      peran: akunCocok.peran,
      nama: akunCocok.nama,
      waktuLogin: new Date().toISOString(),
    };

    localStorage.setItem("adminSudahLogin", "true");
    localStorage.setItem("adminAktif", JSON.stringify(infoLogin));
    return true;
  }

  return false;
}

// Fungsi untuk menambahkan menu admin berdasarkan peran
function aturMenuAdmin() {
  // Cek apakah pengguna login sebagai superadmin
  const adminAktif = JSON.parse(localStorage.getItem("adminAktif") || "{}");

  // Sembunyikan menu berdasarkan peran
  if (adminAktif.peran === "superadmin") {
    // Tampilkan semua menu
    document.querySelectorAll(".menu-admin").forEach((menu) => {
      menu.style.display = "block";
    });
  } else if (adminAktif.peran === "manajer") {
    // Sembunyikan menu pengaturan akun
    document.querySelectorAll(".menu-pengaturan-akun").forEach((menu) => {
      menu.style.display = "none";
    });
  } else if (adminAktif.peran === "staff") {
    // Hanya tampilkan menu produk dan pesanan
    document.querySelectorAll(".menu-admin").forEach((menu) => {
      menu.style.display = "none";
    });
    document.querySelectorAll(".menu-produk, .menu-pesanan").forEach((menu) => {
      menu.style.display = "block";
    });
  }
}

// Inisialisasi akun admin default saat halaman dimuat
document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi akun default
  buatAkunAdminAwal();

  // Setup form login
  const formLogin = document.getElementById("form-login-admin");
  if (formLogin) {
    formLogin.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username-admin").value;
      const password = document.getElementById("password-admin").value;

      if (validasiLogin(username, password)) {
        window.location.href = "dashboard.html";
      } else {
        alert("Username atau password salah");
      }
    });
  }
});
