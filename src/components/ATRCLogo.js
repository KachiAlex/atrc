import React, { useMemo } from 'react';

const ATRCLogo = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  // Generate stable unique IDs to avoid conflicts when multiple logos are on the same page
  const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 9), []);

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={`circleGradient-${uniqueId}`} cx="50%" cy="30%">
            <stop offset="0%" stopColor="#4338ca"/>
            <stop offset="100%" stopColor="#1e1b4b"/>
          </radialGradient>
          <radialGradient id={`innerGradient-${uniqueId}`} cx="50%" cy="30%">
            <stop offset="0%" stopColor="#fbbf24"/>
            <stop offset="100%" stopColor="#d97706"/>
          </radialGradient>
          <linearGradient id={`crownGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24"/>
            <stop offset="50%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#d97706"/>
          </linearGradient>
          <linearGradient id={`purpleGradient-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed"/>
            <stop offset="100%" stopColor="#5b21b6"/>
          </linearGradient>
        </defs>
        
        {/* Outer Blue Circle */}
        <circle cx="200" cy="200" r="190" fill={`url(#circleGradient-${uniqueId})`} stroke="#1e40af" strokeWidth="4"/>
        
        {/* Inner Gold Circle */}
        <circle cx="200" cy="200" r="140" fill={`url(#innerGradient-${uniqueId})`}/>
        
        {/* White Triangle Background */}
        <path d="M200 80 L320 240 L80 240 Z" fill="white" stroke="#d1d5db" strokeWidth="2"/>
        
        {/* Open Book */}
        <g transform="translate(200, 280)">
          <path d="M-40 -20 Q-40 -25 -35 -25 L35 -25 Q40 -25 40 -20 L40 10 Q40 15 35 15 L5 15 L0 20 L-5 15 L-35 15 Q-40 15 -40 10 Z" 
                fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1"/>
          {/* Book pages */}
          <line x1="-30" y1="-15" x2="30" y2="-15" stroke="#e5e7eb" strokeWidth="1"/>
          <line x1="-30" y1="-10" x2="30" y2="-10" stroke="#e5e7eb" strokeWidth="1"/>
          <line x1="-30" y1="-5" x2="30" y2="-5" stroke="#e5e7eb" strokeWidth="1"/>
          <line x1="-30" y1="0" x2="30" y2="0" stroke="#e5e7eb" strokeWidth="1"/>
          <line x1="-30" y1="5" x2="30" y2="5" stroke="#e5e7eb" strokeWidth="1"/>
        </g>
        
        {/* Crown */}
        <g transform="translate(200, 160)">
          {/* Crown base */}
          <ellipse cx="0" cy="15" rx="45" ry="8" fill={`url(#crownGradient-${uniqueId})`}/>
          
          {/* Crown main body */}
          <path d="M-40 0 Q-40 -10 -35 -15 L-25 -20 L-15 -10 L-5 -25 L5 -25 L15 -10 L25 -20 L35 -15 Q40 -10 40 0 L40 15 L-40 15 Z" 
                fill={`url(#crownGradient-${uniqueId})`} stroke="#d97706" strokeWidth="1"/>
          
          {/* Crown velvet interior */}
          <path d="M-35 0 L-20 -8 L-10 -5 L0 -20 L10 -5 L20 -8 L35 0 L35 12 L-35 12 Z" 
                fill={`url(#purpleGradient-${uniqueId})`}/>
          
          {/* Crown jewels */}
          <circle cx="-20" cy="-5" r="3" fill="#dc2626"/>
          <circle cx="0" cy="-15" r="4" fill="#dc2626"/>
          <circle cx="20" cy="-5" r="3" fill="#dc2626"/>
          <circle cx="-10" cy="0" r="2" fill="#fbbf24"/>
          <circle cx="10" cy="0" r="2" fill="#fbbf24"/>
          
          {/* Cross on top */}
          <g transform="translate(0, -25)">
            <rect x="-2" y="-8" width="4" height="12" fill={`url(#crownGradient-${uniqueId})`} rx="1"/>
            <rect x="-6" y="-4" width="12" height="4" fill={`url(#crownGradient-${uniqueId})`} rx="1"/>
          </g>
        </g>
        
        {/* Curved Text - Top */}
        <path id={`topCurve-${uniqueId}`} d="M 80 120 Q 200 60 320 120" fill="none"/>
        <text fontFamily="Arial, sans-serif" fontSize="18" fontWeight="bold" fill="white" textAnchor="middle">
          <textPath href={`#topCurve-${uniqueId}`} startOffset="50%">AFRICA TRADITIONAL RULERS FOR CHRIST</textPath>
        </text>
        
        {/* Bottom Text */}
        <path id={`bottomCurve-${uniqueId}`} d="M 120 340 Q 200 320 280 340" fill="none"/>
        <text fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" fill="white" textAnchor="middle">
          <textPath href={`#bottomCurve-${uniqueId}`} startOffset="50%">PSALM 45:6-8</textPath>
        </text>
      </svg>
    </div>
  );
};

export default ATRCLogo;
