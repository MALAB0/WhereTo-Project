document.addEventListener('DOMContentLoaded', () => {
  // Load saved data when page opens
  loadUserData();
  loadPreferences();

  const editBtn = document.getElementById('editBtn');
  editBtn.addEventListener('click', toggleEditProfile);

  // Listen to preference toggles
  const toggles = document.querySelectorAll('.toggle-switch input');
  toggles.forEach(toggle => {
    toggle.addEventListener('change', savePreference);
  });

  // Enable edit mode by default (like your version)
  enableEditMode();

  // Add popup save button
  createSavePopup();

  // Listen to typing to show popup
  const nameField = document.getElementById('userName');
  const emailField = document.getElementById('userEmail');

  nameField.addEventListener('input', showSavePopup);
  emailField.addEventListener('input', showSavePopup);

  // Prevent Enter from adding new lines
  [nameField, emailField].forEach(field => {
    field.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveUserData();
        hideSavePopup();
        alert('Profile saved!');
      }
    });
  });
});

// --- Edit Mode ---
function toggleEditProfile() {
  const nameField = document.getElementById('userName');
  const emailField = document.getElementById('userEmail');
  const editBtn = document.getElementById('editBtn');

  const isEditing = nameField.isContentEditable;

  if (!isEditing) {
    enableEditMode();
  } else {
    disableEditMode();
    saveUserData();
    hideSavePopup();
    alert('Profile saved!');
  }
}

function enableEditMode() {
  const nameField = document.getElementById('userName');
  const emailField = document.getElementById('userEmail');
  const editBtn = document.getElementById('editBtn');

  nameField.contentEditable = true;
  emailField.contentEditable = true;
  nameField.classList.add('editable');
  emailField.classList.add('editable');
  editBtn.src = 'save.png';
}

function disableEditMode() {
  const nameField = document.getElementById('userName');
  const emailField = document.getElementById('userEmail');
  const editBtn = document.getElementById('editBtn');

  nameField.contentEditable = false;
  emailField.contentEditable = false;
  nameField.classList.remove('editable');
  emailField.classList.remove('editable');
  editBtn.src = 'edit.png';
}

// --- Preferences ---
function savePreference(e) {
  const toggleName = e.target.id;
  const toggleValue = e.target.checked;
  localStorage.setItem(toggleName, toggleValue);
}

function loadPreferences() {
  const toggles = document.querySelectorAll('.toggle-switch input');
  toggles.forEach(toggle => {
    const saved = localStorage.getItem(toggle.id);
    if (saved !== null) {
      toggle.checked = saved === 'true';
    }
  });
}

// --- User Data Save/Load ---
function saveUserData() {
  const userData = {
    name: document.getElementById('userName').textContent.trim(),
    email: document.getElementById('userEmail').textContent.trim(),
  };
  localStorage.setItem('savedUserData', JSON.stringify(userData));
}

function loadUserData() {
  const saved = localStorage.getItem('savedUserData');
  if (saved) {
    const data = JSON.parse(saved);
    document.getElementById('userName').textContent = data.name;
    document.getElementById('userEmail').textContent = data.email;
  }
}

// --- Save Popup ---
function createSavePopup() {
  const popup = document.createElement('div');
  popup.id = 'savePopup';
  popup.textContent = '💾 Save Changes';
  popup.style.position = 'fixed';
  popup.style.bottom = '30px';
  popup.style.right = '30px';
  popup.style.background = '#007bff';
  popup.style.color = '#fff';
  popup.style.padding = '10px 20px';
  popup.style.borderRadius = '10px';
  popup.style.fontWeight = '600';
  popup.style.boxShadow = '0 4px 10px rgba(0,0,0,0.2)';
  popup.style.cursor = 'pointer';
  popup.style.display = 'none';
  popup.style.zIndex = '1000';
  document.body.appendChild(popup);

  popup.addEventListener('click', () => {
    saveUserData();
    hideSavePopup();
    alert('Profile saved!');
  });
}

function showSavePopup() {
  const popup = document.getElementById('savePopup');
  popup.style.display = 'block';
}

function hideSavePopup() {
  const popup = document.getElementById('savePopup');
  popup.style.display = 'none';
}