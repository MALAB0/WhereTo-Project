// Editable Profile Name & Email
function toggleEditProfile() {
    const nameField = document.getElementById('userName');
    const emailField = document.getElementById('userEmail');
    const editBtn = document.getElementById('editBtn');
    
    const isEditing = nameField.isContentEditable;

    if (!isEditing) {
        // Enable editing
        nameField.contentEditable = true;
        emailField.contentEditable = true;
        nameField.classList.add('editable');
        emailField.classList.add('editable');
        editBtn.src = 'save.png';
    } else {
        // Disable editing and save
        nameField.contentEditable = false;
        emailField.contentEditable = false;
        nameField.classList.remove('editable');
        emailField.classList.remove('editable');
        editBtn.src = 'edit.png';

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.name = nameField.textContent.trim();
        currentUser.email = emailField.textContent.trim();
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        alert('Profile updated successfully!');
    }
}

// Enter edit mode by default on profile2 page
function enableEditMode() {
    const nameField = document.getElementById('userName');
    const emailField = document.getElementById('userEmail');
    const editBtn = document.getElementById('editBtn');
    if (!nameField || !emailField || !editBtn) return;
    nameField.contentEditable = true;
    emailField.contentEditable = true;
    nameField.classList.add('editable');
    emailField.classList.add('editable');
    editBtn.src = 'save.png';
}

// Toggle switch functionality
const toggles = document.querySelectorAll('.toggle-switch input');
toggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
        const preference = this.id;
        const isEnabled = this.checked;
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        preferences[preference] = isEnabled;
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
    });
});

// Load saved preferences
function loadPreferences() {
    const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
    Object.keys(preferences).forEach(key => {
        const toggle = document.getElementById(key);
        if (toggle) toggle.checked = preferences[key];
    });
}

// Load user data
function loadUserData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (currentUser.name) document.getElementById('userName').textContent = currentUser.name;
    if (currentUser.email) document.getElementById('userEmail').textContent = currentUser.email;
}

// Route management
function useRoute(routeName) {
    window.location.href = 'route.html';
}

function deleteRoute(routeName) {
    if (confirm(`Are you sure you want to delete "${routeName}"?`)) {
        const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
        const updatedRoutes = savedRoutes.filter(route => route.name !== routeName);
        localStorage.setItem('savedRoutes', JSON.stringify(updatedRoutes));
        event.target.closest('.route-item').remove();
    }
}

// Settings
function openNotificationSettings() {
    console.log('Opening notification settings');
}

function openPrivacySettings() {
    console.log('Opening privacy settings');
}

function signOut() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userPreferences');
        window.location.href = 'signin.html';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPreferences();
    loadUserData();
    // Allow editing immediately
    enableEditMode();
});
