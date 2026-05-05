import { postJson } from '../utils.js';
import { ENDPOINTS } from '../api.js';

import { showConfirmModal, showToast } from './modal.js';

export async function initializeProfile(userPromise) {

    // Await the user data because authenticateUser is async and the caller didn't await it
    const user = await userPromise;
    if (!user) return;

    // 1. Get Profile Icon from DOM (added in HTML)
    const profileIconBtn = document.getElementById('profileIconBtn');
    if (!profileIconBtn) return;

    // 2. Inject Profile Modal into Body
    const modalHtml = `
    <div class="modal fade" id="profileModal" tabindex="-1" aria-labelledby="profileModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-bold" id="profileModalLabel">Manage Account</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-3">
            <!-- User Information -->
            <div class="mb-4">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i data-lucide="user" class="text-primary" style="width: 24px; height: 24px;"></i>
                    </div>
                    <div>
                        <h6 class="mb-0 fw-semibold" id="profileName">${user.name || 'User'}</h6>
                        <p class="text-muted mb-0 small" id="profileEmail">${user.email || 'email'}</p>
                    </div>
                </div>
            </div>
            
            <hr class="text-secondary opacity-25">

            <!-- Change Password Form -->
            <h6 class="fw-semibold mb-3">Change Password</h6>
            <div id="passwordFeedback" class="alert d-none small py-2" role="alert"></div>
            
            <form id="changePasswordForm">
                <div class="mb-3">
                    <label for="currentPassword" class="form-label small text-secondary mb-1">Current Password</label>
                    <input type="password" class="form-control form-control-sm" id="currentPassword" required>
                </div>
                <div class="mb-3">
                    <label for="newPassword" class="form-label small text-secondary mb-1">New Password</label>
                    <input type="password" class="form-control form-control-sm" id="newPassword" minlength="8" required>
                    <div class="form-text" style="font-size: 0.7rem;">Minimum 8 characters</div>
                </div>
                <div class="mb-4">
                    <label for="confirmPassword" class="form-label small text-secondary mb-1">Confirm New Password</label>
                    <input type="password" class="form-control form-control-sm" id="confirmPassword" minlength="8" required>
                </div>
                <button type="submit" class="btn btn-primary btn-sm w-100" id="changePasswordBtn">
                    Update Password
                </button>
            </form>
            
            <hr class="text-secondary opacity-25 mt-4 mb-3">
            
            <!-- Logout -->
            <button class="btn btn-outline-danger btn-sm w-100 d-flex align-items-center justify-content-center gap-2" id="logoutBtn">
                <i data-lucide="log-out" style="width: 16px; height: 16px;"></i>
                Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // 3. Attach Event Listeners
    const profileModalEl = document.getElementById('profileModal');
    let profileModal;
    if (window.bootstrap) {
        profileModal = new window.bootstrap.Modal(profileModalEl);
    }

    profileIconBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (profileModal) {
            profileModal.show();
        }
    });

    const changePasswordForm = document.getElementById('changePasswordForm');
    const passwordFeedback = document.getElementById('passwordFeedback');
    const changePasswordBtn = document.getElementById('changePasswordBtn');

    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showFeedback('New password and confirm password do not match.', 'danger');
            return;
        }

        if (newPassword.length < 8) {
            showFeedback('Password must be at least 8 characters long.', 'danger');
            return;
        }

        changePasswordBtn.disabled = true;
        changePasswordBtn.textContent = 'Updating...';

        try {
            const response = await postJson(ENDPOINTS.CHANGE_PASSWORD, {
                currentPassword,
                newPassword,
                confirmPassword
            });

            if (response.success) {
                showFeedback('Password updated successfully.', 'success');
                changePasswordForm.reset();
            } else {
                showFeedback(response.error || 'Failed to update password.', 'danger');
            }
        } catch (error) {
            showFeedback(error.message || 'An error occurred while updating the password.', 'danger');
        } finally {
            changePasswordBtn.disabled = false;
            changePasswordBtn.textContent = 'Update Password';
        }
    });

    function showFeedback(message, type) {
        passwordFeedback.textContent = message;
        passwordFeedback.className = `alert alert-${type} small py-2`;
        passwordFeedback.classList.remove('d-none');
    }

    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', async () => {
        const confirmed = await showConfirmModal({
            title: 'Log Out',
            message: 'Are you sure you want to log out of your account?',
            confirmLabel: 'Log Out',
            cancelLabel: 'Cancel',
            danger: true
        });
        if (!confirmed) return;
        try {
            await postJson(ENDPOINTS.LOGOUT, {});
            window.location.href = 'index.html';
        } catch (error) {
            showToast({ message: 'Logout encountered an error. Redirecting...', type: 'warning' });
            setTimeout(() => { window.location.href = 'index.html'; }, 2000);
        }
    });
}
