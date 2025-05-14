
import { getApiKey } from "./storageService";
import { fetchYouTubeData, YouTubeSearchResult } from "./youtubeApi";
import { 
  searchInvidious, 
  getTrendingVideos, 
  getVideoDetails,
  InvidiousVideo,
  InvidiousSearchResult,
  getCurrentInstance,
  checkInvidiousStatus,
  fetchWithFallback,
  formatDuration,
  formatViewCount
} from "./invidiousApi";
import { toast } from "@/components/ui/sonner";

// Unified video interface for both APIs
export interface UnifiedVideo {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount: string | number;
  likeCount?: string | number;
  thumbnailUrl: string;
  duration?: string;
  source: 'youtube' | 'invidious';
}

// Filter options interface
export interface FilterOptions {
  sort?: string;
  date?: string;
  duration?: string;
  type?: string;
}

// API Type
export type ApiType = 'youtube' | 'invidious';

// Get stored API preference (defaulting to invidious)
export const getApiPreference = (): ApiType => {
  const preference = localStorage.getItem('apiPreference');
  return (preference === 'youtube' ? 'youtube' : 'invidious') as ApiType;
};

// Set API preference
export const setApiPreference = (preference: ApiType) => {
  localStorage.setItem('apiPreference', preference);
};

// Convert YouTube results to unified format
const convertYouTubeToUnified = (results: YouTubeSearchResult[]): UnifiedVideo[] => {
  return results.map(item => ({
    id: item.id.videoId || '',
    title: item.snippet.title,
    description: item.snippet.description,
    channelTitle: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    publishedAt: item.snippet.publishedAt,
    viewCount: item.statistics?.viewCount || '0',
    likeCount: item.statistics?.likeCount || '0',
    thumbnailUrl: item.snippet.thumbnails.high.url,
    source: 'youtube' as const
  }));
};

// Convert Invidious results to unified format
const convertInvidiousToUnified = (videos: InvidiousVideo[]): UnifiedVideo[] => {
  return videos.map(video => ({
    id: video.videoId,
    title: video.title,
    description: video.description,
    channelTitle: video.author,
    channelId: video.authorId,
    publishedAt: new Date(video.published * 1000).toISOString(),
    viewCount: video.viewCount,
    likeCount: 0, // Not always available in search results
    thumbnailUrl: video.videoThumbnails[0]?.url || '',
    duration: formatDuration(video.lengthSeconds),
    source: 'invidious' as const
  }));
};

// Check if Invidious is available 
export const checkApiAvailability = async (): Promise<ApiType> => {
  try {
    // Check if Invidious is available by fetching a random trending video
    const isInvidiousAvailable = await checkInvidiousStatus();
    
    if (isInvidiousAvailable) {
      return 'invidious';
    } else {
      // If Invidious is not available, check if YouTube API key is set
      const apiKey = getApiKey();
      if (apiKey) {
        return 'youtube';
      } else {
        // If neither is available, default to Invidious anyway
        return 'invidious';
      }
    }
  } catch (error) {
    console.error('API availability check error:', error);
    return 'invidious'; // Default to Invidious even if check fails
  }
};

