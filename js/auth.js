// Authentication module for handling login, logout, and JWT management

const API_BASE_URL = 'http://localhost:8080';
const AUTH_ENDPOINT = `${API_BASE_URL}/api/auth/signin`;

/**
 * Login function that authenticates user with username/email and password
 * @param {string} identifier - Username or email
 * @param {string} password - User password
 * @returns {Promise<string>} JWT token
 */
export async function login(identifier, password) {
    try {
        // Create Base64 encoded credentials
        const credentials = btoa(`${identifier}:${password}`);
        
        // Make POST request to signin endpoint
        const response = await fetch(AUTH_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid username/email or password');
            }
            throw new Error(`Authentication failed: ${response.statusText}`);
        }
        
        // Get JWT token from response
        const data = await response.json();
        const token = data.token || data;
        
        if (!token) {
            throw new Error('No token received from server');
        }
        
        // Store JWT in localStorage
        localStorage.setItem('jwt_token', token);
        
        // Decode and store user ID for quick access
        const userId = getUserIdFromToken(token);
        if (userId) {
            localStorage.setItem('user_id', userId);
        }
        
        return token;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Logout function that clears stored credentials and navigates to login
 */
export function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    // Use hash navigation instead of page reload
    window.location.hash = 'login';
}

/**
 * Get stored JWT token
 * @returns {string|null} JWT token or null if not found
 */
export function getToken() {
    return localStorage.getItem('jwt_token');
}

/**
 * Get stored user ID
 * @returns {string|null} User ID or null if not found
 */
export function getUserId() {
    return localStorage.getItem('user_id');
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if valid token exists
 */
export function isAuthenticated() {
    const token = getToken();
    if (!token) return false;
    
    try {
        // Decode JWT and check expiration
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp;
        
        // Check if token is expired
        if (exp && Date.now() >= exp * 1000) {
            logout();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

/**
 * Decode JWT token to extract user ID
 * @param {string} token - JWT token
 * @returns {string|null} User ID or null if extraction fails
 */
function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.userId || payload.id || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}

/**
 * Check if user is authenticated (used by router)
 * Router handles the redirect, this just checks
 */
export function requireAuth() {
    return isAuthenticated();
}

