const pastelColors = [
  "#b8c0ff",
  "#caffbf",
  "#ffd6a5",
  "#ffadad",
  "#a0c4ff",
  "#fdffb6",
  "#ffc6ff",
  "#9bf6ff",
  "#d0f4de",
  "#f1c0e8"
];

let bars = [];
let comparisons = 0;
let swaps = 0;
let isSorting = false;

function showPage(id) {
  document.querySelectorAll(".screen").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  if (id === "graphing") drawGraph();

  if (id === "geometry") {
    updateGeometryHelp();
    drawGeometryVisual();
  }

  if (id === "probability") updateProbabilityHelp();
  if (id === "patterns") updatePatternHelp();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getSortDelay() {
  const speed = Number(document.getElementById("sortSpeed").value);
  return [350, 220, 120, 65, 25][speed - 1];
}

function setSortAction(text) {
  const action = document.getElementById("sortAction");
  if (action) action.textContent = text;
}

function changeSortSpeed() {
  const speed = Number(document.getElementById("sortSpeed").value);
  document.getElementById("sortSpeedLabel").textContent =
    ["Very Slow", "Slow", "Medium", "Fast", "Insane"][speed - 1];
}

function changeBarCount() {
  if (isSorting) return;

  document.getElementById("barCountLabel").textContent = document.getElementById("barCount").value;
  makeBars();
}

function makeBars() {
  const amount = Number(document.getElementById("barCount").value);

  bars = Array.from({ length: amount }, () => Math.floor(Math.random() * 360) + 80);
  comparisons = 0;
  swaps = 0;

  updateSortStats();
  setSortAction("Waiting");
  renderBars();
  renderArrayView();
}

function updateSortStats() {
  document.getElementById("comparisons").textContent = comparisons;
  document.getElementById("swaps").textContent = swaps;
}

function renderBars(activeA = -1, activeB = -1) {
  const holder = document.getElementById("bars");
  holder.innerHTML = "";

  bars.forEach((height, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";

    if (index === activeA || index === activeB) {
      bar.classList.add("active");
    }

    bar.style.height = height + "px";
    bar.style.background = pastelColors[index % pastelColors.length];
    bar.draggable = !isSorting;

    bar.addEventListener("dragstart", () => {
      if (isSorting) return;
      bar.dataset.dragging = "true";
    });

    bar.addEventListener("dragend", () => {
      bar.dataset.dragging = "false";
    });

    bar.addEventListener("dragover", event => {
      if (!isSorting) event.preventDefault();
    });

    bar.addEventListener("drop", () => {
      if (isSorting) return;

      const dragged = [...holder.children].find(child => child.dataset.dragging === "true");
      const from = [...holder.children].indexOf(dragged);
      const to = [...holder.children].indexOf(bar);

      if (from < 0 || to < 0) return;

      const moved = bars.splice(from, 1)[0];
      bars.splice(to, 0, moved);

      setSortAction(`Moved index ${from} to index ${to}`);
      renderBars();
      renderArrayView();
    });

    holder.appendChild(bar);
  });
}

function renderArrayView(activeA = -1, activeB = -1, mode = "compare") {
  const arrayView = document.getElementById("arrayView");
  if (!arrayView) return;

  arrayView.innerHTML = "";

  bars.forEach((height, index) => {
    const cell = document.createElement("div");
    cell.className = "array-cell";

    if (index === activeA || index === activeB) {
      cell.classList.add(mode);
    }

    cell.innerHTML = `<small>[${index}]</small>${height}`;
    arrayView.appendChild(cell);
  });
}

function shuffleBars() {
  if (isSorting) return;
  makeBars();
}

function lockSortingControls(locked) {
  isSorting = locked;

  document.getElementById("sortType").disabled = locked;
  document.getElementById("barCount").disabled = locked;
  document.getElementById("sortSpeed").disabled = locked;
}

async function startSort() {
  if (isSorting) return;

  const type = document.getElementById("sortType").value;

  comparisons = 0;
  swaps = 0;
  updateSortStats();
  lockSortingControls(true);
  setSortAction("Starting sort");

  if (type === "bubble") await bubbleSort();
  if (type === "selection") await selectionSort();
  if (type === "insertion") await insertionSort();
  if (type === "quick") await quickSort(0, bars.length - 1);

  renderBars();
  renderArrayView();
  setSortAction("Sorted");
  lockSortingControls(false);
}

async function highlightCompare(i, j, message) {
  comparisons++;
  updateSortStats();
  setSortAction(message || `Comparing index ${i} and index ${j}`);
  renderBars(i, j);
  renderArrayView(i, j, "compare");
  await sleep(getSortDelay());
}

async function doSwap(i, j, message) {
  swaps++;
  updateSortStats();
  setSortAction(message || `Swapping index ${i} and index ${j}`);
  renderBars(i, j);
  renderArrayView(i, j, "swap");
  await sleep(getSortDelay() * 0.8);

  [bars[i], bars[j]] = [bars[j], bars[i]];

  renderBars(i, j);
  renderArrayView(i, j, "swap");
  await sleep(getSortDelay() * 0.8);
}

async function bubbleSort() {
  for (let i = 0; i < bars.length; i++) {
    for (let j = 0; j < bars.length - i - 1; j++) {
      await highlightCompare(j, j + 1, `Bubble Sort: checking if array[${j}] > array[${j + 1}]`);

      if (bars[j] > bars[j + 1]) {
        await doSwap(j, j + 1, `Bubble Sort: swapped array[${j}] and array[${j + 1}]`);
      }
    }
  }
}

async function selectionSort() {
  for (let i = 0; i < bars.length; i++) {
    let min = i;
    setSortAction(`Selection Sort: assuming index ${i} is the smallest`);

    for (let j = i + 1; j < bars.length; j++) {
      await highlightCompare(min, j, `Selection Sort: comparing current smallest index ${min} with index ${j}`);

      if (bars[j] < bars[min]) {
        min = j;
        setSortAction(`Selection Sort: new smallest value found at index ${min}`);
        renderBars(min, -1);
        renderArrayView(min, -1, "compare");
        await sleep(getSortDelay());
      }
    }

    if (min !== i) {
      await doSwap(i, min, `Selection Sort: placing smallest value at index ${i}`);
    }
  }
}

async function insertionSort() {
  for (let i = 1; i < bars.length; i++) {
    let j = i;
    setSortAction(`Insertion Sort: inserting value at index ${i}`);

    while (j > 0) {
      await highlightCompare(j - 1, j, `Insertion Sort: checking array[${j - 1}] and array[${j}]`);

      if (bars[j - 1] > bars[j]) {
        await doSwap(j - 1, j, `Insertion Sort: moving smaller value left`);
        j--;
      } else {
        break;
      }
    }
  }
}

async function quickSort(left, right) {
  if (left >= right) return;

  const pivot = bars[right];
  let i = left;

  setSortAction(`Quick Sort: pivot is array[${right}] = ${pivot}`);
  renderBars(right, -1);
  renderArrayView(right, -1, "compare");
  await sleep(getSortDelay());

  for (let j = left; j < right; j++) {
    await highlightCompare(j, right, `Quick Sort: checking if array[${j}] < pivot array[${right}]`);

    if (bars[j] < pivot) {
      await doSwap(i, j, `Quick Sort: moved smaller value toward the left partition`);
      i++;
    }
  }

  await doSwap(i, right, `Quick Sort: moved pivot into its final position`);

  await quickSort(left, i - 1);
  await quickSort(i + 1, right);
}

function drawGraph() {
  const canvas = document.getElementById("graphCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  const type = document.getElementById("graphType").value;
  const a = Number(document.getElementById("a").value);
  const b = Number(document.getElementById("b").value);
  const c = Number(document.getElementById("c").value);
  const zoom = Number(document.getElementById("zoom").value);
  const color = document.getElementById("graphColor").value;

  document.getElementById("zoomLabel").textContent = zoom;

  let formula = "";
  if (type === "linear") formula = `y = ${a}x + ${b}`;
  if (type === "quadratic") formula = `y = ${a}x² + ${b}x + ${c}`;
  if (type === "sine") formula = `y = ${a}sin(${b}x) + ${c}`;
  if (type === "cosine") formula = `y = ${a}cos(${b}x) + ${c}`;
  if (type === "absolute") formula = `y = ${a}|x - ${b}| + ${c}`;
  if (type === "exponential") formula = `y = ${a} × ${b}ˣ + ${c}`;

  document.getElementById("formulaBox").textContent = formula;

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.beginPath();

  for (let px = 0; px < w; px++) {
    const x = (px - w / 2) / zoom;
    let y = 0;

    if (type === "linear") y = a * x + b;
    if (type === "quadratic") y = a * x * x + b * x + c;
    if (type === "sine") y = a * Math.sin(b * x) + c;
    if (type === "cosine") y = a * Math.cos(b * x) + c;
    if (type === "absolute") y = a * Math.abs(x - b) + c;
    if (type === "exponential") y = a * Math.pow(b, x) + c;

    const py = h / 2 - y * zoom;

    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();
}

function updateGeometryHelp() {
  const shape = document.getElementById("shape").value;
  const help = document.getElementById("geometryHelp");

  const text = {
    circle: "Circle: put radius in Value 1. The visual shows the radius from the center to the edge.",
    rectangle: "Rectangle: put width in Value 1 and height in Value 2.",
    triangle: "Triangle: put base in Value 1 and height in Value 2.",
    cube: "Cube: put side length in Value 1. The visual shows a 3D-style cube.",
    sphere: "Sphere: put radius in Value 1. The visual shows the radius from the center outward.",
    cylinder: "Cylinder: put radius in Value 1 and height in Value 2."
  };

  help.textContent = text[shape];
}

function calculateGeometry() {
  const shape = document.getElementById("shape").value;
  const n1 = Number(document.getElementById("num1").value);
  const n2 = Number(document.getElementById("num2").value);
  const output = document.getElementById("geometryOutput");

  if (shape === "circle") {
    output.textContent =
      `Circle\nArea: ${(Math.PI * n1 * n1).toFixed(2)}\nCircumference: ${(2 * Math.PI * n1).toFixed(2)}`;
  }

  if (shape === "rectangle") {
    output.textContent =
      `Rectangle\nArea: ${(n1 * n2).toFixed(2)}\nPerimeter: ${(2 * (n1 + n2)).toFixed(2)}`;
  }

  if (shape === "triangle") {
    output.textContent =
      `Triangle\nArea: ${(0.5 * n1 * n2).toFixed(2)}`;
  }

  if (shape === "cube") {
    output.textContent =
      `Cube\nSurface Area: ${(6 * n1 * n1).toFixed(2)}\nVolume: ${(n1 ** 3).toFixed(2)}`;
  }

  if (shape === "sphere") {
    output.textContent =
      `Sphere\nSurface Area: ${(4 * Math.PI * n1 * n1).toFixed(2)}\nVolume: ${((4 / 3) * Math.PI * n1 ** 3).toFixed(2)}`;
  }

  if (shape === "cylinder") {
    output.textContent =
      `Cylinder\nSurface Area: ${(2 * Math.PI * n1 * (n1 + n2)).toFixed(2)}\nVolume: ${(Math.PI * n1 * n1 * n2).toFixed(2)}`;
  }
}

function drawGeometryVisual() {
  const canvas = document.getElementById("geometryCanvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const shape = document.getElementById("shape").value;
  const n1 = Math.max(0, Number(document.getElementById("num1").value) || 0);
  const n2 = Math.max(0, Number(document.getElementById("num2").value) || 0);

  const w = canvas.width;
  const h = canvas.height;
  const centerX = w / 2;
  const centerY = h / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.font = "20px system-ui";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  function label(text, x, y) {
    ctx.fillStyle = "#eaf0ff";
    ctx.fillText(text, x, y);
  }

  function line(x1, y1, x2, y2, text, lx, ly) {
    ctx.strokeStyle = "#97f2df";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    label(text, lx, ly);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function scaleSingle(value, fallback, min, max) {
    if (value <= 0) return fallback;
    return clamp(value * 14, min, max);
  }

  function scalePair(value, otherValue, maxSize) {
    const safeValue = value > 0 ? value : 1;
    const safeOther = otherValue > 0 ? otherValue : 1;
    const largest = Math.max(safeValue, safeOther);
    return clamp((safeValue / largest) * maxSize, 70, maxSize);
  }

  if (shape === "circle") {
    const radius = scaleSingle(n1, 115, 45, 165);

    ctx.fillStyle = "rgba(184, 173, 255, 0.18)";
    ctx.strokeStyle = "#b8adff";
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    line(centerX, centerY, centerX + radius, centerY, `radius = ${n1 || "Value 1"}`, centerX + 30, centerY - 16);
    label(`Visual radius scales with Value 1`, centerX - 130, centerY + radius + 38);
  }

  if (shape === "rectangle") {
    const rectW = scalePair(n1, n2, 440);
    const rectH = scalePair(n2, n1, 240);
    const x = centerX - rectW / 2;
    const y = centerY - rectH / 2;

    ctx.fillStyle = "rgba(151, 242, 223, 0.16)";
    ctx.strokeStyle = "#97f2df";
    ctx.fillRect(x, y, rectW, rectH);
    ctx.strokeRect(x, y, rectW, rectH);

    line(x, y + rectH + 24, x + rectW, y + rectH + 24, `width = ${n1 || "Value 1"}`, x + rectW / 2 - 70, y + rectH + 54);
    line(x + rectW + 24, y, x + rectW + 24, y + rectH, `height = ${n2 || "Value 2"}`, x + rectW + 40, y + rectH / 2);
  }

  if (shape === "triangle") {
    const base = scalePair(n1, n2, 460);
    const height = scalePair(n2, n1, 260);
    const ax = centerX - base / 2;
    const ay = centerY + height / 2;
    const bx = centerX + base / 2;
    const by = ay;
    const cx = centerX;
    const cy = centerY - height / 2;

    ctx.fillStyle = "rgba(255, 214, 165, 0.18)";
    ctx.strokeStyle = "#ffd6a5";

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.lineTo(cx, cy);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    line(ax, ay + 24, bx, by + 24, `base = ${n1 || "Value 1"}`, centerX - 70, ay + 54);
    line(cx, cy, cx, ay, `height = ${n2 || "Value 2"}`, cx + 18, centerY);
  }

  if (shape === "cube") {
    const side = scaleSingle(n1, 155, 70, 210);
    const offset = clamp(side * 0.38, 35, 80);
    const x = centerX - side / 2 - offset / 2;
    const y = centerY - side / 2 + offset / 2;

    ctx.strokeStyle = "#ffadad";
    ctx.fillStyle = "rgba(255, 173, 173, 0.15)";

    ctx.fillRect(x, y, side, side);
    ctx.strokeRect(x, y, side, side);
    ctx.strokeRect(x + offset, y - offset, side, side);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + offset, y - offset);
    ctx.moveTo(x + side, y);
    ctx.lineTo(x + side + offset, y - offset);
    ctx.moveTo(x, y + side);
    ctx.lineTo(x + offset, y + side - offset);
    ctx.moveTo(x + side, y + side);
    ctx.lineTo(x + side + offset, y + side - offset);
    ctx.stroke();

    line(x, y + side + 30, x + side, y + side + 30, `side = ${n1 || "Value 1"}`, x + side / 2 - 48, y + side + 60);
    label("Cube scales with side length", x + side + offset + 35, y + 20);
  }

  if (shape === "sphere") {
    const radius = scaleSingle(n1, 115, 45, 165);

    ctx.fillStyle = "rgba(160, 196, 255, 0.16)";
    ctx.strokeStyle = "#a0c4ff";

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    line(centerX, centerY, centerX + radius, centerY, `radius = ${n1 || "Value 1"}`, centerX + 30, centerY - 16);
    label("Sphere scales with radius", centerX - 105, centerY + radius + 38);
  }

  if (shape === "cylinder") {
    const radiusSize = scalePair(n1, n2, 130);
    const cylinderHeight = scalePair(n2, n1, 260);
    const ellipseH = clamp(radiusSize * 0.34, 22, 46);
    const cylinderW = radiusSize * 2;
    const x = centerX - cylinderW / 2;
    const y = centerY - cylinderHeight / 2;

    ctx.strokeStyle = "#9bf6ff";
    ctx.fillStyle = "rgba(155, 246, 255, 0.14)";

    ctx.beginPath();
    ctx.ellipse(centerX, y, radiusSize, ellipseH, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + cylinderHeight);
    ctx.moveTo(x + cylinderW, y);
    ctx.lineTo(x + cylinderW, y + cylinderHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(centerX, y + cylinderHeight, radiusSize, ellipseH, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    line(centerX, y, x + cylinderW, y, `radius = ${n1 || "Value 1"}`, centerX + 35, y - 18);
    line(x + cylinderW + 35, y, x + cylinderW + 35, y + cylinderHeight, `height = ${n2 || "Value 2"}`, x + cylinderW + 50, y + cylinderHeight / 2);
  }
}

function updateProbabilityHelp() {
  const type = document.getElementById("simType").value;
  const help = document.getElementById("probabilityHelp");

  if (type === "coin") help.textContent = "Coin Flip: each trial gives heads or tails. Expected chance is about 50 percent each.";
  if (type === "dice") help.textContent = "Dice Roll: each trial rolls a number from 1 to 6. Expected chance is about 16.67 percent each.";
  if (type === "spinner") help.textContent = "Color Spinner: each trial lands on a random pastel color.";
}

function runSimulation() {
  const type = document.getElementById("simType").value;
  const trials = Number(document.getElementById("trials").value);
  const output = document.getElementById("probabilityOutput");

  if (trials <= 0) {
    output.textContent = "Enter a trial count above 0.";
    return;
  }

  if (type === "coin") {
    let heads = 0;
    let tails = 0;

    for (let i = 0; i < trials; i++) {
      Math.random() < 0.5 ? heads++ : tails++;
    }

    output.textContent =
      `Coin Flip Results\nHeads: ${heads} (${((heads / trials) * 100).toFixed(2)}%)\nTails: ${tails} (${((tails / trials) * 100).toFixed(2)}%)`;
  }

  if (type === "dice") {
    const rolls = [0, 0, 0, 0, 0, 0];

    for (let i = 0; i < trials; i++) {
      rolls[Math.floor(Math.random() * 6)]++;
    }

    output.textContent = rolls
      .map((count, index) => `Side ${index + 1}: ${count} (${((count / trials) * 100).toFixed(2)}%)`)
      .join("\n");
  }

  if (type === "spinner") {
    const results = {};

    pastelColors.forEach(color => results[color] = 0);

    for (let i = 0; i < trials; i++) {
      const color = pastelColors[Math.floor(Math.random() * pastelColors.length)];
      results[color]++;
    }

    output.textContent = Object.entries(results)
      .map(([color, count]) => `${color}: ${count} (${((count / trials) * 100).toFixed(2)}%)`)
      .join("\n");
  }
}

function updatePatternHelp() {
  const type = document.getElementById("patternType").value;
  const help = document.getElementById("patternHelp");

  if (type === "arithmetic") help.textContent = "Arithmetic: starts at your start number and adds the step each time.";
  if (type === "geometric") help.textContent = "Geometric: starts at your start number and multiplies by the step each time.";
  if (type === "fibonacci") help.textContent = "Fibonacci: each number is made by adding the two numbers before it. Start and step are ignored.";
  if (type === "squares") help.textContent = "Squares: generates 1², 2², 3², and so on. Start and step are ignored.";
  if (type === "cubes") help.textContent = "Cubes: generates 1³, 2³, 3³, and so on. Start and step are ignored.";
  if (type === "random") help.textContent = "Random: generates random numbers from 1 up to your step number.";
}

function generatePattern() {
  const type = document.getElementById("patternType").value;
  const start = Number(document.getElementById("startNum").value);
  const step = Number(document.getElementById("stepNum").value);
  const amount = Number(document.getElementById("amountNum").value);
  const output = document.getElementById("patternOutput");

  let sequence = [];

  if (type === "arithmetic") {
    for (let i = 0; i < amount; i++) sequence.push(start + i * step);
  }

  if (type === "geometric") {
    for (let i = 0; i < amount; i++) sequence.push(start * Math.pow(step, i));
  }

  if (type === "fibonacci") {
    let a = 0;
    let b = 1;

    for (let i = 0; i < amount; i++) {
      sequence.push(a);
      [a, b] = [b, a + b];
    }
  }

  if (type === "squares") {
    for (let i = 1; i <= amount; i++) sequence.push(i * i);
  }

  if (type === "cubes") {
    for (let i = 1; i <= amount; i++) sequence.push(i * i * i);
  }

  if (type === "random") {
    const max = Math.max(1, step);

    for (let i = 0; i < amount; i++) {
      sequence.push(Math.floor(Math.random() * max) + 1);
    }
  }

  output.textContent = sequence.join(", ");
}

changeSortSpeed();
makeBars();
updateGeometryHelp();
updateProbabilityHelp();
updatePatternHelp();
drawGraph();
drawGeometryVisual();
