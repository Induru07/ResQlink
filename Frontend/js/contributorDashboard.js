// Contributor Dashboard JS
const API = window.API_BASE || 'http://localhost:5000';
let contributorId = localStorage.getItem('contributorId');
let inventory = [];

// Check authentication
if (!contributorId) {
    window.location.href = 'contributorSignIn.html';
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
    await loadStats();
    await loadInventory();
    await loadHistory();
    await loadCollectionPoints();
    setCurrentDateTime();
    setupHandoverUI();
    setupCreateCollectionPoint();
});

// Load contributor stats
async function loadStats() {
    try {
        const res = await fetch(`${API}/api/contributor/stats/${contributorId}`);
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('welcome-msg').textContent = 
                `Welcome back, ${data.contributor.name}! (${contributorId})`;
            
            renderStatsCards(data.stats);
        }
    } catch (err) {
        console.error('Error loading stats:', err);
    }
}

// Render stats cards
function renderStatsCards(stats) {
    const html = `
        <div class="stat-card">
            <i class="fas fa-box-open icon"></i>
            <h3>Items Collected</h3>
            <div class="value">${stats.totalItemsCollected || 0}</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-warehouse icon"></i>
            <h3>Current Stock</h3>
            <div class="value">${stats.totalItemsInStock || 0}</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-truck icon"></i>
            <h3>Items Distributed</h3>
            <div class="value">${stats.totalItemsDistributed || 0}</div>
        </div>
        <div class="stat-card">
            <i class="fas fa-home icon"></i>
            <h3>Families Helped</h3>
            <div class="value">${stats.totalFamiliesBenefited || 0}</div>
        </div>
        ${stats.lowStockAlerts > 0 ? `
        <div class="stat-card" style="border-left: 4px solid #ffc107;">
            <i class="fas fa-exclamation-triangle icon" style="color: #ffc107;"></i>
            <h3>Low Stock Alerts</h3>
            <div class="value" style="color: #ffc107;">${stats.lowStockAlerts}</div>
        </div>
        ` : ''}
    `;
    document.getElementById('stats-cards').innerHTML = html;
}

// Load inventory
async function loadInventory() {
    try {
        const res = await fetch(`${API}/api/contributor/inventory/${contributorId}`);
        const data = await res.json();
        
        if (res.ok) {
            inventory = data.inventory;
            renderInventory(data);
            populateDistributionItems(data.inventory);
        }
    } catch (err) {
        console.error('Error loading inventory:', err);
    }
}

// Load available collection points (optionally filtered by selected district)
async function loadCollectionPoints() {
    try {
        const district = document.getElementById('collectionDistrict')?.value || '';
        const url = district ? `${API}/api/contributor/collection-points?district=${encodeURIComponent(district)}` : `${API}/api/contributor/collection-points`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok) {
            const select = document.getElementById('handoverCollectionPoint');
            if (select) {
                select.innerHTML = '<option value="">Select a collection point</option>' +
                    (data.points || []).map(p => `<option value="${p.collectionPointId}">${p.name} (${p.district})</option>`).join('');
            }
        }
    } catch (err) {
        console.error('Error loading collection points:', err);
    }
}

function setupHandoverUI() {
    const typeSel = document.getElementById('handoverType');
    const cpGroup = document.getElementById('handover-collection-point-group');
    const vicGroup = document.getElementById('handover-victim-group');
    const districtInput = document.getElementById('collectionDistrict');

    typeSel?.addEventListener('change', () => {
        const v = typeSel.value;
        if (v === 'collection-point') {
            cpGroup.style.display = '';
            vicGroup.style.display = 'none';
        } else {
            cpGroup.style.display = 'none';
            vicGroup.style.display = '';
        }
    });

    districtInput?.addEventListener('change', () => {
        loadCollectionPoints();
    });

    // Victim autocomplete
    const vicInput = document.getElementById('handoverVictimId');
    const attachAutocomplete = () => {
        let timer;
        vicInput?.addEventListener('input', () => {
            clearTimeout(timer);
            const query = vicInput.value.trim();
            const district = document.getElementById('collectionDistrict')?.value || '';
            if (!query && !district) return;
            timer = setTimeout(async () => {
                try {
                    const url = new URL(`${API}/api/auth/victim/search`);
                    if (query) url.searchParams.set('query', query);
                    if (district) url.searchParams.set('district', district);
                    const res = await fetch(url.toString());
                    const data = await res.json();
                    if (res.ok) {
                        renderVictimSuggestions(data.victims || []);
                    }
                } catch (err) {
                    console.error('Victim search error', err);
                }
            }, 250);
        });
    };
    attachAutocomplete();
}

