// =============================================================
// MediFlow — Invoice List
// =============================================================

const params = new URLSearchParams(window.location.search);
const email = params.get("email") || "retailer@gmail.com";
const shop = params.get("shop") || "Retailer Medical Store";
const initial = (shop || email).trim().charAt(0).toUpperCase();

document.getElementById("sideEmail").textContent = email;
document.getElementById("topEmail").textContent = email;
document.getElementById("sideShop").textContent = shop;
document.getElementById("topShop").textContent = shop;
document.getElementById("sideAvatar").textContent = initial;
document.getElementById("topAvatar").textContent = initial;

// ---------------------------------------------------------------
// Sidebar: collapsible groups + sign out (same pattern as app.js)
// ---------------------------------------------------------------
document.querySelectorAll("[data-group] .side__group-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.closest("[data-group]").classList.toggle("is-open");
  });
});
document.getElementById("signOut").addEventListener("click", () => {
  window.location.href = "signin.html";
});

// ---------------------------------------------------------------
// Sample invoices — this page has no backend, so the list below
// is illustrative data standing in for what a shop would see
// after raising a few real invoices.
// ---------------------------------------------------------------
const INVOICES = [
  { no: "RX-2041", date: "15/09/2026", party: "Ahuja Hospital Pharmacy", items: 6, amount: 4820.5, status: "paid" },
  { no: "RX-2040", date: "15/09/2026", party: "Sanoli Road Clinic", items: 3, amount: 1260.0, status: "due" },
  { no: "RX-2039", date: "14/09/2026", party: "Walk-in Customer", items: 2, amount: 340.0, status: "paid" },
  { no: "RX-2038", date: "13/09/2026", party: "Panipat Nursing Home", items: 11, amount: 9875.75, status: "overdue" },
  { no: "RX-2037", date: "12/09/2026", party: "Walk-in Customer", items: 1, amount: 85.0, status: "paid" },
  { no: "RX-2036", date: "11/09/2026", party: "Sector 12 Medical Store", items: 8, amount: 5210.0, status: "due" },
  { no: "RX-2035", date: "10/09/2026", party: "Ahuja Hospital Pharmacy", items: 5, amount: 3120.25, status: "paid" },
];

const rupee = (n) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_LABEL = { paid: "Paid", due: "Due", overdue: "Overdue" };

const iconEye = `<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>`;
const iconPrint = `<svg viewBox="0 0 24 24"><path d="M6 9V3h12v6"/><rect x="4" y="9" width="16" height="8" rx="1.5"/><path d="M6 17h12v4H6z"/></svg>`;

const listBody = document.getElementById("listBody");
const listEmpty = document.getElementById("listEmpty");
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  const filtered = INVOICES.filter((inv) => {
    const matchesQ = !q || inv.no.toLowerCase().includes(q) || inv.party.toLowerCase().includes(q);
    const matchesStatus = status === "all" || inv.status === status;
    return matchesQ && matchesStatus;
  });

  listBody.innerHTML = filtered
    .map(
      (inv) => `
    <tr>
      <td class="invno">${inv.no}</td>
      <td>${inv.date}</td>
      <td class="party">${inv.party}</td>
      <td class="muted">${inv.items} item${inv.items === 1 ? "" : "s"}</td>
      <td class="num">${rupee(inv.amount)}</td>
      <td><span class="status-pill status-pill--${inv.status}">${STATUS_LABEL[inv.status]}</span></td>
      <td>
        <div class="rowactions">
          <button type="button" aria-label="View ${inv.no}">${iconEye}</button>
          <button type="button" aria-label="Print ${inv.no}">${iconPrint}</button>
        </div>
      </td>
    </tr>
  `
    )
    .join("");

  listEmpty.hidden = filtered.length > 0;

  // Summary stats reflect the full list, not just the current filter,
  // so the month-at-a-glance numbers stay stable while searching.
  const billed = INVOICES.reduce((sum, inv) => sum + inv.amount, 0);
  const paid = INVOICES.filter((i) => i.status === "paid").reduce((sum, inv) => sum + inv.amount, 0);
  const due = billed - paid;

  document.getElementById("statCount").textContent = INVOICES.length;
  document.getElementById("statBilled").textContent = rupee(billed);
  document.getElementById("statPaid").textContent = rupee(paid);
  document.getElementById("statDue").textContent = rupee(due);
}

searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
render();

// Print buttons open the browser's print dialog rather than pretending
// to generate a PDF this static build can't actually produce.
listBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[aria-label^='Print']");
  if (btn) window.print();
});