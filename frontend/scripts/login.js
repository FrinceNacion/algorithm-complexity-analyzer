document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerForm = document.getElementById('registerForm');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');

    const LOGINENDPOINT = 'http://localhost/algorithm-complexity-analyzer/backend/login.php';
    const REGISTERENDPOINT = 'http://localhost/algorithm-complexity-analyzer/backend/register.php';

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.style.display = 'none';
        registerView.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.style.display = 'none';
        loginView.style.display = 'block';
    });

    async function postJson(endpoint, payload) {
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

    function setButtonState(button, text, disabled = true) {
        button.disabled = disabled;
        button.innerText = text;
        button.style.opacity = disabled ? '0.8' : '1';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        const originalText = loginBtn.innerText;
        setButtonState(loginBtn, 'Signing in...');

        try {
            const data = await postJson(LOGINENDPOINT, { email, password });
            alert(`Welcome back, ${data.user.name}!`);
            window.location.href = 'main.html';
        } catch (error) {
            alert(error.message);
        } finally {
            setButtonState(loginBtn, originalText, false);
        }
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('regName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        if (!name || !email || !password || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        const originalText = registerSubmitBtn.innerText;
        setButtonState(registerSubmitBtn, 'Creating account...');

        try {
            await postJson(REGISTERENDPOINT, { name, email, password });
            alert('Registration successful! Please sign in.');
            registerForm.reset();
            registerView.style.display = 'none';
            loginView.style.display = 'block';
        } catch (error) {
            alert(error.message);
        } finally {
            setButtonState(registerSubmitBtn, originalText, false);
        }
    });
});
