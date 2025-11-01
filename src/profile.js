document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  loadPreferences();
  loadRoutes();
  enableRouteButtons();
  loadAvatar(); // Load avatar when opening profile.html
});

// === Load saved avatar from localStorage ===
function loadAvatar() {
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
    document.querySelectorAll('.avatar-img').forEach(img => {
      img.src = savedAvatar;
    });
  }
}

// === Enable route buttons ===
function enableRouteButtons() {
  const useButtons = document.querySelectorAll('.use-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn');

  //"Use" works only here and goes to route.html
  useButtons.forEach(btn => {
    btn.disabled = false;
    btn.addEventListener('click', () => {
      const routeItem = btn.closest('.route-item');
      const routeName = routeItem.querySelector('.route-name').textContent.trim();
      useRoute(routeName);
    });
  });

  // "Delete" disabled here
  deleteButtons.forEach(btn => {
    btn.disabled = false;
    btn.addEventListener('click', e => {
      e.preventDefault();
      alert('You can only delete routes from Edit Profile.');
    });
  });
}

// === Load user data ===
function loadUserData() {
  const saved = JSON.parse(localStorage.getItem('savedUserData') || '{}');
  const nameEl = document.getElementById('displayName') || document.querySelector('.user-details h2');
  const emailEl = document.getElementById('displayEmail') || document.querySelector('.user-details p');

  if (saved.name && nameEl) nameEl.textContent = saved.name;
  if (saved.email && emailEl) emailEl.textContent = saved.email;
}

// === Load preferences ===
function loadPreferences() {
  const savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  Object.keys(savedPrefs).forEach(id => {
    const toggle = document.getElementById(id);
    if (toggle) toggle.checked = savedPrefs[id];
  });
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