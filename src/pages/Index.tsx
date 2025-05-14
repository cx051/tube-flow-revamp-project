
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { getApiKey, getSettings, storeVideoData } from '@/services/storageService';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import VideoCard from '@/components/VideoCard';
import SplashScreen from '@/components/SplashScreen';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UnifiedVideo, 
  searchVideos, 
  getTrending, 
  getApiPreference, 
  setApiPreference,
  FilterOptions
} from '@/services/apiService';
import { checkInvidiousStatus } from '@/services/invidiousApi';

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [settings, setSettings] = useState(getSettings());
  const [showSplash, setShowSplash] = useState(true);
  const [apiType, setApiType] = useState(getApiPreference());
  const [filters, setFilters] = useState<FilterOptions>({});
  const navigate = useNavigate();
  
  // Check if Invidious is available and set as default on initial load
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const isInvidiousAvailable = await checkInvidiousStatus();
        
        if (isInvidiousAvailable) {
          setApiPreference('invidious');
          setApiType('invidious');
        } else {
          const storedApiKey = getApiKey();
          if (storedApiKey) {
            setApiPreference('youtube');
            setApiType('youtube');
          } else {
            // If both are unavailable, still try with Invidious as it's the default preference
            setApiPreference('invidious');
            setApiType('invidious');
          }
        }
      } catch (error) {
        console.error("API status check error:", error);
      }
    };
    
    checkApiStatus();
    
    // Also load API key for YouTube (as fallback)
    const storedApiKey = getApiKey();
    setApiKey(storedApiKey);
    
    const storedSettings = getSettings();
    setSettings(storedSettings);
  }, []);
  
  // Determine whether to fetch trending or search results
  const isTrending = activeTab === 'trending';
  
  // Query for data (either YouTube or Invidious)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['videoData', searchQuery, isTrending, settings.regionCode, settings.maxResults, apiType, filters],
    queryFn: async () => {
      if (isTrending) {
        return await getTrending(settings.maxResults, settings.regionCode);
      } else if (searchQuery) {
        return await searchVideos(searchQuery, settings.maxResults, settings.regionCode, filters);
      } else {
        return await getTrending(settings.maxResults, settings.regionCode);
      }
    },
    enabled: !showSplash,
    refetchOnWindowFocus: false
  });
  
  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    
    if (tab === 'trending') {
      // Refetch with trending param
      refetch();
    } else if (tab === 'search' && searchQuery) {
      // Refetch with current search query
      refetch();
    } else if (tab === 'settings') {
      // Navigate to settings page
      navigate('/settings');
    }
  };
  
  // Handle search
  const handleSearch = (query: string, newFilters?: FilterOptions) => {
    setSearchQuery(query);
    if (newFilters) {
      setFilters(newFilters);
    }
    setActiveTab('search');
  };
  
  // Handle settings button click
  const handleSettingsOpen = () => {
    navigate('/settings');
  };
  
  // Show API key needed message only if YouTube is selected and no key is present
  const showNoApiKeyMessage = apiType === 'youtube' && !apiKey && !isLoading && !showSplash;

  // Container variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 }
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }
  
  // Invidious videos or empty array as fallback
  const videos: UnifiedVideo[] = data || [];
  
  return (
    <div className="flex h-screen overflow-hidden bg-background text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Background with animated gradient effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.15),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.8),transparent_70%)]"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzkuMTA0NTcgMCAxMCAwLjg5NTQzIDEwIDJDMTAgMy4xMDQ1NyA5LjEwNDU3IDQgOCA0QzYuODk1NDMgNCBDNS43OTQ4NyA0IDUgMy4xMDQ1NyA1IDJDNSAwLjg5NTQzIDUuODk1NDMgMCA4IDBaIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')] opacity-5"></div>
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="p-6">
            <SearchBar 
              onSearch={handleSearch} 
              onSettingsOpen={handleSettingsOpen}
              showFilters={searchQuery.length > 0} 
            />
          </header>
          
          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <AnimatePresence mode="wait">
              {showNoApiKeyMessage ? (
                <motion.div 
                  key="no-api-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="glass-morphism p-8 rounded-2xl shadow-lg max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-gradient-red">YouTube API Key Required</h2>
                    <p className="text-gray-400 mb-6">
                      YouTube API is currently selected but no API key is provided.
                      Add a key in settings or switch to Invidious.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleSettingsOpen}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors animate-pulse-glow"
                    >
                      Open Settings
                    </motion.button>
                  </div>
                </motion.div>
              ) : isLoading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full"
                >
                  <div className="relative">
                    <Loader2 size={48} className="animate-spin text-red-500 mb-4" />
                    <div className="absolute inset-0 blur-xl bg-red-500/20 -z-10 rounded-full"></div>
                  </div>
                  <p className="text-gray-400">Loading videos...</p>
                </motion.div>
              ) : error ? (
                <motion.div 
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <div className="glass-morphism p-8 rounded-2xl shadow-lg max-w-md">
                    <h2 className="text-xl font-bold mb-4 text-red-500">Error</h2>
                    <p className="text-gray-400 mb-6">
                      {error instanceof Error ? error.message : 'Failed to load videos'}
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => refetch()}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                    >
                      Try Again
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="content"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-2xl font-bold mb-6 pl-2 border-l-4 border-red-600"
                  >
                    {activeTab === 'trending' ? 'Trending Videos' : searchQuery ? `Search Results for "${searchQuery}"` : 'Home'}
                  </motion.h1>
                  
                  {videos.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center h-64 text-center"
                    >
                      <p className="text-gray-400">No videos found</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                    >
                      {videos.map((video, index) => (
                        <motion.div key={video.id || index} variants={itemVariants}>
                          <VideoCard video={video} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Index;
