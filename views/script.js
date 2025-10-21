// Handle route search
document.getElementById("searchBtn").addEventListener("click", async () => {
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();

  if (!from || !to) {
    alert("Please enter both locations!");
    return;
  }

  const response = await fetch("/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ from, to })
  });

  const data = await response.json();
  alert(data.message);
  loadRecentSearches();
});

// Handle Live Map
document.getElementById("liveMapBtn").addEventListener("click", () => {
  alert("Opening live map feature (demo)...");
});

// Handle Report Issue
document.getElementById("reportIssueBtn").addEventListener("click", async () => {
  const issue = prompt("Describe the issue you want to report:");
  if (!issue) return;

  const res = await fetch("/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: issue })
  });

  const data = await res.json();
  alert(data.message);
  loadAlerts();
});

// Load recent searches
async function loadRecentSearches() {
  const res = await fetch("/recent");
  const list = await res.json();
  const ul = document.getElementById("recentList");
  ul.innerHTML = "";
  list.forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.from} → ${item.to}`;
    ul.appendChild(li);
  });
}

// Load alerts
async function loadAlerts() {
  const res = await fetch("/alerts");
  const alerts = await res.json();
  const ul = document.getElementById("alertList");
  ul.innerHTML = "";
  alerts.forEach(a => {
    const li = document.createElement("li");
    li.textContent = `⚠️ ${a.message}`;
    ul.appendChild(li);
  });
}

// Load data on start
loadRecentSearches();
loadAlerts();

// Initialize map
const map = L.map('map').setView([14.5995, 120.9842], 13); // Default: Manila

// Add OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap'
}).addTo(map);

// Add marker for live location
let marker;

// Check for geolocation support
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const userLocation = [latitude, longitude];

      // Move map and marker
      if (!marker) {
        marker = L.marker(userLocation).addTo(map)
          .bindPopup("📍 You are here")
          .openPopup();
      } else {
        marker.setLatLng(userLocation);
      }

      map.setView(userLocation, 15);
    },
    (error) => {
      console.error("Error getting location:", error);
      alert("Unable to access your location.");
    },
    { enableHighAccuracy: true }
  );
} else {
  alert("Geolocation is not supported by your browser.");
}
