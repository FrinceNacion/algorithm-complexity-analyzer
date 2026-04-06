function getComplexity(algorithm) {
    const map = {
        bubble: { time: "O(n²)", space: "O(1)" },
        merge: { time: "O(n log n)", space: "O(n)" },
        linear_search: { time: "O(n)", space: "O(1)" },
        binary_search: { time: "O(log n)", space: "O(1)" },
        fib_recursive: { time: "O(2ⁿ)", space: "O(n)" },
        fib_dp: { time: "O(n)", space: "O(n)" }
    };
    return map[algorithm];
}

function estimateSpace(algo, size) {
    if (algo === "bubble" || algo === "linear_search" || algo === "binary_search") {
        return size * 8;
    } else if (algo === "merge" || algo === "fib_dp") {
        return size * 8 * 2;
    } else if (algo === "fib_recursive") {
        return size * 32;
    }
    return size * 8;
}

function runAlgorithm() {
    let sizeInput = document.getElementById("size").value;
    if (!sizeInput || isNaN(sizeInput)) {
        alert("Please enter a valid input size.");
        return;
    }
    let size = parseInt(sizeInput);
    if (size <= 0) {
        alert("Size must be greater than 0.");
        return;
    }

    let algo = document.getElementById("algorithm").value;

    let arr;
    let target;

    // Setup inputs
    if (!algo.startsWith("fib_")) {
        arr = Array.from({ length: size }, () => Math.floor(Math.random() * size));
        if (algo === "binary_search") {
            arr.sort((a, b) => a - b);
        }
        // Use an element not in the random array to test worst-case time
        // Array numbers are 0 to size-1, so -1 will never exist
        target = -1;
    }

    if (algo === "fib_recursive" && size > 40) {
        alert("Size too large for O(2ⁿ) Fibonacci. Limiting N to 40.");
        size = 40;
        document.getElementById("size").value = 40;
    }

    const runAlgo = () => {
        if (algo === "bubble") Algorithms.bubbleSort(arr);
        if (algo === "merge") Algorithms.mergeSort(arr);
        if (algo === "linear_search") Algorithms.linearSearch(arr, target);
        if (algo === "binary_search") Algorithms.binarySearch(arr, target);
        if (algo === "fib_recursive") Algorithms.fibonacciRecursive(size);
        if (algo === "fib_dp") Algorithms.fibonacciDP(size);
    };

    let start = performance.now();
    runAlgo();
    let end = performance.now();
    let time = end - start;
    /** 
        // Advanced benchmarking to handle algorithms that execute in 0ms due to timer resolution limit
        // We execute them repeatedly to measure average execution time accurately
        if (time < 2) {
            let iterations = 100;
            let totalTime = 0;
            
            while (iterations <= 10000000) {
                start = performance.now();
                for (let i = 0; i < iterations; i++) {
                    runAlgo();
                }
                end = performance.now();
                totalTime = end - start;
                
                // Wait until it takes at least 15ms so we have significant time to reduce timer error
                if (totalTime > 15) {
                    break;
                }
                iterations *= 10;
            }
            time = totalTime / iterations;
        }
    */
    let complexity = getComplexity(algo);
    let space = estimateSpace(algo, size);

    document.getElementById("result").innerText =
        `Execution Time: ${time.toFixed(4)} ms | ` + // using more decimals for microscopic measured times
        `Time Complexity: ${complexity.time} | ` +
        `Space Complexity: ${complexity.space} | ` +
        `Estimated Space Used: ${space} bytes`;

    // Send data to backend
    fetch("save.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ size, time, algo, space })
    }).catch(err => console.log("Failed to save to backend (Not yet implemented):", err));
}