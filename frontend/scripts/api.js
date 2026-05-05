/**
 * Centralized API configuration and endpoints
 */

export const API_BASE = 'http://localhost/algorithm-complexity-analyzer/backend';

export const ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE}/account/login.php`,
    REGISTER: `${API_BASE}/account/register.php`,
    LOGOUT: `${API_BASE}/account/logout.php`,
    GET_USER: `${API_BASE}/account/get_user.php`,

    // Email/Verification
    RESEND_VERIFICATION: `${API_BASE}/email/resend_verification.php`,
    VERIFY_EMAIL: `${API_BASE}/email/verify_email.php`,

    // History
    SAVE_RESULT: `${API_BASE}/history/save.php`,
    GET_HISTORY: `${API_BASE}/history/get_all_saves.php`,
    DELETE_ITEM: `${API_BASE}/history/delete_item.php`,
    CLEAR_HISTORY: `${API_BASE}/history/clear_all.php`,

    // Password
    CHANGE_PASSWORD: `${API_BASE}/password/change_password.php`,
    FORGOT_PASSWORD: `${API_BASE}/password/forgot_password.php`,
};
