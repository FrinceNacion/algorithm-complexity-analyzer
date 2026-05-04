
const CONFIRM_MODAL_ID = 'acaConfirmModal';

function getOrCreateConfirmModal() {
    let el = document.getElementById(CONFIRM_MODAL_ID);
    if (!el) {
        el = document.createElement('div');
        el.innerHTML = `
            <div class="modal fade" id="${CONFIRM_MODAL_ID}" tabindex="-1"
                 aria-modal="true" role="dialog" aria-labelledby="${CONFIRM_MODAL_ID}Label">
                <div class="modal-dialog modal-dialog-centered modal-sm">
                    <div class="modal-content border-0 shadow-lg" style="border-radius: 0.75rem; overflow: hidden;">
                        <div class="modal-header border-0 pb-0 pt-4 px-4" id="${CONFIRM_MODAL_ID}Header">
                            <h6 class="modal-title fw-bold fs-6" id="${CONFIRM_MODAL_ID}Label">Confirm Action</h6>
                        </div>
                        <div class="modal-body px-4 py-3">
                            <p class="text-secondary mb-0 small" id="${CONFIRM_MODAL_ID}Message"></p>
                        </div>
                        <div class="modal-footer border-0 pt-0 pb-4 px-4 gap-2 justify-content-end">
                            <button type="button" class="btn btn-sm btn-light px-3" id="${CONFIRM_MODAL_ID}CancelBtn">
                                Cancel
                            </button>
                            <button type="button" class="btn btn-sm px-3" id="${CONFIRM_MODAL_ID}ConfirmBtn">
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(el.firstElementChild);
        el = document.getElementById(CONFIRM_MODAL_ID);
    }
    return el;
}

/**
 * Show a Bootstrap confirmation modal.
 *
 * @param {object} options
 * @param {string} [options.title='Confirm Action']    Modal heading
 * @param {string} [options.message='Are you sure?']   Body text
 * @param {string} [options.confirmLabel='Confirm']    Confirm button label
 * @param {string} [options.cancelLabel='Cancel']      Cancel button label
 * @param {boolean} [options.danger=false]             Use danger (red) confirm button
 * @returns {Promise<boolean>} Resolves true if confirmed, false if cancelled
 */
export function showConfirmModal({
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false
} = {}) {
    return new Promise((resolve) => {
        const modalEl   = getOrCreateConfirmModal();
        const titleEl   = document.getElementById(`${CONFIRM_MODAL_ID}Label`);
        const msgEl     = document.getElementById(`${CONFIRM_MODAL_ID}Message`);
        const confirmBtn = document.getElementById(`${CONFIRM_MODAL_ID}ConfirmBtn`);
        const cancelBtn  = document.getElementById(`${CONFIRM_MODAL_ID}CancelBtn`);

        // Populate content
        titleEl.textContent   = title;
        msgEl.textContent     = message;
        confirmBtn.textContent = confirmLabel;
        cancelBtn.textContent  = cancelLabel;

        // Style the confirm button
        confirmBtn.className = `btn btn-sm px-3 ${danger ? 'btn-danger' : 'btn-primary'}`;

        // Bootstrap Modal instance
        const bsModal = window.bootstrap
            ? new window.bootstrap.Modal(modalEl, { backdrop: 'static', keyboard: true })
            : null;

        let resolved = false;

        function cleanup(result) {
            if (resolved) return;
            resolved = true;
            if (bsModal) bsModal.hide();
            resolve(result);
        }

        // One-time event listeners
        confirmBtn.onclick = () => cleanup(true);
        cancelBtn.onclick  = () => cleanup(false);

        // Also resolve false when modal is hidden via Escape / backdrop
        modalEl.addEventListener('hidden.bs.modal', () => cleanup(false), { once: true });

        if (bsModal) {
            bsModal.show();
            // Move focus to confirm button once shown for keyboard accessibility
            modalEl.addEventListener('shown.bs.modal', () => {
                confirmBtn.focus();
            }, { once: true });
        }
    });
}

// ─── Toast Notifications ────────────────────────────────────────────────────

const TOAST_CONTAINER_ID = 'acaToastContainer';

const TOAST_ICONS = {
    success: 'check-circle',
    danger:  'x-circle',
    warning: 'alert-triangle',
    info:    'info',
};

const TOAST_COLORS = {
    success: '#198754',
    danger:  '#dc3545',
    warning: '#ffc107',
    info:    '#0d6efd',
};

function getOrCreateToastContainer() {
    let container = document.getElementById(TOAST_CONTAINER_ID);
    if (!container) {
        container = document.createElement('div');
        container.id = TOAST_CONTAINER_ID;
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-atomic', 'false');
        Object.assign(container.style, {
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            zIndex: '9999',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            maxWidth: '340px',
            width: '100%',
        });
        document.body.appendChild(container);
    }
    return container;
}

/**
 * Show a non-blocking Bootstrap toast notification.
 *
 * @param {object} options
 * @param {string} [options.message='']              Toast body text
 * @param {'success'|'danger'|'warning'|'info'} [options.type='info'] Toast variant
 * @param {number} [options.duration=4000]           Auto-hide delay in ms
 */
export function showToast({
    message = '',
    type = 'info',
    duration = 4000
} = {}) {
    const container = getOrCreateToastContainer();
    const iconName  = TOAST_ICONS[type]  || 'info';
    const color     = TOAST_COLORS[type] || TOAST_COLORS.info;

    const toastEl = document.createElement('div');
    toastEl.className = 'toast show align-items-center border-0 shadow';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    Object.assign(toastEl.style, {
        background: 'white',
        borderRadius: '0.625rem',
        overflow: 'hidden',
        borderLeft: `4px solid ${color}`,
        opacity: '0',
        transform: 'translateX(20px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        minWidth: '260px',
    });

    toastEl.innerHTML = `
        <div class="d-flex align-items-start gap-2 p-3">
            <i data-lucide="${iconName}" style="width:18px;height:18px;color:${color};flex-shrink:0;margin-top:1px;"></i>
            <p class="mb-0 small text-dark lh-sm flex-grow-1" style="word-break:break-word;">${message}</p>
            <button type="button" class="btn-close btn-close-sm ms-1 flex-shrink-0" aria-label="Close"
                style="width:0.6em;height:0.6em;"></button>
        </div>`;

    container.appendChild(toastEl);

    // Re-render lucide icons for the new toast
    if (window.lucide) window.lucide.createIcons();

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toastEl.style.opacity = '1';
            toastEl.style.transform = 'translateX(0)';
        });
    });

    function dismiss() {
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(20px)';
        setTimeout(() => toastEl.remove(), 280);
    }

    // Close button
    toastEl.querySelector('.btn-close').addEventListener('click', dismiss);

    // Auto-dismiss
    const timer = setTimeout(dismiss, duration);

    // Clear timer if manually dismissed early
    toastEl.querySelector('.btn-close').addEventListener('click', () => clearTimeout(timer), { once: true });
}