function renderVictimSuggestions(victims) {
    let list = document.getElementById('victim-suggestions');
    if (!list) {
        list = document.createElement('div');
        list.id = 'victim-suggestions';
        list.style.cssText = 'background:#fff;border:1px solid #ddd;border-radius:6px;max-height:180px;overflow:auto;margin-top:6px;';
        const parent = document.getElementById('handover-victim-group');
        parent?.appendChild(list);
    }
    list.innerHTML = victims.map(v => `
        <div class="suggestion-item" data-id="${v.victimId}" style="padding:8px;cursor:pointer;border-bottom:1px solid #eee;">
            <strong>${v.victimId}</strong> - ${v.fullName || ''} ${v.email ? '('+v.email+')' : ''}
        </div>
    `).join('') || '<div style="padding:8px;color:#666;">No matches</div>';
    list.querySelectorAll('.suggestion-item').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.getAttribute('data-id');
            const input = document.getElementById('handoverVictimId');
            if (input) input.value = id;
            list.innerHTML = '';
        });
    });
}

function setupCreateCollectionPoint() {
    const btn = document.getElementById('createCollectionPointBtn');
    btn?.addEventListener('click', async () => {
        const name = document.getElementById('pointName').value.trim();
        const address = document.getElementById('pointAddress').value.trim();
        const hours = document.getElementById('pointHours').value.trim();
        const contactPhone = document.getElementById('pointPhone').value.trim();
        const contactEmail = document.getElementById('pointEmail').value.trim();
        const capacityNote = document.getElementById('pointCapacity').value.trim();
        const districtFallback = document.getElementById('collectionDistrict')?.value.trim() || '';
        const district = (document.getElementById('pointDistrict').value.trim()) || districtFallback;

        if (!name || !district) {
            return showAlert('collection-alert', 'Please provide name and district for the collection point', 'error');
        }

        try {
            const res = await fetch(`${API}/api/contributor/collection-point`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    managedByContributorId: contributorId,
                    contactPhone,
                    contactEmail,
                    address,
                    district,
                    hours,
                    capacityNote
                })
            });
            const result = await res.json();
            if (res.ok) {
                showAlert('collection-alert', `Collection point created: ${result.collectionPointId}`, 'success');
                // Refresh dropdown and select newly created point
                await loadCollectionPoints();
                const select = document.getElementById('handoverCollectionPoint');
                if (select) {
                    select.value = result.collectionPointId;
                }
                const typeSel = document.getElementById('handoverType');
                if (typeSel) typeSel.value = 'collection-point';
            } else {
                showAlert('collection-alert', result.msg || 'Failed to create collection point', 'error');
            }
        } catch (err) {
            console.error('Create collection point error:', err);
            showAlert('collection-alert', 'Cannot connect to server', 'error');
        }
    });
}

