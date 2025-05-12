document
  .getElementById("admin-login-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;

    // Validasi sederhana untuk demo
    if (username && password) {
      // Untuk demo, gunakan kredensial hardcoded (pada implementasi sebenarnya gunakan backend)
      if (username === "admin" && password === "password") {
        // Set session atau localStorage untuk menandai login
        localStorage.setItem("adminLoggedIn", "true");

        // Redirect ke dashboard
        window.location.href = "dashboard.html";
      } else {
        alert("Username atau password salah");
      }
    } else {
      alert("Username dan password wajib diisi");
    }
  });
