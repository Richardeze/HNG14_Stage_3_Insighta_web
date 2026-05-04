const BACKEND_URL = 'http://127.0.0.1:8000';

async function request(method, path, body = null, params = null) {
  let url = `${BACKEND_URL}${path}`;

  if (params) {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== null && v !== undefined && v !== '')
      )
    ).toString();
    if (qs) url += '?' + qs;
  }

  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    'X-API-Version': '1',
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (['POST', 'PUT', 'DELETE'].includes(method)) {
    const csrf = getCSRFToken();
    if (csrf) headers['X-CSRF-Token'] = csrf;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  let response = await fetch(url, options);


  if (response.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getAccessToken()}`;
      response = await fetch(url, { ...options, headers });
    } else {
      clearTokens();
      window.location.href = '/index.html';
      return;
    }
  }

  return response.json();
}

const api = {
  get: (path, params) => request('GET', path, null, params),
  post: (path, body) => request('POST', path, body),
  delete: (path) => request('DELETE', path),
};