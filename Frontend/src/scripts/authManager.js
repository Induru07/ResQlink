/**
 * Authentication Utility
 * Handles token storage, retrieval, and cleanup
 */

class AuthManager {
    constructor() {
        this.tokenKey = 'resqlink_token';
        this.userKey = 'resqlink_user';
        this.contributorIdKey = 'contributorId';
    }

    /**
     * Save token and user data
     */
    saveToken(token, user) {
        try {
            localStorage.setItem(this.tokenKey, token);
            localStorage.setItem(this.userKey, JSON.stringify(user));
            localStorage.setItem(this.contributorIdKey, user.contributorId);
        } catch (err) {
            console.error('Error saving token:', err);
        }
    }

    /**
     * Get token
     */
    getToken() {
        try {
            return localStorage.getItem(this.tokenKey);
        } catch (err) {
            console.error('Error getting token:', err);
            return null;
        }
    }

    /**
     * Get user data
     */
    getUser() {
        try {
            const user = localStorage.getItem(this.userKey);
            return user ? JSON.parse(user) : null;
        } catch (err) {
            console.error('Error getting user:', err);
            return null;
        }
    }

    /**
     * Get contributor ID
     */
    getContributorId() {
        try {
            return localStorage.getItem(this.contributorIdKey);
        } catch (err) {
            console.error('Error getting contributor ID:', err);
            return null;
        }
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.getToken() !== null && this.getUser() !== null;
    }

    /**
     * Clear all auth data (logout)
     */
    logout(redirectUrl) {
        try {
            const userRole = localStorage.getItem('userRole');
            
            // Clear all auth-related data
            localStorage.removeItem(this.tokenKey);
            localStorage.removeItem(this.userKey);
            localStorage.removeItem(this.contributorIdKey);
            localStorage.removeItem('token');
            localStorage.removeItem('victimId');
            localStorage.removeItem('contributorId');
            localStorage.removeItem('adminId');
            localStorage.removeItem('userRole');
            
            // Redirect to appropriate login page based on role
            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else if (userRole === 'contributor') {
                window.location.href = './contributorSignIn.html';
            } else if (userRole === 'admin') {
                window.location.href = './AdminPages/Dashboard%20login.html';
            } else if (userRole === 'victim') {
                window.location.href = './victimSignIn.html';
            } else {
                // Default to home page
                window.location.href = '../../index.html';
            }
        } catch (err) {
            console.error('Error logging out:', err);
            window.location.href = '../../index.html';
        }
    }

    /**
     * Get Authorization header
     */
    getAuthHeader() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Make authenticated fetch request
     */
    async fetchWithAuth(url, options = {}) {
        const authHeader = this.getAuthHeader();
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...authHeader,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            // If token expired (401), logout user
            if (response.status === 401) {
                console.warn('Token expired or invalid');
                this.logout();
                window.location.href = './contributorSignIn.html';
            }
            
            return response;
        } catch (err) {
            console.error('Fetch error:', err);
            throw err;
        }
    }
}

// Create global instance
const authManager = new AuthManager();

// Redirect to login if not authenticated (call on protected pages)
function requireAuth(redirectTo = './contributorSignIn.html') {
    if (!authManager.isLoggedIn()) {
        window.location.href = redirectTo;
    }
}

// Make authManager globally available
window.authManager = authManager;
window.requireAuth = requireAuth;

