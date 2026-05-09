const stage = document.getElementById("stage");
const algorithm = document.getElementById("algorithm");
const countInput = document.getElementById("count");
const speedInput = document.getElementById("speed");
const countLabel = document.getElementById("countLabel");
const speedLabel = document.getElementById("speedLabel");
const sortBtn = document.getElementById("sortBtn");
const shuffleBtn = document.getElementById("shuffleBtn");
const comparisonsEl = document.getElementById("comparisons");
const swapsEl = document.getElementById("swaps");
const statusEl = document.getElementById("status");

const colors = [
  "#b8c0ff", "#caffbf", "#ffd6a5", "#ffadad", "#a0c4ff", "#fdffb6",
  "#ffc6ff", "#9bf6ff", "#d0f4de", "#f1c0e8", "#cfbaf0", "#b9fbc0"
];

let values = [];
let comparisons = 0;
let swaps = 0;
let sorting = false;
let draggedIndex = null;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function getDelay() {
  const speed = Number(speedInput.value);
  return [420, 300, 190, 105, 45][speed - 1];
}

function updateSpeedLabel() {
  speedLabel.textContent = ["Very Slow", "Slow", "Medium", "Fast", "Insane"][Number(speedInput.value) - 1];
}

function resetStats() {
  comparisons = 0;
  swaps = 0;
  comparisonsEl.textContent = "0";
  swapsEl.textContent = "0";
  statusEl.textContent = "Ready";
}

function generateValues() {
  const count = Number(countInput.value);
  countLabel.textContent = count;

  const min = 55;
  const max = 430;

  values = Array.from({ length: count }, (_, i) => {
    const step = (max - min) / Math.max(1, count - 1);
    return Math.round(min + step * i);
  });

  shuffleArray(values);
  resetStats();
  renderBars();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function shade(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);

  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));

  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

function renderBars(active = {}) {
  const fragment = document.createDocumentFragment();

  values.forEach((value, index) => {
    const bar = document.createElement("div");
    const color = colors[index % colors.length];

    bar.className = "bar";
    bar.draggable = !sorting;
    bar.style.height = `${value}px`;
    bar.style.background = `linear-gradient(180deg, ${color}, ${shade(color, -12)})`;
    bar.textContent = Math.round(value / 10);
    bar.dataset.index = index;

    if (active.compare?.includes(index)) bar.classList.add("compare");
    if (active.swap?.includes(index)) bar.classList.add("swap");
    if (active.sorted?.includes(index)) bar.classList.add("sorted");

    bar.addEventListener("dragstart", handleDragStart);
    bar.addEventListener("dragover", handleDragOver);
    bar.addEventListener("drop", handleDrop);
    bar.addEventListener("dragend", handleDragEnd);

    fragment.appendChild(bar);
  });

  stage.replaceChildren(fragment);
}

function handleDragStart(event) {
  if (sorting) return;

  draggedIndex = Number(event.target.dataset.index);
  event.target.classList.add("dragging");
}

function handleDragOver(event) {
  if (!sorting) event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();

  if (sorting || draggedIndex === null) return;

  const targetIndex = Number(event.target.dataset.index);
  if (Number.isNaN(targetIndex) || targetIndex === draggedIndex) return;

  const [moved] = values.splice(draggedIndex, 1);
  values.splice(targetIndex, 0, moved);

  draggedIndex = null;
  resetStats();
  renderBars();
}

function handleDragEnd() {
  draggedIndex = null;
  document.querySelectorAll(".bar").forEach(bar => bar.classList.remove("dragging"));
}

async function compare(i, j) {
  comparisons++;
  comparisonsEl.textContent = comparisons;

  renderBars({ compare: [i, j] });
  await sleep(getDelay());

  return values[i] > values[j];
}

async function swap(i, j) {
  swaps++;
  swapsEl.textContent = swaps;

  renderBars({ swap: [i, j] });
  await sleep(getDelay() * 0.7);

  [values[i], values[j]] = [values[j], values[i]];

  renderBars({ swap: [i, j] });
  await sleep(getDelay() * 0.7);
}

async function bubbleSort() {
  for (let end = values.length - 1; end > 0; end--) {
    for (let i = 0; i < end; i++) {
      if (await compare(i, i + 1)) {
        await swap(i, i + 1);
      }
    }
  }
}

async function selectionSort() {
  for (let i = 0; i < values.length - 1; i++) {
    let min = i;

    for (let j = i + 1; j < values.length; j++) {
      comparisons++;
      comparisonsEl.textContent = comparisons;
      renderBars({ compare: [min, j] });
      await sleep(getDelay());

      if (values[j] < values[min]) {
        min = j;
      }
    }

    if (min !== i) {
      await swap(i, min);
    }
  }
}

async function insertionSort() {
  for (let i = 1; i < values.length; i++) {
    let j = i;

    while (j > 0) {
      if (await compare(j - 1, j)) {
        await swap(j - 1, j);
        j--;
      } else {
        break;
      }
    }
  }
}

async function quickSort(left = 0, right = values.length - 1) {
  if (left >= right) return;

  const pivotIndex = right;
  let partitionIndex = left;

  for (let i = left; i < right; i++) {
    comparisons++;
    comparisonsEl.textContent = comparisons;

    renderBars({ compare: [i, pivotIndex] });
    await sleep(getDelay());

    if (values[i] < values[pivotIndex]) {
      if (i !== partitionIndex) {
        await swap(i, partitionIndex);
      }
      partitionIndex++;
    }
  }

  await swap(partitionIndex, right);
  await quickSort(left, partitionIndex - 1);
  await quickSort(partitionIndex + 1, right);
}

async function finishAnimation() {
  const sorted = [];

  for (let i = 0; i < values.length; i++) {
    sorted.push(i);
    renderBars({ sorted });
    await sleep(25);
  }
}

function lockControls(locked) {
  sortBtn.disabled = locked;
  shuffleBtn.disabled = locked;
  countInput.disabled = locked;
  algorithm.disabled = locked;
}

async function startSort() {
  if (sorting) return;

  sorting = true;
  lockControls(true);
  resetStats();
  statusEl.textContent = "Sorting";

  if (algorithm.value === "bubble") await bubbleSort();
  if (algorithm.value === "selection") await selectionSort();
  if (algorithm.value === "insertion") await insertionSort();
  if (algorithm.value === "quick") await quickSort();

  await finishAnimation();

  statusEl.textContent = "Sorted";
  sorting = false;
  lockControls(false);
}

sortBtn.addEventListener("click", startSort);

shuffleBtn.addEventListener("click", () => {
  if (sorting) return;

  shuffleArray(values);
  resetStats();
  renderBars();
});

countInput.addEventListener("input", generateValues);
speedInput.addEventListener("input", updateSpeedLabel);

updateSpeedLabel();
generateValues();
