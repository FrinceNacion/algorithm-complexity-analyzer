import { postJson } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('loginView');
    const registerView = document.getElementById('registerView');
    const forgotPasswordView = document.getElementById('forgotPasswordView');
    
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const showLoginBtn = document.getElementById('showLoginBtn');
    const showForgotBtn = document.getElementById('showForgotBtn');
    const showLoginFromForgotBtn = document.getElementById('showLoginFromForgotBtn');

    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const registerForm = document.getElementById('registerForm');
    const registerSubmitBtn = document.getElementById('registerSubmitBtn');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const forgotSubmitBtn = document.getElementById('forgotSubmitBtn');

    const LOGINENDPOINT = 'http://localhost/algorithm-complexity-analyzer/backend/login.php';
    const REGISTERENDPOINT = 'http://localhost/algorithm-complexity-analyzer/backend/register.php';
    const FORGOTENDPOINT = 'http://localhost/algorithm-complexity-analyzer/backend/forgot_password.php';

    function hideAllViews() {
        loginView.style.display = 'none';
        registerView.style.display = 'none';
        forgotPasswordView.style.display = 'none';
    }

    showRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllViews();
        registerView.style.display = 'block';
    });

    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllViews();
        loginView.style.display = 'block';
    });

    showForgotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllViews();
        forgotPasswordView.style.display = 'block';
    });

    showLoginFromForgotBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllViews();
        loginView.style.display = 'block';
    });

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
            hideAllViews();
            loginView.style.display = 'block';
        } catch (error) {
            alert(error.message);
        } finally {
            setButtonState(registerSubmitBtn, originalText, false);
        }
    });

    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('forgotEmail').value.trim();
        const newPassword = document.getElementById('forgotNewPassword').value;
        const confirmPassword = document.getElementById('forgotConfirmPassword').value;

        if (!email || !newPassword || !confirmPassword) {
            alert('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        const originalText = forgotSubmitBtn.innerText;
        setButtonState(forgotSubmitBtn, 'Resetting...');

        try {
            const data = await postJson(FORGOTENDPOINT, { email, newPassword, confirmPassword });
            alert(data.message || 'Password reset successfully! Please sign in.');
            forgotPasswordForm.reset();
            hideAllViews();
            loginView.style.display = 'block';
        } catch (error) {
            alert(error.message);
        } finally {
            setButtonState(forgotSubmitBtn, originalText, false);
        }
    });
});
