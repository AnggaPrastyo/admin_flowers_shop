// File baru: js/auth.js
document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi akun default jika belum ada
  initDefaultAccounts();

  // Setup form login
  const loginForm = document.getElementById("admin-login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const username = document.getElementById("admin-username").value;
      const password = document.getElementById("admin-password").value;

      if (validateLogin(username, password)) {
        window.location.href = "dashboard.html";
      } else {
        // Tampilkan pesan error dengan lebih baik
        showLoginError("Username atau password salah");
      }
    });
  }
});

function initDefaultAccounts() {
  if (!localStorage.getItem("daftarAkunAdmin")) {
    const defaultAccounts = [
      {
        username: "admin",
        password: "123",
        role: "superadmin",
        name: "Administrator Utama",
      },
      {
        username: "manajer",
        password: "123",
        role: "manajer",
        name: "Manajer Toko",
      },
      {
        username: "staff",
        password: "123",
        role: "staff",
        name: "Staff Operasional",
      },
    ];
    localStorage.setItem("daftarAkunAdmin", JSON.stringify(defaultAccounts));
  }
}

function validateLogin(username, password) {
  const accounts = JSON.parse(localStorage.getItem("daftarAkunAdmin") || "[]");
  const matchedAccount = accounts.find(
    (account) => account.username === username && account.password === password
  );

  if (matchedAccount) {
    const loginInfo = {
      username: matchedAccount.username,
      role: matchedAccount.role,
      name: matchedAccount.name,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem("adminSudahLogin", "true");
    localStorage.setItem("adminAktif", JSON.stringify(loginInfo));
    return true;
  }

  return false;
}

function showLoginError(message) {
  // Buat atau update elemen untuk menampilkan pesan error
  let errorDiv = document.getElementById("login-error");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = "login-error";
    errorDiv.className = "alert alert-danger mt-3";

    const loginForm = document.getElementById("admin-login-form");
    loginForm.insertAdjacentElement("beforebegin", errorDiv);
  }

  errorDiv.textContent = message;
  errorDiv.style.display = "block";

  // Hilangkan pesan error setelah 3 detik
  setTimeout(() => {
    errorDiv.style.display = "none";
  }, 3000);
}
// Tambahkan ini di auth.js
document.addEventListener("DOMContentLoaded", function () {
  // Inisialisasi validasi form
  if (document.getElementById("admin-login-form")) {
    const validator = new FormValidator("admin-login-form");

    document
      .getElementById("admin-login-form")
      .addEventListener("form:valid", function (e) {
        const formData = e.detail;

        if (validateLogin(formData.adminUsername, formData.adminPassword)) {
          window.location.href = "dashboard.html";
        } else {
          showLoginError("Username atau password salah");
        }
      });
  }
});
