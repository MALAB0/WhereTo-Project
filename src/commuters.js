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

  // --- Suspend button ---
  document.querySelectorAll('.user-card-actions .suspend').forEach(btn => {
    btn.addEventListener('click', function () {
      alert('User suspended!');
    });
  });

  // --- Delete button ---
  document.querySelectorAll('.user-card-actions .delete').forEach(btn => {
    btn.addEventListener('click', function () {
      if (confirm('Are you sure you want to delete this user?')) {
        alert('User deleted!');
        // Optional: Remove user card from DOM
        // btn.closest('.user-card').remove();
      }
    });
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

  // Submit Add User form
  if (addUserForm) {
    addUserForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const name = document.getElementById('newUserName').value;
      const email = document.getElementById('newUserEmail').value;
      const status = document.getElementById('newUserStatus').value;
      const role = document.getElementById('newUserRole').value;

      const userGrid = document.querySelector('.user-grid');
      const newUserCard = document.createElement('div');
      newUserCard.className = 'user-card';
      newUserCard.innerHTML = `
        <div class="user-card-header">
          <i class="fa-solid fa-user-circle"></i>
          <div>
            <div class="user-name">${name}</div>
            <div class="user-email">${email}</div>
          </div>
          <span class="user-status ${status.toLowerCase()}">${status}</span>
        </div>
        <div class="user-card-info">
          <div><i class="fa-solid fa-calendar"></i> Joined ${new Date().toISOString().split('T')[0]}</div>
          <div><i class="fa-solid fa-clock"></i> Just now</div>
          <div><i class="fa-solid fa-route"></i> 0 trips</div>
          <div><i class="fa-solid fa-user"></i> ${role}</div>
        </div>
        <div class="user-card-actions">
          <button class="suspend"><i class="fa-solid fa-ban"></i> suspend</button>
          <button class="delete"><i class="fa-solid fa-trash"></i> delete</button>
        </div>
      `;
      userGrid.prepend(newUserCard);

      // Reattach suspend/delete functionality for new card
      newUserCard.querySelector('.suspend').addEventListener('click', () => alert('User suspended!'));
      newUserCard.querySelector('.delete').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this user?')) {
          newUserCard.remove();
        }
      });

      addUserModal.style.display = 'none';
      addUserForm.reset();
      updateNoResults();
    });
  }
});

