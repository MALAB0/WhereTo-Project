// Toggle Sidebar
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('active');
}

// Sign Out Button
function signOut() {
  alert('You have signed out successfully.');
  window.location.href = 'signup.html';
}
