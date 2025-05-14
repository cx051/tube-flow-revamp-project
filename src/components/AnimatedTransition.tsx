
import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
  duration?: number;
  type?: 'fade' | 'slide' | 'scale' | 'rotate';
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  show,
  children,
  className,
  duration = 300,
  type = 'fade',
  direction = 'left',
  delay = 0,
}) => {
  const [shouldRender, setShouldRender] = React.useState(show);
  
  React.useEffect(() => {
    if (show) setShouldRender(true);
    let timer: ReturnType<typeof setTimeout>;
    
    if (!show) {
      timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, duration]);
  
  if (!shouldRender) return null;
  
  const getTransformValue = () => {
    if (type === 'scale') return 'scale(0.95)';
    if (type === 'rotate') return 'rotate(-5deg)';
    if (type !== 'slide') return 'none';
    
    switch (direction) {
      case 'left': return 'translateX(-20px)';
      case 'right': return 'translateX(20px)';
      case 'up': return 'translateY(-20px)';
      case 'down': return 'translateY(20px)';
      default: return 'translateX(-20px)';
    }
  };
  
  const baseStyle = {
    opacity: show ? 1 : 0,
    transform: show ? 'none' : getTransformValue(),
    transition: `opacity ${duration}ms ease-in-out, transform ${duration}ms ease-in-out`,
    transitionDelay: `${delay}ms`,
  };
  
  return (
    <div style={baseStyle} className={cn('overflow-hidden', className)}>
      {children}
    </div>
  );
};

export default AnimatedTransition;
