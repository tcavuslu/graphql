// Use localhost for development, Render for production
const isDevelopment = window.location.hostname === 'localhost';
export const API_BASE_URL = isDevelopment 
    ? 'http://localhost:8080' 
    : 'https://graphql-esp2.onrender.com';
export const AUTH_ENDPOINT = `${API_BASE_URL}/api/auth/signin`;
export const GRAPHQL_ENDPOINT = `${API_BASE_URL}/api/graphql`;