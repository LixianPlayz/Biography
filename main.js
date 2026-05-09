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

function showPage(id) {
  document.querySelectorAll(".screen").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  if (id === "graphing") drawGraph();
  if (id === "geometry") updateGeometryHelp();
  if (id === "probability") updateProbabilityHelp();
  if (id === "patterns") updatePatternHelp();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Sorting */

function getSortDelay() {
  const speed = Number(document.getElementById("sortSpeed").value);
  return [350, 220, 120, 65, 25][speed - 1];
}

function changeSortSpeed() {
  const speed = Number(document.getElementById("sortSpeed").value);
  document.getElementById("sortSpeedLabel").textContent =
    ["Very Slow", "Slow", "Medium", "Fast", "Insane"][speed - 1];
}

function changeBarCount() {
  document.getElementById("barCountLabel").textContent = document.getElementById("barCount").value;
  makeBars();
}

function makeBars() {
  const amount = Number(document.getElementById("barCount").value);
  bars = Array.from({ length: amount }, () => Math.floor(Math.random() * 360) + 80);
  comparisons = 0;
  swaps = 0;
  updateSortStats();
  renderBars();
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
    bar.draggable = true;

    bar.addEventListener("dragstart", () => {
      bar.dataset.dragging = "true";
    });

    bar.addEventListener("dragend", () => {
      bar.dataset.dragging = "false";
    });

    bar.addEventListener("dragover", event => {
      event.preventDefault();
    });

    bar.addEventListener("drop", () => {
      const dragged = [...holder.children].find(child => child.dataset.dragging === "true");
      const from = [...holder.children].indexOf(dragged);
      const to = [...holder.children].indexOf(bar);

      if (from < 0 || to < 0) return;

      const moved = bars.splice(from, 1)[0];
      bars.splice(to, 0, moved);

      renderBars();
    });

    holder.appendChild(bar);
  });
}

function shuffleBars() {
  makeBars();
}

async function startSort() {
  const type = document.getElementById("sortType").value;

  comparisons = 0;
  swaps = 0;
  updateSortStats();

  if (type === "bubble") await bubbleSort();
  if (type === "selection") await selectionSort();
  if (type === "insertion") await insertionSort();
  if (type === "quick") await quickSort(0, bars.length - 1);

  renderBars();
}

async function bubbleSort() {
  for (let i = 0; i < bars.length; i++) {
    for (let j = 0; j < bars.length - i - 1; j++) {
      comparisons++;
      updateSortStats();
      renderBars(j, j + 1);
      await sleep(getSortDelay());

      if (bars[j] > bars[j + 1]) {
        swaps++;
        [bars[j], bars[j + 1]] = [bars[j + 1], bars[j]];
        updateSortStats();
      }
    }
  }
}

async function selectionSort() {
  for (let i = 0; i < bars.length; i++) {
    let min = i;

    for (let j = i + 1; j < bars.length; j++) {
      comparisons++;
      updateSortStats();
      renderBars(min, j);
      await sleep(getSortDelay());

      if (bars[j] < bars[min]) min = j;
    }

    if (min !== i) {
      swaps++;
      [bars[i], bars[min]] = [bars[min], bars[i]];
      updateSortStats();
    }
  }
}

async function insertionSort() {
  for (let i = 1; i < bars.length; i++) {
    let j = i;

    while (j > 0 && bars[j - 1] > bars[j]) {
      comparisons++;
      swaps++;
      renderBars(j - 1, j);
      updateSortStats();
      await sleep(getSortDelay());

      [bars[j - 1], bars[j]] = [bars[j], bars[j - 1]];
      j--;
    }
  }
}

async function quickSort(left, right) {
  if (left >= right) return;

  const pivot = bars[right];
  let i = left;

  for (let j = left; j < right; j++) {
    comparisons++;
    renderBars(j, right);
    updateSortStats();
    await sleep(getSortDelay());

    if (bars[j] < pivot) {
      swaps++;
      [bars[i], bars[j]] = [bars[j], bars[i]];
      i++;
      updateSortStats();
    }
  }

  swaps++;
  [bars[i], bars[right]] = [bars[right], bars[i]];
  updateSortStats();

  await quickSort(left, i - 1);
  await quickSort(i + 1, right);
}

/* Graphing */

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

/* Geometry */

function updateGeometryHelp() {
  const shape = document.getElementById("shape").value;
  const help = document.getElementById("geometryHelp");

  const text = {
    circle: "Circle: put the radius in Value 1. Value 2 is not used.",
    rectangle: "Rectangle: put width in Value 1 and height in Value 2.",
    triangle: "Triangle: put base in Value 1 and height in Value 2.",
    cube: "Cube: put side length in Value 1. Value 2 is not used.",
    sphere: "Sphere: put radius in Value 1. Value 2 is not used.",
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

/* Probability */

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

/* Patterns */

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

/* Startup */

changeSortSpeed();
makeBars();
updateGeometryHelp();
updateProbabilityHelp();
updatePatternHelp();
drawGraph();
