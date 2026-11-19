const PSTAT = { Paid: "paid", Due: "due", Overdue: "overdue" };

initCrud({
  key: "mf_purchases", item: "Purchase", empty: "No purchases yet.",
  search: (r) => `${r.supplier} ${r.billNo}`,
  filter: { label: "All statuses", options: ["Paid", "Due", "Overdue"], get: (r) => r.status },
  fields: [
    { id: "supplier", label: "Supplier", required: true },
    { id: "billNo", label: "Bill no.", required: true },
    { id: "date", label: "Date", type: "date", default: () => MF.today() },
    { id: "amount", label: "Amount (₹)", type: "number", required: true },
    { id: "status", label: "Status", type: "select", options: ["Paid", "Due", "Overdue"] },
  ],
  columns: [
    { label: "Bill No", html: (r) => esc(r.billNo), cls: "invno" },
    { label: "Date", html: (r) => fmtDate(r.date) },
    { label: "Supplier", html: (r) => esc(r.supplier), cls: "party" },
    { label: "Amount", num: true, html: (r) => rupee(r.amount) },
    { label: "Status", html: (r) => pill(PSTAT[r.status], r.status) },
  ],
  stats: (rows) => {
    const total = rows.reduce((s, r) => s + r.amount, 0);
    const paid = rows.filter((r) => r.status === "Paid").reduce((s, r) => s + r.amount, 0);
    return [["Purchases", rows.length], ["Total purchased", rupee(total)], ["Paid", rupee(paid)], ["Payable", rupee(total - paid), "due"]];
  },
});
