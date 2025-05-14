
import React, { useState, useRef, useEffect } from 'react';
import { Search, Settings, X } from 'lucide-react';
import { addSearchToHistory, getSearchHistory } from '@/services/storageService';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSettingsOpen: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSettingsOpen
}) => {
  const [query, setQuery] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load search history
    setSearchHistory(getSearchHistory());

    // Close history dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(event.target as Node) && 
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query.trim());
      addSearchToHistory(query.trim());
      setSearchHistory(getSearchHistory());
      setShowHistory(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleHistoryItemClick = (item: string) => {
    setQuery(item);
    onSearch(item);
    setShowHistory(false);
  };
  
  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative w-full max-w-3xl mx-auto"
    >
      <motion.div 
        className="relative flex items-center bg-secondary rounded-full overflow-hidden shadow-lg neo-blur focus-within:ring-2 focus-within:ring-red-500/50 transition-all"
        whileHover={{ boxShadow: "0 0 0 1px rgba(220, 38, 38, 0.1), 0 8px 20px rgba(0, 0, 0, 0.3)" }}
      >
        <div className="pl-5 pr-2 text-gray-400">
          <Search size={20} />
        </div>
        
        <input 
          ref={inputRef} 
          type="text" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          onKeyDown={handleKeyDown} 
          onFocus={() => setShowHistory(true)} 
          placeholder="Search videos..." 
          className="py-3 px-2 bg-transparent w-full text-white outline-none placeholder-gray-500" 
        />
        
        {query && (
          <motion.button 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={clearSearch} 
            className="mx-1 p-1 rounded-full hover:bg-white/10 text-gray-400"
          >
            <X size={16} />
          </motion.button>
        )}
        
        <motion.button 
          whileHover={{ backgroundColor: "rgba(220, 38, 38, 0.9)" }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSearch} 
          className="bg-red-600 hover:bg-red-700 text-white py-3 px-6 transition-colors rounded-r-full"
        >
          Search
        </motion.button>
      </motion.div>
      
      <AnimatePresence>
        {showHistory && searchHistory.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            ref={historyRef}
            className="absolute w-full mt-2 bg-secondary rounded-xl glass-morphism shadow-xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/10">
              <p className="text-sm text-gray-400">Recent searches</p>
            </div>
            
            <ul className="max-h-60 overflow-y-auto scrollbar-hide">
              {searchHistory.map((item, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <button 
                    onClick={() => handleHistoryItemClick(item)} 
                    className="w-full text-left px-4 py-3 text-white hover:bg-white/5 flex items-center"
                  >
                    <Search size={14} className="mr-2 text-gray-400" />
                    {item}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SearchBar;
