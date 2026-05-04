// P0 ADDITION: import theoretical value utility from algorithms module
import { getTheoreticalValue } from '../algorithms.js';

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Chart instance references — kept module-level so they can be destroyed
// before re-rendering to avoid Chart.js "canvas already in use" errors.
let performanceChartInstance = null;
let growthChartInstance = null;

// ─────────────────────────────────────────────────────────────────────────────
// P0 ADDITION — Colour palette shared by both charts
// Index 0 → first selected algorithm, Index 1 → second selected algorithm
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = [
  { empirical: '#3b82f6', theoretical: 'rgba(59,130,246,0.35)', label: 'blue' },
  { empirical: '#ef4444', theoretical: 'rgba(239, 68, 68,0.35)', label: 'red' },
];

// ─────────────────────────────────────────────────────────────────────────────
// P0 ADDITION — Theoretical vs. Empirical Growth Chart
//
// For each result that contains growthData (multi-point empirical samples),
// this function renders a Chart.js line chart with:
//   • Solid line  — empirical execution times at each sampled input size
//   • Dashed line — theoretical growth curve (normalized to the same scale)
//
// Normalization: theoretical values are scaled so their last sample point
// matches the last empirical time. This preserves the *shape* of the
// theoretical curve while making it visually comparable to measured data.
// ─────────────────────────────────────────────────────────────────────────────
function renderGrowthChart(results) {
  const ctx = document.getElementById("growthChart");
  if (!ctx) return;

  if (growthChartInstance) {
    growthChartInstance.destroy();
    growthChartInstance = null;
  }

  // Build unified x-axis from the first result's growth sizes
  // (all results share the same sampling strategy so sizes align)
  const primaryGrowth = results[0].growthData;
  if (!primaryGrowth || primaryGrowth.length === 0) return;

  // Use the result whose growthData has the largest final size for labels
  const labelSource = results.reduce((best, r) =>
    (r.growthData.at(-1)?.size ?? 0) > (best.growthData.at(-1)?.size ?? 0) ? r : best
    , results[0]);
  const labels = labelSource.growthData.map((p) => p.size.toLocaleString());
  const datasets = [];

  results.forEach((result, idx) => {
    if (!result.growthData || result.growthData.length === 0) return;

    const color = PALETTE[idx % PALETTE.length];
    const empTimes = result.growthData.map((p) => parseFloat(p.time.toFixed(6)));

    // ── Empirical dataset ─────────c─────────────────────────────────────────
    datasets.push({
      label: `${result.algorithmName} — Empirical`,
      data: empTimes,
      borderColor: color.empirical,
      backgroundColor: color.empirical,
      borderWidth: 2.5,
      pointRadius: 4,
      pointHoverRadius: 6,
      tension: 0.35,
      fill: false,
      borderDash: [],
    });

    // ── Theoretical dataset (normalized) ──────────────────────────────────
    const rawTheory = result.growthData.map((p) =>
      getTheoreticalValue(result.timeComplexity, p.size)
    );
    const lastEmp = empTimes[empTimes.length - 1] || 1;
    const lastTheory = rawTheory[rawTheory.length - 1] || 1;
    const scale = lastEmp / lastTheory;
    const normTheory = rawTheory.map((v) =>
      parseFloat((v * scale).toFixed(6))
    );

    datasets.push({
      label: `${result.algorithmName} — Theoretical ${result.timeComplexity} (normalized)`,
      data: normTheory,
      borderColor: color.empirical,
      backgroundColor: color.theoretical,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.35,
      fill: false,
      borderDash: [6, 4],  // dashed line distinguishes theoretical from empirical
    });
  });

  growthChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            font: { size: 11 },
            generateLabels(chart) {
              // Custom legend: show dashes for theoretical entries
              return chart.data.datasets.map((ds, i) => ({
                text: ds.label,
                fillStyle: ds.borderColor,
                strokeStyle: ds.borderColor,
                lineWidth: ds.borderWidth,
                lineDash: ds.borderDash,
                hidden: !chart.isDatasetVisible(i),
                datasetIndex: i,
                pointStyle: 'line',
              }));
            },
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)} ms`,
          },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Input Size (n)',
            font: { size: 12 },
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Time (ms)',
            font: { size: 12 },
          },
          ticks: {
            callback: (v) => `${v.toFixed(4)}`,
          },
        },
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main render function
// ─────────────────────────────────────────────────────────────────────────────
export function renderAnalysisResults(results) {
  const container = document.getElementById("resultsContainer");

  if (results.length === 0) {
    container.innerHTML = "";
    return;
  }

  const isComparison = results.length > 1;

  // Determine best/worst performers for badge labelling
  let fastestResult = results[0];
  let slowestResult = results[0];
  let mostMemoryResult = results[0];
  let leastMemoryResult = results[0];

  results.forEach((result) => {
    if (result.executionTime < fastestResult.executionTime) fastestResult = result;
    if (result.executionTime > slowestResult.executionTime) slowestResult = result;
    if (result.memoryUsage > mostMemoryResult.memoryUsage) mostMemoryResult = result;
    if (result.memoryUsage < leastMemoryResult.memoryUsage) leastMemoryResult = result;
  });

  const speedDifference = slowestResult.executionTime / fastestResult.executionTime;
  const memoryDifference = mostMemoryResult.memoryUsage / leastMemoryResult.memoryUsage;

  let html = `<div class="d-flex flex-column gap-4 mt-4">`;

  // ── Comparison Summary Card (2 algorithms only) ───────────────────────────
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
                <div class="fw-bold fs-5 text-primary">${speedDifference.toFixed(2)}×</div>
                <div class="text-secondary small mt-1">${fastestResult.algorithmName} is faster</div>
              </div>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <div class="bg-white rounded p-3 border" style="border-color: #bfdbfe;">
                <div class="text-secondary small mb-1">Memory Difference</div>
                <div class="fw-bold fs-5" style="color: #7e22ce;">${memoryDifference.toFixed(2)}×</div>
                <div class="text-secondary small mt-1">${leastMemoryResult.algorithmName} uses less</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Performance Bar Chart ─────────────────────────────────────────────────
  html += `
    <div class="card mb-0">
      <div class="card-header bg-white border-0 pt-3 pb-0">
        <h5 class="card-title fw-bold">${isComparison ? "Performance Comparison" : "Performance Analysis"}</h5>
        <p class="text-secondary mb-0 mt-1" style="font-size: 0.75rem;">Measured execution time at the configured input size.</p>
      </div>
      <div class="card-body">
        <canvas id="performanceChart" style="width: 100%; height: 300px;"></canvas>
      </div>
    </div>
  `;

  // ── P0 ADDITION — Theoretical vs. Empirical Growth Chart ─────────────────
  html += `
    <div class="card mb-0">
      <div class="card-header bg-white border-0 pt-3 pb-0">
        <div class="d-flex align-items-start justify-content-between">
          <div>
            <h5 class="card-title fw-bold mb-0">Theoretical vs. Empirical Growth</h5>
            <p class="text-secondary mt-1 mb-0" style="font-size: 0.75rem;">
              <strong>Solid lines</strong> show measured execution times at 5 sampled input sizes.
              <strong>Dashed lines</strong> show the expected theoretical growth curve
              (normalized to the same scale for visual comparison).
            </p>
          </div>
        </div>
      </div>
      <div class="card-body">
        <canvas id="growthChart" style="width: 100%; height: 340px;"></canvas>
      </div>
    </div>
  `;

  // ── Result Cards ──────────────────────────────────────────────────────────
  html += `<div class="row g-4">`;
  results.forEach((result) => {
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
              ${isComparison && result.id === fastestResult.id
        ? '<span class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 rounded-pill">Fastest</span>'
        : ''}
              ${isComparison && result.id === slowestResult.id
        ? '<span class="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 rounded-pill">Slowest</span>'
        : ''}
            </div>
          </div>
          <div class="card-body d-flex flex-column gap-3">

            <div class="d-flex align-items-start gap-3">
              <i data-lucide="clock" class="text-primary mt-1" style="flex-shrink:0;"></i>
              <div>
                <div class="text-secondary small">Execution Time</div>
                <div class="fs-5 fw-semibold text-dark">${result.executionTime.toFixed(4)} ms</div>
              </div>
            </div>

            <div class="d-flex align-items-start gap-3">
              <i data-lucide="hard-drive" class="mt-1" style="flex-shrink:0; color:#ea580c;"></i>
              <div>
                <div class="text-secondary small">Memory Usage</div>
                <div class="fs-5 fw-semibold text-dark">${formatBytes(result.memoryUsage)}</div>
              </div>
            </div>

            <!-- P0 ADDITION: All three asymptotic notations for Time Complexity -->
            <div class="d-flex align-items-start gap-3">
              <i data-lucide="trending-up" class="text-success mt-1" style="flex-shrink:0;"></i>
              <div style="flex: 1;">
                <div class="text-secondary small mb-1">Time Complexity</div>
                <div class="d-flex flex-wrap gap-1">
                  <span class="badge border fw-normal px-2 py-1"
                    style="background:#f0fdf4; color:#166534; border-color:#bbf7d0; font-size:0.8rem;">
                    ${result.timeComplexity}
                    <span class="ms-1 opacity-75" style="font-size:0.7rem;">Big-O</span>
                  </span>
                  ${result.thetaComplexity ? `
                  <span class="badge border fw-normal px-2 py-1"
                    style="background:#eff6ff; color:#1e40af; border-color:#bfdbfe; font-size:0.8rem;">
                    ${result.thetaComplexity}
                    <span class="ms-1 opacity-75" style="font-size:0.7rem;">Big-Θ</span>
                  </span>` : ''}
                  ${result.omegaComplexity ? `
                  <span class="badge border fw-normal px-2 py-1"
                    style="background:#fef3c7; color:#92400e; border-color:#fde68a; font-size:0.8rem;">
                    ${result.omegaComplexity}
                    <span class="ms-1 opacity-75" style="font-size:0.7rem;">Big-Ω</span>
                  </span>` : ''}
                </div>
              </div>
            </div>

            <div class="d-flex align-items-start gap-3">
              <i data-lucide="database" class="mt-1" style="flex-shrink:0; color:#9333ea;"></i>
              <div>
                <div class="text-secondary small">Space Complexity</div>
                <div class="fs-5 fw-semibold text-dark">${result.spaceComplexity}</div>
              </div>
            </div>

            <div class="pt-3 mt-auto border-top text-secondary" style="font-size:0.75rem;">
              Input Size: ${result.inputSize.toLocaleString()}
            </div>

          </div>
        </div>
      </div>
    `;
  });
  html += `</div>`;

  // ── Detailed Comparison Table (2 algorithms only) ─────────────────────────
  if (isComparison) {
    const sortedResults = [...results].sort((a, b) => a.executionTime - b.executionTime);
    html += `
      <div class="card mt-2 mb-5">
        <div class="card-header bg-white border-0 pt-3 pb-0">
          <h5 class="card-title fw-bold">Detailed Comparison Table</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-borderless table-hover align-middle mb-0">
              <thead class="border-bottom text-muted small">
                <tr>
                  <th class="py-2 px-3 fw-medium">Rank</th>
                  <th class="py-2 px-3 fw-medium">Algorithm</th>
                  <th class="py-2 px-3 fw-medium text-end">Time (ms)</th>
                  <th class="py-2 px-3 fw-medium text-end">Memory</th>
                  <th class="py-2 px-3 fw-medium text-end">Relative Speed</th>
                  <th class="py-2 px-3 fw-medium">Big-O</th>
                  <th class="py-2 px-3 fw-medium">Big-Θ</th>
                  <th class="py-2 px-3 fw-medium">Big-Ω</th>
                  <th class="py-2 px-3 fw-medium">Space</th>
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
            ${relativeSpeed === 1
          ? '<span class="text-success fw-semibold">Baseline</span>'
          : `<span class="text-secondary">${relativeSpeed.toFixed(2)}× slower</span>`}
          </td>
          <td class="py-2 px-3">
            <span class="badge fw-normal border px-2 py-1"
              style="background:#f0fdf4;color:#166534;border-color:#bbf7d0;">
              ${result.timeComplexity}
            </span>
          </td>
          <td class="py-2 px-3">
            <span class="badge fw-normal border px-2 py-1"
              style="background:#eff6ff;color:#1e40af;border-color:#bfdbfe;">
              ${result.thetaComplexity || '—'}
            </span>
          </td>
          <td class="py-2 px-3">
            <span class="badge fw-normal border px-2 py-1"
              style="background:#fef3c7;color:#92400e;border-color:#fde68a;">
              ${result.omegaComplexity || '—'}
            </span>
          </td>
          <td class="py-2 px-3">
            <span class="badge bg-light text-dark fw-normal border px-2 py-1">
              ${result.spaceComplexity}
            </span>
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

  // Re-initialise Lucide icons injected into the new HTML
  if (window.lucide) window.lucide.createIcons();

  // ── Performance Bar Chart ─────────────────────────────────────────────────
  const perfCtx = document.getElementById("performanceChart");
  if (perfCtx) {
    if (performanceChartInstance) {
      performanceChartInstance.destroy();
    }
    performanceChartInstance = new Chart(perfCtx, {
      type: 'bar',
      data: {
        labels: results.map((r) => r.algorithmName),
        datasets: [{
          label: 'Execution Time (ms)',
          data: results.map((r) => parseFloat(r.executionTime.toFixed(4))),
          backgroundColor: results.map((_, i) => PALETTE[i % PALETTE.length].empirical),
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top' },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Time (ms)' },
          },
          x: {
            ticks: { maxRotation: 45, minRotation: 45 },
          },
        },
      },
    });
  }

  // ── P0 ADDITION — Theoretical vs. Empirical Growth Chart ─────────────────
  const hasGrowthData = results.some(
    (r) => r.growthData && r.growthData.length > 0
  );
  if (hasGrowthData) {
    renderGrowthChart(results);
  }
}