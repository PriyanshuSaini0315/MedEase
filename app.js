// =============================================================
// MediFlow workspace — Create Invoice
// =============================================================

// ---------------------------------------------------------------
// Who's signed in (carried over from the sign-in page)
// ---------------------------------------------------------------
const params = new URLSearchParams(window.location.search);
const email = params.get("email") || "retailer@gmail.com";
const shop = params.get("shop") || "Retailer Medical Store";

const initial = (shop || email).trim().charAt(0).toUpperCase();

document.getElementById("sideEmail").textContent = email;
document.getElementById("topEmail").textContent = email;
document.getElementById("sheetEmail").textContent = email;
document.getElementById("sideShop").textContent = shop;
document.getElementById("topShop").textContent = shop;
document.getElementById("sheetStore").textContent = shop.toUpperCase();
document.getElementById("signFor").textContent = `For ${shop}`;
document.getElementById("sideAvatar").textContent = initial;
document.getElementById("topAvatar").textContent = initial;

// ---------------------------------------------------------------
// Dates on the invoice header
// ---------------------------------------------------------------
const fmt = (d) =>
  d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).replace(/\//g, "/");

const today = new Date();
const due = new Date(today);
due.setDate(due.getDate() + 30);

document.getElementById("invDate").textContent = fmt(today);
document.getElementById("lrDate").textContent = fmt(today);
document.getElementById("dueDate").textContent = fmt(due);

// ---------------------------------------------------------------
// Sidebar: collapsible groups + mobile drawer
// ---------------------------------------------------------------
document.querySelectorAll("[data-group] .side__group-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest("[data-group]").classList.toggle("is-open");
  });
});

const side = document.getElementById("side");
const veil = document.getElementById("sideveil");

function closeDrawer() {
  side.classList.remove("is-open");
  veil.classList.remove("is-open");
}

document.getElementById("sidetoggle").addEventListener("click", () => {
  side.classList.toggle("is-open");
  veil.classList.toggle("is-open");
});
veil.addEventListener("click", closeDrawer);
document.getElementById("sideClose").addEventListener("click", closeDrawer);

// On mobile the drawer covers the whole screen, so close it once the
// visitor actually taps through to a page (not the group toggles).
document.querySelectorAll(".side__link").forEach((link) => {
  link.addEventListener("click", () => {
    if (window.innerWidth <= 1020) closeDrawer();
  });
});

document.getElementById("signOut").addEventListener("click", () => {
  window.location.href = "signin.html";
});

// ---------------------------------------------------------------
// Line items
// ---------------------------------------------------------------
const linesBody = document.getElementById("linesBody");
const STARTING_ROWS = 8;

function rowMarkup(sr) {
  return `
    <td class="sr">${sr}</td>
    <td><input type="text" data-f="name" placeholder="Product..." /></td>
    <td><input type="text" data-f="hsn" /></td>
    <td><input type="text" data-f="pack" /></td>
    <td><input type="number" min="0" step="1" data-f="qty" class="num" /></td>
    <td><input type="number" min="0" step="1" data-f="free" class="num" /></td>
    <td><input type="text" data-f="batch" /></td>
    <td><input type="text" data-f="mfg" placeholder="MM-YYYY" /></td>
    <td><input type="text" data-f="exp" placeholder="MM-YYYY" /></td>
    <td><input type="number" min="0" step="0.01" data-f="mrp" class="num" /></td>
    <td><input type="number" min="0" max="100" step="0.01" data-f="discpc" class="num" /></td>
    <td class="calc" data-c="discamt">0.00</td>
    <td class="calc" data-c="price">0.00</td>
    <td><input type="number" min="0" step="1" data-f="gstpc" class="num" value="0" /></td>
    <td class="calc" data-c="gstamt">0.00</td>
    <td class="calc" data-c="taxable">0.00</td>
    <td class="del"><button type="button" class="rmrow" aria-label="Remove row ${sr}">×</button></td>
  `;
}

function addRow() {
  const tr = document.createElement("tr");
  tr.innerHTML = rowMarkup(linesBody.children.length + 1);
  linesBody.appendChild(tr);
}

