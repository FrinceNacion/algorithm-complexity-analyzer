import { ENDPOINTS } from './api.js';

const USERS_KEY = 'algorithm-analyzer-users';
const CURRENT_USER_KEY = 'algorithm-analyzer-current-user';

// Sensible defaults / initial state
function initializeDefaults() {
    if (!localStorage.getItem(USERS_KEY)) {
        const defaultUsers = [
            {
                name: 'Demo User',
                email: 'demo@example.com',
                password: 'password123',
                verified: true
            }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
}
initializeDefaults();

// POST request simulation with JSON data and error handling
export async function postJson(endpoint, payload) {
    /*
    // Comment out backend integrations for static site compatibility
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
    });

    const data = await response.json().catch(() => ({ error: 'Invalid server response' }));

    if (!response.ok || data.success === false || data.error) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }

    return data;
    */

    // Simulated Server Delay for authentic feel
    await new Promise(resolve => setTimeout(resolve, 300));

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');

    // 1. Auth: LOGIN
    if (endpoint.endsWith('/account/login.php')) {
        const { email, password } = payload;
        const user = users.find(u => u.email === email);
        if (!user) {
            throw new Error('Invalid email or password.');
        }
        if (user.password !== password) {
            throw new Error('Invalid email or password.');
        }
        if (!user.verified) {
            throw new Error(JSON.stringify({ error: 'unverified', email: user.email }));
        }
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { success: true, user };
    }

    // 2. Auth: REGISTER
    if (endpoint.endsWith('/account/register.php')) {
        const { name, email, password } = payload;
        if (users.some(u => u.email === email)) {
            throw new Error('An account with this email already exists.');
        }
        const newUser = { name, email, password, verified: false };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return { success: true, message: 'Account created! Please check your inbox for a verification email.' };
    }

    // 3. Auth: LOGOUT
    if (endpoint.endsWith('/account/logout.php')) {
        localStorage.removeItem(CURRENT_USER_KEY);
        return { success: true };
    }

    // 4. Auth: GET_USER
    if (endpoint.endsWith('/account/get_user.php')) {
        const currentUser = localStorage.getItem(CURRENT_USER_KEY);
        if (currentUser) {
            return { success: true, user: JSON.parse(currentUser) };
        }
        return { success: false, error: 'Not authenticated' };
    }

    // 5. Email: RESEND_VERIFICATION
    if (endpoint.endsWith('/email/resend_verification.php')) {
        const { email } = payload;
        const user = users.find(u => u.email === email);
        if (!user) {
            throw new Error('Email address not found.');
        }
        return { success: true, message: 'Verification email sent successfully!' };
    }

    // 6. History: SAVE_RESULT
    if (endpoint.endsWith('/history/save.php')) {
        return { success: true };
    }

    // 7. History: GET_HISTORY
    if (endpoint.endsWith('/history/get_all_saves.php')) {
        const historyJson = localStorage.getItem('algorithm-analyzer-history');
        const history = historyJson ? JSON.parse(historyJson) : [];
        const results = history.map((row, index) => ({
            id: index + 1,
            algorithm: row.algorithmName,
            input_size: row.inputSize,
            execution_time: row.executionTime,
            space_used: row.memoryUsage || 0,
            created_at: new Date(row.timestamp).toISOString()
        }));
        return { success: true, results };
    }

    // 8. History: CLEAR_HISTORY
    if (endpoint.endsWith('/history/clear_all.php')) {
        return { success: true };
    }

    // 9. History: DELETE_ITEM
    if (endpoint.endsWith('/history/delete_item.php')) {
        return { success: true };
    }

    // 10. Password: CHANGE_PASSWORD
    if (endpoint.endsWith('/password/change_password.php')) {
        const { currentPassword, newPassword } = payload;
        const currentUserStr = localStorage.getItem(CURRENT_USER_KEY);
        if (!currentUserStr) {
            throw new Error('User not logged in.');
        }
        const currentUser = JSON.parse(currentUserStr);
        const userIdx = users.findIndex(u => u.email === currentUser.email);
        if (userIdx === -1 || users[userIdx].password !== currentPassword) {
            throw new Error('Current password is incorrect.');
        }
        users[userIdx].password = newPassword;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        currentUser.password = newPassword;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
        return { success: true, message: 'Password updated successfully.' };
    }

    // 11. Password: FORGOT_PASSWORD
    if (endpoint.endsWith('/password/forgot_password.php')) {
        const { email, newPassword } = payload;
        const userIdx = users.findIndex(u => u.email === email);
        if (userIdx === -1) {
            throw new Error('No account found with this email.');
        }
        users[userIdx].password = newPassword;
        users[userIdx].verified = true;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        return { success: true, message: 'Password reset successfully! Please sign in.' };
    }

    throw new Error(`Endpoint mock not found: ${endpoint}`);
}

// Authenticate user and return user ID
export async function authenticateUser() {
    /*
    // Comment out backend integrations for static site compatibility
    const response = await fetch(ENDPOINTS.GET_USER, { method: "POST", credentials: "include" });
    const data = await response.json().catch(() => ({ error: 'Invalid server response' }));

    if (!data.success) {
        window.location.href = 'index.html';
    } else {
        return data.user;
    }
    */

    // Return dummy guest user to bypass authentication checks
    return { name: 'Guest User', email: 'guest@example.com' };
}
