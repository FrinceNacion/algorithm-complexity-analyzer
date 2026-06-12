import { postJson } from './utils.js';
import { ENDPOINTS } from './api.js';

import { showToast } from './components/modal.js';

const STORAGE_KEY = "algorithm-analyzer-history";

const MOCK_HISTORY = [
  {
    id: 'mock-1-bubble-sort',
    algorithmName: 'Bubble Sort',
    inputSize: 1000,
    executionTime: 2.4512,
    memoryUsage: 24,
    timeComplexity: 'O(n²)',
    thetaComplexity: 'Θ(n²)',
    omegaComplexity: 'Ω(n)',
    spaceComplexity: 'O(1)',
    timestamp: Date.now() - 3600 * 1000 * 2, // 2 hours ago
  },
  {
    id: 'mock-2-merge-sort',
    algorithmName: 'Merge Sort',
    inputSize: 5000,
    executionTime: 0.8245,
    memoryUsage: 40024,
    timeComplexity: 'O(n log n)',
    thetaComplexity: 'Θ(n log n)',
    omegaComplexity: 'Ω(n log n)',
    spaceComplexity: 'O(n)',
    timestamp: Date.now() - 3600 * 1000 * 4, // 4 hours ago
  },
  {
    id: 'mock-3-quick-sort',
    algorithmName: 'Quick Sort',
    inputSize: 10000,
    executionTime: 1.1204,
    memoryUsage: 80120,
    timeComplexity: 'O(n²)',
    thetaComplexity: 'Θ(n log n)',
    omegaComplexity: 'Ω(n log n)',
    spaceComplexity: 'O(log n)',
    timestamp: Date.now() - 3600 * 1000 * 24, // 1 day ago
  }
];

function initializeHistoryDefaults() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_HISTORY));
  }
}
initializeHistoryDefaults();

export async function saveToHistory(result) {
  // Save to local storage
  const history = getHistory();
  history.unshift(result);
  // Keep only last 100 results
  if (history.length > 100) {
    history.length = 100;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  /*
  // Comment out backend integrations for static site compatibility
  try {
    await postJson(ENDPOINTS.SAVE_RESULT, {
      size: result.inputSize,
      time: result.executionTime,
      algorithm: result.algorithmName,
      space: result.memoryUsage
    });
  } catch (error) {
    showToast({ message: 'Failed to save result to server. Your result is stored locally.', type: 'warning' });
  }
  */
}

export function getHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getBackendHistory() {
  /*
  // Comment out backend integrations for static site compatibility
  try {
    const data = await postJson(ENDPOINTS.GET_HISTORY, {});
    if (data.success && data.results) {
      return data.results.map(row => ({
        id: `backend-${row.id}`,
        algorithmName: row.algorithm,
        inputSize: row.input_size,
        executionTime: row.execution_time,
        memoryUsage: row.space_used,
        timestamp: new Date(row.created_at).getTime(),
        isBackend: true
      }));
    }
    return [];
  } catch (error) {
    showToast({ message: 'Failed to load history from server. Please check your connection.', type: 'danger' });
    return [];
  }
  */

  // Return local storage history as the source of truth for static site
  return getHistory();
}

export async function getCombinedHistory() {
  const localHistory = getHistory();
  const backendHistory = await getBackendHistory();
  
  // Merge and sort by timestamp (newest first)
  const combined = [...localHistory, ...backendHistory];
  combined.sort((a, b) => b.timestamp - a.timestamp);
  
  // Remove duplicates based on id
  const seen = new Set();
  return combined.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export async function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  /*
  // Comment out backend integrations for static site compatibility
  try {
    await postJson(ENDPOINTS.CLEAR_HISTORY, {});
  } catch (error) {
    console.error('Failed to clear history on server:', error);
    showToast({ message: 'History cleared locally, but server update failed.', type: 'warning' });
  }
  */
}

export async function deleteFromHistory(id) {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  /*
  // Comment out backend integrations for static site compatibility
  try {
    await postJson(ENDPOINTS.DELETE_ITEM, { id });
  } catch (error) {
    console.error('Failed to delete item from server:', error);
    showToast({ message: 'Item removed locally, but server update failed.', type: 'warning' });
  }
  */
}
