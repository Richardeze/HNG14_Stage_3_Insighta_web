(async () => {
    const user = await requireAuth();
    if (!user) return;
    renderNav(user);
  
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) {
      window.location.href = '/profiles.html';
      return;
    }
  
    const data = await api.get(`/api/profiles/${id}`);
  
    if (!data || data.status === 'error') {
      document.getElementById('detail-card').innerHTML =
        `<div class="alert alert-error">${data?.message || 'Profile not found'}</div>`;
      return;
    }
  
    const p = data.data;
    document.getElementById('detail-card').innerHTML = `
      <h2 style="font-size:22px;color:#e6edf3;margin-bottom:24px;text-transform:capitalize">${p.name}</h2>
      <div class="detail-grid">
        <div class="detail-item"><label>Gender</label>
          <span><span class="badge badge-${p.gender}">${p.gender}</span></span></div>
        <div class="detail-item"><label>Age</label><span>${p.age}</span></div>
        <div class="detail-item"><label>Age Group</label><span>${p.age_group}</span></div>
        <div class="detail-item"><label>Gender Probability</label><span>${(p.gender_probability * 100).toFixed(1)}%</span></div>
        <div class="detail-item"><label>Country</label><span>${p.country_name} (${p.country_id})</span></div>
        <div class="detail-item"><label>Country Probability</label><span>${(p.country_probability * 100).toFixed(1)}%</span></div>
        <div class="detail-item"><label>Created At</label><span>${new Date(p.created_at).toLocaleString()}</span></div>
        <div class="detail-item"><label>ID</label><span style="font-size:12px;color:#8b949e">${p.id}</span></div>
      </div>
    `;
  })();