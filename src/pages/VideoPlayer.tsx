
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, 
  Settings, Maximize, Minimize, ArrowLeft, Volume1, 
  ThumbsUp, Share, List, Download, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchYouTubeData, YouTubeVideoDetails } from '@/services/youtubeApi';
import { getApiKey } from '@/services/storageService';
import { toast } from '@/components/ui/sonner';
import SplitText from '@/components/animations/SplitText';
import AnimatedList from '@/components/animations/AnimatedList';
import Sidebar from '@/components/Sidebar';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [activeQuality, setActiveQuality] = useState('auto');
  const [isHovering, setIsHovering] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const apiKey = getApiKey();

  // Quality options
  const qualityOptions = [
    { label: 'Auto', value: 'auto' },
    { label: '2160p (4K)', value: '2160p' },
    { label: '1440p (2K)', value: '1440p' },
    { label: '1080p', value: '1080p' },
    { label: '720p', value: '720p' },
    { label: '480p', value: '480p' },
    { label: '360p', value: '360p' },
    { label: '240p', value: '240p' },
    { label: '144p', value: '144p' },
  ];

  // Playback rates
  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Fetch video details
  const { data: videoDetails, isLoading, error } = useQuery({
    queryKey: ['videoDetails', videoId],
    queryFn: async () => {
      if (!apiKey || !videoId) {
        throw new Error('API key or video ID missing');
      }

      // In a real implementation, you'd make a specific call to get video details
      // For now, we'll simulate this by just fetching search results with the video's ID
      const videoData = await fetch(`https://www.googleapis.com/youtube/v3/videos?key=${apiKey}&id=${videoId}&part=snippet,statistics,contentDetails`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch video details');
          return res.json();
        });
      
      return videoData.items[0];
    },
    enabled: !!apiKey && !!videoId
  });

  // Fetch related videos
  const { data: relatedVideos, isLoading: relatedLoading } = useQuery({
    queryKey: ['relatedVideos', videoId],
    queryFn: async () => {
      if (!apiKey || !videoId) {
        throw new Error('API key or video ID missing');
      }
      
      // Fetch related videos based on the current video's ID
      const relatedData = await fetch(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&relatedToVideoId=${videoId}&type=video&part=snippet&maxResults=10`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch related videos');
          return res.json();
        });
      
      return relatedData.items;
    },
    enabled: !!apiKey && !!videoId
  });

  useEffect(() => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };
    
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    
    const handleVideoEnd = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleVideoEnd);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleVideoEnd);
    };
  }, [videoRef]);

  // Auto-hide controls after 3 seconds of inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      setIsHovering(true);
      
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying && !showSettings && !showQualitySettings) {
          setShowControls(false);
          setIsHovering(false);
        }
      }, 3000);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying, showSettings, showQualitySettings]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };
  
  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
    
    if (newVolume === 0) {
      setIsMuted(true);
      videoRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      videoRef.current.muted = false;
    }
  };
  
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    
    const newTime = parseFloat(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };
  
  const handleQualityChange = (quality: string) => {
    // In a real implementation, you would change the video source
    // to the appropriate quality stream here
    setActiveQuality(quality);
    setShowQualitySettings(false);
    setShowSettings(false);
    toast.success(`Quality changed to ${quality}`);
  };
  
  const handlePlaybackRateChange = (rate: number) => {
    if (!videoRef.current) return;
    
    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
    toast.success(`Playback speed set to ${rate}x`);
  };
  
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Volume icon based on current volume
  const getVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX size={20} />;
    } else if (volume < 0.5) {
      return <Volume1 size={20} />;
    } else {
      return <Volume2 size={20} />;
    }
  };

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
  const formatPublishDate = (publishedAt?: string) => {
    if (!publishedAt) return '';
    
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const settingsVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <div className="animate-pulse w-16 h-16">
          <div className="w-full h-full rounded-full border-4 border-t-red-600 border-r-gray-200/20 border-b-gray-200/20 border-l-gray-200/20 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-400">Loading video...</p>
      </div>
    );
  }

  if (error || !videoDetails) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism p-8 rounded-2xl max-w-md text-center"
        >
          <h2 className="text-2xl font-bold mb-4 text-red-500">Error</h2>
          <p className="text-gray-300 mb-6">
            {error instanceof Error ? error.message : 'Failed to load video'}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            Back to Home
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <Sidebar activeTab="home" onTabChange={(tab) => navigate('/')} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <motion.div 
          className="relative z-10 w-full h-full overflow-y-auto scrollbar-hide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Video section */}
          <div className="relative aspect-video bg-black w-full">
            {/* YouTube iframe */}
            <iframe 
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}&rel=0`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
            
            {/* Video controls overlay - we would implement these controls if we had direct access to video stream */}
            <AnimatePresence>
              {showControls && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"
                >
                  {/* Top controls - Back button */}
                  <div className="absolute top-0 left-0 p-4">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate('/')}
                      className="p-2 rounded-full bg-black/50 hover:bg-black/70"
                    >
                      <ArrowLeft size={20} />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Video info section */}
          <div className="p-6">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-5xl mx-auto"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-2xl font-bold mb-2"
              >
                {videoDetails.snippet.title}
              </motion.h1>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap items-center justify-between mb-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
                  <a 
                    href={`https://www.youtube.com/channel/${videoDetails.snippet.channelId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold hover:text-red-500 transition-colors"
                  >
                    {videoDetails.snippet.channelTitle}
                  </a>
                  <div className="text-sm text-gray-400 flex items-center">
                    <span>{formatViewCount(videoDetails.statistics?.viewCount)}</span>
                    <span className="mx-2">•</span>
                    <span>{formatPublishDate(videoDetails.snippet.publishedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700"
                  >
                    <ThumbsUp size={18} />
                    <span>{videoDetails.statistics?.likeCount ? formatViewCount(videoDetails.statistics?.likeCount) : 'Like'}</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700"
                  >
                    <Share size={18} />
                    <span>Share</span>
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700"
                  >
                    <Download size={18} />
                    <span>Download</span>
                  </motion.button>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="bg-gray-800/40 rounded-xl p-4 mb-8"
              >
                <p className="text-gray-300 text-sm line-clamp-3">
                  {videoDetails.snippet.description}
                </p>
                <button className="text-sm text-gray-400 mt-2 hover:text-white">Show more</button>
              </motion.div>
              
              {/* Related videos */}
              <motion.div variants={itemVariants}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <List size={20} />
                  <SplitText>Related Videos</SplitText>
                </h2>
                
                {relatedLoading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                  </div>
                ) : (
                  <AnimatedList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedVideos?.map((video: any) => (
                      <motion.div 
                        key={video.id.videoId}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gray-800/40 rounded-lg overflow-hidden cursor-pointer"
                        onClick={() => navigate(`/video/${video.id.videoId}`)}
                      >
                        <div className="aspect-video relative">
                          <img 
                            src={video.snippet.thumbnails.high.url}
                            alt={video.snippet.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium line-clamp-2 mb-2">{video.snippet.title}</h3>
                          <p className="text-sm text-gray-400">{video.snippet.channelTitle}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatedList>
                )}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoPlayer;
