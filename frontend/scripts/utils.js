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
    const getUserEndpoint = "http://localhost/algorithm-complexity-analyzer/backend/get_user.php";
    const response = await fetch(getUserEndpoint, { method: "POST", credentials: "include" });
    const data = await response.json().catch(() => ({ error: 'Invalid server response' }));

    if (!response.ok || data.success === false || data.error) {
        window.location.href = 'login.html';
    } else {
        console.log("Authenticated user:", data.user);
        return data.user.id;
    }
}
