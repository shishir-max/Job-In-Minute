/* UI Interactive Elements Target Selectors */
const authModal = document.getElementById('authModal');
const loginNavBtn = document.getElementById('loginNavBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');

// Test Log to verify file execution in your browser console
console.log("Job-In-Minute application script is successfully active and running!");

/* UI Core Modal Overlay Toggles Engine Configuration */
if (loginNavBtn && authModal) {
    loginNavBtn.addEventListener('click', () => {
        authModal.classList.add('open');
        authMessage.textContent = "";
    });
}

if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
        authModal.classList.remove('open');
    });
}

if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
    });

    tabSignup.addEventListener('click', () => {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        signupForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    });
}
