import React from 'react';

const ATRCLogoSimple = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center`}>
      <div className="relative w-full h-full">
        {/* Simple circular background with colors matching your logo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-600 to-blue-900 border-2 border-blue-700"></div>
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600"></div>
        <div className="absolute inset-2 rounded-full bg-white flex items-center justify-center">
          {/* Crown symbol */}
          <div className="text-center">
            <div className="text-yellow-500 text-lg font-bold">👑</div>
            <div className="text-purple-600 text-xs font-bold mt-1">📖</div>
          </div>
        </div>
        {/* Text overlay for larger sizes */}
        {(size === 'large' || size === 'xlarge') && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-blue-900 whitespace-nowrap">
            ATRC
          </div>
        )}
      </div>
    </div>
  );
};

export default ATRCLogoSimple;
