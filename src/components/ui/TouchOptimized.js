import React from 'react';

// Touch-optimized button component
export const TouchButton = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'touch-manipulation select-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500',
    success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl'
  };
  
  const disabledClasses = disabled 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Touch-optimized card component
export const TouchCard = ({ 
  children, 
  className = '', 
  onClick,
  hoverable = true,
  ...props 
}) => {
  const baseClasses = 'transition-all duration-300 touch-manipulation';
  const hoverClasses = hoverable 
    ? 'hover:shadow-lg hover:-translate-y-1 active:translate-y-0 active:shadow-md' 
    : '';
  
  return (
    <div
      onClick={onClick}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Touch-optimized input component
export const TouchInput = ({ 
  className = '', 
  size = 'md',
  ...props 
}) => {
  const baseClasses = 'touch-manipulation transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl'
  };
  
  return (
    <input
      className={`${baseClasses} ${sizes[size]} ${className}`}
      {...props}
    />
  );
};

// Touch-optimized select component
export const TouchSelect = ({ 
  children,
  className = '', 
  size = 'md',
  ...props 
}) => {
  const baseClasses = 'touch-manipulation transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent';
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-3 text-base rounded-lg',
    lg: 'px-6 py-4 text-lg rounded-xl'
  };
  
  return (
    <select
      className={`${baseClasses} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

// Swipe gesture handler
export const SwipeHandler = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  threshold = 50,
  className = ''
}) => {
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    e.target.startX = touch.clientX;
    e.target.startY = touch.clientY;
  };
  
  const handleTouchEnd = (e) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - e.target.startX;
    const deltaY = touch.clientY - e.target.startY;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
    } else {
      // Vertical swipe
      if (deltaY > threshold && onSwipeDown) {
        onSwipeDown();
      } else if (deltaY < -threshold && onSwipeUp) {
        onSwipeUp();
      }
    }
  };
  
  return (
    <div
      className={`touch-manipulation ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
};

// Pull-to-refresh component
export const PullToRefresh = ({ 
  children, 
  onRefresh, 
  threshold = 80,
  className = ''
}) => {
  const [isPulling, setIsPulling] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);
  
  const handleTouchStart = (e) => {
    e.target.startY = e.touches[0].clientY;
  };
  
  const handleTouchMove = (e) => {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - e.target.startY;
    
    if (deltaY > 0 && window.scrollY === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(deltaY * 0.5, threshold));
      e.preventDefault();
    }
  };
  
  const handleTouchEnd = () => {
    if (pullDistance >= threshold) {
      onRefresh();
    }
    setIsPulling(false);
    setPullDistance(0);
  };
  
  return (
    <div
      className={`relative ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isPulling && (
        <div 
          className="absolute top-0 left-0 right-0 bg-primary-600 text-white text-center py-2 z-10"
          style={{ transform: `translateY(-${pullDistance}px)` }}
        >
          {pullDistance >= threshold ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
      <div style={{ transform: `translateY(${pullDistance}px)` }}>
        {children}
      </div>
    </div>
  );
};

export default {
  TouchButton,
  TouchCard,
  TouchInput,
  TouchSelect,
  SwipeHandler,
  PullToRefresh
};