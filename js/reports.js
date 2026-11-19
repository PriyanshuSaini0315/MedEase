// =============================================================
// MediFlow — Reports (Employee Sales, Product Sales, P&L, Forecast)
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
document.getElementById("signOut").addEventListener("click", () => { window.location.href = "signin.html"; });

// ---------------------------------------------------------------
// Sample sales — no backend, so this is generated, illustrative data
// for the last 30 days. Replace LINES / EXPENSES with real data later.
// LINES: one row per product sold in an order.
// ---------------------------------------------------------------
const CATALOG = [
  // name, category, price, cost
  ["Paracetamol 500mg", "Tablets", 32, 20],
  ["Azithromycin 500mg", "Tablets", 118, 82],
  ["Cetirizine 10mg", "Tablets", 24, 14],
  ["Pantoprazole 40mg", "Tablets", 89, 58],
  ["Cough Syrup 100ml", "Syrups", 112, 76],
  ["Antacid Syrup 200ml", "Syrups", 96, 64],
  ["ORS Sachet", "Supplements", 22, 14],
  ["Vitamin D3 60K", "Supplements", 168, 112],
];
const EMPLOYEES = ["saksham", "Riya", "Amit"];
const PAYMENTS = ["Cash", "UPI", "Card"];

let seed = 11;
const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const pad = (n) => String(n).padStart(2, "0");
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const today = new Date();
today.setHours(0, 0, 0, 0);

const LINES = [];
const EXPENSES = [];
let orderId = 0;

for (let back = 29; back >= 0; back -= 1) {
  const day = new Date(today.getTime() - back * 86400000);
  const date = keyOf(day);
  const orders = 3 + Math.floor(rnd() * 5);
  for (let o = 0; o < orders; o += 1) {
    orderId += 1;
    const emp = EMPLOYEES[Math.floor(rnd() * EMPLOYEES.length)];
    const pay = PAYMENTS[Math.floor(rnd() * PAYMENTS.length)];
    const picks = [...CATALOG].sort(() => rnd() - 0.5).slice(0, 1 + Math.floor(rnd() * 3));
    const gross = picks.map(([, , price]) => price);
    const lines = picks.map(([name, cat, price, cost]) => {
      const qty = 1 + Math.floor(rnd() * 6);
      return { orderId, date, emp, pay, name, cat, qty, gross: qty * price, cost: qty * cost, disc: 0 };
    });
    const orderGross = lines.reduce((s, l) => s + l.gross, 0);
    const orderDisc = rnd() < 0.3 ? Math.round(orderGross * 0.05) : 0;
    lines.forEach((l) => { l.disc = (orderDisc * l.gross) / orderGross; l.net = l.gross - l.disc; });
    LINES.push(...lines);
  }
  if (rnd() < 0.35) EXPENSES.push({ date, amount: 200 + Math.floor(rnd() * 900) });
}

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------
const rupee = (n) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
const uniq = (arr) => [...new Set(arr)];
const $ = (id) => document.getElementById(id);

function groupBy(arr, keyFn) {
  const m = new Map();
  arr.forEach((x) => { const k = keyFn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); });
  return [...m.entries()];
}

// Fill filter dropdowns from the data
function fillSelect(id, allLabel, values) {
  $(id).innerHTML = `<option value="">${allLabel}</option>` + values.map((v) => `<option>${v}</option>`).join("");
}
fillSelect("fEmp", "All Employees", EMPLOYEES);
fillSelect("fCat", "All Categories", uniq(CATALOG.map((c) => c[1])));
fillSelect("fPay", "All Payments", PAYMENTS);

function filteredLines() {
  const from = $("fFrom").value, to = $("fTo").value;
  const emp = $("fEmp").value, cat = $("fCat").value, pay = $("fPay").value;
  const q = $("fSearch").value.trim().toLowerCase();
  return LINES.filter((l) =>
    (!from || l.date >= from) && (!to || l.date <= to) &&
    (!emp || l.emp === emp) && (!cat || l.cat === cat) && (!pay || l.pay === pay) &&
    (!q || l.name.toLowerCase().includes(q))
  );
}

function filteredExpenses() {
  const from = $("fFrom").value, to = $("fTo").value;
  return EXPENSES.filter((e) => (!from || e.date >= from) && (!to || e.date <= to));
}

