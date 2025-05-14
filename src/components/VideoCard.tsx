
import React from 'react';
import { YouTubeSearchResult } from '@/services/youtubeApi';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface VideoCardProps {
  video: YouTubeSearchResult;
}

const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const { snippet, id, statistics } = video;
  const navigate = useNavigate();
  
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
  
  const handleClick = () => {
    if (id.videoId) {
      navigate(`/video/${id.videoId}`);
    }
  };
  
  return (
    <motion.div 
      className="bg-gray-800/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform transition-all duration-300"
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div 
        onClick={handleClick}
        className="cursor-pointer"
      >
        <div className="relative aspect-video">
          <img 
            src={snippet.thumbnails.high.url} 
            alt={snippet.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
            <div className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-medium line-clamp-2 mb-2 text-white">{snippet.title}</h3>
          
          <div className="flex items-center text-gray-400 text-sm mb-2">
            <p className="hover:text-red-400 transition-colors">
              {snippet.channelTitle}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{statistics && formatViewCount(statistics.viewCount)}</span>
            <span>{formatPublishDate(snippet.publishedAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VideoCard;
