// =============================================================
// MediFlow — Inventory shared: user info, sidebar, sample stock
// (load this BEFORE stock.js / expiry.js)
// =============================================================

const params = new URLSearchParams(window.location.search);
const email = params.get("email") || "retailer@gmail.com";
const shop = params.get("shop") || "Retailer Medical Store";
const initial = (shop || email).trim().charAt(0).toUpperCase();

["sideEmail", "topEmail"].forEach((id) => (document.getElementById(id).textContent = email));
["sideShop", "topShop"].forEach((id) => (document.getElementById(id).textContent = shop));
["sideAvatar", "topAvatar"].forEach((id) => (document.getElementById(id).textContent = initial));

// Sidebar groups, mobile drawer, sign out
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
  window.location.href = "signin.html";
});

// ---------------------------------------------------------------
// Sample stock — no backend here, so this is illustrative data.
// Replace RAW with your real stock (or an API call) later.
// Row: [name, batch, pack, qty, reorderLevel, mrp, expiresInDays]
// Expiry dates are generated relative to today so the Near Expiry
// page always has something meaningful to show.
// ---------------------------------------------------------------
const DAY = 86400000;
const todayDate = new Date();
todayDate.setHours(0, 0, 0, 0);

const RAW = [
  ["Paracetamol 500mg", "PC2411", "10 x 10", 240, 50, 32.0, 420],
  ["Azithromycin 500mg", "AZ0932", "1 x 5", 18, 20, 118.5, 48],
  ["Amoxicillin 500mg", "AM7714", "10 x 10", 0, 30, 96.0, 200],
  ["Cetirizine 10mg", "CT5521", "10 x 10", 75, 40, 24.0, 25],
  ["Pantoprazole 40mg", "PN3308", "10 x 10", 12, 25, 89.0, 12],
  ["Metformin 500mg", "MT1190", "10 x 15", 160, 60, 21.0, 600],
  ["ORS Sachet", "OR8842", "1 x 20", 90, 30, 22.0, 85],
  ["Vitamin D3 60K", "VD2207", "1 x 4", 9, 15, 168.0, -20],
  ["Cough Syrup 100ml", "CS4410", "1 x 1", 34, 10, 112.0, 300],
  ["Ibuprofen 400mg", "IB6603", "10 x 10", 0, 20, 38.0, -5],
];

function monthEnd(offsetDays) {
  const d = new Date(todayDate.getTime() + offsetDays * DAY);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

const STOCK = RAW.map(([name, batch, pack, qty, reorder, mrp, off]) => {
  const expiry = monthEnd(off);
  return {
    name, batch, pack, qty, reorder, mrp, expiry,
    expLabel: `${String(expiry.getMonth() + 1).padStart(2, "0")}-${expiry.getFullYear()}`,
    daysLeft: Math.round((expiry - todayDate) / DAY),
  };
});

const rupee = (n) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const stockState = (i) => (i.qty === 0 ? "out" : i.qty <= i.reorder ? "low" : "ok");
