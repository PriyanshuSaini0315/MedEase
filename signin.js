// =============================================================
// MediFlow — sign in page
// =============================================================

function setFieldError(id, message) {
  const input = document.getElementById(id);
  const err = document.getElementById(`err-${id}`);
  if (input) input.classList.toggle("is-invalid", Boolean(message));
  if (err) err.textContent = message || "";
}

const signinForm = document.getElementById("signinForm");
const signinSubmit = document.getElementById("signinSubmit");

signinForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  let hasError = false;

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    setFieldError("email", "Enter a valid email address.");
    hasError = true;
  } else {
    setFieldError("email", "");
  }

  if (!password) {
    setFieldError("password", "Enter your password.");
    hasError = true;
  } else {
    setFieldError("password", "");
  }

  if (hasError) return;

  signinSubmit.disabled = true;
  signinSubmit.textContent = "Signing in...";

  // Simulated sign-in — this page has no backend, so we just open the
  // workspace once the fields look filled in.
  setTimeout(() => {
    const qs = new URLSearchParams({ email });
    window.location.href = `app.html?${qs.toString()}`;
  }, 600);
});

// Password recovery isn't wired up on this static build — say so plainly
// instead of letting the link look like it did something.
document.getElementById("forgotLink").addEventListener("click", (e) => {
  e.preventDefault();
  const note = document.getElementById("err-email");
  note.textContent = "Password reset isn't set up yet — call support to get back in.";
});