// Get stream URL based on video ID and source
export const getStreamUrl = (videoId: string, source: ApiType = 'invidious'): string => {
  if (source === 'invidious') {
    const instance = getCurrentInstance();
    return `${instance}/watch?v=${videoId}`;
  } else {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
};

// Search videos using the preferred API
export const searchVideos = async (
  query: string, 
  maxResults: number = 20, 
  regionCode: string = "US",
  filters?: FilterOptions
): Promise<UnifiedVideo[]> => {
  const apiPreference = getApiPreference();
  
  try {
    if (apiPreference === 'youtube') {
      const apiKey = getApiKey();
      if (!apiKey) {
        toast.error("Switching to Invidious as YouTube API key is missing");
        setApiPreference('invidious');
        return searchWithInvidious(query, filters);
      }
      
      const results = await fetchYouTubeData(apiKey, query, maxResults, regionCode);
      return convertYouTubeToUnified(results);
    } else {
      return searchWithInvidious(query, filters);
    }
  } catch (error) {
    console.error("Search error:", error);
    
    // If primary API fails, try the other one
    if (apiPreference === 'youtube') {
      try {
        toast.warning("YouTube API failed, trying Invidious");
        return searchWithInvidious(query, filters);
      } catch (fallbackError) {
        throw fallbackError;
      }
    } else {
      const apiKey = getApiKey();
      if (apiKey) {
        try {
          toast.warning("Invidious API failed, trying YouTube");
          const results = await fetchYouTubeData(apiKey, query, maxResults, regionCode);
          return convertYouTubeToUnified(results);
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
    }
    
    throw error;
  }
};

// Helper function for Invidious search with filters
const searchWithInvidious = async (query: string, filters?: FilterOptions): Promise<UnifiedVideo[]> => {
  // Build filter parameters
  let filterParams = '';
  
  if (filters) {
    if (filters.sort) filterParams += `&sort=${filters.sort}`;
    if (filters.date) filterParams += `&date=${filters.date}`;
    if (filters.duration) filterParams += `&duration=${filters.duration}`;
    if (filters.type) filterParams += `&type=${filters.type}`;
  }
  
  // Use the Invidious API with filters
  const results = await searchInvidious(query, 1, filterParams);
  return results.videos ? convertInvidiousToUnified(results.videos) : [];
};

// Get trending videos using the preferred API
export const getTrending = async (
  maxResults: number = 20, 
  regionCode: string = "US"
): Promise<UnifiedVideo[]> => {
  const apiPreference = getApiPreference();
  
  try {
    if (apiPreference === 'youtube') {
      const apiKey = getApiKey();
      if (!apiKey) {
        toast.warning("Switching to Invidious as YouTube API key is missing");
        setApiPreference('invidious');
        const results = await getTrendingVideos(regionCode);
        return convertInvidiousToUnified(results);
      }
      
      const results = await fetchYouTubeData(apiKey, undefined, maxResults, regionCode, true);
      return convertYouTubeToUnified(results);
    } else {
      const results = await getTrendingVideos(regionCode);
      return convertInvidiousToUnified(results);
    }
  } catch (error) {
    console.error("Trending error:", error);
    
    // If primary API fails, try the other one
    if (apiPreference === 'youtube') {
      try {
        toast.warning("YouTube API failed, trying Invidious");
        const results = await getTrendingVideos(regionCode);
        return convertInvidiousToUnified(results);
      } catch (fallbackError) {
        throw fallbackError;
      }
    } else {
      const apiKey = getApiKey();
      if (apiKey) {
        try {
          toast.warning("Invidious API failed, trying YouTube");
          const results = await fetchYouTubeData(apiKey, undefined, maxResults, regionCode, true);
          return convertYouTubeToUnified(results);
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
    }
    
    throw error;
  }
};

// Get video details from either API
export const getVideoInfo = async (videoId: string): Promise<any> => {
  const apiPreference = getApiPreference();
  
  try {
    if (apiPreference === 'youtube') {
      const apiKey = getApiKey();
      if (!apiKey) {
        toast.warning("Switching to Invidious as YouTube API key is missing");
        setApiPreference('invidious');
        return getInvidiousVideoInfo(videoId);
      }
      
      // For YouTube, we need to make a specific API call
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=snippet,statistics,contentDetails`
      );
      
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.items[0];
    } else {
      return getInvidiousVideoInfo(videoId);
    }
  } catch (error) {
    console.error("Video details error:", error);
    
    // If primary API fails, try the other one
    if (apiPreference === 'youtube') {
      try {
        toast.warning("YouTube API failed, trying Invidious");
        return getInvidiousVideoInfo(videoId);
      } catch (fallbackError) {
        throw fallbackError;
      }
    } else {
      const apiKey = getApiKey();
      if (apiKey) {
        try {
          toast.warning("Invidious API failed, trying YouTube");
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=snippet,statistics,contentDetails`
          );
          
          if (!response.ok) {
            throw new Error(`YouTube API error: ${response.status}`);
          }
          
          const data = await response.json();
          return data.items[0];
        } catch (fallbackError) {
          throw fallbackError;
        }
      }
    }
    
    throw error;
  }
};

// Helper function to handle Invidious video info retrieval
const getInvidiousVideoInfo = async (videoId: string) => {
  try {
    const videoDetails = await getVideoDetails(videoId);
    return videoDetails;
  } catch (error) {
    console.error("Invidious video details error:", error);
    throw error;
  }
};
