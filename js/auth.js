// Authentication module for handling login, logout, and JWT management

import { API_BASE_URL, AUTH_ENDPOINT } from './config.js';

// Login function that authenticates user with username/email and password
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

// Logout function that clears stored credentials and navigates to login
export function logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_id');
    // Use hash navigation instead of page reload
    window.location.hash = 'login';
}

// Get stored JWT token
export function getToken() {
    return localStorage.getItem('jwt_token');
}

// Check if user is authenticated
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

// Decode JWT token to extract user ID
function getUserIdFromToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.userId || payload.id || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}
