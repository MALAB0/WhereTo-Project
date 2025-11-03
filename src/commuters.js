document.addEventListener('DOMContentLoaded', function () {
  // --- Sidebar toggle ---
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function () {
      sidebar.classList.toggle('active');
    });

      // Close sidebar when clicking outside of it
    document.addEventListener('click', function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnMenuBtn = menuBtn.contains(event.target);

    if (!isClickInsideSidebar && !isClickOnMenuBtn) {
      sidebar.classList.remove('active');
    }
  });

  }

  // --- Utility: show/hide 'No user found' message ---
  function updateNoResults() {
    const grid = document.querySelector('.user-grid');
    if (!grid) return;
    let noEl = document.getElementById('noResults');
    if (!noEl) {
      noEl = document.createElement('div');
      noEl.id = 'noResults';
      noEl.textContent = 'No user found';
      noEl.style.marginTop = '16px';
      noEl.style.fontWeight = '600';
      grid.parentNode.insertBefore(noEl, grid.nextSibling);
    }
    const anyVisible = Array.from(document.querySelectorAll('.user-card'))
      .some(card => card.style.display !== 'none');
    noEl.style.display = anyVisible ? 'none' : '';
  }

// --- Suspend button (updated to toggle) ---
document.addEventListener('click', async function (e) {
  if (e.target.closest('.suspend')) {
    e.preventDefault();
    const card = e.target.closest('.user-card');
    const id = card.dataset.id;
    const statusSpan = card.querySelector('.user-status');
    const button = card.querySelector('.suspend');
    const icon = button.querySelector('i');
    
    const currentStatus = statusSpan.textContent.trim();
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const res = await fetch('/api/users/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Update status span
        statusSpan.textContent = newStatus;
        statusSpan.className = `user-status ${newStatus}`;
        
        // Update button text and icon
        button.innerHTML = `<i class="fa-solid fa-${newStatus === 'active' ? 'ban' : 'check'}"></i> ${newStatus === 'active' ? 'suspend' : 'unsuspend'}`;
      } else {
        alert('Error updating user status');
      }
    } catch (err) {
      console.error('Suspend toggle error:', err);
    }
  }
});
// --- Delete button (updated for API) ---
document.addEventListener('click', async function (e) {
  if (e.target.closest('.delete')) {
    e.preventDefault();
    const card = e.target.closest('.user-card');
    const id = card.dataset.id;
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch('/api/users/' + id, { method: 'DELETE' });
      if (res.ok) {
        card.remove();
      } else {
        alert('Error deleting user');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  }
});

  // --- Search functionality ---
  const searchInput = document.querySelector('.user-searchbar input');
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll('.user-card').forEach(card => {
        const name = card.querySelector('.user-name').textContent.toLowerCase();
        const email = card.querySelector('.user-email').textContent.toLowerCase();
        card.style.display = (name.includes(query) || email.includes(query)) ? '' : 'none';
      });
      updateNoResults();
    });
  }

  // --- Filter by status ---
  const statusSelect = document.querySelector('.filter-group select');
  if (statusSelect) {
    statusSelect.addEventListener('change', function () {
      const selected = statusSelect.value.toLowerCase();
      document.querySelectorAll('.user-card').forEach(card => {
        const status = card.querySelector('.user-status').textContent.toLowerCase();
        card.style.display = (selected === 'all status' || status === selected) ? '' : 'none';
      });
      updateNoResults();
    });
  }

  // --- Add User Modal ---
  const addUserBtn = document.getElementById('addUserBtn');
  const addUserModal = document.getElementById('addUserModal');
  const closeBtn = addUserModal.querySelector('.close-btn');
  const addUserForm = document.getElementById('addUserForm');

  // Open modal
  if (addUserBtn && addUserModal) {
    addUserBtn.addEventListener('click', function () {
      addUserModal.style.display = 'flex';
    });
  }

  // Close modal
  if (closeBtn) {
    closeBtn.addEventListener('click', function () {
      addUserModal.style.display = 'none';
    });
  }

  // Close modal if clicking outside content
  window.addEventListener('click', function (e) {
    if (e.target === addUserModal) {
      addUserModal.style.display = 'none';
    }
  });

// Submit Add User form (updated for API)
if (addUserForm) {
  addUserForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('newUserName').value;
    const email = document.getElementById('newUserEmail').value;
    const password = document.getElementById('newUserPassword').value;
    const role = document.getElementById('newUserRole').value;
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password, role })
      });
      if (res.ok) {
        addUserModal.style.display = 'none';
        addUserForm.reset();
        location.reload();  // Reload to show new user; alternatively, fetch users and re-render grid
      } else {
        const error = await res.json();
        alert('Error: ' + error.error);
      }
    } catch (err) {
      console.error('Add user error:', err);
    }
  });
}
});

