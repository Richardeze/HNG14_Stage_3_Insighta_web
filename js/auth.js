const BACKEND_URL = 'http://127.0.0.1:8000';


function saveTokens(accessToken, refreshToken, csrfToken) {
  sessionStorage.setItem('access_token', accessToken);
  sessionStorage.setItem('refresh_token', refreshToken);
  sessionStorage.setItem('csrf_token', csrfToken);
}

function getAccessToken() {
  return sessionStorage.getItem('access_token');
}

function getRefreshToken() {
  return sessionStorage.getItem('refresh_token');
}

function getCSRFToken() {
  return sessionStorage.getItem('csrf_token');
}

function clearTokens() {
  sessionStorage.clear();
}


function checkUrlTokens() {
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  const csrfToken = params.get('csrf_token');

  if (accessToken && refreshToken) {
    saveTokens(accessToken, refreshToken, csrfToken);

    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

async function requireAuth() {

  checkUrlTokens();

  const token = getAccessToken();
  if (!token) {
    window.location.href = '/index.html';
    return null;
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-API-Version': '1',
      },
    });

    if (!res.ok) {

      const refreshed = await tryRefresh();
      if (!refreshed) {
        clearTokens();
        window.location.href = '/index.html';
        return null;
      }

      const res2 = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`,
          'X-API-Version': '1',
        },
      });
      if (!res2.ok) {
        clearTokens();
        window.location.href = '/index.html';
        return null;
      }
      const data2 = await res2.json();
      return data2.data;
    }

    const data = await res.json();
    return data.data;
  } catch {
    clearTokens();
    window.location.href = '/index.html';
    return null;
  }
}

async function tryRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    saveTokens(data.access_token, data.refresh_token, getCSRFToken());
    return true;
  } catch {
    return false;
  }
}

function renderNav(user) {
  const nav = document.getElementById('nav-user');
  if (!nav || !user) return;
  nav.innerHTML = `
    <img src="${user.avatar_url || ''}" class="avatar" alt="${user.username}">
    <span style="font-size:14px;color:#8b949e">@${user.username}</span>
  `;
}

async function logout() {
  const refreshToken = getRefreshToken();
  try {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ refresh_token: refreshToken || '' }),
    });
  } catch {}
  clearTokens();
  window.location.href = '/index.html';
}