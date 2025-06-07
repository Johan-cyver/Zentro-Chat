import React from 'react';

const Avatar = ({ src, alt, size = 'md', status }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };

  return (
    <div className="relative inline-block">
      <img
        src={src || '/default-avatar.png'}
        alt={alt || 'User avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white dark:border-gray-800`}
      />
      {status && (
        <span
          className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white dark:ring-gray-800 ${statusColors[status]}`}
        />
      )}
    </div>
  );
};

export default Avatar; 