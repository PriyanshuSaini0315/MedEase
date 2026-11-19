// =============================================================
const pill = (cls, label) => `<span class="status-pill status-pill--${cls}">${label}</span>`;
// MediFlow — Alerts (needs inventory-data.js: STOCK, rupee helpers)
// =============================================================
const LEVEL = { high: "overdue", mid: "due" };
const alertsAll = [];

STOCK.forEach((i) => {
  if (i.qty === 0) alertsAll.push({ type: "Out of stock", level: "high", item: i, detail: "No units left — reorder now", order: 0 });
  else if (i.qty <= i.reorder) alertsAll.push({ type: "Low stock", level: "mid", item: i, detail: `${i.qty} left (reorder at ${i.reorder})`, order: 2 });
  if (i.daysLeft < 0) alertsAll.push({ type: "Expired", level: "high", item: i, detail: `Expired ${Math.abs(i.daysLeft)} days ago — remove from shelf`, order: 1 });
  else if (i.daysLeft <= 90) alertsAll.push({ type: "Expiring soon", level: i.daysLeft <= 30 ? "high" : "mid", item: i, detail: `Expires in ${i.daysLeft} days (${i.expLabel})`, order: 3 });
});
alertsAll.sort((a, b) => a.order - b.order);

const el = (id) => document.getElementById(id);

function render() {
  const f = el("filter").value;
  const q = el("search").value.trim().toLowerCase();
  const list = alertsAll.filter((a) => (!f || a.type === f) && (!q || a.item.name.toLowerCase().includes(q)));

  el("tbody").innerHTML = list
    .map((a) => `<tr><td>${pill(LEVEL[a.level], a.type)}</td><td class="party">${a.item.name}</td><td class="invno">${a.item.batch}</td><td class="muted">${a.detail}</td></tr>`)
    .join("");
  el("empty").hidden = list.length > 0;

  const c = (t) => alertsAll.filter((a) => a.type === t).length;
  el("stats").innerHTML = [["Out of stock", c("Out of stock"), "due"], ["Low stock", c("Low stock")], ["Expired", c("Expired"), "due"], ["Expiring soon", c("Expiring soon")]]
    .map(([l, v, m]) => `<div class="stat ${m === "due" ? "stat--due" : ""}"><p class="stat__label">${l}</p><p class="stat__value">${v}</p></div>`)
    .join("");
}
el("filter").addEventListener("change", render);
el("search").addEventListener("input", render);
render();
