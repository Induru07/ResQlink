// Victim Dashboard JS - Integrated with JWT Authentication
const API = window.API_BASE || 'http://localhost:5000';
let victimId = localStorage.getItem('victimId');
let token = localStorage.getItem('token');

// Check authentication
if (!victimId || !token) {
    if (!localStorage.getItem('victimId')) {
        alert('Please sign in first');
    }
    window.location.href = 'victimSignIn.html';
}

// Helper: Make authenticated fetch
async function authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'victimSignIn.html';
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
        window.location.href = 'victimSignIn.html';
        return null;
    }

    return response;
}

// Show alert message
function showAlert(msg, type) {
    const alert = document.getElementById('alert');
    if (alert) {
        alert.textContent = msg;
        alert.className = `alert ${type}`;
        alert.style.display = 'block';
        setTimeout(() => alert.style.display = 'none', 5000);
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadNeeds();
    
    // Setup tab switching
    setupTabSwitching();
    
    // Setup form submission
    setupFormSubmission();
});

// Programmatic tab switching function
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (selectedTab && tabBtn) {
        selectedTab.classList.add('active');
        tabBtn.classList.add('active');
        
        // Load data for requests and status when tabs are clicked
        if (tabName === 'requests') {
            loadRequests();
        } else if (tabName === 'status') {
            loadStatus();
        }
    }
}

// Setup tab switching
function setupTabSwitching() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

// Load existing needs
async function loadNeeds() {
    try {
        const res = await authenticatedFetch(`${API}/api/needs/${victimId}`);
        if (!res) return;

        if (res.ok) {
            const { data } = await res.json();
            const needs = data;
            
            // Set checkboxes for items
            if (needs.items) {
                Object.keys(needs.items).forEach(key => {
                    const checkbox = document.getElementById(key);
                    if (checkbox) checkbox.checked = needs.items[key] || false;
                });
            }

            // Set special conditions
            if (needs.specialConditions) {
                Object.keys(needs.specialConditions).forEach(key => {
                    const checkbox = document.getElementById(key);
                    if (checkbox) checkbox.checked = needs.specialConditions[key] || false;
                });
            }

            // Set description
            const descField = document.getElementById('description');
            if (descField && needs.description) {
                descField.value = needs.description;
            }

            // Show status with action button
            const statusElement = document.getElementById('current-status');
            if (statusElement && needs.status) {
                const statusBadge = `<span class="status-badge status-${needs.status}">${needs.status.toUpperCase()}</span>
                    <button style="margin-left: 10px; padding: 5px 12px; background: #667eea; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; text-decoration: none;" onclick="switchTab('requests')">
                        📋 View Request
                    </button>`;
                statusElement.innerHTML = statusBadge;
            }

            // Show urgency if available
            if (needs.urgency) {
                const urgencyText = document.createElement('span');
                urgencyText.style.marginLeft = '10px';
                urgencyText.style.fontSize = '14px';
                urgencyText.style.color = '#666';
                urgencyText.textContent = `(${needs.urgency} priority)`;
                if (statusElement) {
                    statusElement.appendChild(urgencyText);
                }
            }
        } else {
            const error = await res.json();
            console.error('Error loading needs:', error.error);
        }
    } catch (err) {
        console.error('Error loading needs:', err);
    }
}

