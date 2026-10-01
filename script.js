// FORM SUBMISSION HANDLER FOR PERSONAL ASSISTANT APPLICATION
document.addEventListener("DOMContentLoaded", function () {
  const applicationForm = document.getElementById("applicationForm");
  const submitBtn = document.querySelector(".btn-block");
  const formMessage = document.createElement("div");

  // Add message element to the form
  if (applicationForm) {
    applicationForm.appendChild(formMessage);
    formMessage.style.marginTop = "20px";
    formMessage.style.padding = "10px";
    formMessage.style.borderRadius = "4px";
  }

  // Email validation function - accepts any valid email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Real-time email validation
  const emailField = document.getElementById("email");
  if (emailField) {
    emailField.addEventListener("blur", function () {
      const email = this.value.trim();

      if (email && !isValidEmail(email)) {
        this.style.borderColor = "red";
        let errorElement = this.parentNode.querySelector(".email-error");
        if (!errorElement) {
          errorElement = document.createElement("div");
          errorElement.className = "email-error";
          this.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = "Please enter a valid email address";
      } else {
        this.style.borderColor = "#ddd";
        const errorElement = this.parentNode.querySelector(".email-error");
        if (errorElement) {
          errorElement.remove();
        }
      }
    });

    emailField.addEventListener("input", function () {
      if (isValidEmail(this.value.trim())) {
        this.style.borderColor = "#ddd";
        const errorElement = this.parentNode.querySelector(".email-error");
        if (errorElement) {
          errorElement.remove();
        }
      }
    });
  }

  if (applicationForm) {
    applicationForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Validate email first
      const emailInput = document.getElementById("email");
      const email = emailInput.value.trim();

      if (!isValidEmail(email)) {
        emailInput.style.borderColor = "red";
        showMessage("Please enter a valid email address.", "error");

        let errorElement = emailInput.parentNode.querySelector(".email-error");
        if (!errorElement) {
          errorElement = document.createElement("div");
          errorElement.className = "email-error";
          emailInput.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = "Please enter a valid email address";
        emailInput.focus();
        return;
      }

      // Show loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";
      }

      showMessage("Submitting your application...", "loading");

      try {
        const formData = getFormData();
        console.log("Form data to submit:", formData);

        await submitToGoogleSheets(formData);

        showSuccessMessage();
        applicationForm.reset();
      } catch (error) {
        console.error("Submission error:", error);
        showMessage(
          "There was an error submitting your application. Please try again.",
          "error"
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Application";
        }
      }
    });
  }

  function getFormData() {
    const formData = new FormData(applicationForm);

    const formattedAddress = createFormattedAddress(
      formData.get("fullName") || "",
      formData.get("address") || "",
      formData.get("city") || "",
      formData.get("state") || "",
      formData.get("zip") || "",
      formData.get("email") || "",
      formData.get("phone") || ""
    );

    return {
      fullName: formData.get("fullName") || "",
      address: formData.get("address") || "",
      city: formData.get("city") || "",
      state: formData.get("state") || "",
      zip: formData.get("zip") || "",
      email: formData.get("email") || "",
      phone: formData.get("phone") || "",
      experience: formData.get("experience") || "",
      start: formData.get("start") || "",
      references: formData.get("references") || "",
      comments: formData.get("comments") || "",
      formattedAddress: formattedAddress,
      timestamp: new Date().toLocaleString(),
      source: "Personal Assistant Application Website",
    };
  }

  function createFormattedAddress(
    fullName,
    address,
    city,
    state,
    zip,
    email,
    phone
  ) {
    let formatted = "";
    if (fullName) formatted += fullName + "\n";
    if (address) formatted += address + "\n";

    const locationParts = [];
    if (city) locationParts.push(city);
    if (state) locationParts.push(state);
    if (zip) locationParts.push(zip);

    if (locationParts.length > 0) {
      formatted += locationParts.join(", ") + "\n";
    }

    if (email) formatted += email + "\n";
    if (phone) formatted += phone + "\n";
    formatted += "==============";

    return formatted;
  }

  async function submitToGoogleSheets(formData) {
    const GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbzGCxVjqa9HdelP-WLd2BTux0nKlJD0KUL2CqYvF_4cDdTbHfx3otpMn0kB2my6bRiiCw/exec";

    return new Promise((resolve, reject) => {
      const iframe = document.createElement("iframe");
      iframe.name = "hidden_iframe_" + Date.now();
      iframe.style.display = "none";

      const form = document.createElement("form");
      form.method = "POST";
      form.action = GOOGLE_SCRIPT_URL;
      form.target = iframe.name;
      form.style.display = "none";

      Object.keys(formData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      });

      document.body.appendChild(iframe);
      document.body.appendChild(form);

      iframe.onload = function () {
        console.log("Form submitted successfully via iframe");

        setTimeout(() => {
          if (document.body.contains(iframe)) document.body.removeChild(iframe);
          if (document.body.contains(form)) document.body.removeChild(form);
        }, 1000);

        resolve({ result: "success" });
      };

      iframe.onerror = function () {
        console.error("Iframe submission failed");

        if (document.body.contains(iframe)) document.body.removeChild(iframe);
        if (document.body.contains(form)) document.body.removeChild(form);

        reject(new Error("Form submission failed"));
      };

      form.submit();
    });
  }

  function showMessage(message, type) {
    if (formMessage) {
      formMessage.textContent = message;
      formMessage.style.color =
        type === "success"
          ? "#2ecc71"
          : type === "error"
          ? "#e74c3c"
          : "#3498db";
      formMessage.style.backgroundColor =
        type === "success"
          ? "#d1fae5"
          : type === "error"
          ? "#fee2e2"
          : "#dbeafe";
      formMessage.style.border =
        type === "success"
          ? "1px solid #a7f3d0"
          : type === "error"
          ? "1px solid #fecaca"
          : "1px solid #93c5fd";

      if (type === "error" || type === "loading") {
        setTimeout(() => {
          if (formMessage.textContent === message) {
            formMessage.textContent = "";
            formMessage.style.backgroundColor = "transparent";
            formMessage.style.border = "none";
          }
        }, 5000);
      }
    }
  }

  function showSuccessMessage() {
    formMessage.innerHTML = `
      <div style="color: #2ecc71; padding: 15px; background: #d1fae5; border-radius: 8px; border: 1px solid #a7f3d0;">
        <strong>✓ Application submitted successfully!</strong><br>
        We've received your application and will contact you soon via email.
      </div>
    `;
  }
});