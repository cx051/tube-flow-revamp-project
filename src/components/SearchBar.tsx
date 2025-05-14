import React, { useState, useRef, useEffect } from 'react';
import { Search, Settings, X } from 'lucide-react';
import { addSearchToHistory, getSearchHistory } from '@/services/storageService';
import AnimatedTransition from './AnimatedTransition';
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
      if (historyRef.current && !historyRef.current.contains(event.target as Node) && inputRef.current && !inputRef.current.contains(event.target as Node)) {
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
  return <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative flex items-center bg-gray-800 rounded-lg overflow-hidden shadow-lg focus-within:ring-2 focus-within:ring-purple-500 transition-all">
        <div className="pl-4 pr-2 text-gray-400">
          <Search size={20} />
        </div>
        
        <input ref={inputRef} type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKeyDown} onFocus={() => setShowHistory(true)} placeholder="Search videos..." className="py-3 px-2 bg-transparent w-full text-white outline-none placeholder-gray-500" />
        
        {query && <button onClick={clearSearch} className="mx-1 p-1 rounded-full hover:bg-gray-700 text-gray-400">
            <X size={16} />
          </button>}
        
        <button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-5 transition-colors">
          Search
        </button>
        
        <button onClick={onSettingsOpen} className="p-3 text-gray-400 hover:bg-gray-700 transition-colors">
          
        </button>
      </div>
      
      <AnimatedTransition show={showHistory && searchHistory.length > 0} type="fade" direction="down">
        <div ref={historyRef} className="absolute w-full mt-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-2 border-b border-gray-700">
            <p className="text-sm text-gray-400">Recent searches</p>
          </div>
          
          <ul className="max-h-60 overflow-y-auto">
            {searchHistory.map((item, index) => <li key={index}>
                <button onClick={() => handleHistoryItemClick(item)} className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 flex items-center">
                  <Search size={14} className="mr-2 text-gray-400" />
                  {item}
                </button>
              </li>)}
          </ul>
        </div>
      </AnimatedTransition>
    </div>;
};
export default SearchBar;