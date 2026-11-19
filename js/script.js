// =============================================================
// MediFlow landing page — interactions
// =============================================================

// Footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Today's date on the invoice slip, formatted like a real receipt
const invDateEl = document.getElementById("invDate");
if (invDateEl) {
  invDateEl.textContent = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ---------------------------------------------------------------
// Mobile menu
// ---------------------------------------------------------------
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(isOpen));
  });

  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => mobileMenu.classList.remove("is-open"));
  });
}

// ---------------------------------------------------------------
// Pricing toggle: Monthly / Yearly
// ---------------------------------------------------------------
const toggleBtns = document.querySelectorAll(".toggle__btn");
const priceEls = document.querySelectorAll(".ticket__price [data-m]");
const periodEls = document.querySelectorAll(".ticket__price .per");

function formatINR(n) {
  return Number(n).toLocaleString("en-IN");
}

toggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    toggleBtns.forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const freq = btn.dataset.freq;

    priceEls.forEach((el) => {
      const value = freq === "yearly" ? el.dataset.y : el.dataset.m;
      el.textContent = formatINR(value);
    });
    periodEls.forEach((el) => {
      el.textContent = freq === "yearly" ? "/yr" : "/mo";
    });
  });
});

// ---------------------------------------------------------------
// Interactive invoice slip: add a line item and recompute totals
// ---------------------------------------------------------------
const CATALOG = [
  { name: "Cetirizine 10mg", qty: 6, rate: 2.4 },
  { name: "Pantoprazole 40mg", qty: 8, rate: 5.1 },
  { name: "ORS Sachet", qty: 4, rate: 8.0 },
  { name: "Vitamin D3 60K", qty: 1, rate: 42.0 },
  { name: "Amoxicillin 500mg", qty: 10, rate: 6.8 },
  { name: "Cough Syrup 100ml", qty: 1, rate: 68.0 },
  { name: "Metformin 500mg", qty: 15, rate: 2.1 },
];

const slipTableBody = document.querySelector("#slipTable tbody");
const addItemBtn = document.getElementById("addItem");
const slipEmpty = document.getElementById("slipEmpty");
const tSub = document.getElementById("tSub");
const tGst = document.getElementById("tGst");
const tTotal = document.getElementById("tTotal");

const GST_RATE = 0.12; // combined CGST + SGST shown as one line, matching the slip

function currentSubtotal() {
  let sum = 0;
  slipTableBody.querySelectorAll("tr[data-row]").forEach((row) => {
    const amt = parseFloat(row.querySelector(".c-amt").textContent.replace(/[₹,]/g, ""));
    sum += amt;
  });
  return sum;
}

function recalcTotals() {
  const rows = slipTableBody.querySelectorAll("tr[data-row]");
  slipEmpty.hidden = rows.length > 0;

  const subtotal = currentSubtotal();
  const gst = subtotal * GST_RATE;
  const total = subtotal + gst;

  tSub.textContent = `₹${subtotal.toFixed(2)}`;
  tGst.textContent = `₹${gst.toFixed(2)}`;
  tTotal.textContent = `₹${total.toFixed(2)}`;
}

let addedCount = 0;

function addRow(item) {
  const row = document.createElement("tr");
  row.dataset.row = "";
  row.innerHTML = `
    <td class="c-name">${item.name}</td>
    <td class="c-qty">×${item.qty}</td>
    <td class="c-amt">₹${(item.qty * item.rate).toFixed(2)}</td>
    <td class="c-rm"><button type="button" class="rm" aria-label="Remove ${item.name}">×</button></td>
  `;
  slipTableBody.appendChild(row);
  recalcTotals();
}

if (addItemBtn) {
  addItemBtn.addEventListener("click", () => {
    if (addedCount >= CATALOG.length) return;
    addRow(CATALOG[addedCount]);
    addedCount += 1;

    if (addedCount === CATALOG.length) {
      addItemBtn.textContent = "that's the whole shelf";
      addItemBtn.disabled = true;
    }
  });
}

// Remove a row — works for the two starting rows and anything added later
if (slipTableBody) {
  slipTableBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".rm");
    if (!btn) return;
    btn.closest("tr")?.remove();
    recalcTotals();
    // Freeing up a slot means there's room to add from the catalog again
    if (addedCount > 0) addedCount -= 1;
    addItemBtn.disabled = false;
    addItemBtn.textContent = "+ add another item";
  });
}

// ---------------------------------------------------------------
// Scrollspy: highlight the nav link for the section in view
// ---------------------------------------------------------------
const navLinks = document.querySelectorAll("#navLinks a");
const spySections = Array.from(navLinks)
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (spySections.length) {
  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === id);
        });
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  spySections.forEach((section) => spyObserver.observe(section));
}

// ---------------------------------------------------------------
// Sticky mobile CTA — appears once the hero has scrolled out of view
// ---------------------------------------------------------------
const stickyCta = document.getElementById("stickyCta");
const heroSection = document.getElementById("invoice");

if (stickyCta && heroSection) {
  const ctaObserver = new IntersectionObserver(
    ([entry]) => stickyCta.classList.toggle("is-visible", !entry.isIntersecting),
    { threshold: 0 }
  );
  ctaObserver.observe(heroSection);
}

// ---------------------------------------------------------------
// Smooth-scroll for in-page nav links, offset for the sticky header
// ---------------------------------------------------------------
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId.length <= 1) return;
    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;
    e.preventDefault();
    const top = targetEl.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: "smooth" });
  });
});