function renumber() {
  Array.from(linesBody.children).forEach((tr, i) => {
    tr.querySelector(".sr").textContent = i + 1;
    tr.querySelector(".rmrow").setAttribute("aria-label", `Remove row ${i + 1}`);
  });
}

for (let i = 0; i < STARTING_ROWS; i += 1) addRow();

document.getElementById("addRow").addEventListener("click", () => {
  addRow();
  recalc();
});

linesBody.addEventListener("click", (e) => {
  const btn = e.target.closest(".rmrow");
  if (!btn) return;
  // Keep at least one row on the sheet so there's always somewhere to type
  if (linesBody.children.length === 1) {
    btn.closest("tr").querySelectorAll("input").forEach((i) => (i.value = ""));
  } else {
    btn.closest("tr").remove();
  }
  renumber();
  recalc();
});

// ---------------------------------------------------------------
// Totals — GST split per slab, CGST/SGST for in-state billing
// ---------------------------------------------------------------
const money = (n) => n.toFixed(2);
const num = (el) => parseFloat(el?.value) || 0;

function recalc() {
  const slabs = { 5: { sales: 0, disc: 0, taxable: 0, gst: 0 }, 12: { sales: 0, disc: 0, taxable: 0, gst: 0 }, 18: { sales: 0, disc: 0, taxable: 0, gst: 0 }, 28: { sales: 0, disc: 0, taxable: 0, gst: 0 } };

  let qtyBilled = 0;
  let qtyFree = 0;
  let totalSales = 0;
  let totalDisc = 0;
  let totalGst = 0;
  let totalTaxable = 0;

  Array.from(linesBody.children).forEach((tr) => {
    const get = (f) => tr.querySelector(`[data-f="${f}"]`);
    const set = (c, v) => (tr.querySelector(`[data-c="${c}"]`).textContent = v);

    const qty = num(get("qty"));
    const free = num(get("free"));
    const mrp = num(get("mrp"));
    const discPc = num(get("discpc"));
    const gstPc = num(get("gstpc"));

    const gross = qty * mrp;
    const discAmt = (gross * discPc) / 100;
    const taxable = gross - discAmt;
    const gstAmt = (taxable * gstPc) / 100;
    const price = taxable + gstAmt;

    set("discamt", money(discAmt));
    set("taxable", money(taxable));
    set("gstamt", money(gstAmt));
    set("price", money(price));

    qtyBilled += qty;
    qtyFree += free;
    totalSales += gross;
    totalDisc += discAmt;
    totalGst += gstAmt;
    totalTaxable += taxable;

    if (slabs[gstPc]) {
      slabs[gstPc].sales += gross;
      slabs[gstPc].disc += discAmt;
      slabs[gstPc].taxable += taxable;
      slabs[gstPc].gst += gstAmt;
    }
  });

  // per-slab class table
  document.querySelectorAll("#classBody tr").forEach((tr) => {
    const s = slabs[tr.dataset.slab];
    tr.querySelector("[data-sales]").textContent = money(s.sales);
    tr.querySelector("[data-disc]").textContent = money(s.disc);
    tr.querySelector("[data-taxable]").textContent = money(s.taxable);
  });

  const beforeRound = totalTaxable + totalGst;
  const grand = Math.round(beforeRound);
  const roundOff = grand - beforeRound;

  document.getElementById("qtyBilled").textContent = `${qtyBilled} Pcs.`;
  document.getElementById("qtyFree").textContent = `${qtyFree} Pcs.`;
  document.getElementById("tSales").textContent = money(totalSales);
  document.getElementById("tDisc").textContent = money(totalDisc);
  document.getElementById("tIgst").textContent = money(0);
  document.getElementById("tCgst").textContent = money(totalGst / 2);
  document.getElementById("tSgst").textContent = money(totalGst / 2);
  document.getElementById("tRound").textContent = money(roundOff);
  document.getElementById("tGrand").textContent = money(grand);
  document.getElementById("tGrand2").textContent = money(grand);
}

linesBody.addEventListener("input", recalc);
recalc();

// ---------------------------------------------------------------
// Confirm & Print — no backend here, so this opens the print dialog
// rather than pretending the invoice was saved to a server.
// ---------------------------------------------------------------
document.getElementById("confirmPrint").addEventListener("click", () => {
  window.print();
});