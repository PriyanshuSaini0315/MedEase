const CATS = ["Tablets", "Syrups", "Injections", "Supplements", "Surgical", "Other"];
const stockPill = (r) => (r.qty === 0 ? pill("overdue", "Out of stock") : r.qty <= r.reorder ? pill("due", "Low stock") : pill("paid", "In stock"));

initCrud({
  key: "mf_products", item: "Product", empty: "No products yet.",
  search: (r) => `${r.name} ${r.category} ${r.hsn}`,
  filter: { label: "All categories", options: CATS, get: (r) => r.category },
  fields: [
    { id: "name", label: "Product name", required: true, placeholder: "e.g. Dolo 650" },
    { id: "category", label: "Category", type: "select", options: CATS },
    { id: "hsn", label: "HSN code", placeholder: "3004" },
    { id: "gst", label: "GST %", type: "select", options: ["5", "12", "18", "28"], default: "12" },
    { id: "mrp", label: "MRP (₹)", type: "number", required: true },
    { id: "qty", label: "Stock qty", type: "number", default: 0 },
    { id: "reorder", label: "Reorder level", type: "number", default: 10 },
  ],
  columns: [
    { label: "Product", html: (r) => esc(r.name), cls: "party" },
    { label: "Category", html: (r) => esc(r.category), cls: "muted" },
    { label: "HSN", html: (r) => esc(r.hsn) },
    { label: "GST", num: true, html: (r) => r.gst + "%" },
    { label: "MRP", num: true, html: (r) => rupee(r.mrp) },
    { label: "Stock", num: true, html: (r) => r.qty },
    { label: "Status", html: stockPill },
  ],
  stats: (rows) => [
    ["Total products", rows.length],
    ["Categories", new Set(rows.map((r) => r.category)).size],
    ["Low stock", rows.filter((r) => r.qty > 0 && r.qty <= r.reorder).length],
    ["Out of stock", rows.filter((r) => r.qty === 0).length, "due"],
  ],
});
