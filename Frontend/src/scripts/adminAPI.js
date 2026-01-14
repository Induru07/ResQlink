// Admin API Service
// This file handles all API calls for admin panels (DEV, GOV, DS, GN)

// Use the global API_BASE if available, otherwise fallback to Render
const API_BASE_URL = (window.API_BASE || 'https://resqlink-ovm6.onrender.com') + '/api';

class AdminAPI {
    constructor() {
        this.adminSession = null;
        this.loadSession();
        console.log('Admin API initialized with base URL:', API_BASE_URL);
    }

    // Load admin session from localStorage
    loadSession() {
        const session = localStorage.getItem('adminSession');
        if (session) {
            this.adminSession = JSON.parse(session);
        }
    }

    // Save admin session
    saveSession(session) {
        this.adminSession = session;
        localStorage.setItem('adminSession', JSON.stringify(session));
    }

    // Clear session
    clearSession() {
        this.adminSession = null;
        localStorage.removeItem('adminSession');
    }

    // ============ AUTHENTICATION ============

    async login(email, password, role) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, role })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            this.saveSession(data.admin);
            return data;

        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return data;

        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    // ============ SYSTEM HEALTH & MONITORING ============

    async getSystemHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/system/health`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminId: this.adminSession?.id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch system health');
            }

            return data;

        } catch (error) {
            console.error('System health error:', error);
            throw error;
        }
    }

    async getSystemLogs(limit = 50, level = null) {
        try {
            const params = new URLSearchParams({ limit });
            if (level) params.append('level', level);

            const response = await fetch(`${API_BASE_URL}/admin/system/logs?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminId: this.adminSession?.id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch system logs');
            }

            return data;

        } catch (error) {
            console.error('System logs error:', error);
            throw error;
        }
    }

    // ============ USER MANAGEMENT ============

    async getAllUsers(role = null, status = null, limit = 100) {
        try {
            const params = new URLSearchParams({ limit });
            if (role) params.append('role', role);
            if (status) params.append('status', status);

            const response = await fetch(`${API_BASE_URL}/admin/users?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminId: this.adminSession?.id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch users');
            }

            return data;

        } catch (error) {
            console.error('Get users error:', error);
            throw error;
        }
    }

    async updateUserStatus(userId, userType, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    userType, 
                    status,
                    adminId: this.adminSession?.id 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user status');
            }

            return data;

        } catch (error) {
            console.error('Update user status error:', error);
            throw error;
        }
    }

    // ============ SECURITY MONITORING ============

    async getSecurityLogs(hours = 1, eventType = null) {
        try {
            const params = new URLSearchParams({ hours });
            if (eventType) params.append('eventType', eventType);

            const response = await fetch(`${API_BASE_URL}/admin/security/logs?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminId: this.adminSession?.id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch security logs');
            }

            return data;

        } catch (error) {
            console.error('Security logs error:', error);
            throw error;
        }
    }

    async getFailedLogins() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/security/failed-logins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminId: this.adminSession?.id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch failed logins');
            }

            return data;

        } catch (error) {
            console.error('Failed logins error:', error);
            throw error;
        }
    }

    async blockIP(ipAddress) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/security/block-ip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    ipAddress,
                    adminId: this.adminSession?.id 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to block IP');
            }

            return data;

        } catch (error) {
            console.error('Block IP error:', error);
            throw error;
        }
    }

    // ============ DATABASE OPERATIONS ============

    async getDatabaseStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/database/stats`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ adminId: this.adminSession?.id })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch database stats');
            }

            return data;

        } catch (error) {
            console.error('Database stats error:', error);
            throw error;
        }
    }
}

// Create singleton instance
const adminAPI = new AdminAPI();

// Make it globally available
window.adminAPI = adminAPI;

console.log('AdminAPI initialized:', adminAPI);
