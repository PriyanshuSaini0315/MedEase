// =============================================================
// MediFlow — Near Expiry
// =============================================================

const listBody = document.getElementById("listBody");
const listEmpty = document.getElementById("listEmpty");
const searchInput = document.getElementById("search");
const windowFilter = document.getElementById("windowFilter");

// Only batches that are expired or expire within 90 days, soonest first
const WATCH = STOCK.filter((i) => i.daysLeft <= 90).sort((a, b) => a.daysLeft - b.daysLeft);

function band(i) {
  if (i.daysLeft < 0) return { pill: "overdue", label: "Expired" };
  if (i.daysLeft <= 30) return { pill: "overdue", label: "≤ 30 days" };
  if (i.daysLeft <= 60) return { pill: "due", label: "31–60 days" };
  return { pill: "due", label: "61–90 days" };
}

function inWindow(i, w) {
  if (w === "all") return true;
  if (w === "expired") return i.daysLeft < 0;
  const max = Number(w);
  return i.daysLeft >= 0 && i.daysLeft <= max;
}

function render() {
  const q = searchInput.value.trim().toLowerCase();
  const w = windowFilter.value;

  const filtered = WATCH.filter((i) => {
    const matchesQ = !q || i.name.toLowerCase().includes(q) || i.batch.toLowerCase().includes(q);
    return matchesQ && inWindow(i, w);
  });

  listBody.innerHTML = filtered
    .map((i) => {
      const b = band(i);
      const left = i.daysLeft < 0 ? `${Math.abs(i.daysLeft)} days ago` : `${i.daysLeft} days`;
      return `
    <tr>
      <td class="party">${i.name}</td>
      <td class="invno">${i.batch}</td>
      <td>${i.expLabel}</td>
      <td class="muted">${left}</td>
      <td class="num">${i.qty}</td>
      <td class="num">${rupee(i.qty * i.mrp)}</td>
      <td><span class="status-pill status-pill--${b.pill}">${b.label}</span></td>
    </tr>`;
    })
    .join("");

  listEmpty.hidden = filtered.length > 0;

  // Summary cards always count the full watch-list
  const count = (fn) => WATCH.filter(fn).length;
  document.getElementById("statExpired").textContent = count((i) => i.daysLeft < 0);
  document.getElementById("stat30").textContent = count((i) => i.daysLeft >= 0 && i.daysLeft <= 30);
  document.getElementById("stat60").textContent = count((i) => i.daysLeft > 30 && i.daysLeft <= 60);
  document.getElementById("stat90").textContent = count((i) => i.daysLeft > 60 && i.daysLeft <= 90);
}

searchInput.addEventListener("input", render);
windowFilter.addEventListener("change", render);
render();
