// Authentication JavaScript for Pattern Tracking System
const API_BASE = 'https://pattern-tracking-system.onrender.com';

// ─── Student Login ───────────────────────────────────────────────────────────
const studentLoginForm = document.getElementById('studentLoginForm');
if (studentLoginForm) {
    studentLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email    = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) { showError('Please fill in all fields'); return; }
        if (!isValidEmail(email)) { showError('Please enter a valid email address'); return; }

        const btn = this.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Signing in...</span>';

        const session = {
            role: 'student',
            email: email,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('userSession', JSON.stringify(session));

        btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Success!</span>';
        btn.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';

        setTimeout(() => { window.location.href = 'student-dashboard.html'; }, 800);
    });
}

// ─── Admin Login ─────────────────────────────────────────────────────────────
const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Read from username field (text input, not email)
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) { showError('Please fill in all fields'); return; }

        const btn = this.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Signing in...</span>';

        try {
            const response = await fetch(`${API_BASE}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                const session = {
                    role: 'admin',
                    username: username,
                    loginTime: new Date().toISOString()
                };
                localStorage.setItem('userSession', JSON.stringify(session));
                localStorage.setItem('adminAuthenticated', 'true');

                btn.innerHTML = '<i class="fas fa-check-circle"></i> <span>Success!</span>';
                btn.style.background = 'linear-gradient(135deg, #11998e, #38ef7d)';

                setTimeout(() => { window.location.href = 'admin-dashboard.html'; }, 800);
            } else {
                showError(data.error || 'Invalid credentials');
                btn.disabled = false;
                btn.innerHTML = '<span>Access Dashboard</span><i class="fas fa-sign-in-alt"></i>';
            }

        } catch (err) {
            showError('Cannot connect to server. Please try again in a moment.');
            btn.disabled = false;
            btn.innerHTML = '<span>Access Dashboard</span><i class="fas fa-sign-in-alt"></i>';
        }
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => errorDiv.classList.remove('show'), 3000);
    } else {
        alert(message);
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function checkSession() {
    const session = localStorage.getItem('userSession');
    if (session) {
        const sessionData = JSON.parse(session);
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage.includes('login')) {
            if (sessionData.role === 'student') window.location.href = 'student-dashboard.html';
            else if (sessionData.role === 'admin') window.location.href = 'admin-dashboard.html';
        }
    }
}

if (document.getElementById('studentLoginForm') || document.getElementById('adminLoginForm')) {
    checkSession();
}

document.querySelectorAll('input').forEach(input => {
    input.addEventListener('focus', function() { this.parentElement.style.transform = 'scale(1.01)'; });
    input.addEventListener('blur',  function() { this.parentElement.style.transform = 'scale(1)'; });
});