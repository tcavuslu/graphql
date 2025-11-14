// Profile page logic

import { logout } from './auth.js';
import { getAllProfileData } from './api.js';
import { createXPChart, createSkillsRadarChart } from './charts.js';

let isInitialized = false;

// Initialize profile page (called by router)
export async function initProfile() {
    // Prevent multiple initializations
    if (isInitialized) {
        return;
    }
    
    // Get DOM elements
    const logoutButton = document.getElementById('logoutButton');
    const retryButton = document.getElementById('retryButton');
    
    // Setup event listeners (only once)
    if (!isInitialized) {
        logoutButton?.addEventListener('click', logout);
        retryButton?.addEventListener('click', () => {
            isInitialized = false;
            initProfile();
        });
        isInitialized = true;
    }
    
    try {
        showLoading();
        
        // Fetch all profile data
        const profileData = await getAllProfileData();
        
        // Render profile data
        renderProfile(profileData);
        
        showContent();
    } catch (error) {
        console.error('Error initializing profile:', error);
        showError(error.message);
    }
}

// Render profile data to the page
function renderProfile(data) {
    // Get DOM elements
    const userLoginEl = document.getElementById('userLogin');
    const totalXPEl = document.getElementById('totalXP');
    const auditRatioEl = document.getElementById('auditRatio');
    
    // Render user info
    if (userLoginEl) userLoginEl.textContent = data.user?.login || 'Unknown';
    if (totalXPEl) totalXPEl.textContent = formatXP(data.totalXP);
    if (auditRatioEl) auditRatioEl.textContent = data.auditRatio || '0.0';
    
    // Create charts
    createXPChart(data.xpTransactions, 'xpChart');
    createSkillsRadarChart(data.skills, 'skillsChart');
}

// Show loading state
function showLoading() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const profileContent = document.getElementById('profileContent');
    
    loadingState?.classList.remove('hidden');
    errorState?.classList.add('hidden');
    profileContent?.classList.add('hidden');
}

// Show error state
function showError(message) {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const profileContent = document.getElementById('profileContent');
    const errorMessage = document.getElementById('profileErrorMessage');
    
    loadingState?.classList.add('hidden');
    errorState?.classList.remove('hidden');
    profileContent?.classList.add('hidden');
    if (errorMessage) errorMessage.textContent = message;
}

// Show profile content
function showContent() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const profileContent = document.getElementById('profileContent');
    
    loadingState?.classList.add('hidden');
    errorState?.classList.add('hidden');
    profileContent?.classList.remove('hidden');
}

// Format XP in MB without decimals
function formatXP(xp) {
    const mb = xp / 1000000;
    return mb.toFixed(2) + ' MB';
}
