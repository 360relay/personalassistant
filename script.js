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

  // Email validation function
  function isValidGmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    const domain = email.split("@")[1].toLowerCase();
    const gmailDomains = ["gmail.com", "googlemail.com"];
    return gmailDomains.includes(domain);
  }

  // Real-time email validation
  document.getElementById("email").addEventListener("blur", function () {
    const email = this.value.trim();

    if (email && !isValidGmail(email)) {
      this.style.borderColor = "red";
      let errorElement = this.parentNode.querySelector(".email-error");
      if (!errorElement) {
        errorElement = document.createElement("div");
        errorElement.className = "email-error";
        this.parentNode.appendChild(errorElement);
      }
      errorElement.textContent = "Please use a Gmail account for this position";
      errorElement.style.color = "red";
      errorElement.style.fontSize = "0.8rem";
      errorElement.style.marginTop = "5px";
    } else {
      this.style.borderColor = "#ddd";
      const errorElement = this.parentNode.querySelector(".email-error");
      if (errorElement) {
        errorElement.remove();
      }
    }
  });

  if (applicationForm) {
    applicationForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      // Validate email first
      const emailField = document.getElementById("email");
      const email = emailField.value.trim();

      if (!isValidGmail(email)) {
        emailField.style.borderColor = "red";
        showMessage(
          "A Google account (Gmail) is required for this position. Please provide a Gmail address.",
          "error"
        );
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

        // Send to Google Sheets using Google Forms method (more reliable)
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
    // REPLACE WITH YOUR ACTUAL GOOGLE APPS SCRIPT URL
    const GOOGLE_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbzGCxVjqa9HdelP-WLd2BTux0nKlJD0KUL2CqYvF_4cDdTbHfx3otpMn0kB2my6bRiiCw/exec";

    return new Promise((resolve, reject) => {
      // Create a hidden iframe to handle the response
      const iframe = document.createElement("iframe");
      iframe.name = "hidden_iframe_" + Date.now();
      iframe.style.display = "none";

      // Create a form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = GOOGLE_SCRIPT_URL;
      form.target = iframe.name;
      form.style.display = "none";

      // Add all form data as hidden inputs
      Object.keys(formData).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = formData[key];
        form.appendChild(input);
      });

      // Add iframe and form to document
      document.body.appendChild(iframe);
      document.body.appendChild(form);

      // Handle the response
      iframe.onload = function () {
        // For Google Apps Script, we can't read the response due to CORS
        // But if the iframe loads, the request was successful
        console.log("Form submitted successfully via iframe");

        // Clean up
        setTimeout(() => {
          document.body.removeChild(iframe);
          document.body.removeChild(form);
        }, 1000);

        resolve({ result: "success" });
      };

      iframe.onerror = function () {
        console.error("Iframe submission failed");

        // Clean up
        document.body.removeChild(iframe);
        document.body.removeChild(form);

        reject(new Error("Form submission failed"));
      };

      // Submit the form
      console.log("Submitting form via iframe method");
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
