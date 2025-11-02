document.addEventListener('DOMContentLoaded', () => {
  fetchAndUpdateProfile();
  loadRoutes();
  enableRouteButtons();
  loadAvatar();
  setupPreferenceListeners();
});

// === Fetch and update profile data ===
async function fetchAndUpdateProfile() {
  try {
    const response = await fetch('/api/user', {
      credentials: 'include' // Important: send cookies/session data
    });

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/signin'; // Redirect to signin if not authenticated
        return;
      }
      throw new Error('Failed to fetch profile data');
    }

    const data = await response.json();
    updateProfileUI(data);
  } catch (err) {
    console.error('Error loading profile:', err);
    showError('Failed to load profile data. Please try again later.');
  }
}

// === Update UI with profile data ===
function updateProfileUI(data) {
  // Update name and email
  const nameEl = document.getElementById('displayName');
  const emailEl = document.getElementById('displayEmail');
  if (nameEl) nameEl.textContent = data.name;
  if (emailEl) emailEl.textContent = data.email;

  // Update stats
  const statsElements = {
    tripsTaken: document.querySelector('.stat-item:nth-child(1) .stat-number'),
    savedRoutes: document.querySelector('.stat-item:nth-child(2) .stat-number'),
    reportsMade: document.querySelector('.stat-item:nth-child(3) .stat-number'),
    rating: document.querySelector('.rating')
  };

  Object.entries(statsElements).forEach(([key, element]) => {
    if (element && data.stats && data.stats[key] !== undefined) {
      element.textContent = data.stats[key];
    }
  });

  // Update preferences
  if (data.preferences) {
    Object.entries(data.preferences).forEach(([key, value]) => {
      const toggle = document.getElementById(key);
      if (toggle) toggle.checked = value;
    });
  }
}

// === Set up preference change listeners ===
function setupPreferenceListeners() {
  const toggles = document.querySelectorAll('.toggle-switch input');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', async () => {
      try {
        const response = await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [toggle.id]: toggle.checked
          }),
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Failed to update preference');
        
      } catch (err) {
        console.error('Error updating preference:', err);
        toggle.checked = !toggle.checked; // Revert the toggle
        showError('Failed to update preference. Please try again.');
      }
    });
  });
}

// === Load saved avatar ===
function loadAvatar() {
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
    document.querySelectorAll('.avatar-img').forEach(img => {
      img.src = savedAvatar;
    });
  }
}

// === Show error message ===
function showError(message) {
  // You can implement this using a toast or alert
  alert(message);
}

// === Load routes ===
function loadRoutes() {
  const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
  const routeContainer = document.querySelector('.saved-routes');
  if (!routeContainer) return;

  const existing = routeContainer.querySelectorAll('.route-item');
  if (existing.length > 0) return;

  savedRoutes.forEach(route => {
    const routeDiv = document.createElement('div');
    routeDiv.className = 'route-item';
    routeDiv.innerHTML = `
      <div class="route-info">
        <img src="pin.png" alt="Location" class="route-icon">
        <div class="route-details">
          <span class="route-name">${route.name}</span>
          <span class="route-path">${route.path}</span>
          <span class="route-last-used">${route.lastUsed || 'last used: today'}</span>
        </div>
      </div>
      <div class="route-actions">
        <button class="action-btn use-btn">use</button>
        <button class="action-btn delete-btn">delete</button>
      </div>
    `;
    routeContainer.appendChild(routeDiv);
  });
}

// === Use Route (redirect to route.html) ===
function useRoute(routeName) {
  console.log(`Using route: ${routeName}`);
  const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
  const selectedRoute = savedRoutes.find(route => route.name === routeName);

  if (selectedRoute) {
    localStorage.setItem('selectedRoute', JSON.stringify(selectedRoute));
  } else {
    localStorage.setItem('selectedRoute', JSON.stringify({ name: routeName }));
  }

  window.location.href = '/route'; // goes to route.html now
}

// === Navigation & Settings ===
function goToNextPage() {
  window.location.href = '/prof2';
}

function openSettings() {
  window.location.href = '/notification';
}

function signOut() {
  if (confirm('Are you sure you want to sign out?')) {
    localStorage.clear();
    window.location.href = '/signin';
  }
}