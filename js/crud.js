// =============================================================
// MediFlow — generic list page: add / edit / delete / search / filter
// Needs store.js + common.js loaded first.
// =============================================================
function initCrud(cfg) {
  let rows = MF.load(cfg.key);
  let editId = null;

  $("formFields").innerHTML = cfg.fields
    .map((f) => {
      const input =
        f.type === "select"
          ? `<select id="f_${f.id}">${f.options.map((o) => `<option>${o}</option>`).join("")}</select>`
          : `<input id="f_${f.id}" type="${f.type || "text"}" ${f.type === "number" ? 'min="0" step="any"' : ""} placeholder="${f.placeholder || ""}" />`;
      return `<div class="field2"><label for="f_${f.id}">${f.label}${f.required ? " *" : ""}</label>${input}</div>`;
    })
    .join("");

  if (cfg.filter) {
    $("filter").innerHTML = `<option value="">${cfg.filter.label}</option>` + cfg.filter.options.map((o) => `<option>${o}</option>`).join("");
  } else {
    $("filter").remove();
  }

  function resetForm() {
    cfg.fields.forEach((f) => {
      const el = $("f_" + f.id);
      const d = typeof f.default === "function" ? f.default() : f.default;
      el.value = d !== undefined ? d : f.type === "select" ? f.options[0] : "";
    });
    editId = null;
    $("formTitle").textContent = "Add " + cfg.item;
    $("formErr").textContent = "";
  }

  function openForm() { $("formPanel").hidden = false; }
  function closeForm() { $("formPanel").hidden = true; resetForm(); }

  $("addBtn").addEventListener("click", () => { resetForm(); openForm(); $(`f_${cfg.fields[0].id}`).focus(); });
  $("cancelBtn").addEventListener("click", closeForm);

  $("saveBtn").addEventListener("click", () => {
    const row = {};
    for (const f of cfg.fields) {
      const raw = $("f_" + f.id).value.trim();
      if (f.required && !raw) { $("formErr").textContent = `${f.label} is required.`; return; }
      row[f.id] = f.type === "number" ? parseFloat(raw) || 0 : f.type === "select" && /^\d+$/.test(raw) ? Number(raw) : raw;
    }
    if (editId) rows = rows.map((r) => (r.id === editId ? { ...r, ...row } : r));
    else rows.unshift({ id: Date.now(), ...row });
    MF.set(cfg.key, rows);
    closeForm();
    render();
  });

  $("tbody").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const id = Number(btn.dataset.id);
    if (btn.dataset.act === "del") {
      if (!confirm("Delete this entry?")) return;
      rows = rows.filter((r) => r.id !== id);
      MF.set(cfg.key, rows);
      render();
    } else {
      const r = rows.find((x) => x.id === id);
      cfg.fields.forEach((f) => ($("f_" + f.id).value = r[f.id]));
      editId = id;
      $("formTitle").textContent = "Edit " + cfg.item;
      openForm();
    }
  });

  $("thead").innerHTML = `<tr>${cfg.columns.map((c) => `<th class="${c.num ? "num" : ""}">${c.label}</th>`).join("")}<th></th></tr>`;

  function render() {
    const q = $("search").value.trim().toLowerCase();
    const fv = cfg.filter ? $("filter").value : "";
    const list = rows.filter((r) => (!q || cfg.search(r).toLowerCase().includes(q)) && (!fv || String(cfg.filter.get(r)) === fv));

    $("tbody").innerHTML = list
      .map(
        (r) => `<tr>${cfg.columns.map((c) => `<td class="${c.num ? "num" : ""} ${c.cls || ""}">${c.html(r)}</td>`).join("")}
        <td><div class="rowbtns"><button type="button" class="linkbtn" data-act="edit" data-id="${r.id}">Edit</button>
        <button type="button" class="linkbtn linkbtn--red" data-act="del" data-id="${r.id}">Delete</button></div></td></tr>`
      )
      .join("");
    $("empty").hidden = list.length > 0;

    $("stats").innerHTML = cfg
      .stats(rows)
      .map(([label, value, mod]) => `<div class="stat ${mod === "due" ? "stat--due" : ""}"><p class="stat__label">${label}</p><p class="stat__value">${value}</p></div>`)
      .join("");
  }

  $("search").addEventListener("input", render);
  if (cfg.filter) $("filter").addEventListener("change", render);
  resetForm();
  render();
}
