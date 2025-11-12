// Profile page logic

import { logout } from './auth.js';
import { getAllProfileData, testAPI } from './api.js';
import { createXPChart, createSkillsRadarChart } from './charts.js';

// Make testAPI available in console
window.testAPI = testAPI;

let isInitialized = false;

/**
 * Initialize profile page (called by router)
 */
export async function initProfile() {
    // Prevent multiple initializations
    if (isInitialized) {
        return;
    }
    
    // Get DOM elements
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const profileContent = document.getElementById('profileContent');
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
        
        // Debug logging
        console.log('📊 Profile Data:', profileData);
        console.log('💰 Total XP:', profileData.totalXP);
        console.log('🎯 Skills:', profileData.skills);
        
        // Render profile data
        renderProfile(profileData);
        
        showContent();
    } catch (error) {
        console.error('Error initializing profile:', error);
        showError(error.message);
    }
}

/**
 * Render profile data to the page
 * @param {object} data - Profile data
 */
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

/**
 * Show loading state
 */
function showLoading() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const profileContent = document.getElementById('profileContent');
    
    loadingState?.classList.remove('hidden');
    errorState?.classList.add('hidden');
    profileContent?.classList.add('hidden');
}

/**
 * Show error state
 * @param {string} message - Error message
 */
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

/**
 * Show profile content
 */
function showContent() {
    const loadingState = document.getElementById('loadingState');
    const errorState = document.getElementById('errorState');
    const profileContent = document.getElementById('profileContent');
    
    loadingState?.classList.add('hidden');
    errorState?.classList.add('hidden');
    profileContent?.classList.remove('hidden');
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format XP in MB without decimals (e.g., 1270000 -> "1.27 MB")
 * @param {number} xp - XP amount
 * @returns {string} Formatted XP string
 */
function formatXP(xp) {
    const mb = xp / 1000000;
    return mb.toFixed(2) + ' MB';
}

