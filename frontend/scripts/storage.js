import { postJson } from './utils.js';
import { ENDPOINTS } from './api.js';

import { showToast } from './components/modal.js';

const STORAGE_KEY = "algorithm-analyzer-history";

export async function saveToHistory(result) {
  // Save to local storage
  const history = getHistory();
  history.unshift(result);
  // Keep only last 100 results
  if (history.length > 100) {
    history.length = 100;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  // Also save to backend
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
}

export function getHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getBackendHistory() {
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

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}

export function deleteFromHistory(id) {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}
