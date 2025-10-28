document.addEventListener('DOMContentLoaded', function () {
  // Define DOM elements
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const addRouteBtn = document.getElementById('addRouteBtn');
  const addRouteModal = document.getElementById('addRouteModal');
  const addRouteForm = document.getElementById('addRouteForm');
  const modalTitle = document.getElementById('modalTitle');
  const nextStepBtn = document.getElementById('nextStepBtn');
  const routeStepsModal = document.getElementById('routeStepsModal');
  const routeStepsForm = document.getElementById('routeStepsForm');
  const routeViewModal = document.getElementById('routeViewModal');
  const routeViewContent = document.getElementById('routeViewContent');
  const routesGrid = document.getElementById('routesGrid');
  const closeBtn = addRouteModal?.querySelector('.close-btn');
  const closeStepsBtn = routeStepsModal?.querySelector('.close-steps-btn');
  const closeViewBtn = routeViewModal?.querySelector('.close-view-btn');

  let editingRoute = null;
  let tempRouteData = {};

  // Helper functions
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function updateRouteCard(card, data) {
    if (!card) return;
    card.querySelector('.route-title span').textContent = data.name;
    const statusSpan = card.querySelector('.route-title .route-status');
    if (statusSpan) {
      statusSpan.textContent = data.status;
      statusSpan.className = 'route-status ' + data.status.toLowerCase();
    }
    card.querySelector('.route-desc').textContent = `${data.start} → ${data.end}`;
    card.querySelector('.route-riders').textContent = (data.steps?.length) ? data.steps.length + ' steps' : '0 steps';
    card.dataset.steps = JSON.stringify(data.steps || []);
  }

  // Sidebar toggle
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
    document.addEventListener('click', (event) => {
      if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
        sidebar.classList.remove('active');
      }
    });
  }

  // Fetch and render routes
  async function initRoutes() {
    try {
      const response = await fetch('/api/routes');
      if (!response.ok) throw new Error('Failed to fetch routes');
      const routes = await response.json();
      if (routesGrid) routesGrid.innerHTML = '';
      routes.forEach(createRouteCard);
    } catch (err) {
      console.error('Failed to load routes:', err);
    }
  }

  // Create route card
  function createRouteCard(data) {
    if (!routesGrid) return;
    const newCard = document.createElement('div');
    newCard.className = 'route-card';
    newCard.dataset.id = data._id;
    newCard.dataset.steps = JSON.stringify(data.steps || []);
    newCard.innerHTML = `
      <div class="route-title">
        <span>${escapeHtml(data.name)}</span>
        <span class="route-status ${data.status.toLowerCase()}">${escapeHtml(data.status)}</span>
      </div>
      <div class="route-desc">${escapeHtml(data.start)} → ${escapeHtml(data.end)}</div>
      <div class="route-riders">${(data.steps?.length) ? data.steps.length + ' steps' : '0 steps'}</div>
      <div class="route-actions">
        <button class="view"><i class="fa-solid fa-eye"></i> view</button>
        <button class="edit"><i class="fa-solid fa-pen"></i> edit</button>
        <button class="delete"><i class="fa-solid fa-trash"></i> delete</button>
      </div>
    `;
    routesGrid.appendChild(newCard);
    attachCardEvents(newCard);
  }

  // Attach events to card buttons
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
        const steps = JSON.parse(card.dataset.steps || '[]');

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
            const response = await fetch(`/api/routes/${card.dataset.id}`, { method: 'DELETE' });
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
        const steps = JSON.parse(card.dataset.steps || '[]');

        const stepsList = steps.length ? steps.slice(0, 5).map(s => `<li>${escapeHtml(s)}</li>`).join('') : '<li>No steps added</li>';

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

  // Initialize routes
  initRoutes();

  // Modal events
  if (addRouteBtn) {
    addRouteBtn.addEventListener('click', () => {
      if (modalTitle) modalTitle.textContent = "Add New Route";
      if (addRouteForm) addRouteForm.reset();
      tempRouteData = {};
      editingRoute = null;
      if (addRouteModal) addRouteModal.style.display = 'flex';
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => { if (addRouteModal) addRouteModal.style.display = 'none'; });
  if (closeStepsBtn) closeStepsBtn.addEventListener('click', () => { if (routeStepsModal) routeStepsModal.style.display = 'none'; });
  if (closeViewBtn) closeViewBtn.addEventListener('click', () => { if (routeViewModal) routeViewModal.style.display = 'none'; });

  window.addEventListener('click', e => {
    if (addRouteModal && e.target === addRouteModal) addRouteModal.style.display = 'none';
    if (routeStepsModal && e.target === routeStepsModal) routeStepsModal.style.display = 'none';
    if (routeViewModal && e.target === routeViewModal) routeViewModal.style.display = 'none';
  });

  // Next step button
  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', () => {
      tempRouteData = {
        name: document.getElementById('newRouteName')?.value || '',
        start: document.getElementById('newRouteStart')?.value || '',
        end: document.getElementById('newRouteEnd')?.value || '',
        status: document.getElementById('newRouteStatus')?.value || ''
      };
      if (addRouteModal) addRouteModal.style.display = 'none';
      const oldSteps = tempRouteData.steps || (editingRoute ? JSON.parse(editingRoute.dataset.steps || '[]') : []);
      ['step1', 'step2', 'step3', 'step4', 'step5'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) el.value = oldSteps[i] || '';
      });
      if (routeStepsModal) routeStepsModal.style.display = 'flex';
    });
  }

  // Save route form
  if (routeStepsForm) {
    routeStepsForm.addEventListener('submit', async e => {
      e.preventDefault();
      const steps = ['step1', 'step2', 'step3', 'step4', 'step5']
        .map(id => document.getElementById(id)?.value.trim() || '')
        .filter(s => s);
      tempRouteData.steps = steps;

      try {
        let response;
        if (editingRoute && tempRouteData.id) {
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
