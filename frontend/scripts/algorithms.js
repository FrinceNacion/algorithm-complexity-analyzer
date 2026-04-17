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