
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Home, Search, TrendingUp, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import AnimatedTransition from './AnimatedTransition';

type NavItem = {
  name: string;
  icon: React.ElementType;
  action: () => void;
};

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>(activeTab);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleNavItemClick = (item: NavItem) => {
    if (selectedItem !== item.name) {
      setSelectedItem(item.name);
      item.action();
      onTabChange(item.name);
    }
  };
  
  const navItems: NavItem[] = [
    {
      name: 'home',
      icon: Home,
      action: () => {}
    },
    {
      name: 'search',
      icon: Search,
      action: () => {}
    },
    {
      name: 'trending',
      icon: TrendingUp,
      action: () => {}
    },
    {
      name: 'settings',
      icon: Settings,
      action: () => {}
    }
  ];
  
  return (
    <div 
      className={cn(
        "h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <AnimatedTransition show={!isCollapsed} type="fade" direction="left">
            <h1 className="text-xl font-bold">TubeFlow</h1>
          </AnimatedTransition>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      
      <nav className="flex-1 py-6">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => handleNavItemClick(item)}
                className={cn(
                  "flex items-center w-full p-3 transition-all duration-300 relative group",
                  selectedItem === item.name 
                    ? "text-white" 
                    : "text-gray-400 hover:text-white"
                )}
              >
                <div className="relative z-10 flex items-center">
                  <item.icon size={20} />
                  
                  {!isCollapsed && (
                    <AnimatedTransition show={!isCollapsed} type="fade">
                      <span className="ml-4 font-medium capitalize">{item.name}</span>
                    </AnimatedTransition>
                  )}
                </div>
                
                {selectedItem === item.name && (
                  <div className="absolute inset-0 bg-purple-600 rounded-md z-0 animate-scale-in" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        {!isCollapsed && (
          <AnimatedTransition show={!isCollapsed} type="fade">
            <p>TubeFlow v1.0</p>
          </AnimatedTransition>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
