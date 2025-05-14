
import React, { useState, useEffect } from 'react';
import { X, Trash2, ArrowLeft, RefreshCw, RotateCw } from 'lucide-react';
import { storeApiKey, getApiKey, getSettings, storeSettings, clearAllData, clearVideoData } from '@/services/storageService';
import { isValidYouTubeApiKey } from '@/services/youtubeApi';
import { toast } from '@/components/ui/sonner';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SplitText from '@/components/animations/SplitText';
import { getCurrentInstance, refreshInstance, checkInvidiousStatus } from '@/services/invidiousApi';
import { getApiPreference, setApiPreference, ApiType } from '@/services/apiService';

const REGION_CODES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'BR', name: 'Brazil' },
];

const MAX_RESULTS_OPTIONS = [10, 20, 30, 50];

const Settings = () => {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState(getApiKey() || '');
  const [settings, setSettings] = useState(getSettings());
  const [currentInstance, setCurrentInstance] = useState(getCurrentInstance());
  const [apiPreference, setApiPref] = useState<ApiType>(getApiPreference());
  const [checkingInstance, setCheckingInstance] = useState(false);
  const [instanceStatus, setInstanceStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  
  // Check Invidious status on component mount
  useEffect(() => {
    checkInstance();
  }, []);
  
  const checkInstance = async () => {
    setCheckingInstance(true);
    setInstanceStatus('checking');
    
    try {
      const status = await checkInvidiousStatus();
      setInstanceStatus(status ? 'online' : 'offline');
    } catch (error) {
      setInstanceStatus('offline');
    } finally {
      setCheckingInstance(false);
    }
  };
  
  const handleRefreshInstance = async () => {
    setCheckingInstance(true);
    setInstanceStatus('checking');
    
    try {
      const newInstance = refreshInstance();
      setCurrentInstance(newInstance);
      const status = await checkInvidiousStatus();
      setInstanceStatus(status ? 'online' : 'offline');
      toast.success(`Switched to instance: ${newInstance}`);
    } catch (error) {
      setInstanceStatus('offline');
      toast.error("Failed to find a working Invidious instance");
    } finally {
      setCheckingInstance(false);
    }
  };
  
  const handleApiPreferenceChange = (preference: ApiType) => {
    setApiPref(preference);
  };
  
  const handleSave = () => {
    if (apiPreference === 'youtube' && apiKey && !isValidYouTubeApiKey(apiKey)) {
      toast.error('Invalid YouTube API key format');
      return;
    }
    
    storeApiKey(apiKey);
    storeSettings(settings);
    setApiPreference(apiPreference);
    toast.success('Settings saved successfully');
    navigate('/');
  };
  
  const handleClearAllData = () => {
    clearAllData();
    setApiKey('');
    setSettings({
      regionCode: 'US',
      maxResults: 20,
      theme: 'dark',
    });
    toast.success('All data cleared successfully');
  };
  
  const handleClearVideoData = () => {
    clearVideoData();
    toast.success('Video data cleared successfully');
  };

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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.15),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.8),transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzkuMTA0NTcgMCAxMCAwLjg5NTQzIDEwIDJDMTAgMy4xMDQ1NyA5LjEwNDU3IDQgOCA0QzYuODk1NDMgNCBDNS43OTQ4NyA0IDUgMy4xMDQ1NyA1IDJDNSAwLjg5NTQzIDUuODk1NDMgMCA4IDBaIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDMiLz48L3N2Zz4=')] opacity-5"></div>
      </div>
      
      <div className="relative z-10 flex-1 flex flex-col h-full p-6 max-w-4xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center mb-8"
        >
          <button 
            onClick={() => navigate('/')} 
            className="p-2 mr-4 rounded-full hover:bg-white/10"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">
            <SplitText>Settings</SplitText>
          </h1>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible" 
          className="glass-morphism p-8 rounded-2xl"
        >
          <motion.div variants={itemVariants} className="space-y-6">
            {/* API Preference */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">API Preference</h3>
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApiPreferenceChange('invidious')}
                  className={`p-4 rounded-lg border ${apiPreference === 'invidious' 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800/50'}`}
                >
                  <div className="font-medium mb-1">Invidious (Recommended)</div>
                  <div className="text-sm text-gray-400">No API key required, privacy-focused</div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleApiPreferenceChange('youtube')}
                  className={`p-4 rounded-lg border ${apiPreference === 'youtube' 
                    ? 'border-red-500 bg-red-500/10' 
                    : 'border-gray-700 bg-gray-900/50 hover:bg-gray-800/50'}`}
                >
                  <div className="font-medium mb-1">YouTube API</div>
                  <div className="text-sm text-gray-400">Requires API key, official data</div>
                </motion.button>
              </div>
            </div>
            
            {/* Invidious Instance Settings */}
            {apiPreference === 'invidious' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Invidious Instance
                </label>
                <div className="flex items-center space-x-2">
                  <div className={`flex-1 p-3 bg-gray-900/50 border ${
                    instanceStatus === 'online' ? 'border-green-500/50' : 
                    instanceStatus === 'offline' ? 'border-red-500/50' : 'border-gray-700'
                  } rounded-lg text-white`}>
                    <div className="flex items-center justify-between">
                      <span>{currentInstance}</span>
                      <span className="flex items-center">
                        {instanceStatus === 'checking' && (
                          <span className="text-yellow-500 text-sm flex items-center">
                            <RotateCw size={14} className="animate-spin mr-1" />
                            Checking...
                          </span>
                        )}
                        {instanceStatus === 'online' && (
                          <span className="text-green-500 text-sm">Online</span>
                        )}
                        {instanceStatus === 'offline' && (
                          <span className="text-red-500 text-sm">Offline</span>
                        )}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, rotate: 180 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.4 }}
                    onClick={handleRefreshInstance}
                    disabled={checkingInstance}
                    className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  >
                    <RefreshCw size={20} className={checkingInstance ? "animate-spin" : ""} />
                  </motion.button>
                </div>
                <p className="text-xs text-gray-400">
                  If the current instance is not working, click refresh to try another
                </p>
              </div>
            )}
            
            {/* YouTube API Key (only shown when YouTube is selected) */}
            {apiPreference === 'youtube' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  YouTube API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your YouTube API key"
                  className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
                />
                <p className="text-xs text-gray-400">
                  API key is required for YouTube data access
                </p>
              </div>
            )}
            
            {/* Region Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Region
              </label>
              <select
                value={settings.regionCode}
                onChange={(e) => setSettings({...settings, regionCode: e.target.value})}
                className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
              >
                {REGION_CODES.map((region) => (
                  <option key={region.code} value={region.code}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Results Per Page */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Results Per Page
              </label>
              <select
                value={settings.maxResults}
                onChange={(e) => setSettings({...settings, maxResults: Number(e.target.value)})}
                className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white"
              >
                {MAX_RESULTS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Data Management Section */}
            <div className="space-y-4 pt-6 border-t border-gray-700">
              <h3 className="text-lg font-medium">Data Management</h3>
              
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 165, 0, 0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearVideoData}
                  className="flex items-center justify-between w-full p-3 bg-gray-800/80 hover:bg-gray-700/80 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Trash2 size={18} className="text-orange-400" />
                    <span>Clear Video Data</span>
                  </div>
                  <span className="text-xs text-gray-400">Clears search history & videos</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(220, 38, 38, 0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClearAllData}
                  className="flex items-center justify-between w-full p-3 bg-gray-800/80 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Trash2 size={18} className="text-red-500" />
                    <span>Clear All Data</span>
                  </div>
                  <span className="text-xs text-gray-400">Including API key & settings</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Action Buttons */}
          <motion.div 
            variants={itemVariants} 
            className="flex justify-end mt-8 pt-4 border-t border-gray-700"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-5 py-2 mr-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Save
            </motion.button>
          </motion.div>
        </motion.div>
        
        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-500 mt-4"
        >
          Made with ❤️ by cx051
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
