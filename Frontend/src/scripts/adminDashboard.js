// Admin Dashboard JS - System Management with JWT Authentication
const API = window.API_BASE || 'http://localhost:5000';
let adminId = localStorage.getItem('adminId');
let token = localStorage.getItem('token');
let adminRole = localStorage.getItem('adminRole');

// Check authentication
if (!token) {
    window.location.href = '../pages/AdminPages/Dashboard%20login.html';
}

// Helper: Make authenticated fetch
async function adminAuthenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../pages/AdminPages/Dashboard%20login.html';
        return;
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
        localStorage.clear();
        alert('Your session has expired. Please sign in again.');
        window.location.href = '../pages/AdminPages/Dashboard%20login.html';
        return null;
    }

    return response;
}

// Load System Health
async function loadSystemHealth() {
    try {
        const res = await adminAuthenticatedFetch(`${API}/api/admin/system/health`, {
            method: 'POST'
        });
        if (!res) return;

        if (res.ok) {
            const data = await res.json();
            
            // Update CPU usage
            document.getElementById('cpu-usage').textContent = `${data.cpu.usage.toFixed(1)}%`;
            document.getElementById('cpu-progress').style.width = `${data.cpu.usage}%`;
            
            // Update Memory usage
            const memPercent = Math.min(parseFloat(data.memory.usagePercent), 100);
            document.getElementById('mem-usage').textContent = data.memory.used;
            document.getElementById('mem-progress').style.width = `${memPercent}%`;
            
            // Update Uptime
            document.getElementById('uptime').textContent = data.uptime.formatted;
        } else {
            console.error('Error loading system health');
        }
    } catch (err) {
        console.error('Error loading system health:', err);
    }
}

// Load System Logs
async function loadSystemLogs() {
    try {
        const res = await adminAuthenticatedFetch(`${API}/api/admin/system/logs?limit=50&level=info`, {
            method: 'POST'
        });
        if (!res) return;

        if (res.ok) {
            const data = await res.json();
            const logsContainer = document.getElementById('system-logs-container');
            
            if (!data.logs || data.logs.length === 0) {
                if (logsContainer) {
                    logsContainer.innerHTML = '<p class="text-muted">No logs available</p>';
                }
                return;
            }

            const html = data.logs.map(log => `
                <div class="log-entry mb-2" style="font-size: 0.85rem; padding: 8px; background: #111; border-left: 2px solid #666;">
                    <div class="d-flex justify-content-between">
                        <span class="text-muted">[${new Date(log.timestamp).toLocaleTimeString()}]</span>
                        <span class="badge bg-info">${log.level}</span>
                    </div>
                    <div>${log.message}</div>
                </div>
            `).join('');

            if (logsContainer) {
                logsContainer.innerHTML = html;
            }
        }
    } catch (err) {
        console.error('Error loading logs:', err);
    }
}

// Load Failed Login Attempts
async function loadFailedLogins() {
    try {
        const res = await adminAuthenticatedFetch(`${API}/api/admin/security/failed-logins`, {
            method: 'POST'
        });
        if (!res) return;

        if (res.ok) {
            const data = await res.json();
            const container = document.getElementById('failed-logins-container');
            
            if (!data.failedAttempts || data.failedAttempts.length === 0) {
                if (container) {
                    container.innerHTML = '<p class="text-muted">No failed login attempts</p>';
                }
                return;
            }

            const html = data.failedAttempts.map(attempt => `
                <div class="failed-attempt mb-2" style="padding: 10px; background: rgba(220, 53, 69, 0.1); border: 1px solid #dc3545; border-radius: 4px;">
                    <div class="d-flex justify-content-between align-items-center">
                        <span><strong>IP:</strong> ${attempt._id}</span>
                        <span class="badge bg-danger">${attempt.count} attempts</span>
                    </div>
                    <small class="text-muted d-block mt-1">Last: ${new Date(attempt.lastAttempt).toLocaleString()}</small>
                </div>
            `).join('');

            if (container) {
                container.innerHTML = html;
            }
        }
    } catch (err) {
        console.error('Error loading failed logins:', err);
    }
}

