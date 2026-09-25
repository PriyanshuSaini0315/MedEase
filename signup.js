// =============================================================
// MediFlow — create account page
// =============================================================

// Carry a plan choice over from the pricing tickets (?plan=basic etc.)
// without showing a picker on this shorter form.
const params = new URLSearchParams(window.location.search);
const requestedPlan = params.get("plan");
if (requestedPlan) {
  const planField = document.getElementById("plan");
  if (planField) planField.value = requestedPlan;
}

const TYPE_LABELS = {
  retail: "Retail Medical Shop",
  wholesale: "Wholesale / Distributor",
  hospital: "Hospital Pharmacy",
};

function setFieldError(id, message) {
  const input = document.getElementById(id);
  const err = document.getElementById(`err-${id}`);
  if (input) input.classList.toggle("is-invalid", Boolean(message));
  if (err) err.textContent = message || "";
}

const signupForm = document.getElementById("signupForm");
const signupSubmit = document.getElementById("signupSubmit");

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const businessName = document.getElementById("businessName").value.trim();
  const email = document.getElementById("email").value.trim();
  const businessType = document.getElementById("businessType").value;
  const stateCode = document.getElementById("stateCode").value.trim().toUpperCase();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const plan = document.getElementById("plan").value || "professional";

  let hasError = false;

  if (!businessName) {
    setFieldError("businessName", "Which shop should we set up?");
    hasError = true;
  } else {
    setFieldError("businessName", "");
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setFieldError("email", "Enter a valid email address.");
    hasError = true;
  } else {
    setFieldError("email", "");
  }

  if (!/^[A-Z]{2}$/.test(stateCode)) {
    setFieldError("stateCode", "Two-letter state code, e.g. MH.");
    hasError = true;
  } else {
    setFieldError("stateCode", "");
  }

  if (password.length < 8) {
    setFieldError("password", "Use at least 8 characters.");
    hasError = true;
  } else {
    setFieldError("password", "");
  }

  if (!password || confirmPassword !== password) {
    setFieldError("confirmPassword", "Passwords don't match.");
    hasError = true;
  } else {
    setFieldError("confirmPassword", "");
  }

  if (hasError) return;

  signupSubmit.disabled = true;
  signupSubmit.textContent = "Setting up your shop...";

  // Simulated account creation — this page has no backend, so we
  // just confirm receipt and move on to the setup-complete page.
  setTimeout(() => {
    const qs = new URLSearchParams({
      name: businessName,
      shop: businessName,
      email,
      plan,
      type: TYPE_LABELS[businessType] || "",
      state: stateCode,
    });
    window.location.href = `welcome.html?${qs.toString()}`;
  }, 700);
});
