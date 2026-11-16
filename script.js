// 1. Initialize the Map centered over the Philippines
const map = L.map('map').setView([12.8797, 121.7740], 6);

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Create a LayerGroup to easily clear old markers before every new search
const markerLayer = L.layerGroup().addTo(map);

const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const messageDiv = document.getElementById('message');

searchBtn.addEventListener('click', performSearch);
cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function performSearch() {
    const query = cityInput.value.trim();
    
    // Clear previous messages and markers
    messageDiv.textContent = '';
    messageDiv.style.color = 'black';
    markerLayer.clearLayers();

    if (!query) {
        messageDiv.textContent = 'Please enter a city name to search.';
        messageDiv.style.color = 'red';
        return;
    }

    messageDiv.textContent = 'Searching...';

    // Nominatim API endpoint restricted to the Philippines (countrycodes=ph) and limit to 5 results
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ph&limit=5`;

    fetch(url, {
        headers: {
            'User-Agent': 'PHCityExplorerStudentExercise/1.0'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.length === 0) {
            messageDiv.textContent = `No locations found for "${query}" in the Philippines. Try another name.`;
            messageDiv.style.color = '#e74c3c';
            return;
        }

        messageDiv.textContent = `Found ${data.length} matching location(s).`;
        messageDiv.style.color = '#27ae60';

        const bounds = [];

        data.forEach(place => {
            const lat = parseFloat(place.lat);
            const lon = parseFloat(place.lon);
            
            // Nominatim returns a full display name string ending with "Philippines"
            const displayName = place.display_name;

            // Add marker to layer group
            const marker = L.marker([lat, lon]).bindPopup(`<b>${displayName}</b>`);
            markerLayer.addLayer(marker);

            bounds.push([lat, lon]);
        });

        // Adjust map view to fit all returned markers nicely
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        messageDiv.textContent = 'An error occurred while searching. Please check your network connection.';
        messageDiv.style.color = 'red';
    });
}