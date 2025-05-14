// File: js/validation.js
class FormValidator {
  constructor(formId, options = {}) {
    this.form = document.getElementById(formId);
    this.options = {
      realtime: true,
      showSuccessMessage: false,
      ...options,
    };
    this.errors = {};
    this.fields = {};
    this.setupValidation();
  }

  setupValidation() {
    const inputs = this.form.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      const fieldName = input.id;
      this.fields[fieldName] = input;

      // Tambahkan event listener untuk validasi realtime
      if (this.options.realtime) {
        input.addEventListener("blur", () => {
          this.validateField(fieldName);
        });

        input.addEventListener("input", () => {
          if (this.errors[fieldName]) {
            this.validateField(fieldName);
          }
        });
      }
    });

    // Validasi saat submit
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (this.validateAll()) {
        // Jika valid, dispatch custom event
        const event = new CustomEvent("form:valid", {
          detail: this.getFormData(),
        });
        this.form.dispatchEvent(event);
      }
    });
  }

  validateField(fieldName) {
    const field = this.fields[fieldName];
    if (!field) return true;

    // Reset error
    this.setFieldError(fieldName, "");

    // Validasi required
    if (field.hasAttribute("required") && !field.value.trim()) {
      this.setFieldError(fieldName, "Field ini wajib diisi");
      return false;
    }

    // Validasi email
    if (field.type === "email" && field.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(field.value)) {
        this.setFieldError(fieldName, "Format email tidak valid");
        return false;
      }
    }

    // Validasi nomor telepon
    if (field.id.toLowerCase().includes("phone") && field.value) {
      const phoneRegex = /^[0-9]{10,13}$/;
      if (!phoneRegex.test(field.value.replace(/\D/g, ""))) {
        this.setFieldError(fieldName, "Nomor telepon tidak valid");
        return false;
      }
    }

    // Validasi panjang password
    if (field.type === "password" && field.value) {
      if (field.value.length < 6) {
        this.setFieldError(fieldName, "Password minimal 6 karakter");
        return false;
      }
    }

    // Tampilkan pesan sukses jika diaktifkan
    if (this.options.showSuccessMessage) {
      this.setFieldSuccess(fieldName);
    }

    return true;
  }

  validateAll() {
    let isValid = true;

    for (const fieldName in this.fields) {
      if (!this.validateField(fieldName)) {
        isValid = false;
      }
    }

    return isValid;
  }

  setFieldError(fieldName, errorMessage) {
    const field = this.fields[fieldName];
    if (!field) return;

    this.errors[fieldName] = errorMessage;

    // Ubah tampilan field
    if (errorMessage) {
      field.classList.add("is-invalid");
      field.classList.remove("is-valid");

      // Buat atau update pesan error
      let errorElement = field.nextElementSibling;
      if (
        !errorElement ||
        !errorElement.classList.contains("invalid-feedback")
      ) {
        errorElement = document.createElement("div");
        errorElement.className = "invalid-feedback";
        field.parentNode.insertBefore(errorElement, field.nextSibling);
      }

      errorElement.textContent = errorMessage;
    } else {
      field.classList.remove("is-invalid");
    }
  }

  setFieldSuccess(fieldName) {
    const field = this.fields[fieldName];
    if (!field) return;

    field.classList.add("is-valid");
    field.classList.remove("is-invalid");
  }

  getFormData() {
    const formData = {};

    for (const fieldName in this.fields) {
      const field = this.fields[fieldName];
      formData[fieldName] = field.value;
    }

    return formData;
  }

  reset() {
    this.form.reset();
    this.errors = {};

    for (const fieldName in this.fields) {
      const field = this.fields[fieldName];
      field.classList.remove("is-invalid", "is-valid");

      const errorElement = field.nextElementSibling;
      if (errorElement && errorElement.classList.contains("invalid-feedback")) {
        errorElement.textContent = "";
      }
    }
  }
}