// ---------------------------------------------------------------
// Views: each returns { stats, chart, head, rows, num }
// ---------------------------------------------------------------
const VIEWS = {
  employee(lines) {
    const groups = groupBy(lines, (l) => l.emp)
      .map(([emp, ls]) => ({
        emp, orders: uniq(ls.map((l) => l.orderId)).length, items: sum(ls, (l) => l.qty),
        rev: sum(ls, (l) => l.net), disc: sum(ls, (l) => l.disc),
      }))
      .sort((a, b) => b.rev - a.rev);
    const orders = uniq(lines.map((l) => l.orderId)).length;
    const rev = sum(lines, (l) => l.net);
    return {
      stats: [
        ["Total Employees", groups.length],
        ["Total Revenue", rupee(rev), true],
        ["Total Orders", orders],
        ["Avg Order Value", rupee(orders ? rev / orders : 0)],
      ],
      chartTitle: "Revenue by Employee",
      chart: { type: "h", items: groups.map((g) => ({ label: g.emp, value: g.rev })), fmt: rupee },
      head: ["#", "Employee", "Orders", "Items Sold", "Revenue", "Discount", "Avg Order"],
      rows: groups.map((g, i) => [i + 1, g.emp, g.orders, g.items, rupee(g.rev), rupee(g.disc), rupee(g.rev / g.orders)]),
      num: [2, 3, 4, 5, 6],
    };
  },

  product(lines) {
    const groups = groupBy(lines, (l) => l.name)
      .map(([name, ls]) => ({
        name, cat: ls[0].cat, units: sum(ls, (l) => l.qty), rev: sum(ls, (l) => l.net), disc: sum(ls, (l) => l.disc),
      }))
      .sort((a, b) => b.rev - a.rev);
    return {
      stats: [
        ["Products Sold", groups.length],
        ["Units Sold", sum(groups, (g) => g.units)],
        ["Total Revenue", rupee(sum(groups, (g) => g.rev)), true],
        ["Top Product", groups[0] ? groups[0].name : "—"],
      ],
      chartTitle: "Revenue by Product",
      chart: { type: "h", items: groups.slice(0, 8).map((g) => ({ label: g.name, value: g.rev })), fmt: rupee },
      head: ["#", "Product", "Category", "Units", "Revenue", "Discount"],
      rows: groups.map((g, i) => [i + 1, g.name, g.cat, g.units, rupee(g.rev), rupee(g.disc)]),
      num: [3, 4, 5],
    };
  },

  pnl(lines) {
    const rev = sum(lines, (l) => l.net);
    const cogs = sum(lines, (l) => l.cost);
    const exp = sum(filteredExpenses(), (e) => e.amount);
    const gross = rev - cogs;
    const net = gross - exp;
    const cats = groupBy(lines, (l) => l.cat)
      .map(([cat, ls]) => {
        const r = sum(ls, (l) => l.net), c = sum(ls, (l) => l.cost);
        return { cat, rev: r, cost: c, profit: r - c };
      })
      .sort((a, b) => b.profit - a.profit);
    const rows = cats.map((c) => [c.cat, rupee(c.rev), rupee(c.cost), rupee(c.profit), `${c.rev ? ((c.profit / c.rev) * 100).toFixed(1) : "0.0"}%`]);
    if (cats.length) rows.push(["Total", rupee(rev), rupee(cogs), rupee(gross), `${rev ? ((gross / rev) * 100).toFixed(1) : "0.0"}%`]);
    return {
      stats: [
        ["Revenue", rupee(rev), true],
        ["Gross Profit", rupee(gross)],
        ["Expenses", rupee(exp)],
        ["Net Profit", rupee(net), net >= 0],
      ],
      chartTitle: "Gross Profit by Category",
      chart: { type: "h", items: cats.map((c) => ({ label: c.cat, value: c.profit })), fmt: rupee },
      head: ["Category", "Revenue", "Cost of Goods", "Gross Profit", "Margin"],
      rows, num: [1, 2, 3, 4], totalRow: cats.length > 0,
    };
  },

  forecast(lines) {
    // Daily revenue for the last 14 days of the filtered range
    const byDay = new Map();
    lines.forEach((l) => byDay.set(l.date, (byDay.get(l.date) || 0) + l.net));
    const days = [];
    for (let back = 13; back >= 0; back -= 1) {
      const d = new Date(today.getTime() - back * 86400000);
      days.push({ d, v: byDay.get(keyOf(d)) || 0 });
    }
    const n = days.length;
    const xs = days.map((_, i) => i), ys = days.map((x) => x.v);
    const mx = sum(xs, (x) => x) / n, my = sum(ys, (y) => y) / n;
    const denom = sum(xs, (x) => (x - mx) ** 2) || 1;
    const slope = sum(xs, (x, i) => (x - mx) * (ys[i] - my)) / denom;
    const icpt = my - slope * mx;

    const future = [];
    for (let k = 1; k <= 7; k += 1) {
      const d = new Date(today.getTime() + k * 86400000);
      future.push({ d, v: Math.max(0, icpt + slope * (n - 1 + k)), fc: true });
    }
    const last7 = sum(days.slice(-7), (x) => x.v);
    const next7 = sum(future, (x) => x.v);
    const change = last7 ? ((next7 - last7) / last7) * 100 : 0;

    // Expected demand per product = average units/day over the window × 7
    const windowStart = keyOf(days[0].d);
    const demand = groupBy(lines.filter((l) => l.date >= windowStart), (l) => l.name)
      .map(([name, ls]) => ({ name, perDay: sum(ls, (l) => l.qty) / n }))
      .sort((a, b) => b.perDay - a.perDay)
      .slice(0, 6);

    return {
      stats: [
        ["Last 7 Days", rupee(last7)],
        ["Next 7 Days (forecast)", rupee(next7), true],
        ["Expected Change", `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`],
        ["Avg Daily Revenue", rupee(my)],
      ],
      chartTitle: "Daily Revenue — last 14 days and next 7 days",
      chart: {
        type: "v",
        items: [...days, ...future].map((x) => ({
          label: `${pad(x.d.getDate())}/${pad(x.d.getMonth() + 1)}`, value: x.v, fc: Boolean(x.fc),
        })),
        fmt: rupee,
      },
      note: "This is a simple trend projection (straight-line fit on the last 14 days of sales), not a machine-learning model.",
      head: ["#", "Product", "Avg Units / Day", "Expected Units (7 days)"],
      rows: demand.map((p, i) => [i + 1, p.name, p.perDay.toFixed(1), Math.ceil(p.perDay * 7)]),
      num: [2, 3],
    };
  },
};

