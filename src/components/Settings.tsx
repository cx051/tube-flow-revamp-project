
import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { storeApiKey, getApiKey, getSettings, storeSettings, clearAllData, clearVideoData } from '@/services/storageService';
import { isValidYouTubeApiKey } from '@/services/youtubeApi';
import { toast } from '@/components/ui/sonner';
import AnimatedTransition from './AnimatedTransition';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChanged: () => void;
}

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

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onSettingsChanged }) => {
  const [apiKey, setApiKey] = useState(getApiKey() || '');
  const [settings, setSettings] = useState(getSettings());
  
  const handleSave = () => {
    if (apiKey && !isValidYouTubeApiKey(apiKey)) {
      toast.error('Invalid YouTube API key format');
      return;
    }
    
    storeApiKey(apiKey);
    storeSettings(settings);
    toast.success('Settings saved successfully');
    onSettingsChanged();
    onClose();
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
  
  return (
    <AnimatedTransition 
      show={isOpen} 
      type="fade"
      className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
    >
      <div className="bg-gray-800 text-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              YouTube API Key
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your YouTube API key"
              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white"
            />
            <p className="text-xs text-gray-400">
              API key is required for YouTube data access
            </p>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Region
            </label>
            <select
              value={settings.regionCode}
              onChange={(e) => setSettings({...settings, regionCode: e.target.value})}
              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              {REGION_CODES.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Results Per Page
            </label>
            <select
              value={settings.maxResults}
              onChange={(e) => setSettings({...settings, maxResults: Number(e.target.value)})}
              className="w-full p-2.5 bg-gray-700 border border-gray-600 rounded-md text-white"
            >
              {MAX_RESULTS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-gray-700">
            <h3 className="text-lg font-medium">Data Management</h3>
            
            <div className="space-y-3">
              <button
                onClick={handleClearVideoData}
                className="flex items-center justify-between w-full p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Trash2 size={18} className="text-orange-400" />
                  <span>Clear Video Data</span>
                </div>
                <span className="text-xs text-gray-400">Clears search history & videos</span>
              </button>
              
              <button
                onClick={handleClearAllData}
                className="flex items-center justify-between w-full p-3 bg-gray-700 hover:bg-red-900 rounded-md transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Trash2 size={18} className="text-red-500" />
                  <span>Clear All Data</span>
                </div>
                <span className="text-xs text-gray-400">Including API key & settings</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 mr-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </AnimatedTransition>
  );
};

export default Settings;
