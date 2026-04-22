// Helper to generate random array
function generateRandomArray(size) {
  return Array.from({ length: size }, () => Math.floor(Math.random() * 1000));
}

// Execute and measure
function measureExecution(algorithm) {
  const start = performance.now();
  algorithm();
  const end = performance.now();
  return end - start;
}

// Estimate memory usage based on space complexity and input size
function estimateMemory(spaceComplexity, size) {
  const BYTES_PER_NUMBER = 8; // JavaScript numbers are 64-bit floats
  
  switch (spaceComplexity) {
    case "O(1)":
      return BYTES_PER_NUMBER * 10; // Small constant overhead
    case "O(log n)":
      return BYTES_PER_NUMBER * Math.ceil(Math.log2(size)) * 10;
    case "O(n)":
      return BYTES_PER_NUMBER * size;
    case "O(n²)":
      return BYTES_PER_NUMBER * size * size;
    case "O(2ⁿ)":
      // Cap exponential to prevent unrealistic numbers
      return BYTES_PER_NUMBER * Math.min(Math.pow(2, size), size * 1000);
    default:
      return BYTES_PER_NUMBER * size;
  }
}


// Sorting Algorithms
function bubbleSort(arr) {
  const array = [...arr];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      if (array[j] > array[j + 1]) {
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }
    }
  }
  return array;
}

function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  
  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  
  while (i < left.length && j < right.length) {
    if (left[i] < right[j]) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  
  return result.concat(left.slice(i)).concat(right.slice(j));
}

function insertionSort(arr) {
  const array = [...arr];
  for (let i = 1; i < array.length; i++) {
    const key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      array[j + 1] = array[j];
      j--;
    }
    array[j + 1] = key;
  }
  return array;
}

// Search Algorithms
function linearSearch(arr, target) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === target) return i;
  }
  return -1;
}

function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// Mathematical Algorithms
function fibonacciRecursive(n) {
  if (n <= 1) return n;
  return fibonacciRecursive(n - 1) + fibonacciRecursive(n - 2);
}

function fibonacciIterative(n) {
  if (n <= 1) return n;
  let prev = 0, curr = 1;
  for (let i = 2; i <= n; i++) {
    [prev, curr] = [curr, prev + curr];
  }
  return curr;
}

function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

// ─────────────────────────────────────────────────────────────────────────────
// Algorithm Registry
// P0 ADDITION: Each algorithm now includes thetaComplexity (Θ) and
// omegaComplexity (Ω) fields alongside the existing timeComplexity (O).
//
// Convention used:
//   timeComplexity  → Big-O  (worst-case upper bound)
//   thetaComplexity → Big-Θ  (tight / average-case bound)
//   omegaComplexity → Big-Ω  (best-case lower bound)
// ─────────────────────────────────────────────────────────────────────────────

