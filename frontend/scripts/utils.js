import { ENDPOINTS } from './api.js';

// POST request with JSON data and error handling
export async function postJson(endpoint, payload) {
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
}

// Authenticate user and return user ID
export async function authenticateUser() {
    const response = await fetch(ENDPOINTS.GET_USER, { method: "POST", credentials: "include" });
    const data = await response.json().catch(() => ({ error: 'Invalid server response' }));

    if (!data.success) {
        window.location.href = 'index.html';
    } else {
        return data.user;
    }
}
