function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            }
        }
    }
}

// Placeholder for merge sort (you need to implement this)
function mergeSort(arr) {
    if (arr.length <= 1) return arr;

    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));

    return merge(left, right);
}

function merge(left, right) {
    let result = [], i = 0, j = 0;

    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) result.push(left[i++]);
        else result.push(right[j++]);
    }

    return result.concat(left.slice(i)).concat(right.slice(j));
}

function getComplexity(algorithm) {
    const map = {
        bubble: { time: "O(n^2)", space: "O(1)" },
        merge: { time: "O(n log n)", space: "O(n)" }
    };
    return map[algorithm];
}

function estimateSpace(arr) {
    // Rough estimation: each number ≈ 8 bytes
    return arr.length * 8;
}

function runAlgorithm() {
    let size = document.getElementById("size").value;
    let algo = document.getElementById("algorithm").value;

    let arr = Array.from({ length: size }, () => Math.random());

    let start = performance.now();

    if (algo === "bubble") bubbleSort(arr);
    if (algo === "merge") mergeSort(arr);

    let end = performance.now();

    let time = end - start;
    let complexity = getComplexity(algo);
    let space = estimateSpace(arr);

    document.getElementById("result").innerText =
        `Execution Time: ${time.toFixed(4)} ms | ` +
        `Time Complexity: ${complexity.time} | ` +
        `Space Complexity: ${complexity.space} | ` +
        `Estimated Space Used: ${space} bytes`;

    // Send data to backend
    fetch("save.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size, time, algo, space })
    });
}