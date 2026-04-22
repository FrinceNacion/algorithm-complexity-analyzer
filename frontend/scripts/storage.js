import { postJson } from './utils.js';

const STORAGE_KEY = "algorithm-analyzer-history";
const SAVE_ENDPOINT = "http://localhost/algorithm-complexity-analyzer/backend/save.php";
const GET_ALL_SAVES_ENDPOINT = "http://localhost/algorithm-complexity-analyzer/backend/get_all_saves.php";

export async function saveToHistory(result) {
  // Save to local storage
  const history = getHistory();
  history.unshift(result);
  // Keep only last 100 results
  if (history.length > 100) {
    history.length = 100;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  console.log(result);
  // Also save to backend
  try {
    await postJson(SAVE_ENDPOINT, {
      size: result.inputSize,
      time: result.executionTime,
      algorithm: result.algorithmName,
      space: result.memoryUsage
    });
  } catch (error) {
    console.error("Failed to save to backend:", error);
  }
}

export function getHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export async function getBackendHistory() {
  try {
    const data = await postJson(GET_ALL_SAVES_ENDPOINT, {});
    if (data.success && data.results) {
      return data.results.map(row => ({
        id: `backend-${row.id}`,
        algorithmName: row.algorithm,
        inputSize: row.input_size,
        executionTime: row.execution_time,
        spaceComplexity: row.spaced_used,
        timestamp: new Date(row.created_at).getTime(),
        isBackend: true
      }));
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch backend history:", error);
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