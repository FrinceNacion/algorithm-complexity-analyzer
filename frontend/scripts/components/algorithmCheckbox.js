export function renderAlgorithmsCheckbox(groupedAlgorithms) {
    let algosHtml = '<div class="d-flex flex-column gap-4">';
    for (const [category, algos] of Object.entries(groupedAlgorithms)) {
        algosHtml += `<div>
      <h6 class="fw-semibold text-secondary mb-3">${category}</h6>
      <div class="row g-3">
    `;
        algos.forEach((algo) => {
            algosHtml += `
        <div class="w-50">
          <div class="algo-item">
            <div class="form-check mt-1">
              <input class="form-check-input algo-checkbox" type="checkbox" value="${algo.id}" id="algo-${algo.id}">
            </div>
            <div>
              <label class="form-check-label fw-medium mb-1 cursor-pointer" for="algo-${algo.id}" style="cursor: pointer;">
                ${algo.name}
              </label>
              <div class="text-secondary mb-1" style="font-size: 0.75rem;">
                Time: ${algo.timeComplexity} | Space: ${algo.spaceComplexity}
              </div>
              <div class="text-secondary lh-sm" style="font-size: 0.75rem;">
                ${algo.description}
              </div>
            </div>
          </div>
        </div>
      `;
        });
        algosHtml += `</div></div>`;
    }
    algosHtml += '</div>';
    algorithmsContainer.innerHTML = algosHtml;
}