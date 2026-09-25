// =============================================================
// MediFlow welcome / setup-complete page
// =============================================================

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

const PLAN_LABELS = {
  basic: "Basic",
  professional: "Professional",
  enterprise: "Enterprise",
};

const params = new URLSearchParams(window.location.search);
const name = params.get("name") || "there";
const shop = params.get("shop") || "";
const email = params.get("email") || "";
const plan = params.get("plan") || "";
const isReturning = params.get("returning") === "1";

const firstName = name.split(" ")[0];

const workspaceLink = document.getElementById("openWorkspace");
if (workspaceLink) {
  const qs = new URLSearchParams();
  if (shop) qs.set("shop", shop);
  if (email) qs.set("email", email);
  workspaceLink.href = qs.toString() ? `app.html?${qs.toString()}` : "app.html";
}

const heading = document.getElementById("welcomeHeading");
const body = document.getElementById("welcomeBody");
const eyebrow = document.getElementById("receiptEyebrow");
const stamp = document.getElementById("receiptStamp");
const shopBadge = document.getElementById("shopBadge");
const metaShop = document.getElementById("metaShop");
const metaOwner = document.getElementById("metaOwner");
const metaPlan = document.getElementById("metaPlan");
const metaRow = document.getElementById("receiptMeta");

if (isReturning) {
  eyebrow.textContent = "RX-11 · SIGNED IN";
  stamp.textContent = "WELCOME BACK";
  heading.textContent = `Welcome back, ${firstName}.`;
  body.textContent = "You're signed in. Pick up right where your counter left off.";
  metaRow.hidden = true;
  if (shopBadge) shopBadge.textContent = email;
} else {
  heading.textContent = `Welcome aboard, ${firstName}.`;
  body.textContent = "Your shop's account has been created. Here's what to do first.";
  metaShop.textContent = shop || "—";
  metaOwner.textContent = name;
  metaPlan.textContent = PLAN_LABELS[plan] || "Professional";
  if (shopBadge) shopBadge.textContent = shop ? `${shop} · trial active` : "Trial active";
}
