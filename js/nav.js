// Keeps the signed-in email/shop while moving between workspace pages.
(function () {
  const p = new URLSearchParams(location.search);
  let email = p.get("email"), shop = p.get("shop");
  try {
    if (email || shop) sessionStorage.setItem("mf_user", JSON.stringify({ email, shop }));
    else {
      const s = JSON.parse(sessionStorage.getItem("mf_user") || "null");
      if (s) { email = s.email; shop = s.shop; }
    }
  } catch (e) {}
  if (!email && !shop) return;
  const qs = new URLSearchParams();
  if (email) qs.set("email", email);
  if (shop) qs.set("shop", shop);
  document.querySelectorAll(".side__link[href*='.html']").forEach((a) => {
    a.href = a.getAttribute("href").split("?")[0] + "?" + qs.toString();
  });
})();
