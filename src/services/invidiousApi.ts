
import { toast } from "@/components/ui/sonner";

// Public Invidious instances
// This list will be updated periodically from https://api.invidious.io/instances.json
const PUBLIC_INSTANCES = [
  "https://invidious.snopyta.org",
  "https://yewtu.be",
  "https://invidious.kavin.rocks",
  "https://vid.puffyan.us",
  "https://inv.riverside.rocks",
  "https://yt.artemislena.eu",
  "https://invidious.flokinet.to",
  "https://invidious.esmailelbob.xyz",
  "https://inv.bp.projectsegfau.lt",
  "https://invidious.projectsegfau.lt"
];

// Interface for Invidious video
export interface InvidiousVideo {
  type: "video";
  title: string;
  videoId: string;
  author: string;
  authorId: string;
  authorUrl: string;
  videoThumbnails: {
    quality: string;
    url: string;
    width: number;
    height: number;
  }[];
  description: string;
  descriptionHtml: string;
  viewCount: number;
  published: number;
  publishedText: string;
  lengthSeconds: number;
  liveNow: boolean;
  premium: boolean;
  isUpcoming: boolean;
}

// Interface for Invidious channel
export interface InvidiousChannel {
  type: "channel";
  author: string;
  authorId: string;
  authorUrl: string;
  authorThumbnails: {
    url: string;
    width: number;
    height: number;
  }[];
  subCount: number;
  videoCount: number;
  description: string;
  descriptionHtml: string;
}

// Interface for search results
export interface InvidiousSearchResult {
  videos?: InvidiousVideo[];
  channels?: InvidiousChannel[];
  relatedVideos?: InvidiousVideo[];
}

// Interface for detailed video information
export interface InvidiousVideoDetails extends InvidiousVideo {
  genre: string;
  genreUrl: string;
  subCountText: string;
  allowRatings: boolean;
  rating: number;
  likeCount: number;
  dislikeCount: number;
  recommendedVideos: InvidiousVideo[];
  formatStreams?: {
    url: string;
    itag: string;
    type: string;
    quality: string;
    container: string;
    encoding: string;
    qualityLabel: string;
    resolution: string;
    size: string;
  }[];
  adaptiveFormats?: {
    index: string;
    bitrate: string;
    init: string;
    url: string;
    itag: string;
    type: string;
    clen: string;
    quality: string;
    fps?: number;
    container: string;
    encoding: string;
    qualityLabel?: string;
    resolution?: string;
  }[];
}

// Store current instance
let currentInstance = '';

// Get a random instance from the list
const getRandomInstance = () => {
  const index = Math.floor(Math.random() * PUBLIC_INSTANCES.length);
  return PUBLIC_INSTANCES[index];
};

// Initialize the current instance
const initializeInstance = () => {
  const storedInstance = localStorage.getItem('invidiousInstance');
  if (storedInstance && PUBLIC_INSTANCES.includes(storedInstance)) {
    currentInstance = storedInstance;
  } else {
    currentInstance = getRandomInstance();
    localStorage.setItem('invidiousInstance', currentInstance);
  }
  return currentInstance;
};

// Get the current instance or initialize if not set
export const getCurrentInstance = () => {
  if (!currentInstance) {
    return initializeInstance();
  }
  return currentInstance;
};

// Set a new instance and save it to localStorage
export const setInstance = (instance: string) => {
  if (PUBLIC_INSTANCES.includes(instance)) {
    currentInstance = instance;
    localStorage.setItem('invidiousInstance', instance);
    return true;
  }
  return false;
};

// Refresh the instance (choose a new random one)
export const refreshInstance = () => {
  const oldInstance = currentInstance;
  let newInstance;
  
  do {
    newInstance = getRandomInstance();
  } while (newInstance === oldInstance && PUBLIC_INSTANCES.length > 1);
  
  currentInstance = newInstance;
  localStorage.setItem('invidiousInstance', currentInstance);
  return currentInstance;
};

