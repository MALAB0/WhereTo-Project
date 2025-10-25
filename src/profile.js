// === Load user preferences ===
function loadPreferences() {
  const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  Object.keys(preferences).forEach(key => {
    const toggle = document.getElementById(key);
    if (toggle) {
      toggle.checked = preferences[key];
    }
  });
}

// === Route management ===
function useRoute(routeName) {
  console.log(`Using route: ${routeName}`);
  window.location.href = '/route';
}

function deleteRoute(routeName) {
  if (confirm(`Are you sure you want to delete "${routeName}"?`)) {
    const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
    const updatedRoutes = savedRoutes.filter(route => route.name !== routeName);
    localStorage.setItem('savedRoutes', JSON.stringify(updatedRoutes));
    event.target.closest('.route-item').remove();
  }
}

// === Navigation ===
function goToNextPage() {
  window.location.href = '/prof2';
}

function openSettings() {
  window.location.href = '/notification';
}

function signOut() {
  if (confirm('Are you sure you want to sign out?')) {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userPreferences');
    window.location.href = '/signin';
  }
}

// === Load user data (from profile2 edits) ===
function loadUserData() {
  // Get edited user info from localStorage
  const savedUserData = JSON.parse(localStorage.getItem('savedUserData') || '{}');
  
  const userName = document.querySelector('.user-details h2');
  const userEmail = document.querySelector('.user-details p');
  
  if (savedUserData.name && userName) {
    userName.textContent = savedUserData.name;
  }
  if (savedUserData.email && userEmail) {
    userEmail.textContent = savedUserData.email;
  }
}

// === Initialize page ===
document.addEventListener('DOMContentLoaded', () => {
  loadPreferences();
  loadUserData();
});