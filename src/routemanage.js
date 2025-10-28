document.addEventListener('DOMContentLoaded', function () {
  console.log('Script loaded and DOMContentLoaded fired');  // Debug: Confirm script runs

  // Define ALL DOM elements first (fixed order issue)
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const addRouteBtn = document.getElementById('addRouteBtn');
  const addRouteModal = document.getElementById('addRouteModal');
  const addRouteForm = document.getElementById('addRouteForm');
  const modalTitle = document.getElementById('modalTitle');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const routeStepsModal = document.getElementById('routeStepsModal');
  const routeStepsForm = document.getElementById('routeStepsForm');
  const saveRouteBtn = document.getElementById('saveRouteBtn');
  const routeViewModal = document.getElementById('routeViewModal');
  const routeViewContent = document.getElementById('routeViewContent');
  const routesGrid = document.getElementById('routesGrid');

  // Now define derived elements
  const closeBtn = addRouteModal ? addRouteModal.querySelector('.close-btn') : null;
  const closeStepsBtn = routeStepsModal ? routeStepsModal.querySelector('.close-steps-btn') : null;
  const closeViewBtn = routeViewModal ? routeViewModal.querySelector('.close-view-btn') : null;

  console.log('addRouteBtn element:', addRouteBtn);  // Debug: Check if button is found
  console.log('sidebar element:', sidebar);  // Debug: Check sidebar
  console.log('sidebar classList:', sidebar ? sidebar.classList : 'null');  // Debug: Check if sidebar is active

  let editingRoute = null;
  let tempRouteData = {};

  // Sidebar toggle (with null check)
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      console.log('Sidebar toggled, active?', sidebar.classList.contains('active'));  // Debug
    });
    // Close sidebar when clicking outside of it
    document.addEventListener('click', function (event) {
      const isClickInsideSidebar = sidebar.contains(event.target);
      const isClickOnMenuBtn = menuBtn.contains(event.target);

      if (!isClickInsideSidebar && !isClickOnMenuBtn) {
        sidebar.classList.remove('active');
        console.log('Sidebar closed via outside click');  // Debug
      }
    });
  }

  // Fetch routes from API and render (with error handling)
  async function initRoutes() {
    try {
      console.log('Fetching routes...');  // Debug
      const response = await fetch('/api/routes');
      if (!response.ok) throw new Error('Failed to fetch routes');
      const routes = await response.json();
      console.log('Routes fetched:', routes);  // Debug
      if (routesGrid) routesGrid.innerHTML = '';  // Clear grid
      routes.forEach(r => createRouteCard(r));
    } catch (err) {
      console.error('Failed to load routes:', err);
    }
  }

  // Create route card from data
  function createRouteCard(data) {
    if (!routesGrid) return;
    const newCard = document.createElement('div');
    newCard.className = 'route-card';
    newCard.dataset.id = data._id;  // Store MongoDB _id
    newCard.dataset.steps = JSON.stringify(data.steps || []);
    newCard.innerHTML = `
      <div class="route-title">
        <span>${escapeHtml(data.name)}</span>
        <span class="route-status ${data.status.toLowerCase()}">${escapeHtml(data.status)}</span>
      </div>
      <div class="route-desc">${escapeHtml(data.start)} → ${escapeHtml(data.end)}</div>
      <div class="route-riders">${(data.steps && data.steps.length) ? data.steps.length + ' steps' : '0 steps'}</div>
      <div class="route-actions">
        <button class="view"><i class="fa-solid fa-eye"></i> view</button>
        <button class="edit"><i class="fa-solid fa-pen"></i> edit</button>
        <button class="delete"><i class="fa-solid fa-trash"></i> delete</button>
      </div>
    `;
    routesGrid.appendChild(newCard);
    attachCardEvents(newCard);
  }

  // Update existing card
  function updateRouteCard(card, data) {
    if (!card) return;
    card.querySelector('.route-title span').textContent = data.name;
    const statusSpan = card.querySelector('.route-title .route-status');
    if (statusSpan) {
      statusSpan.textContent = data.status;
      statusSpan.className = 'route-status ' + data.status.toLowerCase();
    }
    card.querySelector('.route-desc').textContent = `${data.start} → ${data.end}`;
    card.querySelector('.route-riders').textContent = (data.steps && data.steps.length) ? data.steps.length + ' steps' : '0 steps';
    card.dataset.steps = JSON.stringify(data.steps || []);
  }

  // Attach events to card buttons (with null checks)
  function attachCardEvents(card) {
    if (!card) return;
    const editBtn = card.querySelector('.edit');
    const deleteBtn = card.querySelector('.delete');
    const viewBtn = card.querySelector('.view');

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        editingRoute = card;
        const id = card.dataset.id;
        const name = card.querySelector('.route-title span')?.textContent || '';
        const status = card.querySelector('.route-title .route-status')?.textContent || '';
        const desc = card.querySelector('.route-desc')?.textContent || '';
        const [start, end] = desc.split(' → ');
        const steps = card.dataset.steps ? JSON.parse(card.dataset.steps) : [];

        document.getElementById('newRouteName').value = name;
        document.getElementById('newRouteStart').value = start || '';
        document.getElementById('newRouteEnd').value = end || '';
        document.getElementById('newRouteStatus').value = status.toLowerCase();

        tempRouteData = { id, name, start: start || '', end: end || '', status, steps };
        if (modalTitle) modalTitle.textContent = "Edit Route";
        if (addRouteModal) addRouteModal.style.display = 'flex';
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener('click', async () => {
        if (confirm('Delete this route?')) {
          try {
            const id = card.dataset.id;
            const response = await fetch(`/api/routes/${id}`, { method: 'DELETE' });
            if (response.ok) card.remove();
            else console.error('Failed to delete route');
          } catch (err) {
            console.error('Failed to delete route:', err);
          }
        }
      });
    }

    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        const name = card.querySelector('.route-title span')?.textContent || '';
        const status = card.querySelector('.route-title .route-status')?.textContent || '';
        const desc = card.querySelector('.route-desc')?.textContent || '';
        const [start, end] = desc.split(' → ');
        const steps = card.dataset.steps ? JSON.parse(card.dataset.steps) : [];

        let stepsList = steps.length ? steps.slice(0,5).map((s, i) => `<li>${escapeHtml(s)}</li>`).join('') : '<li>No steps added</li>';

        if (routeViewContent) {
          routeViewContent.innerHTML = `
            <p><strong>Route Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Status:</strong> ${escapeHtml(status)}</p>
            <p><strong>Start Point:</strong> ${escapeHtml(start || '')}</p>
            <p><strong>End Point:</strong> ${escapeHtml(end || '')}</p>
            <h4>Steps:</h4>
            <ul>${stepsList}</ul>
          `;
        }
        if (routeViewModal) routeViewModal.style.display = 'flex';
      });
    }
  }

  // Helpers
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Initialize routes
  initRoutes();

  // Modal events (with null checks)
  if (addRouteBtn) {
    // Force clickability (temporary CSS override)
    addRouteBtn.style.pointerEvents = 'auto';
    addRouteBtn.style.zIndex = '1000';
    addRouteBtn.style.position = 'relative';  // Ensure it's not overlapped

    console.log('Attaching click listener to addRouteBtn');  // Debug
    addRouteBtn.addEventListener('click', (e) => {
      console.log('addRouteBtn clicked!', e);  // Debug: This should log on click
      if (modalTitle) modalTitle.textContent = "Add New Route";
      if (addRouteForm) addRouteForm.reset();
      tempRouteData = {};
      editingRoute = null;
      if (addRouteModal) addRouteModal.style.display = 'flex';
    });
  } else {
    console.error('addRouteBtn not found!');  // Debug: If this logs, the button ID is wrong
  }

  if (closeBtn) closeBtn.addEventListener('click', () => { if (addRouteModal) addRouteModal.style.display = 'none'; });
  if (closeStepsBtn) closeStepsBtn.addEventListener('click', () => { if (routeStepsModal) routeStepsModal.style.display = 'none'; });
  if (closeViewBtn) closeViewBtn.addEventListener('click', () => { if (routeViewModal) routeViewModal.style.display = 'none'; });

  window.addEventListener('click', e => {
    if (addRouteModal && e.target === addRouteModal) addRouteModal.style.display = 'none';
    if (routeStepsModal && e.target === routeStepsModal) routeStepsModal.style.display = 'none';
    if (routeViewModal && e.target === routeViewModal) routeViewModal.style.display = 'none';
  });

  // Next button: go to steps modal (with null checks)
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      tempRouteData = {
        name: document.getElementById('newRouteName')?.value || '',
        start: document.getElementById('newRouteStart')?.value || '',
        end: document.getElementById('newRouteEnd')?.value || '',
        status: document.getElementById('newRouteStatus')?.value || ''
      };
      if (addRouteModal) addRouteModal.style.display = 'none';
      // Prefill steps if editing
      const oldSteps = (tempRouteData.steps && tempRouteData.steps) || (editingRoute ? JSON.parse(editingRoute.dataset.steps || '[]') : []);
      ['step1','step2','step3','step4','step5'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.value = (oldSteps && oldSteps[i]) ? oldSteps[i] : '';
      });
      if (routeStepsModal) routeStepsModal.style.display = 'flex';
    });
  }

  // Save route from steps modal (with null checks and API call)
  if (routeStepsForm) {
    routeStepsForm.addEventListener('submit', async e => {
      e.preventDefault();
      const steps = [
        document.getElementById('step1')?.value.trim() || '',
        document.getElementById('step2')?.value.trim() || '',
        document.getElementById('step3')?.value.trim() || '',
        document.getElementById('step4')?.value.trim() || '',
        document.getElementById('step5')?.value.trim() || ''
      ].filter(s => s);  // Remove empty steps
      tempRouteData.steps = steps;

      try {
        let response;
        if (editingRoute && tempRouteData.id) {
          // Update existing
          response = await fetch(`/api/routes/${tempRouteData.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tempRouteData)
          });
          if (response.ok) {
            const updated = await response.json();
            updateRouteCard(editingRoute, updated);
          }
        } else {
          // Create new
          response = await fetch('/api/routes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tempRouteData)
          });
          if (response.ok) {
            const newRoute = await response.json();
            createRouteCard(newRoute);
          }
        }
      } catch (err) {
        console.error('Failed to save route:', err);
      }

      if (routeStepsModal) routeStepsModal.style.display = 'none';
      if (addRouteForm) addRouteForm.reset();
      if (routeStepsForm) routeStepsForm.reset();
      editingRoute = null;
    });
  }
});