// Load requests (list of submitted needs)
async function loadRequests() {
    try {
        const res = await authenticatedFetch(`${API}/api/needs/${victimId}`);
        if (!res) return;

        if (res.ok) {
            const result = await res.json();
            const needs = result.data;

            if (!needs) {
                document.getElementById('requests-list').innerHTML = 
                    '<div class="empty-state">📋 No requests yet. Submit your needs to get started!</div>';
                return;
            }

            // Determine urgency color class
            let urgencyClass = 'moderate';
            if (needs.isEmergency || needs.urgency === 'critical') {
                urgencyClass = 'critical';
            } else if (needs.urgency === 'high') {
                urgencyClass = 'high';
            }

            // Build request items display
            const requestHtml = `
                <div class="request-item ${urgencyClass}" style="position: relative; padding-bottom: 60px;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin-top: 0;">Relief Request</h4>
                            <p><strong>Status:</strong> <span class="status-badge status-${needs.status}">${needs.status.toUpperCase()}</span></p>
                            <p><strong>Priority:</strong> ${needs.isEmergency ? '🚨 EMERGENCY' : needs.urgency ? needs.urgency.toUpperCase() : 'MODERATE'}</p>
                        </div>
                    </div>

                    <p><strong>📦 Items Needed:</strong></p>
                    ${Object.entries(needs.items || {}).filter(([, value]) => value).length > 0 ? `
                    <ul style="margin: 8px 0; padding-left: 20px; color: #555;">
                        ${Object.entries(needs.items || {})
                            .filter(([, value]) => value)
                            .map(([key]) => `<li>${key.replace(/([A-Z])/g, ' $1').trim()}</li>`)
                            .join('')}
                    </ul>
                    ` : '<p style="color: #999; margin: 8px 0;"><em>No items selected</em></p>'}

                    ${needs.specialConditions && Object.values(needs.specialConditions).some(v => v) ? `
                    <p><strong>⚕️ Special Conditions:</strong></p>
                    <ul style="margin: 8px 0; padding-left: 20px; color: #555;">
                        ${Object.entries(needs.specialConditions)
                            .filter(([, value]) => value)
                            .map(([key]) => `<li>${key.replace(/([A-Z])/g, ' $1').trim()}</li>`)
                            .join('')}
                    </ul>
                    ` : ''}

                    ${needs.description ? `<p><strong>📝 Additional Details:</strong> ${needs.description}</p>` : ''}

                    <p style="font-size: 12px; color: #999; margin-top: 12px;"><strong>📅 Submitted:</strong> ${new Date(needs.createdAt).toLocaleDateString()} at ${new Date(needs.createdAt).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                    ${needs.lastUpdated && needs.lastUpdated !== needs.createdAt ? `
                    <p style="font-size: 12px; color: #999;"><strong>🔄 Last Updated:</strong> ${new Date(needs.lastUpdated).toLocaleDateString()} at ${new Date(needs.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                    ` : ''}
                    
                    ${needs.isEmergency ? '<p style="color: #dc3545; font-weight: bold; margin-top: 12px;">⚠️ EMERGENCY STATUS - Priority Response Activated</p>' : ''}

                    <div style="position: absolute; bottom: 15px; left: 15px; right: 15px; display: flex; gap: 10px;">
                        <button class="btn" style="flex: 1; background: #667eea; padding: 10px 15px; font-size: 13px;" onclick="switchTab('needs')">✏️ Edit Request</button>
                        <button class="btn" style="flex: 1; background: #28a745; padding: 10px 15px; font-size: 13px;" onclick="switchTab('status')">📊 View Status</button>
                    </div>
                </div>
            `;

            document.getElementById('requests-list').innerHTML = requestHtml;
        } else {
            document.getElementById('requests-list').innerHTML = 
                '<div class="empty-state">📋 No requests yet. Submit your needs to get started!</div>';
        }
    } catch (err) {
        console.error('Error loading requests:', err);
        document.getElementById('requests-list').innerHTML = 
            '<div class="empty-state">❌ Unable to load requests</div>';
    }
}

// Load status updates
async function loadStatus() {
    try {
        const res = await authenticatedFetch(`${API}/api/needs/${victimId}`);
        if (!res) return;

        if (res.ok) {
            const result = await res.json();
            const needs = result.data;

            if (!needs) {
                document.getElementById('status-list').innerHTML = 
                    '<div class="empty-state">📊 No status updates yet. Check back soon!</div>';
                return;
            }

            // Build status timeline
            const statusUpdates = [];
            
            // Add creation status
            statusUpdates.push({
                title: 'Request Created',
                message: `Your relief request was submitted${needs.isEmergency ? ' as EMERGENCY' : ''}`,
                date: needs.createdAt,
                type: needs.isEmergency ? 'critical' : 'pending',
                icon: '📋'
            });

            // Add current status
            if (needs.status !== 'created') {
                const statusMessages = {
                    'received': 'Your request has been received by administrators',
                    'in-process': 'Your request is being processed. Help is being arranged.',
                    'in-distribution': 'Relief items are being distributed to you',
                    'completed': 'Your request has been fulfilled',
                    'resolved': 'Your request has been resolved',
                    'pending': 'Your request is pending review'
                };

                const statusIcons = {
                    'received': '✅',
                    'in-process': '⚙️',
                    'in-distribution': '🚚',
                    'completed': '🎉',
                    'resolved': '✨',
                    'pending': '⏳'
                };

                statusUpdates.push({
                    title: `Status: ${needs.status.toUpperCase()}`,
                    message: statusMessages[needs.status] || `Your request status is ${needs.status}`,
                    date: needs.updatedAt,
                    type: needs.status,
                    icon: statusIcons[needs.status] || '📌'
                });
            }

            // Add responded by info if available
            if (needs.respondedBy) {
                statusUpdates.push({
                    title: 'Response Received',
                    message: `Responded by: ${needs.respondedBy}`,
                    date: needs.responseDate || needs.updatedAt,
                    type: 'success',
                    icon: '📞'
                });
            }

            const html = statusUpdates
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((update, index) => `
                    <div class="status-item ${update.type}" style="position: relative; padding-bottom: ${index === statusUpdates.length - 1 ? 'auto' : '20px'};">
                        <div style="display: flex; align-items: flex-start; gap: 10px;">
                            <span style="font-size: 24px; flex-shrink: 0;">${update.icon}</span>
                            <div style="flex: 1;">
                                <h4 style="margin: 0; color: #333;">${update.title}</h4>
                                <p style="margin: 8px 0; color: #666; font-size: 14px;">${update.message}</p>
                                <p style="font-size: 12px; color: #999; margin: 0;"><strong>📅 Date:</strong> ${new Date(update.date).toLocaleDateString()} at ${new Date(update.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</p>
                            </div>
                        </div>
                    </div>
                `).join('');

            document.getElementById('status-list').innerHTML = html || 
                '<div class="empty-state">📊 No status updates yet</div>';
        } else {
            document.getElementById('status-list').innerHTML = 
                '<div class="empty-state">Unable to load status updates</div>';
        }
    } catch (err) {
        console.error('Error loading status:', err);
        document.getElementById('status-list').innerHTML = 
            '<div class="empty-state">❌ Unable to load status updates</div>';
    }
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('needs-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const items = {
            shelter: document.getElementById('shelter').checked,
            medicine: document.getElementById('medicine').checked,
            infantCare: document.getElementById('infantCare').checked,
            medicalSupport: document.getElementById('medicalSupport').checked,
            dryRations: document.getElementById('dryRations').checked,
            cookedFood: document.getElementById('cookedFood').checked,
            water: document.getElementById('water').checked,
            clothes: document.getElementById('clothes').checked,
            sanitaryItems: document.getElementById('sanitaryItems').checked
        };

        const specialConditions = {
            hasDisability: document.getElementById('hasDisability').checked,
            isPregnant: document.getElementById('isPregnant').checked,
            isElderly: document.getElementById('isElderly').checked,
            hasInfant: document.getElementById('hasInfant').checked,
            hasChronicIllness: document.getElementById('hasChronicIllness').checked
        };

        const data = {
            victimId,
            items,
            specialConditions,
            description: document.getElementById('description').value || ''
        };

        try {
            const res = await authenticatedFetch(`${API}/api/needs`, {
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (!res) return;

            const result = await res.json();

            if (res.ok) {
                showAlert('✅ Request submitted successfully! Switching to your requests...', 'success');
                
                // Reload needs data
                await loadNeeds();
                
                // Switch to requests tab after a brief delay to show the success message
                setTimeout(() => {
                    switchTab('requests');
                    showAlert('', 'success');
                }, 1500);
            } else {
                showAlert(result.error || 'Failed to submit request', 'error');
            }
        } catch (err) {
            console.error('Error updating needs:', err);
            showAlert('Cannot connect to server', 'error');
        }
    });
}

// Emergency SOS
async function triggerEmergency() {
    const reason = prompt('Please describe your emergency situation:');
    if (!reason) return;

    if (!confirm('⚠️ This will send an URGENT alert to administrators. Confirm emergency?')) return;

    try {
        const res = await authenticatedFetch(`${API}/api/needs/${victimId}/emergency`, {
            method: 'POST',
            body: JSON.stringify({ emergencyReason: reason || 'Emergency SOS activated' })
        });

        if (!res) return;

        const result = await res.json();

        if (res.ok) {
            alert('🚨 Emergency alert sent! Help is on the way. Priority response activated.');
            showAlert('Emergency status activated! Administrators are responding.', 'success');
            setTimeout(() => loadNeeds(), 1000);
        } else {
            alert(result.error || 'Failed to send emergency alert');
        }
    } catch (err) {
        console.error('Error sending emergency:', err);
        alert('Cannot connect to server');
    }
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        alert('You have been logged out.');
        window.location.href = 'victimSignIn.html';
    }
}
