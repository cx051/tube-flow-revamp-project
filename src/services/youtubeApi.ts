import { toast } from "@/components/ui/sonner";

// YouTube API types
export interface YouTubeSearchResult {
  kind: string;
  etag: string;
  id: {
    kind: string;
    videoId?: string;
    channelId?: string;
    playlistId?: string;
  };
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    liveBroadcastContent: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
  // Add these properties to match UnifiedVideo interface
  title?: string;
  description?: string;
  channelTitle?: string;
  channelId?: string;
  publishedAt?: string;
  viewCount?: string;
  likeCount?: string;
  thumbnailUrl?: string;
  source?: 'youtube' | 'invidious'; // Added source property
}

export interface YouTubeVideoDetails {
  kind: string;
  etag: string;
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    tags?: string[];
    categoryId: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    favoriteCount: string;
    commentCount: string;
  };
}

export interface YouTubeSearchResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeSearchResult[];
}

export interface YouTubeVideoResponse {
  kind: string;
  etag: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: YouTubeVideoDetails[];
}

// Function to validate the YouTube API key format
export function isValidYouTubeApiKey(apiKey: string): boolean {
  // YouTube API keys are typically 39 characters long and start with 'AIza'
  return /^AIza[0-9A-Za-z_-]{35}$/.test(apiKey);
}

// Main function to fetch YouTube data
export async function fetchYouTubeData(
  apiKey: string,
  searchQuery?: string,
  maxResults: number = 20,
  regionCode: string = "US",
  isTrending: boolean = false
): Promise<YouTubeSearchResult[]> {
  try {
    // Validate API key format
    if (!isValidYouTubeApiKey(apiKey)) {
      throw new Error("Invalid YouTube API key format");
    }
    
    // For trending videos
    if (isTrending) {
      const trendingUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&chart=mostPopular&part=snippet,statistics&maxResults=${maxResults}&regionCode=${regionCode}`;
      
      const response = await fetch(trendingUrl);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform video response format to match search results format
      return data.items.map((item: any) => ({
        kind: "youtube#searchResult",
        etag: item.etag,
        id: { 
          kind: "youtube#video", 
          videoId: item.id 
        },
        snippet: item.snippet,
        statistics: item.statistics,
        // Add these properties to match UnifiedVideo interface
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        publishedAt: item.snippet.publishedAt,
        viewCount: item.statistics?.viewCount || "0",
        likeCount: item.statistics?.likeCount || "0",
        thumbnailUrl: item.snippet.thumbnails?.high?.url || "",
        source: 'youtube' // Added source property
      }));
    }
    
    // For search results
    if (!searchQuery) {
      throw new Error("Search query is required");
    }
    
    // Fix the duplicate part parameter issue by removing statistics from search request
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&maxResults=${maxResults}&regionCode=${regionCode}&q=${encodeURIComponent(searchQuery)}&type=video`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    // Get video IDs for fetching statistics
    const videoIds = data.items
      .filter((item: YouTubeSearchResult) => item.id.videoId)
      .map((item: YouTubeSearchResult) => item.id.videoId)
      .join(",");
    
    if (videoIds) {
      try {
        // Fetch additional video details including statistics
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoIds}&part=snippet,statistics`;
        
        const videoResponse = await fetch(videoDetailsUrl);
        
        if (!videoResponse.ok) {
          // Just return search results if we can't get video details
          return data.items;
        }
        
        const videoData = await videoResponse.json();
        
        // Create a map of video details by ID for quick lookup
        const videoDetailsMap = new Map();
        videoData.items.forEach((item: YouTubeVideoDetails) => {
          videoDetailsMap.set(item.id, item);
        });
        
        // Enhance search results with statistics from video details
        return data.items.map((item: YouTubeSearchResult) => {
          const videoId = item.id.videoId;
          const videoDetails = videoId ? videoDetailsMap.get(videoId) : null;
          
          if (videoDetails) {
            return {
              ...item,
              statistics: videoDetails.statistics,
              // Add these properties to match UnifiedVideo interface
              title: item.snippet.title,
              description: item.snippet.description,
              channelTitle: item.snippet.channelTitle,
              channelId: item.snippet.channelId,
              publishedAt: item.snippet.publishedAt,
              viewCount: videoDetails.statistics?.viewCount || "0",
              likeCount: videoDetails.statistics?.likeCount || "0",
              thumbnailUrl: item.snippet.thumbnails?.high?.url || "",
              source: 'youtube' // Added source property
            };
          }
          
          return {
            ...item,
            // Add these properties to match UnifiedVideo interface
            title: item.snippet.title,
            description: item.snippet.description,
            channelTitle: item.snippet.channelTitle,
            channelId: item.snippet.channelId,
            publishedAt: item.snippet.publishedAt,
            viewCount: "0",
            likeCount: "0",
            thumbnailUrl: item.snippet.thumbnails?.high?.url || "",
            source: 'youtube' // Added source property
          };
        });
      } catch (statisticsError) {
        console.error("Error fetching video statistics:", statisticsError);
        // If statistics fetch fails, return original items
        return data.items;
      }
    }
    
    return data.items;
  } catch (error) {
    console.error("YouTube API Error:", error);
    toast.error(`YouTube API Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    throw error;
  }
}
