
import { getApiKey } from "./storageService";
import { fetchYouTubeData, YouTubeSearchResult } from "./youtubeApi";
import { 
  searchInvidious, 
  getTrendingVideos, 
  getVideoDetails,
  InvidiousVideo,
  InvidiousSearchResult 
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

// API Type
export type ApiType = 'youtube' | 'invidious';

// Get stored API preference
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

// Format duration
const formatDuration = (seconds: number): string => {
  if (!seconds) return "0:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Search videos using the preferred API
export const searchVideos = async (
  query: string, 
  maxResults: number = 20, 
  regionCode: string = "US"
): Promise<UnifiedVideo[]> => {
  const apiPreference = getApiPreference();
  
  try {
    if (apiPreference === 'youtube') {
      const apiKey = getApiKey();
      if (!apiKey) {
        toast.error("YouTube API key is required for YouTube search");
        throw new Error("YouTube API key is required");
      }
      
      const results = await fetchYouTubeData(apiKey, query, maxResults, regionCode);
      return convertYouTubeToUnified(results);
    } else {
      const results = await searchInvidious(query);
      return results.videos ? convertInvidiousToUnified(results.videos) : [];
    }
  } catch (error) {
    console.error("Search error:", error);
    
    // If primary API fails, try the other one
    if (apiPreference === 'youtube') {
      try {
        const results = await searchInvidious(query);
        return results.videos ? convertInvidiousToUnified(results.videos) : [];
      } catch (fallbackError) {
        throw fallbackError;
      }
    } else {
      const apiKey = getApiKey();
      if (apiKey) {
        try {
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
        toast.error("YouTube API key is required for trending videos");
        throw new Error("YouTube API key is required");
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
        const results = await getTrendingVideos(regionCode);
        return convertInvidiousToUnified(results);
      } catch (fallbackError) {
        throw fallbackError;
      }
    } else {
      const apiKey = getApiKey();
      if (apiKey) {
        try {
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
        throw new Error("YouTube API key is required");
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
      return await getVideoDetails(videoId);
    }
  } catch (error) {
    console.error("Video details error:", error);
    
    // If primary API fails, try the other one
    if (apiPreference === 'youtube') {
      try {
        return await getVideoDetails(videoId);
      } catch (fallbackError) {
        throw fallbackError;
      }
    } else {
      const apiKey = getApiKey();
      if (apiKey) {
        try {
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
