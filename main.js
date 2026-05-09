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

function showPage(id) {
  document.querySelectorAll(".screen").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");

  if (id === "graphing") drawGraph();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/* Sorting Visualizer */

function makeBars() {
  const holder = document.getElementById("bars");
  holder.innerHTML = "";

  bars = Array.from({ length: 18 }, () => Math.floor(Math.random() * 360) + 80);

  bars.forEach((height, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
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

      const moved = bars.splice(from, 1)[0];
      bars.splice(to, 0, moved);

      renderBars();
    });

    holder.appendChild(bar);
  });
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

  if (type === "bubble") await bubbleSort();
  if (type === "selection") await selectionSort();
  if (type === "insertion") await insertionSort();

  renderBars();
}

async function bubbleSort() {
  for (let i = 0; i < bars.length; i++) {
    for (let j = 0; j < bars.length - i - 1; j++) {
      renderBars(j, j + 1);
      await sleep(90);

      if (bars[j] > bars[j + 1]) {
        [bars[j], bars[j + 1]] = [bars[j + 1], bars[j]];
      }
    }
  }
}

async function selectionSort() {
  for (let i = 0; i < bars.length; i++) {
    let min = i;

    for (let j = i + 1; j < bars.length; j++) {
      renderBars(min, j);
      await sleep(90);

      if (bars[j] < bars[min]) {
        min = j;
      }
    }

    [bars[i], bars[min]] = [bars[min], bars[i]];
  }
}

async function insertionSort() {
  for (let i = 1; i < bars.length; i++) {
    let j = i;

    while (j > 0 && bars[j - 1] > bars[j]) {
      renderBars(j - 1, j);
      await sleep(90);

      [bars[j - 1], bars[j]] = [bars[j], bars[j - 1]];
      j--;
    }
  }
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

  ctx.clearRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.stroke();

  ctx.strokeStyle = "#b8adff";
  ctx.lineWidth = 4;
  ctx.beginPath();

  for (let px = 0; px < w; px++) {
    const x = (px - w / 2) / 40;
    let y = 0;

    if (type === "linear") y = a * x + b;
    if (type === "quadratic") y = a * x * x + b * x + c;
    if (type === "sine") y = a * Math.sin(b * x) + c;
    if (type === "absolute") y = a * Math.abs(x - b) + c;

    const py = h / 2 - y * 40;

    if (px === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.stroke();
}

/* Geometry */

function calculateGeometry() {
  const shape = document.getElementById("shape").value;
  const n1 = Number(document.getElementById("num1").value);
  const n2 = Number(document.getElementById("num2").value);
  const output = document.getElementById("geometryOutput");

  if (shape === "circle") {
    const area = Math.PI * n1 * n1;
    const circumference = 2 * Math.PI * n1;

    output.innerHTML = `
      Circle<br>
      Area: ${area.toFixed(2)}<br>
      Circumference: ${circumference.toFixed(2)}
    `;
  }

  if (shape === "rectangle") {
    const area = n1 * n2;
    const perimeter = 2 * (n1 + n2);

    output.innerHTML = `
      Rectangle<br>
      Area: ${area.toFixed(2)}<br>
      Perimeter: ${perimeter.toFixed(2)}
    `;
  }

  if (shape === "triangle") {
    const area = 0.5 * n1 * n2;

    output.innerHTML = `
      Triangle<br>
      Area: ${area.toFixed(2)}
    `;
  }
}

/* Probability */

function runSimulation() {
  const type = document.getElementById("simType").value;
  const trials = Number(document.getElementById("trials").value);
  const output = document.getElementById("probabilityOutput");

  if (type === "coin") {
    let heads = 0;
    let tails = 0;

    for (let i = 0; i < trials; i++) {
      Math.random() < 0.5 ? heads++ : tails++;
    }

    output.innerHTML = `
      Coin Flip Results<br>
      Heads: ${heads}<br>
      Tails: ${tails}<br>
      Heads Percent: ${((heads / trials) * 100).toFixed(2)}%
    `;
  }

  if (type === "dice") {
    const rolls = [0, 0, 0, 0, 0, 0];

    for (let i = 0; i < trials; i++) {
      const roll = Math.floor(Math.random() * 6);
      rolls[roll]++;
    }

    output.innerHTML = rolls
      .map((count, index) => `Side ${index + 1}: ${count}`)
      .join("<br>");
  }
}

/* Patterns */

function generatePattern() {
  const type = document.getElementById("patternType").value;
  const start = Number(document.getElementById("startNum").value);
  const step = Number(document.getElementById("stepNum").value);
  const amount = Number(document.getElementById("amountNum").value);
  const output = document.getElementById("patternOutput");

  let sequence = [];

  if (type === "arithmetic") {
    for (let i = 0; i < amount; i++) {
      sequence.push(start + i * step);
    }
  }

  if (type === "geometric") {
    for (let i = 0; i < amount; i++) {
      sequence.push(start * Math.pow(step, i));
    }
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
    for (let i = 1; i <= amount; i++) {
      sequence.push(i * i);
    }
  }

  if (type === "cubes") {
    for (let i = 1; i <= amount; i++) {
      sequence.push(i * i * i);
    }
  }

  output.textContent = sequence.join(", ");
}

makeBars();
drawGraph();
