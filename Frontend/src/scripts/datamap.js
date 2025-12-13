/* --- datamap.js (Connected to Backend) --- */

document.addEventListener('DOMContentLoaded', async function() {
    const API = window.API_BASE || 'http://localhost:5000';
    const showVictimsBtn = document.getElementById('show-victims');
    const showCollectionsBtn = document.getElementById('show-collections');
    
    // 1. Initialize Map (Centered on Sri Lanka)
    // Coordinates: [Latitude, Longitude], Zoom Level
    var map = L.map('map').setView([7.8731, 80.7718], 8);

    // 2. Add the Tile Layer (The visual map background - OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Layer groups for toggling
    const victimLayer = L.layerGroup().addTo(map);
    const collectionLayer = L.layerGroup();

    // --- 3. DEFINE COLORED ICONS ---

    // Red Icon (Critical - shelter, medicine, disabilities)
    var redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // Orange Icon (High - food, water)
    var orangeIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // Yellow Icon (Moderate - clothing, hygiene)
    var yellowIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // Green Icon (For Collection Points)
    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // --- 4. FETCH REAL DATA FROM BACKEND ---
    console.log("Attempting to fetch map data...");

    try {
        // This URL must match your running Node.js server
        const response = await fetch(`${API}/api/map/data`);
        const data = await response.json();

        // Victim markers with color coding
        if (data.victims && data.victims.length > 0) {
            data.victims.forEach(v => {
                // Select icon based on urgency
                let victimIcon = yellowIcon;
                if (v.urgency === 'critical') victimIcon = redIcon;
                else if (v.urgency === 'high') victimIcon = orangeIcon;

                const phoneLine = v.phone ? `<a href="tel:${v.phone}" class="map-call">📞 Call: ${v.phone}</a>` : '';
                const emailLine = v.email ? `<div class="map-line">✉️ ${v.email}</div>` : '';
                const addressLine = v.address ? `<div class="map-line">📍 ${v.address}</div>` : '';
                
                // Urgency badge
                const urgencyColor = v.urgency === 'critical' ? '#dc3545' : (v.urgency === 'high' ? '#ff8c00' : '#ffc107');
                const urgencyBadge = `<span style="background:${urgencyColor}; color:white; padding:3px 8px; border-radius:10px; font-size:11px; font-weight:bold;">${v.urgency?.toUpperCase()}</span>`;
                
                // Status badge
                const statusColor = v.status === 'resolved' ? '#28a745' : (v.status === 'in-progress' ? '#007bff' : '#6c757d');
                const statusBadge = `<span style="background:${statusColor}; color:white; padding:3px 8px; border-radius:10px; font-size:11px; margin-left:5px;">${v.status?.toUpperCase()}</span>`;
                
                const emergencyFlag = v.isEmergency ? '<div style="color:#dc3545; font-weight:bold; margin-top:5px;">🚨 EMERGENCY</div>' : '';

                L.marker([v.lat, v.lng], {icon: victimIcon})
                    .addTo(victimLayer)
                    .bindPopup(`
                        <div class="map-popup">
                            <div class="map-title">SOS REQUEST</div>
                            <div class="map-name">${v.name || 'Unknown'}</div>
                            <div class="map-line">ID: ${v.victimId || 'N/A'}</div>
                            <div style="margin: 8px 0;">${urgencyBadge}${statusBadge}</div>
                            ${emergencyFlag}
                            ${addressLine}
                            ${emailLine}
                            <div class="map-line"><strong>Needs:</strong> ${v.needs || 'Help Needed'}</div>
                            ${phoneLine}
                        </div>
                    `);
            });

            console.log(`Successfully loaded ${data.victims.length} victims onto the map.`);
        } else {
            console.log("Connected to backend, but found no victims in the database.");
        }

        // Collection point markers
        if (data.collections && data.collections.length > 0) {
            data.collections.forEach(c => {
                const nameLine = c.name ? `<div class="map-name">${c.name}</div>` : '';
                const addressLine = c.address ? `<div class="map-line">📍 ${c.address}</div>` : '';
                const districtLine = c.district ? `<div class="map-line">District: ${c.district}</div>` : '';
                const hoursLine = c.hours ? `<div class="map-line">Hours: ${c.hours}</div>` : '';
                const contactLine = c.contactPhone ? `<a href="tel:${c.contactPhone}" class="map-call">📞 ${c.contactPhone}</a>` : '';

                L.marker([c.lat, c.lng], {icon: greenIcon})
                    .addTo(collectionLayer)
                    .bindPopup(`
                        <div class="map-popup">
                            <div class="map-title">Collection Point</div>
                            ${nameLine}
                            ${districtLine}
                            ${addressLine}
                            ${hoursLine}
                            ${contactLine}
                            ${c.capacityNote ? `<div class="map-line">Capacity: ${c.capacityNote}</div>` : ''}
                            ${c.notes ? `<div class="map-line">Notes: ${c.notes}</div>` : ''}
                        </div>
                    `);
            });
            console.log(`Successfully loaded ${data.collections.length} collection points onto the map.`);
        } else {
            console.log("Connected to backend, but found no collection points in the database.");
        }

    } catch (error) {
        console.error("Error loading map data:", error);
        console.log("Make sure your Backend Server (node server.js) is running on port 5000!");
    }

    // Toggle buttons to switch layers
    const showVictims = () => {
        if (!map.hasLayer(victimLayer)) map.addLayer(victimLayer);
        if (map.hasLayer(collectionLayer)) map.removeLayer(collectionLayer);
        showVictimsBtn?.classList.add('active');
        showCollectionsBtn?.classList.remove('active');
    };

    const showCollections = () => {
        if (!map.hasLayer(collectionLayer)) map.addLayer(collectionLayer);
        if (map.hasLayer(victimLayer)) map.removeLayer(victimLayer);
        showCollectionsBtn?.classList.add('active');
        showVictimsBtn?.classList.remove('active');
    };

    showVictimsBtn?.addEventListener('click', showVictims);
    showCollectionsBtn?.addEventListener('click', showCollections);

    // Default view
    showVictims();

});