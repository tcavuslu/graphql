// Login form module
import { login } from './auth.js';
import { navigate } from './router.js';

// Initialize login form
export function initLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    // Remove any existing listeners by cloning the form
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    // Reset button state to ensure it's not stuck in loading state
    const loginButton = newForm.querySelector('#loginButton');
    const loginButtonText = newForm.querySelector('#loginButtonText');
    const loginSpinner = newForm.querySelector('#loginSpinner');
    
    if (loginButton && loginButtonText && loginSpinner) {
        loginButton.disabled = false;
        loginButtonText.classList.remove('hidden');
        loginSpinner.classList.add('hidden');
    }
    
    // Add submit event listener
    newForm.addEventListener('submit', handleLoginSubmit);
}

// Handle login form submission
async function handleLoginSubmit(e) {
    e.preventDefault();
    
    const identifier = document.getElementById('identifier').value.trim();
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    const loginButton = document.getElementById('loginButton');
    const loginButtonText = document.getElementById('loginButtonText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Hide error message
    errorMessage.classList.add('hidden');
    
    // Show loading state
    loginButton.disabled = true;
    loginButtonText.classList.add('hidden');
    loginSpinner.classList.remove('hidden');
    
    try {
        await login(identifier, password);
        // Navigate to profile on success
        navigate('profile');
    } catch (error) {
        // Show error message
        errorText.textContent = error.message || 'Invalid credentials. Please try again.';
        errorMessage.classList.remove('hidden');
        
        // Reset button state
        loginButton.disabled = false;
        loginButtonText.classList.remove('hidden');
        loginSpinner.classList.add('hidden');
    }
}

