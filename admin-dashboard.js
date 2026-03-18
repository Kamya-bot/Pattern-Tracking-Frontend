// Admin Dashboard JavaScript
// Additional functionality and utilities

// Check authentication
function checkAuth() {
    const session = localStorage.getItem('userSession');
    if (!session) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    const sessionData = JSON.parse(session);
    if (sessionData.role !== 'admin') {
        window.location.href = 'index.html';
        return false;
    }
    
    return true;
}

// Run auth check on page load
if (!checkAuth()) {
    throw new Error('Unauthorized access');
}

// Welcome message
const session = JSON.parse(localStorage.getItem('userSession'));
console.log(`%c🔐 Admin Dashboard - ${session.email}`, 'color: #FA709A; font-size: 16px; font-weight: bold;');
console.log('%c📊 Access granted to analytics and reporting tools', 'color: #FEE140; font-size: 14px;');
console.log('%c🎨 Charts are interactive - hover for details!', 'color: #4facfe; font-size: 14px;');
