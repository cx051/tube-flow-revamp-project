
import React from 'react';
import { YouTubeSearchResult } from '@/services/youtubeApi';

interface VideoCardProps {
  video: YouTubeSearchResult;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { snippet, id, statistics } = video;
  
  // Format view count
  const formatViewCount = (count?: string) => {
    if (!count) return '';
    
    const num = parseInt(count, 10);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M views`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K views`;
    }
    return `${num} views`;
  };
  
  // Format publish date
  const formatPublishDate = (publishedAt: string) => {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };
  
  const videoUrl = id.videoId ? `https://www.youtube.com/watch?v=${id.videoId}` : '#';
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200">
      <a href={videoUrl} target="_blank" rel="noopener noreferrer">
        <div className="relative aspect-video">
          <img 
            src={snippet.thumbnails.high.url} 
            alt={snippet.title}
            className="w-full h-full object-cover"
          />
        </div>
      </a>
      
      <div className="p-4">
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-white hover:text-purple-400"
        >
          <h3 className="font-medium line-clamp-2 mb-2">{snippet.title}</h3>
        </a>
        
        <div className="flex items-center text-gray-400 text-sm mb-2">
          <a 
            href={`https://www.youtube.com/channel/${snippet.channelId}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-purple-400"
          >
            {snippet.channelTitle}
          </a>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{statistics && formatViewCount(statistics.viewCount)}</span>
          <span>{formatPublishDate(snippet.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
