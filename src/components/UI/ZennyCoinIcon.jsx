import React from 'react';

const ZennyCoinIcon = ({ 
  size = 28, 
  className = "", 
  animated = false, 
  glowing = false,
  variant = "default" // default, mini, large
}) => {
  const sizeMap = {
    mini: 16,
    default: 28,
    large: 40
  };
  
  const actualSize = sizeMap[variant] || size;
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <svg 
        width={actualSize} 
        height={actualSize} 
        viewBox="0 0 64 64" 
        fill="none"
        className={`
          ${animated ? 'animate-spin' : ''} 
          ${glowing ? 'drop-shadow-lg filter' : ''}
          transition-all duration-300
        `}
        style={{ 
          animationDuration: animated ? '3s' : undefined,
          filter: glowing ? 'drop-shadow(0 0 8px #FFD700)' : undefined
        }}
      >
        {/* Outer ring with gradient */}
        <circle 
          cx="32" 
          cy="32" 
          r="30" 
          stroke="url(#goldGradient)" 
          strokeWidth="3" 
          fill="url(#coinGradient)" 
        />
        
        {/* Inner ring for depth */}
        <circle 
          cx="32" 
          cy="32" 
          r="26" 
          stroke="#B8860B" 
          strokeWidth="1" 
          fill="none" 
          opacity="0.6"
        />
        
        {/* Central Z letter */}
        <text 
          x="50%" 
          y="58%" 
          textAnchor="middle" 
          fill="#2D2D2D" 
          fontSize="24" 
          fontWeight="bold" 
          fontFamily="Arial, sans-serif"
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        >
          Z
        </text>
        
        {/* Shine effect */}
        <ellipse 
          cx="24" 
          cy="20" 
          rx="8" 
          ry="12" 
          fill="url(#shineGradient)" 
          opacity="0.4"
          transform="rotate(-30 24 20)"
        />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="50%" stopColor="#FFA500" />
            <stop offset="100%" stopColor="#FF8C00" />
          </linearGradient>
          
          <radialGradient id="coinGradient" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#FFEF94" />
            <stop offset="50%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#B8860B" />
          </radialGradient>
          
          <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default ZennyCoinIcon;
