/* --- datamap.js (Connected to Backend) --- */

document.addEventListener('DOMContentLoaded', async function() {
    
    // 1. Initialize Map (Centered on Sri Lanka)
    // Coordinates: [Latitude, Longitude], Zoom Level
    var map = L.map('map').setView([7.8731, 80.7718], 8);

    // 2. Add the Tile Layer (The visual map background - OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // --- 3. DEFINE COLORED ICONS ---

    // Red Icon (For Victims)
    var redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // Green Icon (For Contributors - Optional/Future Use)
    var greenIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });

    // --- 4. FETCH REAL DATA FROM BACKEND ---
    console.log("Attempting to fetch map data...");

    try {
        // This URL must match your running Node.js server
        const response = await fetch('http://localhost:5000/api/map/data');
        const data = await response.json();

        // Check if we got victims back
        if (data.victims && data.victims.length > 0) {
            
            // Loop through every victim and add a marker
            data.victims.forEach(v => {
                // Create the marker at the victim's lat/lng
                L.marker([v.lat, v.lng], {icon: redIcon})
                    .addTo(map)
                    .bindPopup(`
                        <div style="font-family: Arial, sans-serif; text-align: center;">
                            <h4 style="color: #dc3545; margin: 0 0 5px 0;">SOS REQUEST</h4>
                            <b style="font-size: 14px;">${v.name}</b><br>
                            <span style="font-size: 12px; color: #666;">Needs: ${v.needs}</span><br>
                            <a href="tel:${v.phone}" style="display: inline-block; margin-top: 5px; padding: 5px 10px; background: #28a745; color: white; text-decoration: none; border-radius: 3px;">
                                📞 Call: ${v.phone}
                            </a>
                        </div>
                    `);
            });

            console.log(`Successfully loaded ${data.victims.length} victims onto the map.`);
        } else {
            console.log("Connected to backend, but found no victims in the database.");
        }

    } catch (error) {
        console.error("Error loading map data:", error);
        console.log("Make sure your Backend Server (node server.js) is running on port 5000!");
    }

});