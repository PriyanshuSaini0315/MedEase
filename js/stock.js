// =============================================================
// MediFlow — Stock List
// =============================================================

// Reuse the status-pill colours from the invoice list:
// green = in stock, amber = low, red = out of stock
const STATE_PILL = { ok: "paid", low: "due", out: "overdue" };
const STATE_LABEL = { ok: "In stock", low: "Low stock", out: "Out of stock" };

const listBody = document.getElementById("listBody");
const listEmpty = document.getElementById("listEmpty");
const searchInput = document.getElementById("search");
const statusFilter = document.getElementById("statusFilter");

let visible = STOCK;

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const status = statusFilter.value;

  visible = STOCK.filter((i) => {
    const matchesQ = !q || i.name.toLowerCase().includes(q) || i.batch.toLowerCase().includes(q);
    return matchesQ && (status === "all" || stockState(i) === status);
  });

  listBody.innerHTML = visible
    .map((i) => {
      const s = stockState(i);
      return `
    <tr>
      <td class="party">${i.name}</td>
      <td class="invno">${i.batch}</td>
      <td class="muted">${i.pack}</td>
      <td>${i.expLabel}</td>
      <td class="num">${i.qty}</td>
      <td class="num">${rupee(i.mrp)}</td>
      <td class="num">${rupee(i.qty * i.mrp)}</td>
      <td><span class="status-pill status-pill--${STATE_PILL[s]}">${STATE_LABEL[s]}</span></td>
    </tr>`;
    })
    .join("");

  listEmpty.hidden = visible.length > 0;

  // Summary reflects the full stock, not the current filter
  document.getElementById("statProducts").textContent = STOCK.length;
  document.getElementById("statValue").textContent = rupee(STOCK.reduce((s, i) => s + i.qty * i.mrp, 0));
  document.getElementById("statLow").textContent = STOCK.filter((i) => stockState(i) === "low").length;
  document.getElementById("statOut").textContent = STOCK.filter((i) => stockState(i) === "out").length;
}

searchInput.addEventListener("input", render);
statusFilter.addEventListener("change", render);
render();

// Export whatever is currently shown as a CSV file
document.getElementById("exportCsv").addEventListener("click", () => {
  const rows = [["Product", "Batch", "Pack", "Expiry", "Qty", "MRP", "Value", "Status"]].concat(
    visible.map((i) => [i.name, i.batch, i.pack, i.expLabel, i.qty, i.mrp.toFixed(2), (i.qty * i.mrp).toFixed(2), STATE_LABEL[stockState(i)]])
  );
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = "stock-list.csv";
  a.click();
  URL.revokeObjectURL(a.href);
});
