import { postJson } from './utils.js';
import { ENDPOINTS } from './api.js';


document.addEventListener('DOMContentLoaded', () => {
    // ── Views ──────────────────────────────────────────────────────────────────
    const loginView               = document.getElementById('loginView');
    const registerView            = document.getElementById('registerView');
    const forgotPasswordView      = document.getElementById('forgotPasswordView');
    const verificationPendingView = document.getElementById('verificationPendingView');

    // ── Nav links ──────────────────────────────────────────────────────────────
    const showRegisterBtn         = document.getElementById('showRegisterBtn');
    const showLoginBtn            = document.getElementById('showLoginBtn');
    const showForgotBtn           = document.getElementById('showForgotBtn');
    const showLoginFromForgotBtn  = document.getElementById('showLoginFromForgotBtn');
    const showLoginFromVerifyBtn  = document.getElementById('showLoginFromVerifyBtn');

    // ── Forms & buttons ────────────────────────────────────────────────────────
    const loginForm               = document.getElementById('loginForm');
    const loginBtn                = document.getElementById('loginBtn');
    const registerForm            = document.getElementById('registerForm');
    const registerSubmitBtn       = document.getElementById('registerSubmitBtn');
    const forgotPasswordForm      = document.getElementById('forgotPasswordForm');
    const forgotSubmitBtn         = document.getElementById('forgotSubmitBtn');
    const resendVerificationBtn   = document.getElementById('resendVerificationBtn');
    const pendingEmailEl          = document.getElementById('pendingEmail');

    // ── Endpoints ──────────────────────────────────────────────────────────────

    // ── View helpers ───────────────────────────────────────────────────────────
    function hideAllViews() {
        loginView.style.display               = 'none';
        registerView.style.display            = 'none';
        forgotPasswordView.style.display      = 'none';
        verificationPendingView.style.display = 'none';
    }

    function showVerificationPending(email) {
        hideAllViews();
        pendingEmailEl.textContent = email;
        verificationPendingView.style.display = 'block';
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

    showLoginFromVerifyBtn.addEventListener('click', (e) => {
        e.preventDefault();
        hideAllViews();
        loginView.style.display = 'block';
    });

    // ── Button state helper ────────────────────────────────────────────────────
    function setButtonState(button, text, disabled = true) {
        button.disabled    = disabled;
        button.innerText   = text;
        button.style.opacity = disabled ? '0.8' : '1';
    }

    // ── Login ──────────────────────────────────────────────────────────────────
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        const originalText = loginBtn.innerText;
        setButtonState(loginBtn, 'Signing in…');

        try {
            const data = await postJson(ENDPOINTS.LOGIN, { email, password });
            window.location.href = '../../index.html';
        } catch (error) {
            // Check for the specific "unverified" error from backend
            try {
                const parsed = JSON.parse(error.message);
                if (parsed.error === 'unverified') {
                    showVerificationPending(parsed.email || email);
                    return;
                }
            } catch (_) { /* not JSON — fall through to generic alert */ }

            alert(error.message);
        } finally {
            setButtonState(loginBtn, originalText, false);
        }
    });

    // ── Register ───────────────────────────────────────────────────────────────
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name            = document.getElementById('regName').value.trim();
        const email           = document.getElementById('regEmail').value.trim();
        const password        = document.getElementById('regPassword').value;
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
        setButtonState(registerSubmitBtn, 'Creating account…');

        try {
            const data = await postJson(ENDPOINTS.REGISTER, { name, email, password });
            registerForm.reset();

            if (data.mailError) {
                // Account created but email failed — still show pending view with context
                alert(data.message);
                showVerificationPending(email);
            } else {
                // Normal success: show the "check your inbox" view
                showVerificationPending(email);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setButtonState(registerSubmitBtn, originalText, false);
        }
    });

    // ── Resend Verification ────────────────────────────────────────────────────
    resendVerificationBtn.addEventListener('click', async () => {
        const email = pendingEmailEl.textContent.trim();
        if (!email) {
            alert('No email address found. Please go back and try registering again.');
            return;
        }

        const originalText = resendVerificationBtn.innerText;
        setButtonState(resendVerificationBtn, 'Sending…');

        try {
            const data = await postJson(ENDPOINTS.RESEND_VERIFICATION, { email });
            alert(data.message || 'Verification email sent!');
        } catch (error) {
            alert(error.message);
        } finally {
            setButtonState(resendVerificationBtn, originalText, false);
        }
    });

    // ── Forgot Password ────────────────────────────────────────────────────────
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email           = document.getElementById('forgotEmail').value.trim();
        const newPassword     = document.getElementById('forgotNewPassword').value;
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
        setButtonState(forgotSubmitBtn, 'Resetting…');

        try {
            const data = await postJson(ENDPOINTS.FORGOT_PASSWORD, { email, newPassword, confirmPassword });
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