// Render inventory table
function renderInventory(data) {
    const summaryHtml = Object.entries(data.summary || {}).map(([cat, qty]) => 
        `<span class="item-chip">${cat}: ${qty}</span>`
    ).join('');
    document.getElementById('inventory-summary').innerHTML = summaryHtml || '<p>No items in inventory</p>';
    
    const tbody = document.getElementById('inventory-body');
    tbody.innerHTML = data.inventory.map(item => `
        <tr>
            <td>${item.itemName}</td>
            <td><span class="badge">${item.category}</span></td>
            <td><strong>${item.currentQuantity}</strong></td>
            <td>${item.unit}</td>
            <td>${item.condition}</td>
            <td>${item.isLowStock ? '<span class="badge pending">Low Stock</span>' : '<span class="badge delivered">OK</span>'}</td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;">No inventory items</td></tr>';
}

// Populate distribution items from inventory
function populateDistributionItems(inventory) {
    const container = document.getElementById('distribution-items');
    container.innerHTML = inventory.map(item => `
        <div class="form-group" style="display: flex; align-items: center; gap: 10px; padding: 10px; background: #f8f9fa; border-radius: 6px; margin-bottom: 8px;">
            <input type="checkbox" id="dist-${item.inventoryId}" value="${item.inventoryId}" data-item='${JSON.stringify(item)}'>
            <label for="dist-${item.inventoryId}" style="margin: 0; flex: 1;">
                <strong>${item.itemName}</strong> (Available: ${item.currentQuantity} ${item.unit})
            </label>
            <input type="number" id="qty-${item.inventoryId}" placeholder="Quantity" min="0.01" max="${item.currentQuantity}" step="0.01" style="width: 120px;" disabled>
        </div>
    `).join('') || '<p>No items available in inventory</p>';
    
    // Enable/disable quantity input based on checkbox
    inventory.forEach(item => {
        const checkbox = document.getElementById(`dist-${item.inventoryId}`);
        const qtyInput = document.getElementById(`qty-${item.inventoryId}`);
        if (checkbox && qtyInput) {
            checkbox.addEventListener('change', () => {
                qtyInput.disabled = !checkbox.checked;
                if (!checkbox.checked) qtyInput.value = '';
            });
        }
    });
}

// Load history
async function loadHistory() {
    try {
        const [collectionsRes, distributionsRes] = await Promise.all([
            fetch(`${API}/api/contributor/collection/${contributorId}`),
            fetch(`${API}/api/contributor/distribution/${contributorId}`)
        ]);
        
        const collections = await collectionsRes.json();
        const distributions = await distributionsRes.json();
        
        renderCollectionsHistory(collections.collections || []);
        renderDistributionsHistory(distributions.distributions || []);

        // Load notifications for contributor managed points
        await loadPointNotifications();
    } catch (err) {
        console.error('Error loading history:', err);
    }
}

async function loadPointNotifications(){
    try{
        // Get points managed by this contributor
        const res = await fetch(`${API}/api/contributor/collection-points/${contributorId}`);
        const data = await res.json();
        const points = data.points || [];
        const allNotifs = [];
        for(const p of points){
            const r = await fetch(`${API}/api/contributor/notifications/collection-point/${p.collectionPointId}`);
            const d = await r.json();
            (d.notifications||[]).forEach(n=>allNotifs.push({ pointName: p.name, pointId: p.collectionPointId, notif: n }));
        }
        const html = allNotifs.map(({pointName, pointId, notif})=>
            `<div class="alert warning">
                <strong>${pointName}</strong> (${pointId}) — ${new Date(notif.createdAt).toLocaleString()}<br/>
                ${notif.title || 'Incoming items'}: ${(notif.items||[]).map(i=>`${i.itemName} (${i.quantity}${i.unit})`).join(', ') || 'N/A'}<br/>
                From: ${notif.contributorName||notif.contributorId||''} ${notif.contributorPhone?('| '+notif.contributorPhone):''}
            </div>`
        ).join('') || '<p>No incoming handovers for your points.</p>';
        const container = document.getElementById('point-notifications');
        if (container) container.innerHTML = html;
    }catch(err){
        console.error('Error loading point notifications:', err);
    }
}

// Render collections history
function renderCollectionsHistory(collections) {
    const tbody = document.getElementById('collections-history');
    tbody.innerHTML = collections.map(c => `
        <tr>
            <td>${c.collectionId}</td>
            <td>${new Date(c.collectionDate).toLocaleDateString()}</td>
            <td>${c.items.map(i => `${i.itemName} (${i.quantity}${i.unit})`).join(', ')}</td>
            <td>${c.collectionLocation?.address || 'N/A'}</td>
            <td><span class="badge ${c.status}">${c.status}</span></td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center;">No collections yet</td></tr>';
}

// Render distributions history
function renderDistributionsHistory(distributions) {
    const tbody = document.getElementById('distributions-history');
    tbody.innerHTML = distributions.map(d => `
        <tr>
            <td>${d.distributionId}</td>
            <td>${new Date(d.distributionDate).toLocaleDateString()}</td>
            <td>${d.recipientName} (${d.recipientType})</td>
            <td>${d.items.map(i => `${i.itemName} (${i.quantityDistributed}${i.unit})`).join(', ')}</td>
            <td><span class="badge ${d.status}">${d.status}</span></td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align:center;">No distributions yet</td></tr>';
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(`${tab}-tab`).classList.add('active');
}

// Add item row for collection form
function addItemRow() {
    const container = document.getElementById('items-container');
    const div = document.createElement('div');
    div.className = 'item-row';
    div.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 150px 100px 40px; gap: 10px; margin-bottom: 10px;';
    div.innerHTML = `
        <select class="item-category" required>
            <option value="">Category</option>
            <option value="food">Food</option>
            <option value="water">Water</option>
            <option value="clothing">Clothing</option>
            <option value="medicine">Medicine</option>
            <option value="hygiene">Hygiene Products</option>
            <option value="shelter">Shelter Materials</option>
            <option value="other">Other</option>
        </select>
        <input type="text" class="item-name" placeholder="Item Name" required>
        <input type="number" class="item-quantity" placeholder="Quantity" required min="0.01" step="0.01">
        <input type="text" class="item-unit" placeholder="Unit" required>
        <button type="button" onclick="removeItem(this)" class="btn btn-danger" style="padding: 8px;">✕</button>
    `;
    container.appendChild(div);
}

// Remove item row
function removeItem(btn) {
    btn.closest('.item-row').remove();
}

// Set current date/time
function setCurrentDateTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const dateString = now.toISOString().slice(0, 16);
    
    const collectionDate = document.getElementById('collectionDate');
    const deliveryDate = document.getElementById('deliveryDate');
    if (collectionDate) collectionDate.value = dateString;
    if (deliveryDate) deliveryDate.value = dateString;
}

// Show alert
function showAlert(elementId, msg, type) {
    const alert = document.getElementById(elementId);
    alert.textContent = msg;
    alert.className = `alert ${type}`;
    alert.style.display = 'block';
    setTimeout(() => alert.style.display = 'none', 5000);
}

// Collection form submit
document.getElementById('collection-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const itemRows = document.querySelectorAll('#items-container .item-row');
    const items = Array.from(itemRows).map(row => ({
        category: row.querySelector('.item-category').value,
        itemName: row.querySelector('.item-name').value,
        quantity: parseFloat(row.querySelector('.item-quantity').value),
        unit: row.querySelector('.item-unit').value,
        condition: 'good'
    }));
    
    if (items.length === 0) {
        return showAlert('collection-alert', 'Please add at least one item', 'error');
    }
    
    // Validate handover target selection
    const handoverTypeSel = document.getElementById('handoverType');
    const handoverTypeVal = handoverTypeSel?.value || 'collection-point';
    if (handoverTypeVal === 'collection-point') {
        const cpVal = document.getElementById('handoverCollectionPoint').value;
        if (!cpVal) {
            return showAlert('collection-alert', 'Please select a collection point or create one', 'error');
        }
    } else {
        const vicVal = document.getElementById('handoverVictimId').value.trim();
        if (!vicVal) {
            return showAlert('collection-alert', 'Please enter a victim ID for handover', 'error');
        }
    }

    const data = {
        contributorId,
        items,
        collectionDate: document.getElementById('collectionDate').value,
        collectionLocation: {
            address: document.getElementById('collectionAddress').value,
            district: document.getElementById('collectionDistrict').value
        },
        donorName: document.getElementById('donorName').value,
        notes: document.getElementById('collectionNotes').value,
        handoverType: handoverTypeVal,
        handoverRef: (handoverTypeVal === 'collection-point')
            ? document.getElementById('handoverCollectionPoint').value
            : document.getElementById('handoverVictimId').value,
        handoverEta: document.getElementById('handoverEta').value
    };
    
    try {
        const res = await fetch(`${API}/api/contributor/collection`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            showAlert('collection-alert', `Collection logged! ID: ${result.collectionId}`, 'success');
            e.target.reset();
            setCurrentDateTime();
            await loadStats();
            await loadInventory();
            await loadHistory();
        } else {
            showAlert('collection-alert', result.msg || 'Error logging collection', 'error');
        }
    } catch (err) {
        console.error(err);
        showAlert('collection-alert', 'Cannot connect to server', 'error');
    }
});

// Distribution form submit
document.getElementById('distribution-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const selectedItems = [];
    inventory.forEach(item => {
        const checkbox = document.getElementById(`dist-${item.inventoryId}`);
        const qtyInput = document.getElementById(`qty-${item.inventoryId}`);
        
        if (checkbox?.checked && qtyInput?.value) {
            selectedItems.push({
                inventoryId: item.inventoryId,
                category: item.category,
                itemName: item.itemName,
                quantityDistributed: parseFloat(qtyInput.value),
                unit: item.unit
            });
        }
    });
    
    if (selectedItems.length === 0) {
        return showAlert('distribution-alert', 'Please select at least one item to distribute', 'error');
    }
    
    const data = {
        contributorId,
        items: selectedItems,
        recipientType: document.getElementById('recipientType').value,
        recipientName: document.getElementById('recipientName').value,
        recipientPhone: document.getElementById('recipientPhone').value,
        recipientAddress: document.getElementById('recipientAddress').value,
        distributionDate: document.getElementById('deliveryDate').value,
        deliveryMethod: 'direct-delivery',
        familiesBenefited: parseInt(document.getElementById('familiesBenefited').value) || 0,
        individualsBenefited: parseInt(document.getElementById('individualsBenefited').value) || 0,
        notes: document.getElementById('distributionNotes').value
    };
    
    try {
        const res = await fetch(`${API}/api/contributor/distribution`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await res.json();
        
        if (res.ok) {
            showAlert('distribution-alert', `Distribution logged! ID: ${result.distributionId}`, 'success');
            e.target.reset();
            setCurrentDateTime();
            await loadStats();
            await loadInventory();
            await loadHistory();
        } else {
            showAlert('distribution-alert', result.msg || 'Error logging distribution', 'error');
        }
    } catch (err) {
        console.error(err);
        showAlert('distribution-alert', 'Cannot connect to server', 'error');
    }
});
