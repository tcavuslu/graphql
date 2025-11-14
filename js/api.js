// GraphQL API module for querying Zone01 data

import { getToken, logout } from './auth.js';
import { queries } from './queries.js';
import { API_BASE_URL, GRAPHQL_ENDPOINT } from './config.js';

/**
 * Generic GraphQL query function
 * @param {string} query - GraphQL query string
 * @param {object} variables - Query variables
 * @returns {Promise<object>} Query result data
 */
export async function graphqlQuery(query, variables = {}) {
    const token = getToken();
    
    if (!token) {
        throw new Error('No authentication token found');
    }
    
    try {
        const response = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                query,
                variables
            })
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                throw new Error('Authentication expired. Please login again.');
            }
            throw new Error(`GraphQL request failed: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.errors) {
            console.error('GraphQL errors:', result.errors);
            throw new Error(result.errors[0]?.message || 'GraphQL query failed');
        }
        
        return result.data;
    } catch (error) {
        console.error('GraphQL query error:', error);
        throw error;
    }
}

/**
 * Get basic user information
 * @returns {Promise<object>} User data
 */
export async function getUserInfo() {
    const data = await graphqlQuery(queries.getUserInfo);
    const user = data.user[0] || data.user;
    
    // Extract email from attrs if it exists
    return {
        id: user.id,
        login: user.login,
        email: user.attrs?.email || user.login
    };
}

/**
 * Get all XP transactions for the user
 * @returns {Promise<Array>} Array of XP transactions
 */
export async function getXPTransactions() {
    const data = await graphqlQuery(queries.getXPTransactions);
    return data.transaction || [];
}

/**
 * Get total XP - excludes piscine exercises but includes final piscine rewards
 * @returns {Promise<number>} Total XP amount
 */
export async function getTotalXP() {
    const transactions = await getXPTransactions();
    
    // Filter logic: Exclude piscine exercises (piscine-go, piscine-js, piscine-ux in path)
    // BUT keep final piscine rewards (where object type is "piscine", "module", "raid", or "project")
    const filteredTransactions = transactions.filter(t => {
        const path = t.path?.toLowerCase() || '';
        const objectType = t.object?.type?.toLowerCase() || '';
        
        // If path contains piscine-go, piscine-js, or piscine-ux
        if (path.includes('piscine-go') || path.includes('piscine-js') || path.includes('piscine-ux')) {
            // Exclude only if it's an exercise (keep piscine/module/raid/project rewards)
            return objectType !== 'exercise';
        }
        
        // Keep all other transactions
        return true;
    });
    
    const total = filteredTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    console.log('💰 Total XP (excluding piscine exercises):', total);
    console.log('📊 Filtered XP transactions:', filteredTransactions.length, '/', transactions.length);
    return total;
}

/**
 * Get user progress data
 * @returns {Promise<Array>} Array of progress entries
 */
export async function getProgressData() {
    const data = await graphqlQuery(queries.getProgress);
    return data.progress || [];
}

/**
 * Get audit ratio data
 * @returns {Promise<object>} Audit statistics
 */
export async function getAuditRatio() {
    const data = await graphqlQuery(queries.getAuditTransactions);
    const transactions = data.transaction || [];
    
    let totalUp = 0;
    let totalDown = 0;
    
    // Calculate from transactions (up = audits given, down = audits received)
    transactions.forEach(t => {
        if (t.type === 'up') {
            totalUp += t.amount;
        } else if (t.type === 'down') {
            totalDown += t.amount;
        }
    });
    
    // Calculate audit ratio (1 decimal place)
    const auditRatio = totalDown > 0 ? (totalUp / totalDown).toFixed(1) : '0.0';
    
    return {
        auditRatio,
        totalUp,
        totalDown
    };
}

/**
 * Get skills data from skill transactions
 * @returns {Promise<Array>} Array of 7 skills with proficiency (0-100)
 */
export async function getSkillsData() {
    try {
        const data = await graphqlQuery(queries.getSkillTransactions);
        const transactions = data.transaction || [];
        
        console.log('🎯 All skill transactions:', transactions);
        
        // Map skill types to display names
        const skillMapping = {
            'skill_go': 'Go',
            'skill_js': 'JavaScript',
            'skill_algo': 'Algorithm',
            'skill_prog': 'Programming',  
            'skill_front-end': 'Frontend',
            'skill_back-end': 'Backend',
            'skill_git': 'Git',
            'skill_docker': 'Docker'
        };
        
        // Get max value for each skill type (cumulative, so max = current level)
        const skillValues = new Map();
        
        transactions.forEach(t => {
            const displayName = skillMapping[t.type];
            if (displayName) {
                const currentMax = skillValues.get(displayName) || 0;
                if (t.amount > currentMax) {
                    skillValues.set(displayName, t.amount);
                }
            }
        });
        
        console.log('🔍 Max skill values:', Object.fromEntries(skillValues));
        
        // Create array with our 7 target skills
        const targetSkills = ['Frontend', 'Programming', 'Backend', 'Go', 'JavaScript', 'Git', 'Docker', 'Algorithm'];
        const skills = targetSkills.map(name => ({
            name,
            value: skillValues.get(name) || 0
        }));
        
        console.log('📊 Final skills:', skills);
        return skills;
    } catch (error) {
        console.error('Error fetching skills:', error);
        return [
            { name: 'Frontend', value: 0 },
            { name: 'Programming', value: 0 },
            { name: 'Backend', value: 0 },
            { name: 'Go', value: 0 },
            { name: 'JavaScript', value: 0 },
            { name: 'Git', value: 0 },
            { name: 'Docker', value: 0 },
            { name: 'Algorithm', value: 0 },
        ];
    }
}


/**
 * Debug function - test queries in browser console
 * Usage: window.testAPI()
 */
export async function testAPI() {
    console.log('=== TESTING API ===');
    
    // Test 1: Get XP transactions
    console.log('\n1. Testing XP Transactions:');
    const xpTrans = await getXPTransactions();
    console.log('   Count:', xpTrans.length);
    console.log('   First 5 FULL transactions:', xpTrans.slice(0, 5));
    
    // Analyze path patterns
    const pathPatterns = new Map();
    xpTrans.forEach(t => {
        const parts = t.path?.split('/') || [];
        const category = parts[2] || 'unknown'; // e.g., "piscine-go", "div-01", etc.
        if (!pathPatterns.has(category)) {
            pathPatterns.set(category, { count: 0, sum: 0, samples: [] });
        }
        const data = pathPatterns.get(category);
        data.count++;
        data.sum += t.amount || 0;
        if (data.samples.length < 2) {
            data.samples.push({ path: t.path, amount: t.amount });
        }
    });
    
    console.log('\n   XP by category:');
    pathPatterns.forEach((data, category) => {
        console.log(`   ${category}:`, {
            count: data.count,
            totalXP: data.sum,
            samples: data.samples
        });
    });
    
    // Different filter attempts
    const filters = {
        'includes_piscine': xpTrans.filter(t => t.path?.includes('piscine')),
        'starts_with_piscine': xpTrans.filter(t => t.path?.split('/')[2]?.startsWith('piscine')),
        'div_only': xpTrans.filter(t => t.path?.includes('/div-')),
    };
    
    console.log('\n   Filter comparisons:');
    Object.entries(filters).forEach(([name, filtered]) => {
        const sum = filtered.reduce((s, t) => s + (t.amount || 0), 0);
        console.log(`   ${name}: ${filtered.length} transactions, ${sum} XP`);
    });
    
    // Test 2: Get progress
    console.log('\n2. Testing Progress:');
    const progress = await getProgressData();
    console.log('   Total progress entries:', progress.length);
    const passed = progress.filter(p => p.grade >= 1);
    console.log('   Passed projects:', passed.length);
    console.log('   First 5 passed:', passed.slice(0, 5).map(p => ({
        name: p.object?.name,
        path: p.path,
        grade: p.grade
    })));
    
    // Test 3: RAW Progress Data Structure
    console.log('\n3. Testing Progress Data Structure:');
    const progressData = await graphqlQuery(queries.getCompletedProgress);
    const allProgress = progressData.progress || [];
    console.log('   Total progress entries:', allProgress.length);
    
    // Show first 3 full progress objects to see ALL fields
    console.log('\n   First 3 progress objects (FULL DATA):');
    allProgress.slice(0, 3).forEach((p, i) => {
        console.log(`   Progress ${i + 1}:`, JSON.stringify(p, null, 2));
    });
    
    // Test 4: Check if there's a user query with skill percentages
    console.log('\n4. Testing User Query:');
    try {
        const userData = await graphqlQuery(`
            query {
                user {
                    id
                    login
                    attrs
                }
            }
        `);
        console.log('   User data:', userData);
        console.log('   User attrs:', userData.user[0]?.attrs || userData.user?.attrs);
    } catch (e) {
        console.log('   Error fetching user:', e);
    }
    
    // Test 5: Check transaction table for skills
    console.log('\n5. Testing Transaction Types:');
    try {
        const allTransactions = await graphqlQuery(`
            query {
                transaction(limit: 100) {
                    type
                    amount
                    path
                    object {
                        name
                        type
                        attrs
                    }
                }
            }
        `);
        const types = [...new Set(allTransactions.transaction.map(t => t.type))];
        console.log('   Transaction types found:', types);
        
        // Show samples of each type
        types.forEach(type => {
            const sample = allTransactions.transaction.find(t => t.type === type);
            console.log(`   Sample ${type}:`, sample);
        });
    } catch (e) {
        console.log('   Error fetching transactions:', e);
    }
    
    return {
        xpTransactions: xpTrans.length,
        totalXP: manualSum,
        progressCount: progress.length,
        passedProjects: passed.length,
        skillCounts: counts
    };
}

// Make it available in browser console
if (typeof window !== 'undefined') {
    window.testAPI = testAPI;
}

/**
 * Fetch all profile data in parallel
 * @returns {Promise<object>} All profile data
 */
export async function getAllProfileData() {
    try {
        const [user, xpTransactions, totalXP, auditData, skillsData] = await Promise.all([
            getUserInfo(),
            getXPTransactions(),
            getTotalXP(),
            getAuditRatio(),
            getSkillsData()
        ]);
        
        return {
            user,
            xpTransactions,
            totalXP,
            auditRatio: auditData.auditRatio,
            skills: skillsData
        };
    } catch (error) {
        console.error('Error fetching profile data:', error);
        throw error;
    }
}