// ---------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------
let activeTab = "employee";
let current = null;

function renderChart(v, hasData) {
  $("chartTitle").textContent = v.chartTitle;
  const body = $("chartBody");
  if (!hasData || !v.chart.items.length) {
    body.innerHTML = `<div class="rp-empty">No data for selected filters</div>`;
    return;
  }
  const max = Math.max(...v.chart.items.map((i) => Math.abs(i.value)), 1);
  if (v.chart.type === "h") {
    body.innerHTML = `<div class="hb">${v.chart.items
      .map((i) => `<div class="hb__row"><span class="hb__lbl" title="${i.label}">${i.label}</span>
        <span class="hb__track"><i style="width:${(Math.max(i.value, 0) / max) * 100}%"></i></span>
        <span class="hb__val">${v.chart.fmt(i.value)}</span></div>`)
      .join("")}</div>`;
  } else {
    body.innerHTML = `<div class="vb">${v.chart.items
      .map((i) => `<div class="vb__col" title="${i.label}: ${v.chart.fmt(i.value)}">
        <div class="vb__bar ${i.fc ? "is-fc" : ""}" style="height:${(i.value / max) * 100}%"></div>
        <span class="vb__lbl">${i.label}</span></div>`)
      .join("")}</div>
      <div class="rp-legend"><span><i></i>Actual</span><span><i class="fc"></i>Forecast</span></div>
      <p class="rp-note">${v.note}</p>`;
  }
}

function render() {
  const lines = filteredLines();
  const v = VIEWS[activeTab](lines);
  current = v;
  const hasData = lines.length > 0;

  $("stats").innerHTML = v.stats
    .map(([label, value, accent]) => `<div class="stat"><p class="stat__label">${label}</p>
      <p class="stat__value" ${accent === true ? 'style="color:#0e6b4b"' : ""}>${value}</p></div>`)
    .join("");

  renderChart(v, hasData);

  $("tHead").innerHTML = `<tr>${v.head.map((h, i) => `<th class="${v.num.includes(i) ? "num" : ""}">${h}</th>`).join("")}</tr>`;
  $("tBody").innerHTML = hasData
    ? v.rows
        .map((r, ri) => `<tr class="${v.totalRow && ri === v.rows.length - 1 ? "total" : ""}">${r
          .map((c, i) => `<td class="${v.num.includes(i) ? "num" : ""}">${c}</td>`).join("")}</tr>`)
        .join("")
    : "";
  $("tEmpty").hidden = hasData;
}

// Tabs
document.querySelectorAll(".rp-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".rp-tab").forEach((b) => b.classList.toggle("is-active", b === btn));
    activeTab = btn.dataset.tab;
    render();
  });
});

// Filters
["fFrom", "fTo", "fEmp", "fCat", "fPay"].forEach((id) => $(id).addEventListener("change", render));
$("fSearch").addEventListener("input", render);

// Export the table currently on screen
$("exportCsv").addEventListener("click", () => {
  if (!current || !current.rows.length) return;
  const rows = [current.head, ...current.rows];
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `report-${activeTab}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
});

render();
