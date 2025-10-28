document.addEventListener('DOMContentLoaded', function () {
  // Sidebar toggle
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
    document.addEventListener('click', (event) => {
      if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
        sidebar.classList.remove('active');
      }
    });
  }

  // Utility: Show/hide 'No user found' message
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
    const anyVisible = [...document.querySelectorAll('.user-card')].some(card => card.style.display !== 'none');
    noEl.style.display = anyVisible ? 'none' : '';
  }

  // Sign Out button
  const signOutBtn = document.getElementById('signOutBtn');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      alert('Signed out successfully!');
      window.location.href = 'login.html';
    });
  }

  // User card actions
  document.querySelectorAll('.user-card-actions .view').forEach(btn =>
    btn.addEventListener('click', () => alert('Viewing user details...'))
  );
  document.querySelectorAll('.user-card-actions .edit').forEach(btn =>
    btn.addEventListener('click', () => alert('Editing user...'))
  );
  document.querySelectorAll('.user-card-actions .suspend').forEach(btn =>
    btn.addEventListener('click', () => alert('User suspended!'))
  );
  document.querySelectorAll('.user-card-actions .delete').forEach(btn =>
    btn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this user?')) {
        alert('User deleted!');
        btn.closest('.user-card').remove();
      }
    })
  );

  // Search functionality
  const searchInput = document.querySelector('.user-searchbar input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase();
      document.querySelectorAll('.user-card').forEach(card => {
        const name = card.querySelector('.user-name').textContent.toLowerCase();
        const email = card.querySelector('.user-email').textContent.toLowerCase();
        card.style.display = (name.includes(query) || email.includes(query)) ? '' : 'none';
      });
      updateNoResults();
    });
  }

  // Filter by status
  const statusSelect = document.querySelector('.filter-group select');
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      const selected = statusSelect.value.toLowerCase();
      document.querySelectorAll('.user-card').forEach(card => {
        const status = card.querySelector('.user-status').textContent.toLowerCase();
        card.style.display = (selected === 'all status' || status === selected) ? '' : 'none';
      });
      updateNoResults();
    });
  }
});
