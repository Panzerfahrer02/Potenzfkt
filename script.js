// ===================== Helpers =====================
function parseNum(raw) {
  if (raw == null) return NaN;
  const s = String(raw).trim().replace(",", ".");
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

function eq(a, b, eps = 1e-9) {
  return Math.abs(a - b) <= eps;
}

function fmt(n) {
  // hübsch: ganze Zahlen ohne .0, sonst bis 4 Nachkommastellen
  if (!Number.isFinite(n)) return "";
  const rounded = Math.round(n * 10000) / 10000;
  if (eq(rounded, Math.round(rounded))) return String(Math.round(rounded));
  return String(rounded).replace(".", ",");
}

function setFb(id, cls, msg) {
  const el = document.getElementById(id);
  el.className = "feedback " + (cls || "");
  el.textContent = msg;
}

function makeInput(value = "", placeholder = "") {
  const i = document.createElement("input");
  i.type = "text";
  i.value = value;
  i.placeholder = placeholder;
  return i;
}

// ===================== Aufgabe 1: Tabelle =====================
// bewusst andere x-Werte als im Foto
const A1_XS = [-3.5, -2, -1.25, -0.5, 0, 0.75, 1.5, 2.25, 3];

function buildA1Table() {
  const tbody = document.querySelector("#tbl-a1 tbody");
  tbody.innerHTML = "";

  A1_XS.forEach((x) => {
    const tr = document.createElement("tr");

    const tdX = document.createElement("td");
    tdX.textContent = fmt(x);

    const tdY1 = document.createElement("td");
    const tdY2 = document.createElement("td");
    const tdY3 = document.createElement("td");

    const in1 = makeInput("", "y");
    const in2 = makeInput("", "y");
    const in3 = makeInput("", "y");

    in1.dataset.role = "y1";
    in2.dataset.role = "y2";
    in3.dataset.role = "y3";
    tr.dataset.x = String(x);

    tdY1.appendChild(in1);
    tdY2.appendChild(in2);
    tdY3.appendChild(in3);

    tr.appendChild(tdX);
    tr.appendChild(tdY1);
    tr.appendChild(tdY2);
    tr.appendChild(tdY3);
    tbody.appendChild(tr);
  });
}

function checkA1(showSolutions = false) {
  const rows = [...document.querySelectorAll("#tbl-a1 tbody tr")];
  let total = 0, ok = 0, empty = 0;

  rows.forEach((tr) => {
    const x = Number(tr.dataset.x);
    const y1 = x;
    const y2 = x * x;
    const y3 = x * x * x;

    const in1 = tr.querySelector('input[data-role="y1"]');
    const in2 = tr.querySelector('input[data-role="y2"]');
    const in3 = tr.querySelector('input[data-role="y3"]');

    const v1 = parseNum(in1.value);
    const v2 = parseNum(in2.value);
    const v3 = parseNum(in3.value);

    // zählen
    [v1, v2, v3].forEach((v) => {
      total++;
      if (!Number.isFinite(v)) empty++;
    });

    const r1 = Number.isFinite(v1) && eq(v1, y1);
    const r2 = Number.isFinite(v2) && eq(v2, y2);
    const r3 = Number.isFinite(v3) && eq(v3, y3);

    if (r1) ok++;
    if (r2) ok++;
    if (r3) ok++;

    if (showSolutions) {
      in1.value = fmt(y1);
      in2.value = fmt(y2);
      in3.value = fmt(y3);
    }
  });

  if (showSolutions) {
    setFb("fb-a1", "warn", "Lösung eingetragen. Jetzt kannst du vergleichen.");
    return;
  }

  if (empty === total) {
    setFb("fb-a1", "warn", "Noch nichts eingetragen – füll erst ein paar Felder aus 🙂");
    return;
  }

  if (ok === total) {
    setFb("fb-a1", "ok", `Alles korrekt ✅ (${ok}/${total})`);
  } else {
    setFb("fb-a1", "bad", `Noch nicht ganz: ${ok}/${total} richtig. Tipp: Vorzeichen bei x³ beachten!`);
  }
}

function resetA1() {
  const inputs = document.querySelectorAll("#tbl-a1 input");
  inputs.forEach(i => i.value = "");
  setFb("fb-a1", "", "");
}

// ===================== Aufgabe 2: Symmetrie-Tabellen =====================
const A2 = {
  a2a: { // x^3
    rows: [
      { x: 1.2, y: null },
      { x: 2, y: null },
      { x: -1.2, y: null },
      { x: -2, y: null },
    ],
    f: (x) => x * x * x
  },
  a2b: { // x^2
    rows: [
      { x: 0.6, y: null },
      { x: 1.5, y: null },
      { x: -0.6, y: null },
      { x: -1.5, y: null },
    ],
    f: (x) => x * x
  },
  a2c: { // x
    rows: [
      { x: 1.8, y: null },
      { x: -2.4, y: null },
      { x: 0.25, y: null },
      { x: -0.25, y: null },
    ],
    f: (x) => x
  }
};

function buildA2Tables() {
  for (const key of Object.keys(A2)) {
    const tbody = document.querySelector(`#tbl-${key} tbody`);
    tbody.innerHTML = "";
    A2[key].rows.forEach((r, idx) => {
      const tr = document.createElement("tr");
      const tdX = document.createElement("td");
      tdX.textContent = fmt(r.x);

      const tdY = document.createElement("td");
      const input = makeInput("", "…");
      input.dataset.task = key;
      input.dataset.idx = String(idx);
      tdY.appendChild(input);

      tr.appendChild(tdX);
      tr.appendChild(tdY);
      tbody.appendChild(tr);
    });
  }
}

function checkA2(task, showSolutions = false) {
  const conf = A2[task];
  const inputs = [...document.querySelectorAll(`#tbl-${task} input`)];
  let total = inputs.length, ok = 0, empty = 0;

  inputs.forEach((inp) => {
    const idx = Number(inp.dataset.idx);
    const x = conf.rows[idx].x;
    const y = conf.f(x);

    const v = parseNum(inp.value);
    if (!Number.isFinite(v)) empty++;
    else if (eq(v, y)) ok++;

    if (showSolutions) inp.value = fmt(y);
  });

  if (showSolutions) {
    setFb(`fb-${task}`, "warn", "Lösung eingetragen (ideal zum Vergleichen).");
    return;
  }

  if (empty === total) {
    setFb(`fb-${task}`, "warn", "Trag erst etwas ein 🙂 (Symmetrie hilft!)");
    return;
  }

  if (ok === total) setFb(`fb-${task}`, "ok", `Korrekt ✅ (${ok}/${total})`);
  else setFb(`fb-${task}`, "bad", `Teilweise: ${ok}/${total} richtig.`);
}

// ===================== Aufgabe 3: Fehlende Koordinaten =====================
const A3 = {
  a3a: { // y=x
    items: [
      { label: "P₁ ( -3 | y )", ask: "y", x: -3, y: null, f: (x) => x },
      { label: "P₂ ( x | 1,75 )", ask: "x", x: null, y: 1.75, finv: (y) => y },
      { label: "P₃ ( 2,4 | y )", ask: "y", x: 2.4, y: null, f: (x) => x },
      { label: "P₄ ( x | -0,5 )", ask: "x", x: null, y: -0.5, finv: (y) => y }
    ]
  },
  a3b: { // y=x^2
    items: [
      { label: "P₁ ( -4 | y )", ask: "y", x: -4, y: null, f: (x) => x * x },
      { label: "P₂ ( x | 6,25 )", ask: "x", x: null, y: 6.25, finvChoices: (y) => [Math.sqrt(y), -Math.sqrt(y)] },
      { label: "P₃ ( 1,2 | y )", ask: "y", x: 1.2, y: null, f: (x) => x * x },
      { label: "P₄ ( x | 9 )", ask: "x", x: null, y: 9, finvChoices: (y) => [3, -3] }
    ]
  },
  a3c: { // y=x^3
    items: [
      { label: "P₁ ( -2 | y )", ask: "y", x: -2, y: null, f: (x) => x * x * x },
      { label: "P₂ ( x | 27 )", ask: "x", x: null, y: 27, finv: (y) => Math.cbrt(y) },
      { label: "P₃ ( 1,5 | y )", ask: "y", x: 1.5, y: null, f: (x) => x * x * x },
      { label: "P₄ ( x | -0,125 )", ask: "x", x: null, y: -0.125, finv: (y) => Math.cbrt(y) }
    ]
  }
};

function buildA3() {
  for (const key of Object.keys(A3)) {
    const host = document.getElementById(`q-${key}`);
    host.innerHTML = "";
    A3[key].items.forEach((it, idx) => {
      const row = document.createElement("div");
      row.className = "row";
      const left = document.createElement("span");
      left.innerHTML = `<code>${it.label}</code> → ${it.ask} =`;
      const inp = makeInput("", it.ask);
      inp.dataset.task = key;
      inp.dataset.idx = String(idx);
      row.appendChild(left);
      row.appendChild(inp);
      host.appendChild(row);
    });
  }
}

function solutionForA3Item(it) {
  if (it.ask === "y") return it.f(it.x);
  if (it.finv) return it.finv(it.y);
  if (it.finvChoices) return it.finvChoices(it.y); // ±
  return NaN;
}

function checkA3(task, showSolutions = false) {
  const items = A3[task].items;
  const inputs = [...document.querySelectorAll(`#q-${task} input`)];
  let total = inputs.length, ok = 0, empty = 0;

  inputs.forEach((inp) => {
    const idx = Number(inp.dataset.idx);
    const it = items[idx];
    const sol = solutionForA3Item(it);

    if (showSolutions) {
      if (Array.isArray(sol)) inp.value = sol.map(fmt).join(" oder ");
      else inp.value = fmt(sol);
      return;
    }

    const v = parseNum(inp.value);
    if (!Number.isFinite(v)) { empty++; return; }

    if (Array.isArray(sol)) {
      if (sol.some(s => eq(v, s))) ok++;
    } else {
      if (eq(v, sol)) ok++;
    }
  });

  if (showSolutions) {
    setFb(`fb-${task}`, "warn", "Lösung angezeigt/eingetragen.");
    return;
  }

  if (empty === total) {
    setFb(`fb-${task}`, "warn", "Noch nichts eingetragen 🙂");
    return;
  }

  if (ok === total) setFb(`fb-${task}`, "ok", `Alles korrekt ✅ (${ok}/${total})`);
  else setFb(`fb-${task}`, "bad", `Teilweise: ${ok}/${total} richtig. (Bei x² kann es ± geben!)`);
}

// ===================== Aufgabe 4: Punktprobe (Checkboxen) =====================
const A4 = {
  a4a: { // y=x^2
    title: "y = x²",
    points: [
      { x: -7, y: 49 },       // true
      { x: 3.5, y: 12.25 },   // true
      { x: -5, y: -25 },      // false
      { x: 9, y: 80 },        // false
    ],
    f: (x) => x * x
  },
  a4b: { // y=x^3
    title: "y = x³",
    points: [
      { x: -4, y: -64 },        // true
      { x: 1.2, y: 1.728 },     // true
      { x: -2.5, y: 15.625 },   // false
      { x: 6, y: 215 },         // false (6^3=216)
    ],
    f: (x) => x * x * x
  }
};

function buildA4() {
  for (const key of Object.keys(A4)) {
    const host = document.getElementById(`q-${key}`);
    host.innerHTML = "";

    A4[key].points.forEach((p, idx) => {
      const row = document.createElement("div");
      row.className = "row";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = `${key}-${idx}`;
      cb.dataset.task = key;
      cb.dataset.idx = String(idx);

      const label = document.createElement("label");
      label.setAttribute("for", cb.id);
      label.innerHTML = `<code>P${idx + 1} (${fmt(p.x)} | ${fmt(p.y)})</code>`;

      row.appendChild(cb);
      row.appendChild(label);
      host.appendChild(row);
    });
  }
}

function checkA4(task, showSolutions = false) {
  const conf = A4[task];
  const cbs = [...document.querySelectorAll(`#q-${task} input[type="checkbox"]`)];
  let total = cbs.length, ok = 0;

  cbs.forEach((cb) => {
    const idx = Number(cb.dataset.idx);
    const p = conf.points[idx];
    const truth = eq(p.y, conf.f(p.x));

    if (showSolutions) {
      cb.checked = truth;
      return;
    }

    if (cb.checked === truth) ok++;
  });

  if (showSolutions) {
    setFb(`fb-${task}`, "warn", "Lösung angekreuzt. Jetzt vergleichen.");
    return;
  }

  if (ok === total) setFb(`fb-${task}`, "ok", `Perfekt ✅ (${ok}/${total})`);
  else setFb(`fb-${task}`, "bad", `Noch nicht: ${ok}/${total} richtig. Rechne y=f(x) nach.`);
}

// ===================== Plot (Canvas) =====================
function drawPlot() {
  const canvas = document.getElementById("plot");
  const ctx = canvas.getContext("2d");

  const W = canvas.width, H = canvas.height;

  // Koordinatenbereich
  const xmin = -4, xmax = 4;
  const ymin = -6, ymax = 10;

  function X(x){ return (x - xmin) / (xmax - xmin) * W; }
  function Y(y){ return H - (y - ymin) / (ymax - ymin) * H; }

  // clear
  ctx.clearRect(0,0,W,H);

  // grid
  ctx.globalAlpha = 1;
  ctx.lineWidth = 1;

  for (let gx = Math.ceil(xmin); gx <= Math.floor(xmax); gx++) {
    ctx.beginPath();
    ctx.moveTo(X(gx), 0);
    ctx.lineTo(X(gx), H);
    ctx.stroke();
  }
  for (let gy = Math.ceil(ymin); gy <= Math.floor(ymax); gy++) {
    ctx.beginPath();
    ctx.moveTo(0, Y(gy));
    ctx.lineTo(W, Y(gy));
    ctx.stroke();
  }

  // axes (dicker)
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(X(0), 0);
  ctx.lineTo(X(0), H);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(0, Y(0));
  ctx.lineTo(W, Y(0));
  ctx.stroke();

  // functions
  function plotFunc(f) {
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let x = xmin; x <= xmax; x += 0.02) {
      const y = f(x);
      if (y < ymin - 1 || y > ymax + 1) continue;
      const px = X(x), py = Y(y);
      if (first) { ctx.moveTo(px, py); first = false; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // y=x, y=x^2, y=x^3
  plotFunc((x) => x);
  plotFunc((x) => x * x);
  plotFunc((x) => x * x * x);

  // mark some points for orientation
  const points = [
    {x:-2, y:-2},
    {x:2, y:2},
    {x:-2, y:4},
    {x:2, y:4},
    {x:-1, y:-1},
    {x:1, y:1},
    {x:-1, y:-1},
    {x:1, y:1},
  ];
  ctx.lineWidth = 1;
  points.forEach(p => {
    ctx.beginPath();
    ctx.arc(X(p.x), Y(p.y), 3, 0, Math.PI*2);
    ctx.fill();
  });
}

// ===================== Wire up =====================
function init() {
  buildA1Table();
  buildA2Tables();
  buildA3();
  buildA4();
  drawPlot();

  document.getElementById("check-a1").addEventListener("click", () => checkA1(false));
  document.getElementById("solve-a1").addEventListener("click", () => checkA1(true));
  document.getElementById("reset-a1").addEventListener("click", resetA1);

  document.querySelectorAll("[data-check]").forEach(btn => {
    btn.addEventListener("click", () => {
      const task = btn.dataset.check;
      if (task.startsWith("a2")) checkA2(task, false);
      if (task.startsWith("a3")) checkA3(task, false);
    });
  });
  document.querySelectorAll("[data-solve]").forEach(btn => {
    btn.addEventListener("click", () => {
      const task = btn.dataset.solve;
      if (task.startsWith("a2")) checkA2(task, true);
      if (task.startsWith("a3")) checkA3(task, true);
    });
  });

  document.getElementById("check-a4a").addEventListener("click", () => checkA4("a4a", false));
  document.getElementById("solve-a4a").addEventListener("click", () => checkA4("a4a", true));
  document.getElementById("check-a4b").addEventListener("click", () => checkA4("a4b", false));
  document.getElementById("solve-a4b").addEventListener("click", () => checkA4("a4b", true));
}

document.addEventListener("DOMContentLoaded", init);