export const algorithms = [
  // ── Sorting ────────────────────────────────────────────────────────────────
  {
    id: "bubble-sort",
    name: "Bubble Sort",
    category: "Sorting",
    description: "Simplest implementation, slowest performance.",
    timeComplexity:  "O(n²)",
    thetaComplexity: "Θ(n²)",      // average: always performs ~n²/2 comparisons
    omegaComplexity: "Ω(n)",       // best: already-sorted input, one pass only
    spaceComplexity: "O(1)",
    execute: (size) => {
      const arr = generateRandomArray(size);
      const time = measureExecution(() => bubbleSort(arr));
      const memory = estimateMemory("O(1)", size);
      return { time, space: "O(1)", memory };
    },
  },
  {
    id: "quick-sort",
    name: "Quick Sort",
    category: "Sorting",
    description: "Fast average case, minimal memory overhead.",
    timeComplexity:  "O(n log n)",  // average case (worst: O(n²) with poor pivot)
    thetaComplexity: "Θ(n log n)", // tight average-case bound
    omegaComplexity: "Ω(n log n)", // best case with ideal pivot selection
    spaceComplexity: "O(log n)",
    execute: (size) => {
      const arr = generateRandomArray(size);
      const time = measureExecution(() => quickSort(arr));
      const memory = estimateMemory("O(log n)", size);
      return { time, space: "O(log n)", memory };
    },
  },
  {
    id: "merge-sort",
    name: "Merge Sort",
    category: "Sorting",
    description: "Guaranteed performance, higher memory usage.",
    timeComplexity:  "O(n log n)",
    thetaComplexity: "Θ(n log n)", // always the same regardless of input order
    omegaComplexity: "Ω(n log n)", // no better case possible; always divides fully
    spaceComplexity: "O(n)",
    execute: (size) => {
      const arr = generateRandomArray(size);
      const time = measureExecution(() => mergeSort(arr));
      const memory = estimateMemory("O(n)", size);
      return { time, space: "O(n)", memory };
    },
  },
  {
    id: "insertion-sort",
    name: "Insertion Sort",
    category: "Sorting",
    description: "Adaptive, excellent for nearly sorted data.",
    timeComplexity:  "O(n²)",
    thetaComplexity: "Θ(n²)",      // average: random input requires ~n²/4 shifts
    omegaComplexity: "Ω(n)",       // best: already-sorted input, only n−1 comparisons
    spaceComplexity: "O(1)",
    execute: (size) => {
      const arr = generateRandomArray(size);
      const time = measureExecution(() => insertionSort(arr));
      const memory = estimateMemory("O(1)", size);
      return { time, space: "O(1)", memory };
    },
  },

  // ── Searching ──────────────────────────────────────────────────────────────
  {
    id: "linear-search",
    name: "Linear Search",
    category: "Searching",
    description: "No preprocessing required, scales linearly.",
    timeComplexity:  "O(n)",
    thetaComplexity: "Θ(n)",       // average: target found around midpoint
    omegaComplexity: "Ω(1)",       // best: target is the first element
    spaceComplexity: "O(1)",
    execute: (size) => {
      const arr = generateRandomArray(size);
      const target = arr[Math.floor(Math.random() * size)];
      const time = measureExecution(() => linearSearch(arr, target));
      const memory = estimateMemory("O(1)", size);
      return { time, space: "O(1)", memory };
    },
  },
  {
    id: "binary-search",
    name: "Binary Search",
    category: "Searching",
    description: "Logarithmic speed, requires sorted input.",
    timeComplexity:  "O(log n)",
    thetaComplexity: "Θ(log n)",   // average: takes ~log n comparisons
    omegaComplexity: "Ω(1)",       // best: target is the exact middle element
    spaceComplexity: "O(1)",
    execute: (size) => {
      const arr = generateRandomArray(size).sort((a, b) => a - b);
      const target = arr[Math.floor(Math.random() * size)];
      const time = measureExecution(() => binarySearch(arr, target));
      const memory = estimateMemory("O(1)", size);
      return { time, space: "O(1)", memory };
    },
  },

  // ── Mathematical ───────────────────────────────────────────────────────────
  {
    id: "fibonacci-recursive",
    name: "Fibonacci (Recursive)",
    category: "Mathematical",
    description: "Exponential time, recalculates overlapping subproblems.",
    timeComplexity:  "O(2ⁿ)",
    thetaComplexity: "Θ(2ⁿ)",      // always exponential; no early exit
    omegaComplexity: "Ω(2ⁿ)",      // no better case; recursion tree is always full
    spaceComplexity: "O(n)",
    execute: (size) => {
      const n = Math.min(size, 40); // cap to prevent extreme runtimes
      const time = measureExecution(() => fibonacciRecursive(n));
      const memory = estimateMemory("O(n)", n);
      return { time, space: "O(n)", memory };
    },
  },
  {
    id: "fibonacci-iterative",
    name: "Fibonacci (DP / Iterative)",
    category: "Mathematical",
    description: "Linear time via bottom-up dynamic programming (tabulation).",
    timeComplexity:  "O(n)",
    thetaComplexity: "Θ(n)",       // always performs exactly n−1 iterations
    omegaComplexity: "Ω(n)",       // no early exit; always iterates to n
    spaceComplexity: "O(1)",
    execute: (size) => {
      const time = measureExecution(() => fibonacciIterative(size));
      const memory = estimateMemory("O(1)", size);
      return { time, space: "O(1)", memory };
    },
  },
  {
    id: "factorial",
    name: "Factorial",
    category: "Mathematical",
    description: "Linear recursion, uses call stack proportional to n.",
    timeComplexity:  "O(n)",
    thetaComplexity: "Θ(n)",       // always performs exactly n multiplications
    omegaComplexity: "Ω(n)",       // no early exit path beyond base case
    spaceComplexity: "O(n)",
    execute: (size) => {
      const n = Math.min(size, 170); // cap: n>170 causes Infinity in JS floats
      const time = measureExecution(() => factorial(n));
      const memory = estimateMemory("O(n)", n);
      return { time, space: "O(n)", memory };
    },
  },
];
