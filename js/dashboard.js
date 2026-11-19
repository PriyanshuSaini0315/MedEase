// =============================================================
// MediFlow — Dashboard
// =============================================================

const params = new URLSearchParams(window.location.search);
const email = params.get("email") || "retailer@gmail.com";
const shop = params.get("shop") || "Retailer Medical Store";
const userName = email.split("@")[0];
const initial = (shop || email).trim().charAt(0).toUpperCase();

["sideEmail", "topEmail"].forEach((id) => (document.getElementById(id).textContent = email));
["sideShop", "topShop"].forEach((id) => (document.getElementById(id).textContent = shop));
["sideAvatar", "topAvatar"].forEach((id) => (document.getElementById(id).textContent = initial));

const dateLong = new Date().toLocaleDateString("en-GB", {
  weekday: "long", day: "numeric", month: "long", year: "numeric",
});
document.getElementById("welcome").textContent = `Welcome, ${userName} — ${dateLong}`;

// ---------------------------------------------------------------
// Sidebar (same pattern as app.js)
// ---------------------------------------------------------------
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
// Dashboard data — no backend, so this starts empty (like the
// screenshot). Fill these arrays/numbers from your API later and
// call renderDashboard() again.
// ---------------------------------------------------------------
const DATA = {
  sales: 0,
  orders: 0,
  expenses: 0,
  expenseEntries: 0,
  pendingTokens: 0,
  completedOrders: 0,
  lowStock: 0,
  outOfStock: 0,
  products: 0,
  cancelled: 0,
  discounts: 0,
  hourly: [],        // [{ hour: "10", amount: 1200 }]
  payments: [],      // [{ mode: "Cash", amount: 800 }]
  topSelling: [],    // [{ name: "Paracetamol 500mg", qty: 24 }]
  staff: [],         // [{ name: "saksham", orders: 5, amount: 2100 }]
  alerts: [],        // [{ name: "Cetirizine 10mg", left: 3 }]
};

const rupee = (n) => `₹${Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const $ = (id) => document.getElementById(id);

function renderDashboard() {
  const avg = DATA.completedOrders ? DATA.sales / DATA.completedOrders : 0;

  $("kSales").textContent = rupee(DATA.sales);
  $("kSalesSub").textContent = `${DATA.orders} orders`;
  $("kExp").textContent = rupee(DATA.expenses);
  $("kExpSub").textContent = `${DATA.expenseEntries} entries`;
  $("kTokens").textContent = DATA.pendingTokens;
  $("kAvg").textContent = rupee(avg);
  $("kLow").textContent = DATA.lowStock;
  $("kLowSub").textContent = `${DATA.outOfStock} out of stock`;

  $("qsProducts").textContent = DATA.products;
  $("qsOrders").textContent = DATA.orders;
  $("qsCancelled").textContent = DATA.cancelled;
  $("qsDiscounts").textContent = rupee(DATA.discounts);

  // Sales by hour
  const hourly = $("hourly");
  if (!DATA.hourly.length) {
    hourly.innerHTML = `<p class="empty empty--fill">No sales data yet today</p>`;
  } else {
    const max = Math.max(...DATA.hourly.map((h) => h.amount));
    hourly.innerHTML = `<div class="bars">${DATA.hourly
      .map((h) => `<div class="bars__col" title="${rupee(h.amount)}">
        <div class="bars__bar" style="height:${(h.amount / max) * 100}%"></div>
        <span class="bars__lbl">${h.hour}h</span></div>`)
      .join("")}</div>`;
  }

  // Payment split
  const pay = $("payments");
  if (!DATA.payments.length) {
    pay.innerHTML = `<p class="empty empty--fill">No payments yet</p>`;
  } else {
    const total = DATA.payments.reduce((s, p) => s + p.amount, 0);
    pay.innerHTML = `<ul class="list">${DATA.payments
      .map((p) => `<li><div class="list__row"><span>${p.mode}</span><span>${rupee(p.amount)}</span></div>
        <div class="meter"><i style="width:${(p.amount / total) * 100}%"></i></div></li>`)
      .join("")}</ul>`;
  }

  // Top selling
  const top = $("topSelling");
  top.innerHTML = DATA.topSelling.length
    ? `<ul class="list">${DATA.topSelling
        .map((t) => `<li><div class="list__row"><span>${t.name}</span><span>${t.qty} sold</span></div></li>`)
        .join("")}</ul>`
    : `<p class="empty">No sales yet</p>`;

  // Salesperson performance
  const staff = $("staff");
  staff.innerHTML = DATA.staff.length
    ? `<ul class="list">${DATA.staff
        .map((s) => `<li><div class="list__row"><span>${s.name}</span><span>${s.orders} orders · ${rupee(s.amount)}</span></div></li>`)
        .join("")}</ul>`
    : `<p class="empty">No data yet</p>`;

  // Stock alerts
  const al = $("alerts");
  al.innerHTML = DATA.alerts.length
    ? DATA.alerts.map((a) => `<div class="alert-item"><span>${a.name}</span><b>${a.left} left</b></div>`).join("")
    : `<p class="alert-ok">All clear ✓</p>`;
}

// Live numbers from the Products and Token Queue pages (browser storage)
if (typeof MF !== "undefined") {
  const products = MF.load("mf_products");
  const tokens = MF.load("mf_tokens");
  DATA.products = products.length;
  DATA.lowStock = products.filter((p) => p.qty > 0 && p.qty <= p.reorder).length;
  DATA.outOfStock = products.filter((p) => p.qty === 0).length;
  DATA.pendingTokens = tokens.filter((t) => t.status === "waiting" || t.status === "serving").length;
  DATA.alerts = products.filter((p) => p.qty <= p.reorder).map((p) => ({ name: p.name, left: p.qty }));
}

renderDashboard();
