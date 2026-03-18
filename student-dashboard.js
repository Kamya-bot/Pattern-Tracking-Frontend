// Student Dashboard JavaScript
// Additional functionality and utilities

// Check authentication
function checkAuth() {
    const session = localStorage.getItem('userSession');
    if (!session) {
        window.location.href = 'student-login.html';
        return false;
    }
    
    const sessionData = JSON.parse(session);
    if (sessionData.role !== 'student') {
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
console.log(`%c🎉 Welcome, ${session.email}!`, 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('%c✨ All your reports are anonymous and secure', 'color: #11998e; font-size: 14px;');
