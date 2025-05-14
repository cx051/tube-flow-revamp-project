
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface AnimatedListProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'zoom';
  direction?: 'up' | 'down' | 'left' | 'right';
}

const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = '',
  delay = 0,
  staggerDelay = 0.1,
  animationType = 'fade',
  direction = 'up'
}) => {
  const getAnimationVariants = () => {
    const baseDirectionValues = {
      up: { y: 20 },
      down: { y: -20 },
      left: { x: 20 },
      right: { x: -20 }
    };
    
    switch (animationType) {
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              duration: 0.5
            }
          }
        };
      case 'slide':
        return {
          hidden: { opacity: 0, ...baseDirectionValues[direction] },
          visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 24
            }
          }
        };
      case 'zoom':
        return {
          hidden: { opacity: 0, scale: 0.9 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: {
              type: "spring",
              stiffness: 400,
              damping: 25
            }
          }
        };
      default:
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1 }
        };
    }
  };
  
  // Convert children to array and filter out nulls
  const childrenArray = React.Children.toArray(children).filter(Boolean);
  
  if (childrenArray.length === 0) {
    return null;
  }
  
  return (
    <motion.div 
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay
          }
        }
      }}
    >
      {React.Children.map(childrenArray, (child, index) => (
        <motion.div key={index} variants={getAnimationVariants()}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AnimatedList;
