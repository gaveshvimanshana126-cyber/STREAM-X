// Firebase Realtime Database REST API Service & Session Auth
export const FIREBASE_API_KEY = "AIzaSyBkSdYjHaIaaB5OTpXcv0PArP4mmgo23Sk";
export const FIREBASE_DB_URL = "https://sutable-99848-default-rtdb.firebaseio.com";
export const ADMIN_EMAIL = "gaveshvimanshana@gmail.com";
export const IMGBB_API_KEY = "567ca8d36c11db6da21dd4289f252021";

let _authToken = null;

export const setAuthToken = (token) => {
  _authToken = token;
};

export const getAuthToken = () => _authToken;

const _rtdbUrl = (path) => {
  const authQS = _authToken ? `?auth=${_authToken}` : '';
  return `${FIREBASE_DB_URL}/${path}.json${authQS}`;
};

export const rtdbGet = async (path) => {
  const url = _rtdbUrl(path);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    const msg = (e && e.name === 'AbortError') ? 'Request timed out' : ((e && e.message) || 'Network error');
    throw new Error(msg);
  }
};

export const rtdbSet = async (path, data) => {
  const url = _rtdbUrl(path);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const rtdbPush = async (path, data) => {
  const url = _rtdbUrl(path);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return await res.json();
};

export const rtdbRemove = async (path) => {
  const url = _rtdbUrl(path);
  await fetch(url, { method: 'DELETE' });
};

// Real-time poller helper mimicking firebase.database().ref(path).on('value', cb)
export const subscribeRtdb = (path, callback, intervalMs = 30000) => {
  let lastHash = null;
  const poll = async () => {
    try {
      const data = await rtdbGet(path);
      const hash = JSON.stringify(data);
      if (hash === lastHash) return;
      lastHash = hash;
      callback(data);
    } catch (e) {
      console.warn(`[Firebase Poll Error on ${path}]:`, e.message);
    }
  };

  poll();
  const intervalId = setInterval(poll, intervalMs);
  return () => clearInterval(intervalId);
};

// Analytics Trackers
export const trackVisitor = async () => {
  try {
    if (sessionStorage.getItem('cf_visited')) return;
    sessionStorage.setItem('cf_visited', '1');

    const totUrl = `${FIREBASE_DB_URL}/analytics/totalVisitors.json`;
    const totRes = await fetch(totUrl);
    const totVal = (await totRes.json()) || 0;
    await fetch(totUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(totVal + 1) });

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayUrl = `${FIREBASE_DB_URL}/analytics/visitorsDaily/${today}.json`;
    const dayRes = await fetch(dayUrl);
    const dayVal = (await dayRes.json()) || 0;
    await fetch(dayUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dayVal + 1) });
  } catch (e) { }
};

export const incrementViews = async (movieId) => {
  try {
    const cur = await rtdbGet(`movies/${movieId}/views`) || 0;
    await rtdbSet(`movies/${movieId}/views`, cur + 1);

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayUrl = `${FIREBASE_DB_URL}/analytics/viewsDaily/${today}.json`;
    const dayRes = await fetch(dayUrl);
    const dayVal = (await dayRes.json()) || 0;
    await fetch(dayUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dayVal + 1) });
  } catch (e) { }
};

export const trackDownload = async (movieId) => {
  try {
    if (movieId) {
      const cur = await rtdbGet(`movies/${movieId}/downloads_count`) || 0;
      await rtdbSet(`movies/${movieId}/downloads_count`, cur + 1);
    }

    const totUrl = `${FIREBASE_DB_URL}/analytics/totalDownloads.json`;
    const totRes = await fetch(totUrl);
    const totVal = (await totRes.json()) || 0;
    await fetch(totUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(totVal + 1) });

    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayUrl = `${FIREBASE_DB_URL}/analytics/downloadsDaily/${today}.json`;
    const dayRes = await fetch(dayUrl);
    const dayVal = (await dayRes.json()) || 0;
    await fetch(dayUrl, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dayVal + 1) });
  } catch (e) { }
};

export const trackSubDownload = async (movieId) => {
  try {
    const cur = await rtdbGet(`movies/${movieId}/subtitle_downloads_count`) || 0;
    await rtdbSet(`movies/${movieId}/subtitle_downloads_count`, cur + 1);
  } catch (e) { }
};

// ImgBB Upload
export const uploadToImgBB = async (file) => {
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.success) throw new Error('ImgBB Upload failed');
  return data.data.url;
};
