document.addEventListener('DOMContentLoaded', () => {
    const login_form = document.getElementById('loginForm');
    const register_link = document.getElementById('registerLink');
    const login_btn = document.getElementById('loginBtn');

    login_form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        // subtle loading state to the button
        const original_text = login_btn.innerText;
        login_btn.innerText = 'Signing in...';
        login_btn.style.opacity = '0.8';

        // API call for authentication
        setTimeout(() => {
            console.log(`Authenticating user: ${email}`);
            
            // On successful login, redirect to the main app dashboard (index.html)
            window.location.href = 'index.html'; // testing
            
            // Reset button state just in case we don't redirect right away
            login_btn.innerText = original_text;
            login_btn.style.opacity = '1';
        }, 800);
    });

    // Handle Registration (Stubbed as per instructions)
    register_link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // TODO: Implement Registration Logic here
        // This could either:
        // 1. Show a registration modal
        // 2. Flip the login card to a register card seamlessly
        // 3. Redirect to a register.html page
        
        console.log('User intends to register. Registration module needs to be implemented.');
        alert('Registration feature coming soon! Code stub added in login.js.');
    });
});
