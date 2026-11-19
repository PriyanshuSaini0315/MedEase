// =============================================================
// MediFlow — Settings (shop profile + sample-data reset)
// =============================================================
const saved = MF.load("mf_settings");
const FIELDS = ["shopName", "gstin", "phone", "address", "prefix", "defaultGst"];

FIELDS.forEach((f) => { $("s_" + f).value = saved[f] || ""; });
if (!$("s_shopName").value) $("s_shopName").value = shop;
$("s_email").value = email;

$("saveSettings").addEventListener("click", () => {
  const data = {};
  FIELDS.forEach((f) => (data[f] = $("s_" + f).value.trim()));
  if (!data.shopName) { $("setErr").textContent = "Shop name is required."; return; }
  MF.set("mf_settings", data);
  try { sessionStorage.removeItem("mf_user"); } catch (e) {}
  // reload with the new shop name so every page header picks it up
  const qs = new URLSearchParams({ email, shop: data.shopName });
  window.location.href = `settings.html?${qs.toString()}`;
});

$("resetData").addEventListener("click", () => {
  if (!confirm("Reset products, parties, purchases and tokens back to the sample data?")) return;
  MF.KEYS.filter((k) => k !== "mf_settings").forEach((k) => localStorage.removeItem(k));
  alert("Sample data restored.");
  window.location.reload();
});
