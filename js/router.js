// Client-side router for Single Page Application
import { isAuthenticated } from './auth.js';

const routes = {
    'login': {
        view: 'login',
        requiresAuth: false
    },
    'profile': {
        view: 'profile',
        requiresAuth: true
    }
};

// Initialize router
export function init() {
    // Listen for hash changes
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('load', handleRoute);
    
    // Handle initial route
    handleRoute();
}

// Navigate to a specific route
export function navigate(route) {
    window.location.hash = route;
}

// Handle current route
function handleRoute() {
    // Get current hash (remove #)
    let hash = window.location.hash.slice(1) || 'login';
    
    // Check if route exists
    if (!routes[hash]) {
        hash = 'login';
    }
    
    const route = routes[hash];
    
    // Check authentication
    if (route.requiresAuth && !isAuthenticated()) {
        // Redirect to login if not authenticated
        navigate('login');
        return;
    }
    
    // If on login page and already authenticated, go to profile
    if (hash === 'login' && isAuthenticated()) {
        navigate('profile');
        return;
    }
    
    // Show the correct view
    showView(route.view);
}

// Show specific view and hide others
function showView(viewName) {
    // Hide all views
    const allViews = document.querySelectorAll('[data-view]');
    allViews.forEach(view => {
        view.classList.add('hidden');
    });
    
    // Show selected view
    const selectedView = document.querySelector(`[data-view="${viewName}"]`);
    if (selectedView) {
        selectedView.classList.remove('hidden');
        
        // Initialize view-specific logic
        initializeView(viewName);
    }
}

// Initialize view-specific functionality
async function initializeView(viewName) {
    if (viewName === 'login') {
        // Dynamically import and initialize login
        const { initLogin } = await import('./login.js');
        initLogin();
    }
    
    if (viewName === 'profile') {
        // Dynamically import and initialize profile
        const { initProfile } = await import('./profile.js');
        initProfile();
    }
}

// Get current route
export function getCurrentRoute() {
    return window.location.hash.slice(1) || 'login';
}

