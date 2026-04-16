async function authenticateUser() {
    const getUserEndpoint = "http://localhost/algorithm-complexity-analyzer/backend/get_user.php";
    const response  = await fetch(getUserEndpoint, { method: "POST", credentials: "include" });
    const data = await response.json().catch(() => ({ error: 'Invalid server response' }));

    if (!response.ok || data.success === false || data.error) {
        window.location.href = 'login.html';
    } else {
        console.log("Authenticated user:", data.user);
        return data.user.id; // Return user ID if needed for saving results
    }
}

function getComplexity(algorithm) {
    const map = {
        bubble: { time: "O(n²)", space: "O(1)" },
        merge: { time: "O(n log n)", space: "O(n)" },
        linear_search: { time: "O(n)", space: "O(1)" },
        binary_search: { time: "O(log n)", space: "O(1)" },
        fibonacci_recursive: { time: "O(2ⁿ)", space: "O(n)" },
        fibonacci_dynamic_programming: { time: "O(n)", space: "O(n)" }
    };
    return map[algorithm];
}

function estimateSpace(algorithm, size) {
    if (algorithm === "bubble" || algorithm === "linear_search" || algorithm === "binary_search") {
        return size * 8;
    } else if (algorithm === "merge" || algorithm === "fibonacci_dynamic_programming") {
        return size * 8 * 2;
    } else if (algorithm === "fibonacci_recursive") {
        return size * 32;
    }
    return size * 8;
}

async function runAlgorithm() {
    let size_input = document.getElementById("size").value;
    if (!size_input || isNaN(size_input)) {
        alert("Please enter a valid input size.");
        return;
    }
    let size = parseInt(size_input);
    if (size <= 0) {
        alert("Size must be greater than 0.");
        return;
    }

    let algorithm = document.getElementById("algorithm").value;

    let array;
    let target;

    // Setup inputs
    if (!algorithm.startsWith("fibonacci_")) {
        array = Array.from({ length: size }, () => Math.floor(Math.random() * size));
        if (algorithm === "binary_search") {
            array.sort((a, b) => a - b); // sort the randomly arranged array since bsearch requires sorted data
        }
        // Use an element not in the random array to test worst-case time
        // Array numbers are 0 to size-1, so -1 will never exist
        target = -1;
    }

    if (algorithm === "fib_recursive" && size > 40) {
        alert("Size too large for O(2ⁿ) Fibonacci. Limiting N to 40.");
        size = 40;
        document.getElementById("size").value = 40;
    }

    const runAlgo = () => {
        if (algorithm === "bubble") Algorithms.bubbleSort(array);
        if (algorithm === "merge") Algorithms.mergeSort(array);
        if (algorithm === "linear_search") Algorithms.linearSearch(array, array.length - 1); // worst case: search for last element
        if (algorithm === "binary_search") Algorithms.binarySearch(array, array.length - 1); // worst case: search for last element
        if (algorithm === "fibonacci_recursive") Algorithms.fibonacciRecursive(size);
        if (algorithm === "fibonacci_dynamic_programming") Algorithms.fibonacciDP(size);
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
    let complexity = getComplexity(algorithm);
    let space = estimateSpace(algorithm, size);
    const saveEndpoint = "http://localhost/algorithm-complexity-analyzer/backend/save.php";
    const userId = await authenticateUser(); // Ensure user is authenticated and get user ID if needed for saving results

    document.getElementById("result").innerText =
        `Execution Time: ${time.toFixed(4)} ms | ` + // using more decimals for microscopic measured times
        `Time Complexity: ${complexity.time} | ` +
        `Space Complexity: ${complexity.space} | ` +
        `Estimated Space Used: ${space} bytes`;

    // Send data to backend

    try{
        const response = await fetch(saveEndpoint, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, size, time: time.toFixed(4), algorithm, space })
        });
        const data = await response.json().catch(() => ({ error: 'Invalid server response' }));
        if (!response.ok || data.success === false || data.error) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }

        return data;
    } catch (error) {
        console.log("Failed to save to backend:", error);
    }
}