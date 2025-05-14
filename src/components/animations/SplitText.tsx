
import React, { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SplitTextProps {
  children: ReactNode;
  className?: string;
  animationType?: 'wave' | 'fade' | 'bounce';
  duration?: number;
  delay?: number;
  once?: boolean;
}

const SplitText = ({
  children,
  className = '',
  animationType = 'wave',
  duration = 0.5,
  delay = 0,
  once = false
}: SplitTextProps) => {
  const [text, setText] = useState<string>('');
  
  useEffect(() => {
    if (typeof children === 'string') {
      setText(children);
    } else if (children) {
      // Try to convert to string
      setText(React.Children.toArray(children).join(''));
    }
  }, [children]);

  if (!text) return <span className={className}>{children}</span>;

  // Animation variants based on type
  const getAnimationVariant = () => {
    switch (animationType) {
      case 'wave':
        return {
          hidden: { y: 20, opacity: 0 },
          visible: (i: number) => ({
            y: 0,
            opacity: 1,
            transition: {
              delay: delay + (i * 0.05),
              duration: duration,
              ease: [0.215, 0.61, 0.355, 1]
            }
          })
        };
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: (i: number) => ({
            opacity: 1,
            transition: {
              delay: delay + (i * 0.03),
              duration: duration
            }
          })
        };
      case 'bounce':
        return {
          hidden: { y: 0, opacity: 0 },
          visible: (i: number) => ({
            y: [20, -10, 5, 0],
            opacity: 1,
            transition: {
              delay: delay + (i * 0.07),
              duration: duration * 1.5,
              times: [0, 0.6, 0.8, 1],
              ease: "easeOut"
            }
          })
        };
      default:
        return {
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 }
        };
    }
  };

  const variants = getAnimationVariant();
  
  return (
    <motion.span
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
      aria-label={text}
      whileInView={once ? "visible" : undefined}
      viewport={once ? { once: true, margin: "-100px" } : undefined}
    >
      {text.split('').map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          variants={variants}
          custom={index}
          className="inline-block"
          style={{ 
            display: char === ' ' ? 'inline-block' : undefined,
            whiteSpace: char === ' ' ? 'pre' : undefined
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

export default SplitText;
