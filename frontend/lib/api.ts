const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:8002/api';

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.details || error.error || 'API request failed');
  }

  return response.json();
}

export const endpoints = {
  stats: () => fetchApi('/stats'),
  settings: () => fetchApi('/settings'),
  updateSettings: (settings: any) => fetchApi('/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  testLocalModel: () => fetchApi('/settings/test-local', { method: 'POST' }),
  library: () => fetchApi('/library'),
  search: (query: string, threshold: number = 0) => fetchApi(`/search?q=${encodeURIComponent(query)}&threshold=${threshold}`),
  history: () => fetchApi('/history'),
  startIndexing: (folderPath: string) => fetchApi('/index/start', { method: 'POST', body: JSON.stringify({ folder_path: folderPath }) }),
  cancelIndexing: (jobId: string) => fetchApi(`/index/cancel/${jobId}`, { method: 'POST' }),
  progressStream: (jobId: string) => `${API_BASE_URL}/index/progress/${jobId}`,
  streamVideo: (videoId: string) => `${API_BASE_URL}/video/stream/${videoId}`,
  trimClip: (videoId: string, start: number, end: number, padding: number = 2.0) =>
    `${API_BASE_URL}/video/trim/${encodeURIComponent(videoId)}?start=${start}&end=${end}&padding=${padding}`,
};