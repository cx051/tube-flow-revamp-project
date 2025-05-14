
import { getApiPreference } from "@/services/apiService";
import { getCurrentInstance } from "@/services/invidiousApi";
import { toast } from "@/components/ui/sonner";

// Formats for video URL handling
export type VideoSource = 'youtube' | 'invidious';

// Get the proper embed URL for a video based on the API preference
export const getEmbedUrl = (videoId: string, source?: VideoSource): string => {
  const apiPreference = source || getApiPreference();
  
  if (apiPreference === 'invidious') {
    const instance = getCurrentInstance();
    return `${instance}/embed/${videoId}`;
  } else {
    return `https://www.youtube.com/embed/${videoId}`;
  }
};

// Get the direct watch URL for a video
export const getWatchUrl = (videoId: string, source?: VideoSource): string => {
  const apiPreference = source || getApiPreference();
  
  if (apiPreference === 'invidious') {
    const instance = getCurrentInstance();
    return `${instance}/watch?v=${videoId}`;
  } else {
    return `https://www.youtube.com/watch?v=${videoId}`;
  }
};

// Extract video ID from various URL formats
export const extractVideoId = (url: string): string | null => {
  // Handle YouTube URLs
  let match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (match && match[1]) return match[1];
  
  // Handle Invidious URLs
  match = url.match(/(?:invidio\.us|invidious\.[a-z]+\.[a-z]+|yewtu\.be|inv\.riverside\.rocks|yt\.artemislena\.eu)\/(?:watch\?v=|v\/|embed\/)([^"&?\/\s]{11})/);
  if (match && match[1]) return match[1];
  
  // Direct video ID (11 characters)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  
  return null;
};

// Check if a video stream is available by performing a HEAD request
export const checkVideoAvailability = async (videoId: string, source?: VideoSource): Promise<boolean> => {
  try {
    const apiPreference = source || getApiPreference();
    let url = '';
    
    if (apiPreference === 'invidious') {
      const instance = getCurrentInstance();
      url = `${instance}/api/v1/videos/${videoId}?fields=formatStreams`;
    } else {
      url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error(`Video availability check failed for ${videoId}:`, error);
    return false;
  }
};

// Function to handle video errors and display appropriate messages
export const handleVideoError = (videoId: string, error: any, source: VideoSource) => {
  console.error(`Error playing video ${videoId}:`, error);
  
  if (source === 'invidious') {
    toast.error("Failed to play video with Invidious. Trying YouTube instead...");
  } else {
    toast.error("Failed to play video with YouTube. Trying Invidious instead...");
  }
  
  // Return the alternate source to try
  return source === 'invidious' ? 'youtube' : 'invidious';
};
