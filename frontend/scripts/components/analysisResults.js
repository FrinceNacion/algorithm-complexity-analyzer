export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

let chartInstance = null;

export function renderAnalysisResults(results) {
  const container = document.getElementById("resultsContainer");

  if (results.length === 0) {
    container.innerHTML = "";
    return;
  }

  const isComparison = results.length > 1;

  let fastestResult = results[0];
  let slowestResult = results[0];
  let mostMemoryResult = results[0];
  let leastMemoryResult = results[0];

  results.forEach(result => {
    if (result.executionTime < fastestResult.executionTime) {
      fastestResult = result;
    }
    if (result.executionTime > slowestResult.executionTime) {
      slowestResult = result;
    }
    if (result.memoryUsage > mostMemoryResult.memoryUsage) {
      mostMemoryResult = result;
    }
    if (result.memoryUsage < leastMemoryResult.memoryUsage) {
      leastMemoryResult = result;
    }
  });

  const speedDifference = slowestResult.executionTime / fastestResult.executionTime;
  const memoryDifference = mostMemoryResult.memoryUsage / leastMemoryResult.memoryUsage;

  let html = `<div class="d-flex flex-column gap-4 mt-4">`;

  // Comparison Summary
  if (isComparison) {
    html += `
      <div class="card" style="background: linear-gradient(135deg, #eff6ff 0%, #eef2ff 100%); border-color: #bfdbfe;">
        <div class="card-header bg-transparent border-0 pt-3 pb-0">
          <div class="d-flex align-items-center gap-2">
            <i data-lucide="bar-chart-3" class="text-primary"></i>
            <h5 class="card-title fw-bold text-primary mb-0" style="color: #1e3a8a !important;">Comparison Summary</h5>
          </div>
        </div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-12 col-md-6 col-lg-3">
              <div class="bg-white rounded p-3 border" style="border-color: #bfdbfe;">
                <div class="text-secondary small mb-1">Fastest Algorithm</div>
                <div class="fw-bold fs-5 text-success">${fastestResult.algorithmName}</div>
                <div class="text-secondary small mt-1">${fastestResult.executionTime.toFixed(4)} ms</div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <div class="bg-white rounded p-3 border" style="border-color: #bfdbfe;">
                <div class="text-secondary small mb-1">Slowest Algorithm</div>
                <div class="fw-bold fs-5 text-danger">${slowestResult.algorithmName}</div>
                <div class="text-secondary small mt-1">${slowestResult.executionTime.toFixed(4)} ms</div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <div class="bg-white rounded p-3 border" style="border-color: #bfdbfe;">
                <div class="text-secondary small mb-1">Speed Difference</div>
                <div class="fw-bold fs-5 text-primary">${speedDifference.toFixed(2)}x</div>
                <div class="text-secondary small mt-1">${fastestResult.algorithmName} is faster</div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <div class="bg-white rounded p-3 border" style="border-color: #bfdbfe;">
                <div class="text-secondary small mb-1">Memory Difference</div>
                <div class="fw-bold fs-5" style="color: #7e22ce;">${memoryDifference.toFixed(2)}x</div>
                <div class="text-secondary small mt-1">${leastMemoryResult.algorithmName} uses less</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Chart Container
  html += `
    <div class="card mb-4">
      <div class="card-header bg-white border-0 pt-3 pb-0">
        <h5 class="card-title fw-bold">${isComparison ? "Performance Comparison" : "Performance Analysis"}</h5>
      </div>
      <div class="card-body">
        <canvas id="performanceChart" style="width: 100%; height: 300px;"></canvas>
      </div>
    </div>
  `;

  // Results Cards
  html += `<div class="row g-4">`;
  results.forEach(result => {
    let highlightClass = "";
    if (isComparison) {
      if (result.id === fastestResult.id) highlightClass = "border-success shadow-sm";
      else if (result.id === slowestResult.id) highlightClass = "border-danger shadow-sm";
    }

    html += `
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card h-100 ${highlightClass}">
          <div class="card-header bg-white border-bottom-0 pt-3 pb-0">
            <div class="d-flex align-items-start justify-content-between">
              <h5 class="card-title fw-bold fs-5 mb-0">${result.algorithmName}</h5>
              ${isComparison && result.id === fastestResult.id ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill">Fastest</span>' : ''}
              ${isComparison && result.id === slowestResult.id ? '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill">Slowest</span>' : ''}
            </div>
          </div>
          <div class="card-body d-flex flex-column gap-3">
            <div class="d-flex align-items-start gap-3">
              <i data-lucide="clock" class="text-primary mt-1" style="flex-shrink: 0;"></i>
              <div>
                <div class="text-secondary small">Execution Time</div>
                <div class="fs-5 fw-semibold text-dark">${result.executionTime.toFixed(4)} ms</div>
              </div>
            </div>
            <div class="d-flex align-items-start gap-3">
              <i data-lucide="hard-drive" class="text-warning mt-1" style="flex-shrink: 0; color: #ea580c !important;"></i>
              <div>
                <div class="text-secondary small">Memory Usage</div>
                <div class="fs-5 fw-semibold text-dark">${formatBytes(result.memoryUsage)}</div>
              </div>
            </div>
            <div class="d-flex align-items-start gap-3">
              <i data-lucide="trending-up" class="text-success mt-1" style="flex-shrink: 0;"></i>
              <div>
                <div class="text-secondary small">Time Complexity</div>
                <div class="fs-5 fw-semibold text-dark">${result.timeComplexity}</div>
              </div>
            </div>
            <div class="d-flex align-items-start gap-3">
              <i data-lucide="database" class="mt-1" style="flex-shrink: 0; color: #9333ea !important;"></i>
              <div>
                <div class="text-secondary small">Space Complexity</div>
                <div class="fs-5 fw-semibold text-dark">${result.spaceComplexity}</div>
              </div>
            </div>
            <div class="pt-3 mt-auto border-top text-secondary" style="font-size: 0.75rem;">
              Input Size: ${result.inputSize.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  // Detailed Table
  if (isComparison) {
    const sortedResults = [...results].sort((a, b) => a.executionTime - b.executionTime);
    html += `
      <div class="card mt-4 mb-5">
        <div class="card-header bg-white border-0 pt-3 pb-0">
          <h5 class="card-title fw-bold">Detailed Comparison Table</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-borderless table-hover align-middle mb-0">
              <thead class="border-bottom text-muted small">
                <tr>
                  <th scope="col" class="py-2 px-3 fw-medium">Rank</th>
                  <th scope="col" class="py-2 px-3 fw-medium">Algorithm</th>
                  <th scope="col" class="py-2 px-3 fw-medium text-end">Time (ms)</th>
                  <th scope="col" class="py-2 px-3 fw-medium text-end">Memory</th>
                  <th scope="col" class="py-2 px-3 fw-medium text-end">Relative Speed</th>
                  <th scope="col" class="py-2 px-3 fw-medium">Time Complexity</th>
                  <th scope="col" class="py-2 px-3 fw-medium">Space Complexity</th>
                </tr>
              </thead>
              <tbody class="border-top-0">
    `;
    sortedResults.forEach((result, index) => {
      const relativeSpeed = result.executionTime / fastestResult.executionTime;
      html += `
        <tr class="border-bottom">
          <td class="py-2 px-3 fw-bold text-secondary">#${index + 1}</td>
          <td class="py-2 px-3 fw-medium">${result.algorithmName}</td>
          <td class="py-2 px-3 text-end font-monospace">${result.executionTime.toFixed(4)}</td>
          <td class="py-2 px-3 text-end font-monospace small">${formatBytes(result.memoryUsage)}</td>
          <td class="py-2 px-3 text-end">
            ${relativeSpeed === 1 ? '<span class="text-success fw-semibold">Baseline</span>' : `<span class="text-secondary">${relativeSpeed.toFixed(2)}x slower</span>`}
          </td>
          <td class="py-2 px-3">
            <span class="badge bg-light text-dark fw-normal border px-2 py-1">${result.timeComplexity}</span>
          </td>
          <td class="py-2 px-3">
            <span class="badge bg-light text-dark fw-normal border px-2 py-1">${result.spaceComplexity}</span>
          </td>
        </tr>
      `;
    });
    html += `
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  html += `</div>`;
  container.innerHTML = html;
  
  // Re-init lucide icons for injected HTML
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Draw Chart
  const ctx = document.getElementById("performanceChart");
  if (ctx) {
    if (chartInstance) {
      chartInstance.destroy();
    }
    
    const chartLabels = results.map(r => r.algorithmName);
    const chartData = results.map(r => parseFloat(r.executionTime.toFixed(4)));

    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartLabels,
        datasets: [{
          label: 'Execution Time (ms)',
          data: chartData,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Time (ms)'
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });
  }
}
