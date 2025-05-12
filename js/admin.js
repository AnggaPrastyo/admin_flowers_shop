function checkAdminLogin() {
  if (!localStorage.getItem("adminLoggedIn")) {
    window.location.href = "index.html";
  }
}

function adminLogout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "index.html";
}

function toggleSidebar() {
  document.querySelector(".sidebar").classList.toggle("collapsed");
  document.querySelector(".main-content").classList.toggle("expanded");
}

document.addEventListener("DOMContentLoaded", function () {
  checkAdminLogin();

  const logoutBtns = document.querySelectorAll(".logout-btn");
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", adminLogout);
  });

  const sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", toggleSidebar);
  }
});
