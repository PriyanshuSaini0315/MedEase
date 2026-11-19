const TYPES = ["Customer", "Supplier"];

initCrud({
  key: "mf_parties", item: "Party", empty: "No parties yet.",
  search: (r) => `${r.name} ${r.phone} ${r.gstin} ${r.city}`,
  filter: { label: "All types", options: TYPES, get: (r) => r.type },
  fields: [
    { id: "name", label: "Party name", required: true },
    { id: "type", label: "Type", type: "select", options: TYPES },
    { id: "phone", label: "Phone" },
    { id: "gstin", label: "GSTIN" },
    { id: "city", label: "City" },
    { id: "outstanding", label: "Outstanding (₹)", type: "number", default: 0 },
  ],
  columns: [
    { label: "Name", html: (r) => esc(r.name), cls: "party" },
    { label: "Type", html: (r) => pill(r.type === "Customer" ? "paid" : "due", r.type) },
    { label: "Phone", html: (r) => esc(r.phone) || "—" },
    { label: "GSTIN", html: (r) => esc(r.gstin) || "—", cls: "muted" },
    { label: "City", html: (r) => esc(r.city) || "—" },
    { label: "Outstanding", num: true, html: (r) => rupee(r.outstanding) },
  ],
  stats: (rows) => [
    ["Total parties", rows.length],
    ["Customers", rows.filter((r) => r.type === "Customer").length],
    ["Suppliers", rows.filter((r) => r.type === "Supplier").length],
    ["Total outstanding", rupee(rows.reduce((s, r) => s + r.outstanding, 0)), "due"],
  ],
});
