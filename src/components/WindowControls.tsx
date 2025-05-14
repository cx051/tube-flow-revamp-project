
import React from 'react';
import { motion } from 'framer-motion';
import { X, Minus, Square } from 'lucide-react';

interface WindowControlsProps {
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  className?: string;
}

const WindowControls: React.FC<WindowControlsProps> = ({ 
  onMinimize, 
  onMaximize, 
  onClose,
  className = ""
}) => {
  // On macOS-style window controls
  const handleMinimize = () => {
    if (onMinimize) {
      onMinimize();
    } else {
      // Default behavior: minimize window if running in Electron
      if (window.electron) {
        window.electron.minimize();
      }
    }
  };

  const handleMaximize = () => {
    if (onMaximize) {
      onMaximize();
    } else {
      // Default behavior: maximize window if running in Electron
      if (window.electron) {
        window.electron.maximize();
      }
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      // Default behavior: close window if running in Electron
      if (window.electron) {
        window.electron.close();
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleClose}
        className="w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center group"
      >
        <X size={10} className="opacity-0 group-hover:opacity-100 text-black" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleMinimize}
        className="w-3.5 h-3.5 bg-yellow-500 rounded-full flex items-center justify-center group"
      >
        <Minus size={10} className="opacity-0 group-hover:opacity-100 text-black" />
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleMaximize}
        className="w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center group"
      >
        <Square size={8} className="opacity-0 group-hover:opacity-100 text-black" />
      </motion.button>
    </div>
  );
};

export default WindowControls;
