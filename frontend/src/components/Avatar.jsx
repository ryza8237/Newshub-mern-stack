import React from 'react';

const Avatar = ({ name, size = 'md' }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl'
  };

  // Simple hash for consistent colors
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500'
  ];
  
  const colorIndex = name ? name.length % colors.length : 0;
  const color = colors[colorIndex];

  return (
    <div className={`${sizes[size]} ${color} rounded-full flex items-center justify-center text-white font-bold shadow-sm`}>
      {initial}
    </div>
  );
};

export default Avatar;
