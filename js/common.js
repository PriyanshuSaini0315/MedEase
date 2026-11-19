// =============================================================
// MediFlow — shared workspace wiring: signed-in user, sidebar, helpers
// =============================================================
const params = new URLSearchParams(window.location.search);
const email = params.get("email") || "retailer@gmail.com";
const shop = params.get("shop") || "Retailer Medical Store";
const initial = (shop || email).trim().charAt(0).toUpperCase();

["sideEmail", "topEmail"].forEach((id) => (document.getElementById(id).textContent = email));
["sideShop", "topShop"].forEach((id) => (document.getElementById(id).textContent = shop));
["sideAvatar", "topAvatar"].forEach((id) => (document.getElementById(id).textContent = initial));

document.querySelectorAll("[data-group] .side__group-btn").forEach((btn) => {
  btn.addEventListener("click", () => btn.closest("[data-group]").classList.toggle("is-open"));
});
const side = document.getElementById("side");
const veil = document.getElementById("sideveil");
const closeDrawer = () => { side.classList.remove("is-open"); veil.classList.remove("is-open"); };
document.getElementById("sidetoggle").addEventListener("click", () => {
  side.classList.toggle("is-open");
  veil.classList.toggle("is-open");
});
veil.addEventListener("click", closeDrawer);
document.getElementById("sideClose").addEventListener("click", closeDrawer);
document.getElementById("signOut").addEventListener("click", () => {
  try { sessionStorage.removeItem("mf_user"); } catch (e) {}
  window.location.href = "signin.html";
});

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const rupee = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pill = (cls, label) => `<span class="status-pill status-pill--${cls}">${label}</span>`;
const fmtDate = (iso) => { const [y, m, d] = String(iso).split("-"); return d ? `${d}/${m}/${y}` : iso; };
