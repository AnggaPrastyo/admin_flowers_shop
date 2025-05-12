document
  .getElementById("admin-login-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;

    if (username === "admin" && password === "password") {
      localStorage.setItem("adminLoggedIn", "true");
      window.location.href = "dashboard.html";
    } else {
      alert("Username atau password salah");
    }
  });
