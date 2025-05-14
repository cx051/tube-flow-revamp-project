
import React, { useState } from 'react';
import { Filter, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
  isVisible: boolean;
}

export interface FilterOptions {
  date?: string;
  type?: string;
  duration?: string;
  order?: string;
}

const FILTER_OPTIONS = {
  date: [
    { label: 'Any time', value: 'any' },
    { label: 'Today', value: 'today' },
    { label: 'This week', value: 'week' },
    { label: 'This month', value: 'month' },
    { label: 'This year', value: 'year' }
  ],
  type: [
    { label: 'All', value: 'all' },
    { label: 'Video', value: 'video' },
    { label: 'Channel', value: 'channel' },
    { label: 'Playlist', value: 'playlist' },
    { label: 'Movie', value: 'movie' }
  ],
  duration: [
    { label: 'Any', value: 'any' },
    { label: 'Short (< 4 min)', value: 'short' },
    { label: 'Medium (4-20 min)', value: 'medium' },
    { label: 'Long (> 20 min)', value: 'long' }
  ],
  order: [
    { label: 'Relevance', value: 'relevance' },
    { label: 'Upload date', value: 'date' },
    { label: 'View count', value: 'views' },
    { label: 'Rating', value: 'rating' }
  ]
};

const SearchFilters: React.FC<SearchFiltersProps> = ({ onFilterChange, isVisible }) => {
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({});
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  const handleFilterClick = (category: string, value: string) => {
    const newFilters = {
      ...activeFilters,
      [category]: value
    };
    
    // If selecting "Any" or "All", remove that filter
    if (value === 'any' || value === 'all') {
      delete newFilters[category as keyof FilterOptions];
    }
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
    
    // Close the section after selection
    setExpandedSection(null);
  };
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full glass-morphism border border-white/10 rounded-xl p-4 mb-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter size={18} className="mr-2 text-red-500" />
          <h3 className="text-lg font-medium">Filters</h3>
        </div>
        
        {Object.keys(activeFilters).length > 0 && (
          <button
            onClick={() => {
              setActiveFilters({});
              onFilterChange({});
            }}
            className="text-sm text-red-500 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(FILTER_OPTIONS).map(([category, options]) => (
          <div key={category} className="relative">
            <button
              onClick={() => toggleSection(category)}
              className={`w-full flex items-center justify-between p-3 rounded-lg ${
                activeFilters[category as keyof FilterOptions] 
                  ? "bg-red-500/20 border border-red-500/50" 
                  : "bg-gray-800/50 border border-gray-700"
              } hover:bg-gray-700/50 transition-colors`}
            >
              <span className="capitalize">{category}</span>
              <span className="flex items-center">
                {activeFilters[category as keyof FilterOptions] && (
                  <span className="mr-2 text-sm text-gray-300">
                    {options.find(opt => opt.value === activeFilters[category as keyof FilterOptions])?.label}
                  </span>
                )}
                {expandedSection === category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </span>
            </button>
            
            <AnimatePresence>
              {expandedSection === category && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-30"
                >
                  <div className="p-2 max-h-60 overflow-y-auto">
                    {options.map(option => (
                      <button
                        key={option.value}
                        onClick={() => handleFilterClick(category, option.value)}
                        className="flex items-center justify-between w-full p-2 hover:bg-gray-800 rounded-lg text-left"
                      >
                        <span>{option.label}</span>
                        {activeFilters[category as keyof FilterOptions] === option.value && (
                          <Check size={16} className="text-red-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SearchFilters;
