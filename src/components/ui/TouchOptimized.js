import React from 'react';

// Touch-optimized button component
export const TouchButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  variant = 'primary',
  size = 'md',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };
  
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 active:bg-primary-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800'
  };
  
  const disabledClasses = 'opacity-50 cursor-not-allowed';
  
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabled ? disabledClasses : ''}
    ${className}
  `.trim();

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Touch-optimized card component
export const TouchCard = ({ 
  children, 
  onClick, 
  className = '', 
  hoverable = true,
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200';
  const hoverClasses = hoverable ? 'hover:shadow-lg active:shadow-md active:scale-[0.98]' : '';
  const touchClasses = 'min-h-[120px] cursor-pointer';
  
  const classes = `
    ${baseClasses}
    ${hoverClasses}
    ${onClick ? touchClasses : ''}
    ${className}
  `.trim();

  return (
    <div
      className={classes}
      onClick={onClick}
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
  const baseClasses = 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors';
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };
  
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <input
      className={classes}
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
  const baseClasses = 'w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors bg-white';
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[52px]'
  };
  
  const classes = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${className}
  `.trim();

  return (
    <select
      className={classes}
      {...props}
    >
      {children}
    </select>
  );
};

// Touch-optimized navigation item
export const TouchNavItem = ({ 
  children, 
  onClick, 
  isActive = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 min-h-[48px]';
  const activeClasses = isActive 
    ? 'bg-primary-100 text-primary-700' 
    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100';
  
  const classes = `
    ${baseClasses}
    ${activeClasses}
    ${className}
  `.trim();

  return (
    <button
      className={classes}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
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
  className = '',
  ...props 
}) => {
  const [touchStart, setTouchStart] = React.useState(null);
  const [touchEnd, setTouchEnd] = React.useState(null);

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {children}
    </div>
  );
};

// Touch-optimized modal
export const TouchModal = ({ 
  isOpen, 
  onClose, 
  children, 
  className = '',
  ...props 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${className}`} {...props}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default {
  TouchButton,
  TouchCard,
  TouchInput,
  TouchSelect,
  TouchNavItem,
  SwipeHandler,
  TouchModal
};
