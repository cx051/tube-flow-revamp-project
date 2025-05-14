
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/components/ui/sonner';
import { fetchYouTubeData, YouTubeSearchResult } from '@/services/youtubeApi';
import { getApiKey, getSettings, storeVideoData, getVideoData } from '@/services/storageService';
import Sidebar from '@/components/Sidebar';
import SearchBar from '@/components/SearchBar';
import Settings from '@/components/Settings';
import VideoCard from '@/components/VideoCard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [settings, setSettings] = useState(getSettings());
  
  // Fetch stored data on initial load
  useEffect(() => {
    const storedApiKey = getApiKey();
    const storedSettings = getSettings();
    
    setApiKey(storedApiKey);
    setSettings(storedSettings);
  }, []);
  
  // Determine whether to fetch trending or search results
  const isTrending = activeTab === 'trending';
  
  // Query for YouTube data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['youtubeData', searchQuery, isTrending, settings.regionCode, settings.maxResults, apiKey],
    queryFn: async () => {
      if (!apiKey) {
        throw new Error('YouTube API key is required');
      }
      
      const results = await fetchYouTubeData(
        apiKey,
        isTrending ? undefined : searchQuery || undefined,
        settings.maxResults,
        settings.regionCode,
        isTrending
      );
      
      // Cache the results
      storeVideoData(results);
      return results;
    },
    enabled: !!apiKey && (!!searchQuery || isTrending),
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
    }
  };
  
  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setActiveTab('search');
  };
  
  // Handle settings change
  const handleSettingsChanged = () => {
    setApiKey(getApiKey());
    setSettings(getSettings());
    refetch();
  };
  
  // Get cached video data if not loading and no data from query
  const videos: YouTubeSearchResult[] = data || (isLoading ? [] : getVideoData() || []);

  // Show no API key message if needed
  const showNoApiKeyMessage = !apiKey && !isLoading;
  
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Background with animated gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 z-0 opacity-50">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzkuMTA0NTcgMCAxMCAwLjg5NTQzIDEwIDJDMTAgMy4xMDQ1NyA5LjEwNDU3IDQgOCA0QzYuODk1NDMgNCBDNS43OTQ4NyA0IDUgMy4xMDQ1NyA1IDJDNSAwLjg5NTQzIDUuODk1NDMgMCA4IDBaIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-5"></div>
        </div>
        
        <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="p-6">
            <SearchBar 
              onSearch={handleSearch} 
              onSettingsOpen={() => setShowSettings(true)} 
            />
          </header>
          
          {/* Content area */}
          <main className="flex-1 overflow-y-auto p-6">
            {showNoApiKeyMessage ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
                  <h2 className="text-2xl font-bold mb-4">YouTube API Key Required</h2>
                  <p className="text-gray-400 mb-6">
                    To use this application, you need to provide a valid YouTube API key in the settings.
                  </p>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Open Settings
                  </button>
                </div>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
                <p className="text-gray-400">Loading videos...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md">
                  <h2 className="text-xl font-bold mb-4 text-red-500">Error</h2>
                  <p className="text-gray-400 mb-6">
                    {error instanceof Error ? error.message : 'Failed to load videos'}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-6">
                  {activeTab === 'trending' ? 'Trending Videos' : searchQuery ? `Search Results for "${searchQuery}"` : 'Home'}
                </h1>
                
                {videos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <p className="text-gray-400">No videos found</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video, index) => (
                      <AnimatedTransition 
                        key={video.id.videoId || index} 
                        show={true} 
                        type="fade" 
                        delay={index * 50}
                      >
                        <VideoCard video={video} />
                      </AnimatedTransition>
                    ))}
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      
      {/* Settings modal */}
      <Settings 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
        onSettingsChanged={handleSettingsChanged} 
      />
    </div>
  );
};

export default Index;
