import { getBackendHistory, clearHistory, deleteFromHistory } from "./storage.js";
import { algorithms } from "./algorithms.js";
import { formatBytes } from "./components/analysisResults.js";
import { authenticateUser, postJson } from './utils.js';

document.addEventListener("DOMContentLoaded", () => {

    // user authenticates by checking user_id in current session, if not, return to index (login/register)
    const user = authenticateUser();

    const emptyState = document.getElementById("emptyState");
    const historyContent = document.getElementById("historyContent");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");
    const algorithmFilter = document.getElementById("algorithmFilter");
    const historyTitle = document.getElementById("historyTitle");
    const noResults = document.getElementById("noResults");
    const tableContainer = document.getElementById("tableContainer");
    const historyTableBody = document.getElementById("historyTableBody");

    let historyData = [];
    let filteredHistory = [];
    let filterAlgorithm = "all";
    let sortField = "date";
    let sortDirection = "desc";

    // Group algorithms for select menu
    const algorithmsByCategory = algorithms.reduce((acc, algorithm) => {
        const category = algorithm.category;
        if (!acc[category]) acc[category] = [];
        acc[category].push(algorithm.name);
        return acc;
    }, {});

    let filterHtml = '<option value="all">All Algorithms</option>';
    for (const [category, algos] of Object.entries(algorithmsByCategory)) {
        filterHtml += `<optgroup label="${category}">`;
        algos.forEach(algo => {
            filterHtml += `<option value="${algo}">${algo}</option>`;
        });
        filterHtml += `</optgroup>`;
    }
    algorithmFilter.innerHTML = filterHtml;

    async function loadHistory() {
        historyData = await getBackendHistory();
        if (historyData.length === 0) {
            emptyState.classList.remove("d-none");
            historyContent.classList.add("d-none");
        } else {
            emptyState.classList.add("d-none");
            historyContent.classList.remove("d-none");
            applyFiltersAndSort();
        }
    }

    function applyFiltersAndSort() {
        filteredHistory = [...historyData];

        // Filter
        if (filterAlgorithm !== "all") {
            filteredHistory = filteredHistory.filter(item => item.algorithmName === filterAlgorithm);
        }

        // Sort
        filteredHistory.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "date": comparison = a.timestamp - b.timestamp; break;
                case "time": comparison = a.executionTime - b.executionTime; break;
                case "size": comparison = a.inputSize - b.inputSize; break;
                case "algorithm": comparison = a.algorithmName.localeCompare(b.algorithmName); break;
                case "memory": comparison = a.memoryUsage - b.memoryUsage; break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

        renderTable();
    }

    function renderTable() {
        historyTitle.textContent = `Recent Analyses (${filteredHistory.length}${filteredHistory.length !== historyData.length ? ` of ${historyData.length}` : ''})`;

        // Update sort headers UI
        document.querySelectorAll('th[data-sort]').forEach(th => {
            const field = th.getAttribute('data-sort');
            const icon = th.querySelector('.sort-icon');
            if (sortField === field) {
                icon.classList.remove('d-none');
                // Actually arrow-up-down doesn't show direction easily with lucide, but we keep it
            } else {
                icon.classList.add('d-none');
            }
        });

        if (filteredHistory.length === 0) {
            noResults.classList.remove("d-none");
            tableContainer.classList.add("d-none");
        } else {
            noResults.classList.add("d-none");
            tableContainer.classList.remove("d-none");

            let rowsHtml = "";
            filteredHistory.forEach(item => {
                rowsHtml += `
          <tr>
            <td class="fw-medium">${item.algorithmName}</td>
            <td class="text-center">${item.inputSize.toLocaleString()}</td>
            <td class="text-center font-monospace">${Number(item.executionTime).toFixed(4)} ms</td>
            <td class="text-center font-monospace small">${formatBytes(item.memoryUsage || 0)}</td>
            <td class="text-center text-secondary small">${new Date(item.timestamp).toLocaleString()}</td>
            <td class="text-center">
              <button class="btn btn-sm btn-link text-danger p-1 delete-btn" data-id="${item.id}">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
              </button>
            </td>
          </tr>
        `;
            });
            historyTableBody.innerHTML = rowsHtml;

            if (window.lucide) window.lucide.createIcons();

            // Attach delete events
            document.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const id = e.currentTarget.getAttribute('data-id');
                    handleDeleteItem(id);
                });
            });
        }
    }

    function handleDeleteItem(id) {
        deleteFromHistory(id);
        loadHistory();
    }

    // Event Listeners
    clearHistoryBtn.addEventListener('click', () => {
        if (confirm("Are you sure you want to clear all history?")) {
            clearHistory();
            loadHistory();
        }
    });

    algorithmFilter.addEventListener('change', (e) => {
        filterAlgorithm = e.target.value;
        applyFiltersAndSort();
    });

    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            const field = th.getAttribute('data-sort');
            if (sortField === field) {
                sortDirection = sortDirection === "asc" ? "desc" : "asc";
            } else {
                sortField = field;
                sortDirection = "desc";
            }
            applyFiltersAndSort();
        });
    });

    // Initial Load
    loadHistory();
});
