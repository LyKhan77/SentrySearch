// Get the API base URL dynamically
// For production: use environment variable
// For development on local network: auto-detect or use env var
const getApiBaseUrl = () => {
  // Check if there's an environment variable set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // In browser, detect the current host
  if (typeof window !== 'undefined') {
    // Use the same host as the frontend, but on port 8002
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:8002/api`;
  }
  
  // Fallback for SSR
  return 'http://localhost:8002/api';
};

export const API_BASE_URL = getApiBaseUrl();

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  console.log('Fetching from:', url);
  
  const response = await fetch(url, {
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

// Helper to extract video ID from full URL or return as-is
const extractVideoId = (videoUrlOrId: string): string => {
  if (videoUrlOrId.startsWith('http')) {
    // Extract the video ID from the full URL
    // URL format: http://host:8002/api/video/stream/{videoId}
    const match = videoUrlOrId.match(/\/api\/video\/stream\/(.+)$/);
    return match ? match[1] : videoUrlOrId;
  }
  return videoUrlOrId;
};

// Helper to get base URL for API calls
const getApiBaseFromUrl = (fullUrl: string): string => {
  if (fullUrl.startsWith('http')) {
    const url = new URL(fullUrl);
    return `${url.protocol}//${url.host}/api`;
  }
  return API_BASE_URL;
};

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
  // Video URLs are now full URLs from backend, use as-is
  streamVideo: (videoUrl: string) => videoUrl,
  trimClip: (videoUrl: string, start: number, end: number, padding: number = 2.0) => {
    const videoId = extractVideoId(videoUrl);
    const baseUrl = getApiBaseFromUrl(videoUrl);
    return `${baseUrl}/video/trim/${encodeURIComponent(videoId)}?start=${start}&end=${end}&padding=${padding}`;
  },
};
