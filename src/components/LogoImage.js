import React from 'react';

const LogoImage = ({ 
  type = 'traditional-rulers', // 'traditional-rulers' or 'leadership-institute'
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  const logoSources = {
    'traditional-rulers': '/images/traditional-rulers-logo.jpg',
    'leadership-institute': '/images/leadership-institute-logo.jpg'
  };

  const logoAlts = {
    'traditional-rulers': 'Africa Traditional Rulers for Christ Logo',
    'leadership-institute': 'Leadership Institute Logo'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src={logoSources[type]}
        alt={logoAlts[type]}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback if image fails to load
          e.target.style.display = 'none';
          console.error(`Failed to load logo: ${logoSources[type]}`);
        }}
      />
    </div>
  );
};

export default LogoImage;
