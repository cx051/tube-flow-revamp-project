
/// <reference types="vite/client" />

// Define the UnifiedVideo interface for consistent video data structure
interface UnifiedVideo {
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