// Ping the instance with a test video to check if it's working
export const pingInstance = async (instance: string = currentInstance, testVideoId: string = 'dQw4w9WgXcQ'): Promise<boolean> => {
  try {
    const response = await fetch(`${instance}/api/v1/videos/${testVideoId}?fields=videoId`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return !!data.videoId;
  } catch (error) {
    console.error(`Ping failed for instance ${instance}:`, error);
    return false;
  }
};

// Fetch data with automatic fallback to other instances
export const fetchWithFallback = async (endpoint: string) => {
  let attempts = 0;
  const maxAttempts = Math.min(5, PUBLIC_INSTANCES.length);
  
  if (!currentInstance) {
    initializeInstance();
  }
  
  while (attempts < maxAttempts) {
    try {
      const response = await fetch(`${currentInstance}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error with instance ${currentInstance}:`, error);
      attempts++;
      
      // If failed, try another instance
      if (attempts < maxAttempts) {
        toast.warning(`Switching to another Invidious instance`);
        refreshInstance();
      }
    }
  }
  
  // All attempts failed
  toast.error("Failed to connect to any Invidious instance. Please try again later.");
  throw new Error("Failed to connect to any Invidious instance");
};

// Search for videos and channels with filter options
export const searchInvidious = async (
  query: string, 
  page: number = 1,
  filterParams: string = ""
): Promise<InvidiousSearchResult> => {
  try {
    const endpoint = `/api/v1/search?q=${encodeURIComponent(query)}&page=${page}${filterParams}`;
    const results = await fetchWithFallback(endpoint);
    
    const videos = results.filter((item: any) => item.type === "video") as InvidiousVideo[];
    const channels = results.filter((item: any) => item.type === "channel") as InvidiousChannel[];
    
    return { videos, channels };
  } catch (error) {
    console.error("Search error:", error);
    throw error;
  }
};

// Get trending videos
export const getTrendingVideos = async (region: string = "US", category: string = ""): Promise<InvidiousVideo[]> => {
  try {
    const endpoint = category 
      ? `/api/v1/trending?region=${region}&type=${category}` 
      : `/api/v1/trending?region=${region}`;
      
    const videos = await fetchWithFallback(endpoint);
    return videos;
  } catch (error) {
    console.error("Trending videos error:", error);
    throw error;
  }
};

// Get video details
export const getVideoDetails = async (videoId: string): Promise<InvidiousVideoDetails> => {
  try {
    const details = await fetchWithFallback(`/api/v1/videos/${videoId}`);
    return details;
  } catch (error) {
    console.error("Video details error:", error);
    throw error;
  }
};

// Get direct stream URL for a video
export const getStreamUrl = async (videoId: string): Promise<string | null> => {
  try {
    const videoDetails = await getVideoDetails(videoId);
    
    // Try to get the best quality stream URL
    if (videoDetails.formatStreams && videoDetails.formatStreams.length > 0) {
      // Sort by quality (higher resolution first)
      const sortedStreams = [...videoDetails.formatStreams].sort((a, b) => {
        const resA = parseInt(a.resolution?.split('p')[0] || '0', 10);
        const resB = parseInt(b.resolution?.split('p')[0] || '0', 10);
        return resB - resA;
      });
      
      return sortedStreams[0].url;
    }
    
    // If no format streams, create a direct watch URL
    return `${currentInstance}/watch?v=${videoId}`;
  } catch (error) {
    console.error("Failed to get stream URL:", error);
    return null;
  }
};

// Get channel details
export const getChannelDetails = async (channelId: string): Promise<InvidiousChannel> => {
  try {
    const details = await fetchWithFallback(`/api/v1/channels/${channelId}`);
    return details;
  } catch (error) {
    console.error("Channel details error:", error);
    throw error;
  }
};

// Format duration from seconds to MM:SS or HH:MM:SS
export const formatDuration = (seconds: number): string => {
  if (!seconds) return "0:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Format view count
export const formatViewCount = (count: number): string => {
  if (!count) return "0 views";
  
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  
  return `${count} views`;
};

// Check if Invidious is available
export const checkInvidiousStatus = async (): Promise<boolean> => {
  if (!currentInstance) {
    initializeInstance();
  }
  
  try {
    // Try to ping the current instance
    const isPingSuccessful = await pingInstance(currentInstance);
    
    if (!isPingSuccessful) {
      // If the current instance is not available, try to find a working one
      for (const instance of PUBLIC_INSTANCES) {
        if (instance !== currentInstance) {
          const isAvailable = await pingInstance(instance);
          if (isAvailable) {
            // Set the working instance as the current one
            setInstance(instance);
            return true;
          }
        }
      }
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error checking Invidious status:", error);
    return false;
  }
};
