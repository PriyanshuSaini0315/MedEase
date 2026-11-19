// =============================================================
// MediFlow — Token Queue (counter queue: waiting -> serving -> done)
// =============================================================
let tokens = MF.load("mf_tokens");

const TPILL = { waiting: ["due", "Waiting"], serving: ["serving", "Serving"], done: ["paid", "Done"], cancelled: ["overdue", "Cancelled"] };
const tno = (n) => `T-${String(n).padStart(3, "0")}`;
const timeOf = (ms) => new Date(ms).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

function save() { MF.set("mf_tokens", tokens); render(); }

function render() {
  const f = $("filter").value;
  const list = tokens.filter((t) => !f || t.status === f);

  $("tbody").innerHTML = list
    .slice()
    .sort((a, b) => b.no - a.no)
    .map((t) => {
      const [cls, label] = TPILL[t.status];
      let actions = "";
      if (t.status === "waiting") actions = `<button class="linkbtn" data-act="serve" data-id="${t.id}">Call</button><button class="linkbtn linkbtn--red" data-act="cancel" data-id="${t.id}">Cancel</button>`;
      if (t.status === "serving") actions = `<button class="linkbtn" data-act="done" data-id="${t.id}">Mark done</button><button class="linkbtn linkbtn--red" data-act="cancel" data-id="${t.id}">Cancel</button>`;
      return `<tr><td class="invno">${tno(t.no)}</td><td class="party">${esc(t.name)}</td><td class="muted">${esc(t.note) || "—"}</td>
        <td>${timeOf(t.time)}</td><td>${pill(cls, label)}</td><td><div class="rowbtns">${actions}</div></td></tr>`;
    })
    .join("");
  $("empty").hidden = list.length > 0;

  const count = (s) => tokens.filter((t) => t.status === s).length;
  const serving = tokens.find((t) => t.status === "serving");
  $("stats").innerHTML = [
    ["Waiting", count("waiting")],
    ["Now serving", serving ? tno(serving.no) : "—"],
    ["Completed", count("done")],
    ["Cancelled", count("cancelled"), "due"],
  ].map(([l, v, m]) => `<div class="stat ${m === "due" ? "stat--due" : ""}"><p class="stat__label">${l}</p><p class="stat__value">${v}</p></div>`).join("");
}

$("newToken").addEventListener("click", () => {
  const name = $("tName").value.trim() || "Walk-in Customer";
  const next = tokens.reduce((m, t) => Math.max(m, t.no), 0) + 1;
  tokens.push({ id: Date.now(), no: next, name, note: $("tNote").value.trim(), status: "waiting", time: Date.now() });
  $("tName").value = "";
  $("tNote").value = "";
  save();
});

$("tbody").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-act]");
  if (!b) return;
  const t = tokens.find((x) => x.id === Number(b.dataset.id));
  const act = b.dataset.act;
  if (act === "serve") {
    // only one customer is served at a time
    tokens.filter((x) => x.status === "serving").forEach((x) => (x.status = "done"));
    t.status = "serving";
  } else if (act === "done") t.status = "done";
  else if (act === "cancel") t.status = "cancelled";
  save();
});

$("filter").addEventListener("change", render);
$("clearDone").addEventListener("click", () => {
  tokens = tokens.filter((t) => t.status === "waiting" || t.status === "serving");
  save();
});
render();
