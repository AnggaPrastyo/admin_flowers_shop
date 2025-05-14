// auth.js - Fungsi autentikasi dan login

// Inisialisasi akun default
function initDefaultAccounts() {
  if (!localStorage.getItem("daftarAkunAdmin")) {
    const defaultAccounts = [
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

    localStorage.setItem("daftarAkunAdmin", JSON.stringify(defaultAccounts));
    console.log("Akun default berhasil dibuat");
  }
}

// Validasi login admin
function validateAdminLogin(username, password) {
  const accounts = JSON.parse(localStorage.getItem("daftarAkunAdmin") || "[]");
  const account = accounts.find(
    (acc) => acc.username === username && acc.password === password
  );

  if (account) {
    // Simpan info login (tanpa password)
    const loginInfo = {
      username: account.username,
      peran: account.peran,
      nama: account.nama,
      waktuLogin: new Date().toISOString(),
    };

    localStorage.setItem("adminSudahLogin", "true");
    localStorage.setItem("adminAktif", JSON.stringify(loginInfo));
    return true;
  }

  return false;
}

// Tampilkan pesan error login
function showLoginError(message) {
  const errorElement = document.getElementById("login-error");

  if (!errorElement) {
    const loginForm = document.getElementById("form-login-admin");
    if (!loginForm) return;

    const newErrorElement = document.createElement("div");
    newErrorElement.id = "login-error";
    newErrorElement.className = "alert alert-danger mt-3";
    loginForm.parentNode.insertBefore(newErrorElement, loginForm);

    newErrorElement.textContent = message;
  } else {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }

  // Hilangkan pesan setelah 3 detik
  setTimeout(() => {
    const currentErrorElement = document.getElementById("login-error");
    if (currentErrorElement) {
      currentErrorElement.style.display = "none";
    }
  }, 3000);
}

// Setup form login
document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi akun default
  initDefaultAccounts();

  // Setup form login
  const loginForm = document.getElementById("form-login-admin");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("username-admin").value;
      const password = document.getElementById("password-admin").value;

      if (validateAdminLogin(username, password)) {
        window.location.href = "dashboard.html";
      } else {
        showLoginError("Username atau password salah");
      }
    });
  }
});
