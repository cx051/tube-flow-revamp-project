
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CustomSplashScreenProps {
  onComplete?: () => void;
  duration?: number;
}

const CustomSplashScreen: React.FC<CustomSplashScreenProps> = ({ 
  onComplete,
  duration = 2000
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 500); // Give animation time to complete
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black"
        >
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                rotate: 0,
                transition: { 
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1]
                }
              }}
              className="flex items-center justify-center"
            >
              <span className="text-6xl font-bold text-red-600">Vue</span>
              <span className="text-6xl font-bold text-white">Tube</span>
            </motion.div>
            
            {/* Animated underscore line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ 
                scaleX: 1,
                transition: { delay: 0.3, duration: 0.6, ease: "easeOut" }
              }}
              className="h-1 bg-gradient-to-r from-red-600 to-red-900 mt-2"
            ></motion.div>
            
            {/* Loading dots */}
            <div className="flex justify-center mt-8">
              <LoadingDots />
            </div>
            
            {/* Creator text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { delay: 0.8, duration: 0.5 }
              }}
              className="absolute bottom-[-60px] left-0 right-0 text-center text-gray-500 text-sm"
            >
              Made with ❤️ by cx051
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LoadingDots = () => {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          initial={{ scale: 0 }}
          animate={{
            scale: [0, 1, 0],
            transition: {
              delay: index * 0.2,
              repeat: Infinity,
              duration: 1,
              repeatDelay: 0.4
            }
          }}
          className="w-3 h-3 bg-red-600 rounded-full"
        ></motion.div>
      ))}
    </div>
  );
};

export default CustomSplashScreen;
