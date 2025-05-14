// bantuan.js - Kumpulan fungsi bantuan untuk aplikasi

// Format mata uang Rupiah
function formatRupiah(angka) {
  return "Rp " + angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Format tanggal Indonesia
function formatTanggal(tanggal) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(tanggal).toLocaleDateString("id-ID", options);
}

// Class untuk validasi formulir
class ValidatorForm {
  constructor(formId, options = {}) {
    this.form = document.getElementById(formId);
    if (!this.form) return;

    this.options = {
      realtime: true,
      tampilkanSukses: false,
      ...options,
    };

    this.error = {};
    this.bidang = {};
    this.setupValidasi();
  }

  setupValidasi() {
    const inputElements = this.form.querySelectorAll("input, select, textarea");

    inputElements.forEach((input) => {
      const namaBidang = input.id;
      this.bidang[namaBidang] = input;

      // Validasi realtime
      if (this.options.realtime) {
        input.addEventListener("blur", () => {
          this.validasiBidang(namaBidang);
        });

        input.addEventListener("input", () => {
          if (this.error[namaBidang]) {
            this.validasiBidang(namaBidang);
          }
        });
      }
    });

    // Validasi saat submit
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (this.validasiSemua()) {
        const event = new CustomEvent("form:valid", {
          detail: this.getDataForm(),
        });
        this.form.dispatchEvent(event);
      }
    });
  }

  validasiBidang(namaBidang) {
    const bidang = this.bidang[namaBidang];
    if (!bidang) return true;

    // Reset error
    this.setErrorBidang(namaBidang, "");

    // Validasi wajib diisi
    if (bidang.hasAttribute("required") && !bidang.value.trim()) {
      this.setErrorBidang(namaBidang, "Bidang ini wajib diisi");
      return false;
    }

    // Validasi email
    if (bidang.type === "email" && bidang.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bidang.value)) {
        this.setErrorBidang(namaBidang, "Format email tidak valid");
        return false;
      }
    }

    // Validasi nomor telepon
    if (
      bidang.id.toLowerCase().includes("telepon") ||
      bidang.id.toLowerCase().includes("phone")
    ) {
      if (bidang.value) {
        const teleponRegex = /^[0-9]{10,13}$/;
        if (!teleponRegex.test(bidang.value.replace(/\D/g, ""))) {
          this.setErrorBidang(namaBidang, "Nomor telepon tidak valid");
          return false;
        }
      }
    }

    // Validasi password
    if (bidang.type === "password" && bidang.value) {
      if (bidang.value.length < 6) {
        this.setErrorBidang(namaBidang, "Password minimal 6 karakter");
        return false;
      }
    }

    // Tampilkan sukses jika diaktifkan
    if (this.options.tampilkanSukses) {
      this.setBidangSukses(namaBidang);
    }

    return true;
  }

  validasiSemua() {
    let isValid = true;

    for (const namaBidang in this.bidang) {
      if (!this.validasiBidang(namaBidang)) {
        isValid = false;
      }
    }

    return isValid;
  }

  setErrorBidang(namaBidang, pesanError) {
    const bidang = this.bidang[namaBidang];
    if (!bidang) return;

    this.error[namaBidang] = pesanError;

    if (pesanError) {
      bidang.classList.add("is-invalid");
      bidang.classList.remove("is-valid");

      let errorElement = bidang.nextElementSibling;
      if (
        !errorElement ||
        !errorElement.classList.contains("invalid-feedback")
      ) {
        errorElement = document.createElement("div");
        errorElement.className = "invalid-feedback";
        bidang.parentNode.insertBefore(errorElement, bidang.nextSibling);
      }

      errorElement.textContent = pesanError;
    } else {
      bidang.classList.remove("is-invalid");
    }
  }

  setBidangSukses(namaBidang) {
    const bidang = this.bidang[namaBidang];
    if (!bidang) return;

    bidang.classList.add("is-valid");
    bidang.classList.remove("is-invalid");
  }

  getDataForm() {
    const dataForm = {};

    for (const namaBidang in this.bidang) {
      const bidang = this.bidang[namaBidang];
      dataForm[namaBidang] = bidang.value;
    }

    return dataForm;
  }

  reset() {
    this.form.reset();
    this.error = {};

    for (const namaBidang in this.bidang) {
      const bidang = this.bidang[namaBidang];
      bidang.classList.remove("is-invalid", "is-valid");

      const errorElement = bidang.nextElementSibling;
      if (errorElement && errorElement.classList.contains("invalid-feedback")) {
        errorElement.textContent = "";
      }
    }
  }
}

// Fungsi untuk membuat format angka dengan pemisah ribuan
function formatAngka(angka) {
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Fungsi untuk memvalidasi apakah input adalah angka
function validasiAngka(input) {
  return !isNaN(parseFloat(input)) && isFinite(input);
}

// Fungsi untuk memformat ukuran file (contoh: 1.5 MB)
function formatUkuranFile(bytes) {
  if (bytes === 0) return "0 Bytes";

  const satuan = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + satuan[i];
}

// Fungsi untuk membuat ID unik
function buatId(prefix = "") {
  return prefix + Math.random().toString(36).substr(2, 9);
}

// Ekspor fungsi untuk menggunakan secara global
window.formatRupiah = formatRupiah;
window.formatTanggal = formatTanggal;
window.ValidatorForm = ValidatorForm;
window.formatAngka = formatAngka;
window.validasiAngka = validasiAngka;
window.formatUkuranFile = formatUkuranFile;
window.buatId = buatId;