// Load Users
async function loadUsers(role = '') {
    try {
        const url = role ? `${API}/api/admin/users?role=${role}` : `${API}/api/admin/users`;
        const res = await adminAuthenticatedFetch(url, {
            method: 'POST'
        });
        if (!res) return;

        if (res.ok) {
            const data = await res.json();
            const container = document.getElementById('users-container');
            
            if (!data.users || data.users.length === 0) {
                if (container) {
                    container.innerHTML = '<p class="text-muted">No users found</p>';
                }
                return;
            }

            const html = data.users.slice(0, 20).map(user => `
                <tr>
                    <td><small>${user.userId}</small></td>
                    <td><small>${user.name || user.email}</small></td>
                    <td><small><span class="badge bg-secondary">${user.userType}</span></small></td>
                    <td><small><span class="badge ${user.status === 'active' ? 'bg-success' : 'bg-warning'}">${user.status || 'active'}</span></small></td>
                    <td>
                        <button class="btn btn-sm btn-action" onclick="updateUserStatus('${user._id}', '${user.userType}')">
                            <i class="fa-solid fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

            if (container) {
                container.innerHTML = `<table class="table table-dark table-sm">${html}</table>`;
            }
        }
    } catch (err) {
        console.error('Error loading users:', err);
    }
}

// Update User Status
async function updateUserStatus(userId, userType) {
    const newStatus = prompt('Enter new status (active, banned, suspended):');
    if (!newStatus) return;

    try {
        const res = await adminAuthenticatedFetch(`${API}/api/admin/users/${userId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus, userType: userType })
        });

        if (!res) return;

        if (res.ok) {
            alert(`User status updated to ${newStatus}`);
            loadUsers();
        } else {
            const error = await res.json();
            alert(`Error: ${error.error}`);
        }
    } catch (err) {
        console.error('Error updating user status:', err);
        alert('Failed to update user status');
    }
}

// Load Database Statistics
async function loadDatabaseStats() {
    try {
        const res = await adminAuthenticatedFetch(`${API}/api/admin/database/stats`, {
            method: 'POST'
        });
        if (!res) return;

        if (res.ok) {
            const data = await res.json();
            const container = document.getElementById('db-stats-container');
            
            if (!data.collections || data.collections.length === 0) {
                if (container) {
                    container.innerHTML = '<p class="text-muted">No database statistics</p>';
                }
                return;
            }

            const html = data.collections.map(collection => `
                <div class="db-stat mb-2" style="padding: 10px; background: #222; border-radius: 4px;">
                    <div class="d-flex justify-content-between">
                        <span class="text-neon"><strong>${collection.name}</strong></span>
                        <span class="badge bg-info">${collection.count} docs</span>
                    </div>
                    <small class="text-muted d-block">Size: ${collection.size} | Avg: ${collection.avgObjSize}</small>
                </div>
            `).join('');

            if (container) {
                container.innerHTML = html;
            }
        }
    } catch (err) {
        console.error('Error loading database stats:', err);
    }
}

// Block IP Address
async function blockIPAddress() {
    const ipAddress = prompt('Enter IP address to block:');
    if (!ipAddress) return;

    try {
        const res = await adminAuthenticatedFetch(`${API}/api/admin/security/block-ip`, {
            method: 'POST',
            body: JSON.stringify({ ipAddress })
        });

        if (!res) return;

        if (res.ok) {
            alert(`IP ${ipAddress} has been blocked`);
            loadFailedLogins();
        } else {
            const error = await res.json();
            alert(`Error: ${error.error}`);
        }
    } catch (err) {
        console.error('Error blocking IP:', err);
        alert('Failed to block IP address');
    }
}

// Show section
function showSection(sectionName, element) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });

    // Show selected section
    const sectionElement = document.getElementById(`section-${sectionName}`);
    if (sectionElement) {
        sectionElement.classList.add('active');
    }

    // Add active class to clicked link
    if (element) {
        element.classList.add('active');
    }

    // Load data for the selected section
    if (sectionName === 'health') {
        loadSystemHealth();
    } else if (sectionName === 'db-logs') {
        loadSystemLogs();
    } else if (sectionName === 'security') {
        loadFailedLogins();
        loadUsers();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSystemHealth();
    
    // Refresh health stats every 30 seconds
    setInterval(loadSystemHealth, 30000);
});


// Logout function
function logout() {
    if (confirm('Are you sure you want to logout this admin session?')) {
        localStorage.clear();
        alert('You have been logged out.');
        window.location.href = '../pages/AdminPages/Dashboard%20login.html';
    }
}
