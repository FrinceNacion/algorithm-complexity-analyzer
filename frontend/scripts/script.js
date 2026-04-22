import { authenticateUser, postJson } from './utils.js';
import { saveToHistory } from './storage.js';
import { renderAlgorithmsCheckbox } from './components/algorithmCheckbox.js';
import { renderAnalysisResults } from './components/analysisResults.js';
import { algorithms } from './algorithms.js';

document.addEventListener('DOMContentLoaded', () => {

    // user authenticates by checking user_id in current session, if not, return to index (login/register)
    const user = authenticateUser();

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

    let checkedCounter = 0;
    let selectedAlgorithms = new Set();
    let inputSize = 1000;
    let useManualInput = false;
    let isAnalyzing = false;

    // Normal state
    useManualInputToggle.checked = useManualInput;
    inputSizeSlider.value = 1000;
    updateInputSizeLabel();

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
    renderAlgorithmsCheckbox(groupedAlgorithms, checkedCounter);

    function updateInputSizeLabel() {
        inputSizeLabel.textContent = `Input Size: ${inputSize.toLocaleString()}`;
    }

    function updateRunButtonState() {
        selectedCountText.textContent = selectedAlgorithms.size;
        runBtn.disabled = selectedAlgorithms.size === 0 || isAnalyzing;
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

    // Event Listeners for checkboxes (for dynamic label)
    const checkboxes = document.querySelectorAll('.algo-checkbox');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            if (e.target.checked) {
                selectedAlgorithms.add(e.target.value);
            } else {
                selectedAlgorithms.delete(e.target.value);
            }
            updateRunButtonState();
        });
    });

    // Run Analysis
    runBtn.addEventListener('click', async () => {
        if (selectedAlgorithms.size === 0 || isAnalyzing) return;

        isAnalyzing = true;
        updateRunButtonState();

        // UI Loading state
        runIcon.setAttribute('data-lucide', 'loader-2');
        runIcon.classList.add('animate-spin');
        runIcon.style.animation = 'spin 1s linear infinite';
        runText.textContent = 'Analyzing...';
        if (window.lucide) window.lucide.createIcons();

        // Clear previous results container
        document.getElementById("resultsContainer").innerHTML = "";

        // Small delay step to allow UI to render spinner
        await new Promise(resolve => setTimeout(resolve, 100));

        const newResults = [];

        const selectedIds = Array.from(selectedAlgorithms);
        for (const algorithmId of selectedIds) {
            const algorithm = algorithms.find((a) => a.id === algorithmId);
            if (!algorithm) continue;

            try {
                const { time, space, memory } = algorithm.execute(inputSize);

                const result = {
                    id: `${Date.now()}-${algorithmId}`,
                    algorithmName: algorithm.name,
                    inputSize,
                    executionTime: time,
                    memoryUsage: memory,
                    spaceComplexity: algorithm.spaceComplexity,
                    timeComplexity: algorithm.timeComplexity,
                    timestamp: Date.now(),
                };

                newResults.push(result);
                // Save to history here
                saveToHistory(result);
            } catch (error) {
                console.error(`Error running ${algorithm.name}:`, error);
            }
        }

        // Render results here
        renderAnalysisResults(newResults);

        isAnalyzing = false;
        updateRunButtonState();

        // Restore UI state
        runIcon.setAttribute('data-lucide', 'play');
        runIcon.style.animation = '';
        runText.textContent = 'Run Analysis';
        if (window.lucide) window.lucide.createIcons();
    });

    // Add keyframes for spinner if missing
    const style = document.createElement('style');
    style.innerHTML = `@keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }`;
    document.head.appendChild(style);
});