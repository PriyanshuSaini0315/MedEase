// =============================================================
// MediFlow — tiny browser "database" (localStorage) + sample seeds
// =============================================================
const MF = {
  get(key, seed) {
    try {
      const v = localStorage.getItem(key);
      if (v) return JSON.parse(v);
    } catch (e) {}
    const s = typeof seed === "function" ? seed() : seed;
    MF.set(key, s);
    return s;
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  },
  load(key) { return MF.get(key, MF.SEEDS[key]); },
  today() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  },
  KEYS: ["mf_products", "mf_parties", "mf_purchases", "mf_tokens", "mf_settings"],
};

MF.SEEDS = {
  mf_products: () => [
    { id: 1, name: "Paracetamol 500mg", category: "Tablets", hsn: "3004", gst: 12, mrp: 32, qty: 240, reorder: 50 },
    { id: 2, name: "Azithromycin 500mg", category: "Tablets", hsn: "3004", gst: 12, mrp: 118.5, qty: 18, reorder: 20 },
    { id: 3, name: "Amoxicillin 500mg", category: "Tablets", hsn: "3004", gst: 12, mrp: 96, qty: 0, reorder: 30 },
    { id: 4, name: "Cetirizine 10mg", category: "Tablets", hsn: "3004", gst: 12, mrp: 24, qty: 75, reorder: 40 },
    { id: 5, name: "Cough Syrup 100ml", category: "Syrups", hsn: "3004", gst: 12, mrp: 112, qty: 34, reorder: 10 },
    { id: 6, name: "Antacid Syrup 200ml", category: "Syrups", hsn: "3004", gst: 12, mrp: 96, qty: 8, reorder: 15 },
    { id: 7, name: "ORS Sachet", category: "Supplements", hsn: "2106", gst: 5, mrp: 22, qty: 90, reorder: 30 },
    { id: 8, name: "Vitamin D3 60K", category: "Supplements", hsn: "2106", gst: 18, mrp: 168, qty: 40, reorder: 15 },
  ],
  mf_parties: () => [
    { id: 1, name: "Ahuja Hospital Pharmacy", type: "Customer", phone: "9812300011", gstin: "06AAAPA1234B1Z5", city: "Panipat", outstanding: 0 },
    { id: 2, name: "Sanoli Road Clinic", type: "Customer", phone: "9896100022", gstin: "", city: "Panipat", outstanding: 1260 },
    { id: 3, name: "Panipat Nursing Home", type: "Customer", phone: "9416200033", gstin: "06AABCP5678C1Z2", city: "Panipat", outstanding: 9875.75 },
    { id: 4, name: "Sector 12 Medical Store", type: "Customer", phone: "9991400044", gstin: "", city: "Panipat", outstanding: 5210 },
    { id: 5, name: "Sun Pharma Distributors", type: "Supplier", phone: "9810500055", gstin: "06AAACS9999D1Z1", city: "Karnal", outstanding: 18400 },
    { id: 6, name: "Cipla Stockist Haryana", type: "Supplier", phone: "9996600066", gstin: "06AAACC7777E1Z3", city: "Ambala", outstanding: 0 },
  ],
  mf_purchases: () => [
    { id: 1, supplier: "Sun Pharma Distributors", billNo: "SP/2026/1182", date: "2026-10-08", amount: 18400, status: "Due" },
    { id: 2, supplier: "Cipla Stockist Haryana", billNo: "CS-7740", date: "2026-10-03", amount: 12650.5, status: "Paid" },
    { id: 3, supplier: "Sun Pharma Distributors", billNo: "SP/2026/1121", date: "2026-09-21", amount: 9420, status: "Overdue" },
    { id: 4, supplier: "Cipla Stockist Haryana", billNo: "CS-7702", date: "2026-09-14", amount: 7310, status: "Paid" },
  ],
  mf_tokens: () => {
    const now = Date.now();
    return [
      { id: 1, no: 1, name: "Walk-in Customer", note: "Fever medicines", status: "done", time: now - 50 * 60000 },
      { id: 2, no: 2, name: "Rakesh Kumar", note: "BP tablets, 1 month", status: "serving", time: now - 12 * 60000 },
      { id: 3, no: 3, name: "Sunita Devi", note: "Cough syrup", status: "waiting", time: now - 6 * 60000 },
    ];
  },
  mf_settings: () => ({ shopName: "", gstin: "06AFTPM4854Q1ZF", phone: "", address: "Sanoli Road, Near Ahuja Hospital, Panipat, Haryana (132103)", prefix: "RX-", defaultGst: "12" }),
};
