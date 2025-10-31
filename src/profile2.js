document.addEventListener('DOMContentLoaded', () => {
  loadUserData();
  loadPreferences();
  loadRoutes();
  enableEditMode();
  enableRouteButtons();
  loadAvatar(); // load saved avatar on startup

  const editBtn = document.getElementById('editBtn');
  if (editBtn) editBtn.addEventListener('click', toggleEditProfile);

  const toggles = document.querySelectorAll('.toggle-switch input');
  toggles.forEach(toggle => {
    toggle.disabled = false;
    toggle.addEventListener('change', e => {
      savePreference(e);
      showSavePopup();
    });
  });

  createSavePopup();

  const nameField = document.getElementById('userName');
  const emailField = document.getElementById('userEmail');

  const avatarImg = document.getElementById('avatarImg');
  const avatarInput = document.getElementById('avatarInput');
  if (avatarImg && avatarInput) {
    avatarImg.addEventListener('click', triggerImageUpload);
    avatarImg.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') triggerImageUpload(); });
    avatarInput.addEventListener('change', handleImageUpload);
  }

  if (nameField && emailField) {
    nameField.addEventListener('input', showSavePopup);
    emailField.addEventListener('input', showSavePopup);

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
  }
});

// === Avatar Functions ===
function triggerImageUpload() {
  const input = document.getElementById('avatarInput');
  if (input) input.click();
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    return;
  }

  const maxSizeMB = 5;
  const reader = new FileReader();

  reader.onload = function(event) {
    const originalDataUrl = event.target.result;
    if (file.size <= maxSizeMB * 1024 * 1024) {
      updateAvatar(originalDataUrl);
    } else {
      compressImage(originalDataUrl, 1024, 0.8, (compressedDataUrl) => {
        updateAvatar(compressedDataUrl);
      });
    }
  };

  reader.readAsDataURL(file);
}

function updateAvatar(dataUrl) {
  const avatarImg = document.getElementById('avatarImg');
  if (avatarImg) avatarImg.src = dataUrl;
  try {
    localStorage.setItem('userAvatar', dataUrl);
  } catch (err) {
    console.error('Could not save image to localStorage:', err);
    compressImage(dataUrl, 800, 0.7, (smaller) => {
      try {
        localStorage.setItem('userAvatar', smaller);
        if (avatarImg) avatarImg.src = smaller;
      } catch (err2) {
        console.error('Fallback save also failed:', err2);
        alert('Could not save image — it may be too large.');
      }
    });
  }
  showSavePopup();
}

function compressImage(dataUrl, maxDim, quality, cb) {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let { width, height } = img;
    const max = Math.max(width, height);
    if (max > maxDim) {
      const scale = maxDim / max;
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    const compressed = canvas.toDataURL('image/jpeg', quality);
    cb(compressed);
  };
  img.onerror = () => cb(dataUrl);
  img.src = dataUrl;
}

function loadAvatar() {
  const savedAvatar = localStorage.getItem('userAvatar');
  if (savedAvatar) {
    const avatarImg = document.getElementById('avatarImg');
    if (avatarImg) avatarImg.src = savedAvatar;
    document.querySelectorAll('.avatar-img').forEach(img => {
      img.src = savedAvatar;
    });
  }
}

// === Edit Mode ===
function toggleEditProfile() {
  const nameField = document.getElementById('userName');
  const emailField = document.getElementById('userEmail');
  const editBtn = document.getElementById('editBtn');
  const isEditing = nameField && nameField.isContentEditable;

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
  if (!nameField || !emailField) return;
  nameField.contentEditable = true;
  emailField.contentEditable = true;
  nameField.classList.add('editable');
  emailField.classList.add('editable');
  if (editBtn) editBtn.src = 'save.png';
}

