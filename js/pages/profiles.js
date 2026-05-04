let currentPage = 1;
let currentUser = null;

function getFilters() {
  return {
    gender: document.getElementById('f-gender').value,
    age_group: document.getElementById('f-age-group').value,
    country_id: document.getElementById('f-country').value,
    min_age: document.getElementById('f-min-age').value,
    max_age: document.getElementById('f-max-age').value,
    sort_by: document.getElementById('f-sort').value,
    order: document.getElementById('f-order').value,
    page: currentPage,
    limit: 10,
  };
}

async function loadProfiles(page = 1) {
  currentPage = page;
  document.getElementById('profiles-tbody').innerHTML =
    '<tr><td colspan="6" class="loader">Loading...</td></tr>';

  const data = await api.get('/api/profiles', getFilters());

  if (!data || data.status === 'error') {
    document.getElementById('profiles-tbody').innerHTML =
      `<tr><td colspan="6" style="color:#f85149;padding:16px">${data?.message || 'Error loading profiles'}</td></tr>`;
    return;
  }

  if (!data.data || data.data.length === 0) {
    document.getElementById('profiles-tbody').innerHTML =
      '<tr><td colspan="6" style="color:#8b949e;padding:16px">No profiles found.</td></tr>';
  } else {
    document.getElementById('profiles-tbody').innerHTML = data.data.map(p => `
      <tr>
        <td><a href="profile-detail.html?id=${p.id}">${p.name}</a></td>
        <td><span class="badge badge-${p.gender}">${p.gender}</span></td>
        <td>${p.age}</td>
        <td>${p.age_group}</td>
        <td>${p.country_id}</td>
        <td>
          <a href="profile-detail.html?id=${p.id}" class="btn btn-secondary" style="padding:4px 10px;font-size:12px">View</a>
          ${currentUser?.role === 'admin' ? `<button onclick="deleteProfile('${p.id}')" class="btn btn-danger" style="padding:4px 10px;font-size:12px;margin-left:4px">Delete</button>` : ''}
        </td>
      </tr>
    `).join('');
  }

  document.getElementById('page-info').textContent = `Page ${data.page} of ${data.total_pages} (${data.total} total)`;
  document.getElementById('prev-btn').disabled = data.page <= 1;
  document.getElementById('next-btn').disabled = data.page >= data.total_pages;
}

function changePage(dir) {
  loadProfiles(currentPage + dir);
}

async function deleteProfile(id) {
  if (!confirm('Delete this profile?')) return;
  await api.delete(`/api/profiles/${id}`);
  loadProfiles(currentPage);
}

function openModal() {
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
  document.getElementById('new-name').value = '';
  document.getElementById('modal-msg').innerHTML = '';
}

async function createProfile() {
  const name = document.getElementById('new-name').value.trim();
  if (!name) return;

  document.getElementById('modal-msg').innerHTML = '<span style="color:#8b949e">Creating...</span>';
  const data = await api.post('/api/profiles', { name });

  if (data.status === 'success') {
    closeModal();
    loadProfiles(1);
  } else {
    document.getElementById('modal-msg').innerHTML =
      `<span style="color:#f85149">${data.message}</span>`;
  }
}

(async () => {
  currentUser = await requireAuth();
  if (!currentUser) return;
  renderNav(currentUser);

  if (currentUser.role === 'admin') {
    document.getElementById('create-btn').style.display = 'inline-flex';
    document.getElementById('create-btn').onclick = openModal;
  }

  loadProfiles(1);
})();