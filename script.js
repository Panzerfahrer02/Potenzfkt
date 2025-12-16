// ===================== Zahlen / Runden / Vergleichen =====================
function parseNum(raw) {
  if (raw == null) return NaN;
  const s = String(raw).trim().replace(",", ".");
  if (s === "") return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

// auf 2 Nachkommastellen runden
function round2(n) {
  return Math.round(n * 100) / 100;
}

// Vergleich korrekt bei 2 Nachkommastellen
function equals2(a, b) {
  return Math.abs(round2(a) - round2(b)) < 0.005;
}

// Anzeige: ganze Zahlen ohne ,00, sonst 2 Nachkommastellen
function fmt2(n) {
  if (!Number.isFinite(n)) return "";
  const r = round2(n);
  if (Number.isInteger(r)) return String(r);
  return r.toFixed(2).replace(".", ",");
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

// ===================== Aufgabe 1 =====================
const A1_XS = [-3.5, -2, -1.25, -0.5, 0, 0.75, 1.5, 2.25, 3];

function buildA1Table() {
  const tbody = document.querySelector("#tbl-a1 tbody");
  tbody.innerHTML = "";

  A1_XS.forEach((x) => {
    const tr = document.createElement("tr");

    const tdX = document.createElement("td");
    tdX.textContent = fmt2(x);

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

    total += 3;
    if (!Number.isFinite(v1)) empty++;
    if (!Number.isFinite(v2)) empty++;
    if (!Number.isFinite(v3)) empty++;

    if (showSolutions) {
      in1.value = fmt2(y1);
      in2.value = fmt2(y2);
      in3.value = fmt2(y3);
      return;
    }

    if (Number.isFinite(v1) && equals2(v1, y1)) ok++;
    if (Number.isFinite(v2) && equals2(v2, y2)) ok++;
    if (Number.isFinite(v3) && equals2(v3, y3)) ok++;
  });

  if (showSolutions) {
    setFb("fb-a1", "warn", "Lösung eingetragen. (Gerundet auf 2 Nachkommastellen)");
    return;
  }
  if (empty === total) {
    setFb("fb-a1", "warn", "Noch nichts eingetragen – füll erst ein paar Felder aus 🙂");
    return;
  }
  if (ok === total) setFb("fb-a1", "ok", `Alles korrekt ✅ (${ok}/${total})`);
  else setFb("fb-a1", "bad", `Noch nicht ganz: ${ok}/${total} richtig. (Es zählt auf 2 Nachkommastellen)`);
}

function resetA1() {
  const inputs = document.querySelectorAll("#tbl-a1 input");
  inputs.forEach(i => i.value = "");
  setFb("fb-a1", "", "");
}

// ===================== Aufgabe 2 (NEU: zufällig + 2 Vorgaben pro Tabelle) =====================
// Pool an "schönen" Beträgen (damit nicht super hässliche Zahlen entstehen)
const MAG_POOL = [0.4, 0.5, 0.6, 0.8, 1.2, 1.5, 2.0, 2.5];

function sampleTwoDistinct(arr) {
  const a = arr[Math.floor(Math.random() * arr.length)];
  let b = a;
  while (b === a) b = arr[Math.floor(Math.random() * arr.length)];
  return [a, b];
}

function randomSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

// Baut 4 Zeilen: ±a und ±b.
// Für jeden Betrag (a und b) wird GENAU EIN Wert vorgegeben (disabled).
function makeSymmetryRowsFor(f) {
  const [a, b] = sampleTwoDistinct(MAG_POOL);
  const mags = [a, b];

  const rows = [];
  mags.forEach(mag => {
    const sGiven = randomSign();        // z.B. +mag wird vorgegeben
    const sOther = -sGiven;

    const xGiven = sGiven * mag;
    const xOther = sOther * mag;

    rows.push({ x: xGiven, y: round2(f(xGiven)), given: true });
    rows.push({ x: xOther, y: null, given: false });
  });

  // mischen, damit es nicht immer "given, leer, given, leer" ist
  for (let i = rows.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rows[i], rows[j]] = [rows[j], rows[i]];
  }
  return rows;
}

const A2 = {
  a2a: { f: (x) => x * x * x, rows: [] }, // x^3
  a2b: { f: (x) => x * x, rows: [] },     // x^2
  a2c: { f: (x) => x, rows: [] },         // x
};

function rebuildA2Task(task) {
  const conf = A2[task];
  conf.rows = makeSymmetryRowsFor(conf.f);
  renderA2Task(task);
  setFb(`fb-${task}`, "", "");
}

function renderA2Task(task) {
  const conf = A2[task];
  const tbody = document.querySelector(`#tbl-${task} tbody`);
  tbody.innerHTML = "";

  conf.rows.forEach((r, idx) => {
    const tr = document.createElement("tr");

    const tdX = document.createElement("td");
    tdX.textContent = fmt2(r.x);

    const tdY = document.createElement("td");
    const input = makeInput("", "…");
    input.dataset.task = task;
    input.dataset.idx = String(idx);

    if (r.given) {
      input.value = fmt2(r.y);
      input.disabled = true;
      input.classList.add("given");
    }

    tdY.appendChild(input);
    tr.appendChild(tdX);
    tr.appendChild(tdY);
    tbody.appendChild(tr);
  });
}

function checkA2(task, showSolutions = false) {
  const conf = A2[task];
  const inputs = [...document.querySelectorAll(`#tbl-${task} input`)];
  let total = inputs.length, ok = 0, empty = 0;

  inputs.forEach((inp) => {
    const idx = Number(inp.dataset.idx);
    const row = conf.rows[idx];
    const x = row.x;
    const sol = conf.f(x);

    // vorgegeben zählt immer als richtig
    if (row.given) {
      ok++;
      if (showSolutions) inp.value = fmt2(sol);
      return;
    }

    const v = parseNum(inp.value);
    if (!Number.isFinite(v)) {
      empty++;
      if (showSolutions) inp.value = fmt2(sol);
      return;
    }

    if (equals2(v, sol)) ok++;

    if (showSolutions) inp.value = fmt2(sol);
  });

  if (showSolutions) {
    setFb(`fb-${task}`, "warn", "Lösung eingetragen (auf 2 Nachkommastellen gerundet).");
    return;
  }

  if (empty === total - conf.rows.filter(r=>r.given).length) {
    // alle "nicht-given" leer
    setFb(`fb-${task}`, "warn", "Trag erst etwas ein 🙂 (Symmetrie hilft!)");
    return;
  }

  if (ok === total) setFb(`fb-${task}`, "ok", `Korrekt ✅ (${ok}/${total})`);
  else setFb(`fb-${task}`, "bad", `Teilweise: ${ok}/${total} richtig.`);
}

// ===================== Plot (farbig) =====================
function drawPlot() {
  const canvas = document.getElementById("plot");
  const ctx = canvas.getContext("2d");

  const W = canvas.width, H = canvas.height;

  // Bereich so wählen, dass man x^3 noch gut sieht
  const xmin = -4, xmax = 4;
  const ymin = -10, ymax = 10;

  function X(x){ return (x - xmin) / (xmax - xmin) * W; }
  function Y(y){ return H - (y - ymin) / (ymax - ymin) * H; }

  ctx.clearRect(0,0,W,H);

  // grid
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255,255,255,.08)";
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

  // axes
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.beginPath(); ctx.moveTo(X(0), 0); ctx.lineTo(X(0), H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(W, Y(0)); ctx.stroke();

  function plotFunc(f, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    let first = true;

    for (let x = xmin; x <= xmax; x += 0.02) {
      const y = f(x);
      if (!Number.isFinite(y)) continue;
      if (y < ymin - 1 || y > ymax + 1) continue;

      const px = X(x), py = Y(y);
      if (first) { ctx.moveTo(px, py); first = false; }
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
  }

  // farbig
  plotFunc(x => x, "#4da3ff");           // y = x (blau)
  plotFunc(x => x * x, "#ff9f43");       // y = x² (orange)
  plotFunc(x => x * x * x, "#2ecc71");   // y = x³ (grün)
}

// ===================== Wire up =====================
function init() {
  // Aufgabe 1
  buildA1Table();
  drawPlot();

  document.getElementById("check-a1").addEventListener("click", () => checkA1(false));
  document.getElementById("solve-a1").addEventListener("click", () => checkA1(true));
  document.getElementById("reset-a1").addEventListener("click", resetA1);

  // Aufgabe 2: initial zufällige Datensätze
  rebuildA2Task("a2a");
  rebuildA2Task("a2b");
  rebuildA2Task("a2c");

  // Buttons Prüfen/Lösung
  document.querySelectorAll("[data-check]").forEach(btn => {
    btn.addEventListener("click", () => {
      const task = btn.dataset.check;
      checkA2(task, false);
    });
  });

  document.querySelectorAll("[data-solve]").forEach(btn => {
    btn.addEventListener("click", () => {
      const task = btn.dataset.solve;
      checkA2(task, true);
    });
  });

  // Buttons Neue Werte
  document.querySelectorAll("[data-reroll]").forEach(btn => {
    btn.addEventListener("click", () => {
      const task = btn.dataset.reroll;
      rebuildA2Task(task);
    });
  });
}

document.addEventListener("DOMContentLoaded", init);
