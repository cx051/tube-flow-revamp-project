
/// <reference types="vite/client" />

// Define the UnifiedVideo interface for consistent video data structure
interface UnifiedVideo {
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  viewCount: string | number;
  likeCount: string | number;
  thumbnailUrl: string;
  videoId?: string;
  id?: {
    videoId?: string;
    kind?: string;
  };
  snippet?: {
    title?: string;
    description?: string;
    channelTitle?: string;
    channelId?: string;
    publishedAt?: string;
    thumbnails?: {
      default?: { url: string; width: number; height: number };
      medium?: { url: string; width: number; height: number };
      high?: { url: string; width: number; height: number };
    };
  };
  statistics?: {
    viewCount?: string;
    likeCount?: string;
    favoriteCount?: string;
    commentCount?: string;
  };
}
