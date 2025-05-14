
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Home, Search, TrendingUp, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

type NavItem = {
  name: string;
  icon: React.ElementType;
  action: () => void;
  path: string;
};

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string>(activeTab);
  const navigate = useNavigate();
  
  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Store the state in localStorage to persist it
    localStorage.setItem('sidebarCollapsed', String(!isCollapsed));
  };
  
  // Load sidebar state from localStorage on mount
  useEffect(() => {
    const storedState = localStorage.getItem('sidebarCollapsed');
    if (storedState !== null) {
      setIsCollapsed(storedState === 'true');
    }
  }, []);
  
  const handleNavItemClick = (item: NavItem) => {
    if (selectedItem !== item.name) {
      setSelectedItem(item.name);
      item.action();
      onTabChange(item.name);
      
      // Navigate to the appropriate path
      navigate(item.path);
    }
  };
  
  const navItems: NavItem[] = [
    {
      name: 'home',
      icon: Home,
      path: '/',
      action: () => {}
    },
    {
      name: 'search',
      icon: Search,
      path: '/',
      action: () => {}
    },
    {
      name: 'trending',
      icon: TrendingUp,
      path: '/',
      action: () => {}
    },
    {
      name: 'settings',
      icon: Settings,
      path: '/settings',
      action: () => {}
    }
  ];

  // Animation variants
  const sidebarVariants = {
    expanded: { 
      width: '14rem',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    },
    collapsed: { 
      width: '4.5rem',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3
      }
    }
  };

  const itemTextVariants = {
    visible: { 
      opacity: 1, 
      x: 0,
      display: "block",
      transition: { duration: 0.2, delay: 0.1 } 
    },
    hidden: { 
      opacity: 0, 
      x: -10, 
      transitionEnd: { display: "none" },
      transition: { duration: 0.2 } 
    }
  };

  const indicatorVariants = {
    initial: { scaleX: 0, opacity: 0 },
    animate: { 
      scaleX: 1, 
      opacity: 1, 
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 30 
      } 
    },
  };

  const logoVariants = {
    expanded: { opacity: 1, x: 0 },
    collapsed: { opacity: 0, x: -20 }
  };
  
  return (
    <motion.div 
      variants={sidebarVariants}
      initial={false}
      animate={isCollapsed ? "collapsed" : "expanded"}
      className="h-screen relative flex flex-col glass-morphism z-20 overflow-hidden border-r border-white/10"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.h1
              variants={logoVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="text-xl font-bold text-white flex items-center space-x-1"
            >
              <span className="text-red-600">Vue</span>
              <span>Tube</span>
            </motion.h1>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </motion.button>
      </div>
      
      <nav className="flex-1 py-6 overflow-hidden">
        <ul className="space-y-2 px-2">
          {navItems.map((item) => (
            <motion.li 
              key={item.name} 
              whileHover={{ scale: isCollapsed ? 1.08 : 1.03 }}
              className={cn("relative", selectedItem === item.name && "z-10")}
            >
              <motion.button
                onClick={() => handleNavItemClick(item)}
                className={cn(
                  "flex items-center w-full py-3 px-3 rounded-xl transition-all duration-200",
                  selectedItem === item.name 
                    ? "text-white" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="relative z-10 flex items-center justify-center w-full">
                  <span className="relative flex items-center justify-center">
                    <item.icon size={20} className={selectedItem === item.name ? "text-red-500" : ""} />
                    
                    {/* Indicator dot for collapsed state */}
                    <AnimatePresence>
                      {isCollapsed && selectedItem === item.name && (
                        <motion.span 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 500 }}
                          className="absolute -right-1 -top-1 w-2 h-2 bg-red-500 rounded-full" 
                        />
                      )}
                    </AnimatePresence>
                  </span>
                  
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.span 
                        variants={itemTextVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        className="ml-4 font-medium capitalize text-left flex-1"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Active item background indicator */}
                {selectedItem === item.name && !isCollapsed && (
                  <motion.div
                    variants={indicatorVariants}
                    initial="initial"
                    animate="animate"
                    className="absolute inset-0 bg-white/10 rounded-xl z-0"
                    layoutId="sidebar-indicator"
                  />
                )}
              </motion.button>
            </motion.li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-white/10 text-xs text-gray-500">
        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              <p>VueTube v1.0</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Sidebar;
