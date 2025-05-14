
import React, { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilterOptions } from '@/services/apiService';

interface FilterButtonProps {
  onFilterChange: (filters: FilterOptions) => void;
  currentFilters: FilterOptions;
  isVisible: boolean;
}

const FILTER_OPTIONS = {
  sort: [
    { label: 'Relevance', value: '' },
    { label: 'Rating', value: 'rating' },
    { label: 'Upload date', value: 'date' },
    { label: 'View count', value: 'views' }
  ],
  date: [
    { label: 'Any time', value: '' },
    { label: 'Hour', value: 'hour' },
    { label: 'Today', value: 'today' },
    { label: 'Week', value: 'week' },
    { label: 'Month', value: 'month' },
    { label: 'Year', value: 'year' }
  ],
  duration: [
    { label: 'Any', value: '' },
    { label: 'Short (< 4 min)', value: 'short' },
    { label: 'Medium (4-20 min)', value: 'medium' },
    { label: 'Long (> 20 min)', value: 'long' }
  ],
  type: [
    { label: 'All', value: '' },
    { label: 'Video', value: 'video' },
    { label: 'Channel', value: 'channel' },
    { label: 'Playlist', value: 'playlist' },
    { label: 'Movie', value: 'movie' }
  ]
};

const FilterButton: React.FC<FilterButtonProps> = ({ 
  onFilterChange, 
  currentFilters,
  isVisible
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!isVisible) return null;
  
  const handleFilterClick = (category: keyof FilterOptions, value: string) => {
    const newFilters = { ...currentFilters };
    
    if (value === '') {
      // Remove filter if empty value
      delete newFilters[category];
    } else {
      newFilters[category] = value;
    }
    
    onFilterChange(newFilters);
  };
  
  const clearFilters = () => {
    onFilterChange({});
  };
  
  // Count active filters
  const activeFiltersCount = Object.keys(currentFilters).length;
  
  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 py-2 px-3 rounded-full ${
          activeFiltersCount > 0 ? 'bg-red-500' : 'bg-gray-700'
        }`}
      >
        <Filter size={16} />
        <span>Filters</span>
        {activeFiltersCount > 0 && (
          <span className="bg-white text-black rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {activeFiltersCount}
          </span>
        )}
      </motion.button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute right-0 mt-2 p-4 bg-gray-800 rounded-lg shadow-lg z-50 w-72 border border-gray-700"
            style={{ transformOrigin: 'top right' }}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium">Filter Results</h3>
              {activeFiltersCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-red-400 flex items-center hover:text-red-300"
                >
                  <X size={12} className="mr-1" /> Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {(Object.keys(FILTER_OPTIONS) as Array<keyof typeof FILTER_OPTIONS>).map((category) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm text-gray-400 capitalize">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {FILTER_OPTIONS[category].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterClick(category, option.value)}
                        className={`text-xs py-1 px-3 rounded-full ${
                          currentFilters[category] === option.value
                            ? 'bg-red-500 text-white'
                            : 'bg-gray-700 hover:bg-gray-600'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterButton;
