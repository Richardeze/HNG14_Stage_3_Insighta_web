(async () => {
    const user = await requireAuth();
    if (!user) return;
    renderNav(user);
  
    document.getElementById('account-card').innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">
        <img src="${user.avatar_url || ''}" class="avatar" style="width:64px;height:64px" alt="${user.username}">
        <div>
          <div style="font-size:20px;font-weight:700">@${user.username}</div>
          <div style="color:#8b949e;margin-top:4px">${user.email || 'Email private'}</div>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-item">
          <label>Role</label>
          <span><span class="badge badge-${user.role}">${user.role}</span></span>
        </div>
        <div class="detail-item">
          <label>Status</label>
          <span style="color:${user.is_active ? '#3fb950' : '#f85149'}">${user.is_active ? 'Active' : 'Inactive'}</span>
        </div>
        <div class="detail-item">
          <label>Last Login</label>
          <span>${user.last_login_at ? new Date(user.last_login_at).toLocaleString() : '—'}</span>
        </div>
        <div class="detail-item">
          <label>Member Since</label>
          <span>${new Date(user.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    `;
  })();