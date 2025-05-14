// Keys for localStorage items
const STORAGE_KEYS = {
  API_KEY: 'youtube-api-key',
  SEARCH_HISTORY: 'youtube-search-history',
  VIDEO_DATA: 'youtube-video-data',
  SETTINGS: 'youtube-app-settings',
};

// Store YouTube API key
export const storeApiKey = (apiKey: string): void => {
  localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
};

// Get stored YouTube API key
export const getApiKey = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.API_KEY);
};

// Store search history
export const storeSearchHistory = (searchQueries: string[]): void => {
  localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(searchQueries));
};

// Get stored search history
export const getSearchHistory = (): string[] => {
  const history = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
  return history ? JSON.parse(history) : [];
};

// Add a search query to history
export const addSearchToHistory = (query: string): void => {
  const history = getSearchHistory();
  
  // Don't add duplicates, move to top if exists
  const filteredHistory = history.filter(item => item !== query);
  filteredHistory.unshift(query);
  
  // Keep only the most recent 20 searches
  const trimmedHistory = filteredHistory.slice(0, 20);
  
  storeSearchHistory(trimmedHistory);
};

// Store video data cache
export const storeVideoData = (data: any): void => {
  localStorage.setItem(STORAGE_KEYS.VIDEO_DATA, JSON.stringify(data));
};

// Get stored video data cache
export const getVideoData = (): any => {
  const data = localStorage.getItem(STORAGE_KEYS.VIDEO_DATA);
  return data ? JSON.parse(data) : null;
};

// Store app settings
export const storeSettings = (settings: any): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Get stored app settings
export const getSettings = (): any => {
  const settings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  return settings ? JSON.parse(settings) : {
    regionCode: 'US',
    maxResults: 20,
    theme: 'dark',
  };
};

// Clear all stored data
export const clearAllData = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

// Clear only video content data
export const clearVideoData = (): void => {
  localStorage.removeItem(STORAGE_KEYS.VIDEO_DATA);
  localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
};
