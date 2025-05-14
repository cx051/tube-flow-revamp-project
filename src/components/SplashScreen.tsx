
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    // Start progress animation
    interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFadeOut(true);
            setTimeout(onComplete, 500); // Fade out animation duration
          }, 300); // Wait a moment at 100%
          return 100;
        }
        return prev + 4;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [onComplete]);
  
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-500",
        fadeOut ? "opacity-0" : "opacity-100"
      )}
    >
      <div className="relative animate-float">
        <div className="text-5xl font-bold text-white mb-8 animate-pulse-glow">
          <span className="text-red-600">Vue</span>
          <span>Tube</span>
        </div>
        
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <div className="mt-3 text-gray-400 text-sm text-center">
          {progress < 100 ? 'Loading amazing content...' : 'Ready!'}
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
