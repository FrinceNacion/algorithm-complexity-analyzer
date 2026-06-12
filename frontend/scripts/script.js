import { authenticateUser, postJson } from './utils.js';
import { saveToHistory } from './storage.js';
import { showToast } from './components/modal.js';
import { renderAlgorithmsCheckbox } from './components/algorithmCheckbox.js';
import { renderAnalysisResults } from './components/analysisResults.js';
import { algorithms, collectGrowthData } from './algorithms.js';
import { initializeProfile } from './components/profile.js';
import { exportCSV, exportPDF } from './export.js';

document.addEventListener('DOMContentLoaded', () => {

    // user authentication and profile module disabled for auth-free frontend version
    // const user = authenticateUser();
    // initializeProfile(user);

    const algorithmsContainer = document.getElementById("algorithmsContainer");
    const useManualInputToggle = document.getElementById("useManualInput");
    const sliderView = document.getElementById("sliderView");
    const manualInputView = document.getElementById("manualInputView");
    const inputSizeLabel = document.getElementById("inputSizeLabel");
    const inputSizeSlider = document.getElementById("inputSizeSlider");
    const inputSizeNumber = document.getElementById("inputSizeNumber");
    const selectedCountText = document.getElementById("selectedCountText");
    const runBtn = document.getElementById("runBtn");
    const runText = document.getElementById("runText");

    let checkedCounter = 0;
    let selectedAlgorithms = new Set();
    let inputSize = 1000;
    let useManualInput = false;
    let isAnalyzing = false;

    // Initial UI state
    useManualInputToggle.checked = useManualInput;
    inputSizeSlider.value = 1000;
    updateInputSizeLabel();

    // Group algorithms by category
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

    function getRunIcon() {
        return document.getElementById('runIcon');
    }

    function getLoadingIcon() {
        return document.getElementById('loadingIcon');
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
        if (val < 35) {
            inputSize = 35;
            updateInputSizeLabel();
            return;
        }
        if (val > 100000) {
            inputSize = 100000;
            updateInputSizeLabel();
            return;
        }
        if (!isNaN(val) && val >= 35) {
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
        const runIconNode = getRunIcon();
        const loadingIconNode = getLoadingIcon();
        if (!runIconNode || !loadingIconNode) return;

        loadingIconNode.classList.remove('d-none');
        runIconNode.classList.add('d-none');
        loadingIconNode.style.animation = 'spin 1s linear infinite';
        runText.textContent = 'Analyzing...';

        // Add keyframes if missing
        const style = document.createElement('style');
        style.innerHTML = `@keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }`;
        document.head.appendChild(style);

        // Clear previous results container
        document.getElementById("resultsContainer").innerHTML = "";

        // Small delay step to allow UI to render spinner
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Restore UI state
        document.head.removeChild(style);
        loadingIconNode.style.animation = '';
        runIconNode.classList.remove('d-none');
        loadingIconNode.classList.add('d-none');

        runText.textContent = 'Run Analysis';


        const newResults = [];

        const selectedIds = Array.from(selectedAlgorithms);
        for (const algorithmId of selectedIds) {
            const algorithm = algorithms.find((a) => a.id === algorithmId);
            if (!algorithm) continue;

            try {
                const { time, space, memory } = algorithm.execute(inputSize);

                // collectGrowthData runs the algorithm at 5 evenly-spaced input sizes
                // up to inputSize, producing the data points needed for the
                // Theoretical vs. Empirical Growth chart.
                const growthData = collectGrowthData(algorithm, inputSize);

                const result = {
                    id: `${Date.now()}-${algorithmId}`,
                    algorithmName: algorithm.name,
                    inputSize,
                    executionTime: time,
                    memoryUsage: memory,

                    // all three asymptotic notation fields 
                    timeComplexity: algorithm.timeComplexity,   // Big-O  (worst-case)
                    thetaComplexity: algorithm.thetaComplexity,  // Big-Θ  (tight/avg)
                    omegaComplexity: algorithm.omegaComplexity,  // Big-Ω  (best-case)

                    spaceComplexity: algorithm.spaceComplexity,

                    // multi-point empirical data for growth chart
                    growthData,

                    timestamp: Date.now(),
                };

                newResults.push(result);
                // Save to history here
                saveToHistory(result);
            } catch (error) {
                showToast({ message: `Error running ${algorithm.name}: ${error.message}`, type: 'danger' });
            }
        }

        // Render results here
        renderAnalysisResults(newResults);

        const exportMainCsvBtn = document.getElementById("exportMainCsvBtn");
        const exportMainPdfBtn = document.getElementById("exportMainPdfBtn");

        exportMainCsvBtn.addEventListener('click', () => {
            exportCSV(newResults, 'aca-results');
        });

        exportMainPdfBtn.addEventListener('click', () => {
            exportPDF(newResults, 'aca-results');
        });

        isAnalyzing = false;
        updateRunButtonState();

    });
});