function disableEditMode() {
  const nameField = document.getElementById('userName');
  const emailField = document.getElementById('userEmail');
  const editBtn = document.getElementById('editBtn');
  if (nameField) nameField.contentEditable = false;
  if (emailField) emailField.contentEditable = false;
  if (nameField) nameField.classList.remove('editable');
  if (emailField) emailField.classList.remove('editable');
  if (editBtn) editBtn.src = 'edit.png';
}

function savePreference(e) {
  const toggles = document.querySelectorAll('.toggle-switch input');
  const preferences = {};
  toggles.forEach(toggle => {
    preferences[toggle.id] = toggle.checked;
  });
  try {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  } catch (err) {
    console.error('Failed to save preferences:', err);
  }
}

function loadPreferences() {
  const savedPrefs = JSON.parse(localStorage.getItem('userPreferences') || '{}');
  Object.keys(savedPrefs).forEach(id => {
    const toggle = document.getElementById(id);
    if (toggle) toggle.checked = savedPrefs[id];
  });
}

function createSavePopup() {
  const popup = document.createElement('div');
  popup.id = 'savePopup';
  popup.textContent = '💾 Save Changes';
  Object.assign(popup.style, {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    background: '#007bff',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '600',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
    cursor: 'pointer',
    display: 'none',
    zIndex: '1000'
  });
  document.body.appendChild(popup);
  popup.addEventListener('click', () => {
    saveUserData();
    hideSavePopup();
    alert('Profile saved!');
  });
}

function showSavePopup() {
  const popup = document.getElementById('savePopup');
  if (popup) popup.style.display = 'block';
}

function hideSavePopup() {
  const popup = document.getElementById('savePopup');
  if (popup) popup.style.display = 'none';
}

function saveUserData() {
  const userData = {
    name: document.getElementById('userName')?.textContent.trim() || '',
    email: document.getElementById('userEmail')?.textContent.trim() || ''
  };
  try {
    localStorage.setItem('savedUserData', JSON.stringify(userData));
  } catch (err) {
    console.error('Failed to save user data:', err);
  }
}

function loadUserData() {
  const saved = JSON.parse(localStorage.getItem('savedUserData') || '{}');
  if (saved.name && document.getElementById('userName')) document.getElementById('userName').textContent = saved.name;
  if (saved.email && document.getElementById('userEmail')) document.getElementById('userEmail').textContent = saved.email;
}

// === Routes ===
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

// === Enable route buttons ===
function enableRouteButtons() {
  const useButtons = document.querySelectorAll('.use-btn');
  const deleteButtons = document.querySelectorAll('.delete-btn');

  // 🚫 “Use” visible but disabled here
  useButtons.forEach(btn => {
    btn.disabled = false;
    btn.addEventListener('click', () => {
      alert('You can only use routes from your main profile.');
    });
  });

  // ✅ “Delete” works only here
  deleteButtons.forEach(btn => {
    btn.disabled = false;
    btn.addEventListener('click', e => {
      const routeItem = e.target.closest('.route-item');
      if (!routeItem) return;
      const routeName = routeItem.querySelector('.route-name').textContent.trim();
      deleteRoute(routeName, routeItem);
    });
  });
}

// === Delete route ===
function deleteRoute(routeName, routeItem) {
  if (!confirm(`Delete "${routeName}"?`)) return;
  const savedRoutes = JSON.parse(localStorage.getItem('savedRoutes') || '[]');
  const updated = savedRoutes.filter(route => route.name !== routeName);
  try {
    localStorage.setItem('savedRoutes', JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update savedRoutes:', err);
  }
  routeItem.remove();
  alert(`"${routeName}" has been deleted.`);
}

// === Other ===
function openNotificationSettings() {
  alert("Opening notification settings...");
}
function openPrivacySettings() {
  alert("Opening privacy settings...");
}
function signOut() {
  alert("Signed out successfully!");
}
function resetProfile() {
  if (!confirm('Reset profile and remove saved image?')) return;
  localStorage.removeItem('userAvatar');
  localStorage.removeItem('savedUserData');
  hideSavePopup();
  window.location.reload();
}

