const STORAGE_KEY = "algorithm-analyzer-history";

export function saveToHistory(result) {
  const history = getHistory();
  history.unshift(result);
  // Keep only last 100 results
  if (history.length > 100) {
    history.length = 100;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function getHistory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}