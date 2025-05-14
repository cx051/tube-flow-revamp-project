
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, 
  Settings, Maximize, Minimize, ArrowLeft, Volume1, 
  ThumbsUp, Share, List, Download, ChevronDown,
  ChevronUp, ExternalLink, Theater, Maximize2, Minimize2,
  ChevronRight, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/components/ui/sonner';
import SplitText from '@/components/animations/SplitText';
import AnimatedList from '@/components/animations/AnimatedList';
import Sidebar from '@/components/Sidebar';
import { getVideoInfo } from '@/services/apiService';
import { getSettings } from '@/services/storageService';
import { getApiPreference } from '@/services/apiService';
import { formatViewCount, formatDuration } from '@/services/invidiousApi';

const VideoPlayer = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showQualitySettings, setShowQualitySettings] = useState(false);
  const [showSpeedSettings, setShowSpeedSettings] = useState(false);
  const [activeQuality, setActiveQuality] = useState('auto');
  const [isHovering, setIsHovering] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [apiSource] = useState(getApiPreference());
  const settings = getSettings();
  
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
    queryKey: ['videoDetails', videoId, apiSource],
    queryFn: async () => {
      if (!videoId) {
        throw new Error('Video ID missing');
      }
      return await getVideoInfo(videoId);
    }
  });

  // Fetch related videos
  const { data: relatedVideos, isLoading: relatedLoading } = useQuery({
    queryKey: ['relatedVideos', videoId, apiSource],
    queryFn: async () => {
      if (!videoId) {
        throw new Error('Video ID missing');
      }
      
      // For YouTube API source
      if (apiSource === 'youtube') {
        // This uses the YouTube API to get related videos
        const videoData = videoDetails;
        if (!videoData) return [];
        
        // In a real-world scenario, we'd fetch related videos from the YouTube API
        return videoData.recommendedVideos || [];
      } 
      // For Invidious API source
      else {
        // Invidious video details include recommended videos
        return videoDetails?.recommendedVideos || [];
      }
    },
    enabled: !!videoDetails
  });

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 't':
          e.preventDefault();
          toggleTheaterMode();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime += 10;
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime -= 10;
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.min(1, volume + 0.1);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(false);
            videoRef.current.muted = false;
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (videoRef.current) {
            const newVolume = Math.max(0, volume - 0.1);
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            if (newVolume === 0) {
              setIsMuted(true);
              videoRef.current.muted = true;
            }
          }
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [volume, isPlaying]);

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
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleVideoEnd);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleVideoEnd);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [videoRef.current]);
  
  // Check fullscreen state changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

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
    if (!videoContainerRef.current) return;
    
    if (!isFullscreen) {
      if (videoContainerRef.current.requestFullscreen) {
        videoContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
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
    setShowSpeedSettings(false);
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

  // Format publish date
  const formatPublishDate = (publishedAt?: string | number) => {
    if (!publishedAt) return '';
    
    let date;
    if (typeof publishedAt === 'number') {
      date = new Date(publishedAt * 1000);
    } else {
      date = new Date(publishedAt);
    }
    
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

  // Extract data based on API source
  const getVideoData = () => {
    if (!videoDetails) return null;
    
    if (apiSource === 'youtube') {
      return {
        title: videoDetails.snippet?.title || '',
        description: videoDetails.snippet?.description || '',
        channelTitle: videoDetails.snippet?.channelTitle || '',
        channelId: videoDetails.snippet?.channelId || '',
        publishedAt: videoDetails.snippet?.publishedAt || '',
        viewCount: videoDetails.statistics?.viewCount || '0',
        likeCount: videoDetails.statistics?.likeCount || '0',
        thumbnailUrl: videoDetails.snippet?.thumbnails?.high?.url || '',
      };
    } else {
      return {
        title: videoDetails.title || '',
        description: videoDetails.description || '',
        channelTitle: videoDetails.author || '',
        channelId: videoDetails.authorId || '',
        publishedAt: videoDetails.published || 0,
        viewCount: videoDetails.viewCount || 0,
        likeCount: videoDetails.likeCount || 0,
        thumbnailUrl: videoDetails.videoThumbnails?.[0]?.url || '',
      };
    }
  };

  const videoData = getVideoData();

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

  if (error || !videoDetails || !videoData) {
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
          className="relative z-10 w-full h-full overflow-y-auto scrollbar-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`flex ${isTheaterMode ? 'flex-col' : 'flex-col lg:flex-row'} w-full`}>
            {/* Video section */}
            <div 
              ref={videoContainerRef}
              className={`relative ${
                isTheaterMode 
                  ? 'w-full aspect-video max-h-[80vh]' 
                  : 'w-full lg:w-3/4 aspect-video'
              } bg-black overflow-hidden`}
            >
              {videoId && (
                <div className="w-full h-full relative">
                  {/* Video iframe */}
                  {apiSource === 'youtube' ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}&rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  ) : (
                    <iframe
                      src={`${getCurrentInstance()}/embed/${videoId}?autoplay=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  )}
                  
                  {/* Video overlay controls */}
                  <AnimatePresence>
                    {showControls && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent group"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay();
                        }}
                      >
                        {/* Top controls - Back button */}
                        <div 
                          className="absolute top-0 left-0 p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate('/')}
                            className="p-2 rounded-full bg-black/50 hover:bg-black/70"
                          >
                            <ArrowLeft size={20} />
                          </motion.button>
                        </div>
                        
                        {/* Centered play/pause button */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <motion.button
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: isPlaying ? 0 : 1, scale: isPlaying ? 0.5 : 1 }}
                            transition={{ duration: 0.2 }}
                            className="p-4 rounded-full bg-red-600/90 text-white"
                          >
                            <Play size={32} fill="white" />
                          </motion.button>
                        </div>
                        
                        {/* Bottom controls */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 p-4 flex flex-col"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Progress bar */}
                          <div className="w-full mb-4">
                            <input
                              type="range"
                              min={0}
                              max={duration || 100}
                              value={currentTime}
                              onChange={handleSeek}
                              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                              style={{
                                background: `linear-gradient(to right, #ff0000 ${(currentTime / (duration || 100)) * 100}%, rgba(255, 255, 255, 0.3) ${(currentTime / (duration || 100)) * 100}%)`
                              }}
                            />
                            <div className="flex justify-between text-xs text-gray-300 mt-1">
                              <span>{formatTime(currentTime)}</span>
                              <span>{formatTime(duration)}</span>
                            </div>
                          </div>
                          
                          {/* Control buttons */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Play/Pause */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={togglePlay}
                                className="p-2"
                              >
                                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                              </motion.button>
                              
                              {/* Volume */}
                              <div className="flex items-center space-x-2 group relative">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={toggleMute}
                                  className="p-2"
                                >
                                  {getVolumeIcon()}
                                </motion.button>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={volume}
                                  onChange={handleVolumeChange}
                                  className="w-0 group-hover:w-20 transition-all duration-300 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer opacity-0 group-hover:opacity-100"
                                  style={{
                                    background: `linear-gradient(to right, #fff ${volume * 100}%, rgba(255, 255, 255, 0.3) ${volume * 100}%)`
                                  }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {/* Theater mode */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleTheaterMode}
                                className="p-2"
                              >
                                <Theatre size={20} />
                              </motion.button>
                              
                              {/* Settings */}
                              <div className="relative">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setShowSettings(!showSettings);
                                    setShowQualitySettings(false);
                                    setShowSpeedSettings(false);
                                  }}
                                  className="p-2"
                                >
                                  <Settings size={20} className={showSettings ? "animate-spin-slow" : ""} />
                                </motion.button>
                                
                                {/* Settings menu */}
                                <AnimatePresence>
                                  {showSettings && (
                                    <motion.div
                                      variants={settingsVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="hidden"
                                      className="absolute bottom-12 right-0 w-56 bg-black/90 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                                    >
                                      <div className="p-2">
                                        <button
                                          onClick={() => {
                                            setShowQualitySettings(true);
                                            setShowSettings(false);
                                          }}
                                          className="flex items-center justify-between w-full p-2 hover:bg-gray-800 rounded"
                                        >
                                          <span>Quality</span>
                                          <div className="flex items-center">
                                            <span className="text-sm text-gray-400">{activeQuality}</span>
                                            <ChevronRight size={16} className="ml-2" />
                                          </div>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setShowSpeedSettings(true);
                                            setShowSettings(false);
                                          }}
                                          className="flex items-center justify-between w-full p-2 hover:bg-gray-800 rounded"
                                        >
                                          <span>Playback speed</span>
                                          <div className="flex items-center">
                                            <span className="text-sm text-gray-400">{playbackRate}x</span>
                                            <ChevronRight size={16} className="ml-2" />
                                          </div>
                                        </button>
                                        <a
                                          href={`https://www.youtube.com/watch?v=${videoId}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center justify-between w-full p-2 hover:bg-gray-800 rounded"
                                        >
                                          <span>Watch on YouTube</span>
                                          <ExternalLink size={16} />
                                        </a>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                                
                                {/* Quality submenu */}
                                <AnimatePresence>
                                  {showQualitySettings && (
                                    <motion.div
                                      variants={settingsVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="hidden"
                                      className="absolute bottom-12 right-0 w-56 bg-black/90 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                                    >
                                      <div className="p-2">
                                        <button
                                          onClick={() => {
                                            setShowQualitySettings(false);
                                            setShowSettings(true);
                                          }}
                                          className="flex items-center w-full p-2 hover:bg-gray-800 rounded mb-1"
                                        >
                                          <ChevronLeft size={16} className="mr-2" />
                                          <span>Quality</span>
                                        </button>
                                        <div className="space-y-1 max-h-60 overflow-y-auto">
                                          {qualityOptions.map((option) => (
                                            <button
                                              key={option.value}
                                              onClick={() => handleQualityChange(option.value)}
                                              className={`flex items-center justify-between w-full p-2 hover:bg-gray-800 rounded ${activeQuality === option.value ? 'bg-gray-800' : ''}`}
                                            >
                                              <span>{option.label}</span>
                                              {activeQuality === option.value && (
                                                <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                                
                                {/* Speed submenu */}
                                <AnimatePresence>
                                  {showSpeedSettings && (
                                    <motion.div
                                      variants={settingsVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="hidden"
                                      className="absolute bottom-12 right-0 w-56 bg-black/90 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                                    >
                                      <div className="p-2">
                                        <button
                                          onClick={() => {
                                            setShowSpeedSettings(false);
                                            setShowSettings(true);
                                          }}
                                          className="flex items-center w-full p-2 hover:bg-gray-800 rounded mb-1"
                                        >
                                          <ChevronLeft size={16} className="mr-2" />
                                          <span>Playback speed</span>
                                        </button>
                                        <div className="space-y-1">
                                          {playbackRates.map((rate) => (
                                            <button
                                              key={rate}
                                              onClick={() => handlePlaybackRateChange(rate)}
                                              className={`flex items-center justify-between w-full p-2 hover:bg-gray-800 rounded ${playbackRate === rate ? 'bg-gray-800' : ''}`}
                                            >
                                              <span>{rate}x</span>
                                              {playbackRate === rate && (
                                                <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                                              )}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                              
                              {/* Fullscreen */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleFullscreen}
                                className="p-2"
                              >
                                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            
            {/* Related videos sidebar - only shown in non-theater mode */}
            {!isTheaterMode && (
              <div className="w-full lg:w-1/4 p-4 overflow-y-auto max-h-screen scrollbar-none">
                <h3 className="text-lg font-bold mb-4">Related Videos</h3>
                
                {relatedLoading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500"></div>
                  </div>
                ) : (
                  <AnimatedList className="space-y-4">
                    {relatedVideos?.slice(0, 10).map((video: any, index: number) => (
                      <motion.div 
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex space-x-2 cursor-pointer"
                        onClick={() => navigate(`/video/${apiSource === 'youtube' ? video.id?.videoId : video.videoId}`)}
                      >
                        <div className="flex-shrink-0 w-40 h-24 relative rounded overflow-hidden">
                          <img 
                            src={apiSource === 'youtube' 
                              ? video.snippet?.thumbnails?.medium?.url 
                              : video.videoThumbnails?.[0]?.url} 
                            alt={video.title || video.snippet?.title}
                            className="w-full h-full object-cover"
                          />
                          {video.lengthSeconds && (
                            <div className="absolute bottom-1 right-1 bg-black/80 px-1 text-xs rounded">
                              {formatDuration(video.lengthSeconds)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-2">
                            {video.title || video.snippet?.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {video.author || video.snippet?.channelTitle}
                          </p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            {video.viewCount && (
                              <span className="mr-2">
                                {typeof video.viewCount === 'number' 
                                  ? formatViewCount(video.viewCount)
                                  : `${video.viewCount} views`}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatedList>
                )}
              </div>
            )}
          </div>

          {/* Video info section */}
          <div className="p-6 max-w-5xl mx-auto">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1 
                variants={itemVariants}
                className="text-2xl font-bold mb-2"
              >
                {videoData.title}
              </motion.h1>
              
              <motion.div 
                variants={itemVariants}
                className="flex flex-wrap items-center justify-between mb-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-0">
                  <a 
                    href={`https://www.youtube.com/channel/${videoData.channelId}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold hover:text-red-500 transition-colors"
                  >
                    {videoData.channelTitle}
                  </a>
                  <div className="text-sm text-gray-400 flex items-center">
                    <span>
                      {typeof videoData.viewCount === 'number' 
                        ? formatViewCount(videoData.viewCount) 
                        : `${videoData.viewCount} views`}
                    </span>
                    <span className="mx-2">•</span>
                    <span>{formatPublishDate(videoData.publishedAt)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 hover:bg-gray-700"
                  >
                    <ThumbsUp size={18} />
                    <span>
                      {typeof videoData.likeCount === 'number' 
                        ? formatViewCount(videoData.likeCount) 
                        : `${videoData.likeCount} likes`}
                    </span>
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
              
              {/* Description - collapsible */}
              <motion.div variants={itemVariants}>
                <motion.button
                  onClick={() => setShowDescription(!showDescription)}
                  className="w-full flex items-center justify-between bg-gray-800/40 rounded-xl p-4 mb-4 hover:bg-gray-800/60 transition-colors"
                >
                  <span className="font-medium">Description</span>
                  {showDescription ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </motion.button>
                
                <AnimatePresence>
                  {showDescription && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-800/40 rounded-xl p-4 mb-8 overflow-hidden"
                    >
                      <p className="text-gray-300 whitespace-pre-wrap">
                        {videoData.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Related videos - shown in theater mode or on mobile */}
              {(isTheaterMode || window.innerWidth < 1024) && (
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
                      {relatedVideos?.slice(0, 9).map((video: any, index: number) => (
                        <motion.div 
                          key={index}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-gray-800/40 rounded-lg overflow-hidden cursor-pointer"
                          onClick={() => navigate(`/video/${apiSource === 'youtube' ? video.id?.videoId : video.videoId}`)}
                        >
                          <div className="aspect-video relative">
                            <img 
                              src={apiSource === 'youtube' 
                                ? video.snippet?.thumbnails?.high?.url 
                                : video.videoThumbnails?.[0]?.url} 
                              alt={video.title || video.snippet?.title}
                              className="w-full h-full object-cover"
                            />
                            {video.lengthSeconds && (
                              <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 text-xs rounded">
                                {formatDuration(video.lengthSeconds)}
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium line-clamp-2 mb-2">
                              {video.title || video.snippet?.title}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {video.author || video.snippet?.channelTitle}
                            </p>
                            {video.viewCount && (
                              <p className="text-xs text-gray-500 mt-1">
                                {typeof video.viewCount === 'number' 
                                  ? formatViewCount(video.viewCount)
                                  : `${video.viewCount} views`}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatedList>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
          
          {/* Footer */}
          <div className="text-center text-xs text-gray-500 p-4 border-t border-gray-800/40">
            Made with ❤️ by cx051
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const getCurrentInstance = () => {
  const instance = localStorage.getItem('invidiousInstance');
  if (!instance) {
    return "https://invidious.snopyta.org";
  }
  return instance;
};

export default VideoPlayer;
