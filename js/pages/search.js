(async () => {
    const user = await requireAuth();
    if (!user) return;
    renderNav(user);
  })();
  
  async function doSearch() {
    const q = document.getElementById('search-input').value.trim();
    if (!q) return;
  
    const results = document.getElementById('results');
    results.innerHTML = '<div class="loader">Searching...</div>';
  
    const data = await api.get('/api/profiles/search', { q, limit: 20 });
  
    if (!data || data.status === 'error') {
      results.innerHTML = `<div class="alert alert-error">${data?.message || 'Unable to interpret query'}</div>`;
      return;
    }
  
    if (!data.data || data.data.length === 0) {
      results.innerHTML = '<div class="alert alert-error">No profiles found for that query.</div>';
      return;
    }
  
    results.innerHTML = `
      <p style="color:#8b949e;margin-bottom:16px">${data.total} results found</p>
      <div class="card">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Gender</th><th>Age</th><th>Age Group</th><th>Country</th></tr>
            </thead>
            <tbody>
              ${data.data.map(p => `
                <tr>
                  <td><a href="profile-detail.html?id=${p.id}">${p.name}</a></td>
                  <td><span class="badge badge-${p.gender}">${p.gender}</span></td>
                  <td>${p.age}</td>
                  <td>${p.age_group}</td>
                  <td>${p.country_id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }