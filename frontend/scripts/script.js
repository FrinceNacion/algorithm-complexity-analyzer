import { authenticateUser, postJson } from './utils.js';
import { renderAlgorithmsCheckbox } from './components/algorithmCheckbox.js';
import { algorithms } from './algorithms.js';

document.addEventListener('DOMContentLoaded', () => {
    const algorithmsContainer = document.getElementById("algorithmsContainer");
    const useManualInputToggle = document.getElementById("useManualInput");
    const sliderView = document.getElementById("sliderView");
    const manualInputView = document.getElementById("manualInputView");
    const inputSizeLabel = document.getElementById("inputSizeLabel");
    const inputSizeSlider = document.getElementById("inputSizeSlider");
    const inputSizeNumber = document.getElementById("inputSizeNumber");
    const selectedCountText = document.getElementById("selectedCountText");
    const runBtn = document.getElementById("runBtn");
    const runIcon = document.getElementById("runIcon");
    const runText = document.getElementById("runText");

    let selectedAlgorithms = new Set();
    let inputSize = 1000;
    let useManualInput = false;
    let isAnalyzing = false;

    // Normal state
    useManualInputToggle.checked = useManualInput;

    // Group algorithms by category
    /* Example output:
        {
            Sorting: [
                { id: "1", name: "Bubble Sort", category: "Sorting" },
                { id: "2", name: "Quick Sort", category: "Sorting" }
            ],
            Search: [
                { id: "3", name: "Binary Search", category: "Search" }
            ]
        }
    */
    const groupedAlgorithms = algorithms.reduce((accumulator, algorithm) => {
        if (!accumulator[algorithm.category]) {
            accumulator[algorithm.category] = [];
        }
        accumulator[algorithm.category].push(algorithm);
        return accumulator;
    }, {});

    // Render algorithm checkboxes
    renderAlgorithmsCheckbox(groupedAlgorithms);

    function updateInputSizeLabel() {
        inputSizeLabel.textContent = `Input Size: ${inputSize.toLocaleString()}`;
    }

    // Toggle Input Mode
    useManualInputToggle.addEventListener('change', (e) => {
        useManualInput = e.target.checked;
        if (useManualInput) {
            sliderView.classList.add('d-none');
            manualInputView.classList.remove('d-none');
            inputSize = parseInt(inputSizeNumber.value) || 1000;
        } else {
            sliderView.classList.remove('d-none');
            manualInputView.classList.add('d-none');
            inputSize = parseInt(inputSizeSlider.value);
        }
        updateInputSizeLabel();
    });

    // Slider Change
    inputSizeSlider.addEventListener('input', (e) => {
        inputSize = parseInt(e.target.value);
        updateInputSizeLabel();
    });

    // Number Input Change
    inputSizeNumber.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
        const val = parseInt(e.target.value);
        if (val > 100000) {
            inputSize = 100000;
            updateInputSizeLabel();
            return;
        }
        if (!isNaN(val) && val >= 1) {
            inputSize = val;
            updateInputSizeLabel();
        }
    });

    /*function getComplexity(algorithm) {
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
        let complexity = getComplexity(algorithm);
        let space = estimateSpace(algorithm, size);
        const SAVEENDPOINT = "http://localhost/algorithm-complexity-analyzer/backend/save.php";
        await authenticateUser(); // Ensure user is authenticated (user ID comes from session)

        document.getElementById("result").innerText =
            `Execution Time: ${time.toFixed(4)} ms | ` + // using more decimals for microscopic measured times
            `Time Complexity: ${complexity.time} | ` +
            `Space Complexity: ${complexity.space} | ` +
            `Estimated Space Used: ${space} bytes`;

        // Send data to backend
        try {
            time = parseFloat(time) ;
            await postJson(SAVEENDPOINT, { size, time, algorithm, space });
        } catch (error) {
            console.log("Failed to save to backend:", error);
        }
    }

    runButton.addEventListener('click', runAlgorithm);*/
});