import React from 'react';

const ATRCLogo = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield Background */}
        <defs>
          <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <linearGradient id="crownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#5b21b6" />
          </linearGradient>
        </defs>
        
        {/* Shield Shape */}
        <path
          d="M100 20 L180 50 L180 140 L100 180 L20 140 L20 50 Z"
          fill="url(#shieldGradient)"
          stroke="url(#goldGradient)"
          strokeWidth="2"
        />
        
        {/* Golden Cross at Top */}
        <g transform="translate(100, 35)">
          <rect x="-3" y="-8" width="6" height="16" fill="url(#goldGradient)" rx="1" />
          <rect x="-8" y="-3" width="16" height="6" fill="url(#goldGradient)" rx="1" />
        </g>
        
        {/* Open Book */}
        <g transform="translate(100, 65)">
          <path
            d="M-15 -8 L-8 -12 L8 -12 L15 -8 L15 8 L8 12 L-8 12 L-15 8 Z"
            fill="white"
            stroke="url(#goldGradient)"
            strokeWidth="1"
          />
          {/* Book Lines */}
          <line x1="-10" y1="-4" x2="10" y2="-4" stroke="url(#goldGradient)" strokeWidth="0.5" />
          <line x1="-10" y1="-1" x2="10" y2="-1" stroke="url(#goldGradient)" strokeWidth="0.5" />
          <line x1="-10" y1="2" x2="10" y2="2" stroke="url(#goldGradient)" strokeWidth="0.5" />
          <line x1="-10" y1="5" x2="10" y2="5" stroke="url(#goldGradient)" strokeWidth="0.5" />
        </g>
        
        {/* Proverbs 8:15-16 Text */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          fill="white"
          fontSize="8"
          fontFamily="serif"
          fontWeight="bold"
        >
          Proverbs 8:15-16
        </text>
        
        {/* First Golden Bar */}
        <rect x="30" y="100" width="140" height="2" fill="url(#goldGradient)" rx="1" />
        
        {/* Leadership Institute Text */}
        <text
          x="100"
          y="120"
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontFamily="sans-serif"
          fontWeight="bold"
        >
          LEADERSHIP INSTITUTE
        </text>
        
        {/* Second Golden Bar */}
        <rect x="30" y="130" width="140" height="2" fill="url(#goldGradient)" rx="1" />
        
        {/* Sophia Text */}
        <text
          x="100"
          y="150"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontFamily="serif"
          fontWeight="bold"
        >
          Σοφια (Sophía)
        </text>
        
        {/* Crown */}
        <g transform="translate(100, 160)">
          <path
            d="M-12 -5 L-8 -8 L-4 -5 L0 -8 L4 -5 L8 -8 L12 -5 L12 5 L8 3 L4 5 L0 3 L-4 5 L-8 3 L-12 5 Z"
            fill="url(#crownGradient)"
            stroke="url(#goldGradient)"
            strokeWidth="0.5"
          />
          {/* Crown Jewels */}
          <circle cx="-6" cy="-2" r="1" fill="url(#goldGradient)" />
          <circle cx="0" cy="-3" r="1.5" fill="url(#goldGradient)" />
          <circle cx="6" cy="-2" r="1" fill="url(#goldGradient)" />
        </g>
        
        {/* Curved Text - Africa Traditional */}
        <text
          x="50"
          y="175"
          textAnchor="middle"
          fill="white"
          fontSize="7"
          fontFamily="sans-serif"
          fontWeight="bold"
          transform="rotate(-15 50 175)"
        >
          AFRICA TRADITIONAL
        </text>
        
        {/* Curved Text - Rulers for Christ */}
        <text
          x="150"
          y="175"
          textAnchor="middle"
          fill="white"
          fontSize="7"
          fontFamily="sans-serif"
          fontWeight="bold"
          transform="rotate(15 150 175)"
        >
          RULERS FOR CHRIST
        </text>
      </svg>
    </div>
  );
};

export default ATRCLogo;
