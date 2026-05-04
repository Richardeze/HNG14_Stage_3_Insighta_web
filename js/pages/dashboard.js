(async () => {
    const user = await requireAuth();
    if (!user) return;
    renderNav(user);
  
    // Load stats
    const [all, male, female] = await Promise.all([
      api.get('/api/profiles', { limit: 1 }),
      api.get('/api/profiles', { gender: 'male', limit: 1 }),
      api.get('/api/profiles', { gender: 'female', limit: 1 }),
    ]);
  
    document.getElementById('total').textContent = all.total ?? '—';
    document.getElementById('male').textContent = male.total ?? '—';
    document.getElementById('female').textContent = female.total ?? '—';
  
    // Recent profiles
    const recent = await api.get('/api/profiles', { limit: 5 });
    const tbody = document.getElementById('recent');
  
    if (!recent.data || recent.data.length === 0) {
      tbody.innerHTML = '<p style="color:#8b949e">No profiles yet.</p>';
      return;
    }
  
    tbody.innerHTML = `
      <table>
        <thead>
          <tr><th>Name</th><th>Gender</th><th>Age</th><th>Country</th></tr>
        </thead>
        <tbody>
          ${recent.data.map(p => `
            <tr>
              <td><a href="profile-detail.html?id=${p.id}">${p.name}</a></td>
              <td><span class="badge badge-${p.gender}">${p.gender}</span></td>
              <td>${p.age}</td>
              <td>${p.country_id}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  })();