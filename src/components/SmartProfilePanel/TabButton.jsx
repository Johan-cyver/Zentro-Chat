import React from 'react';

const TabButton = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
      active
        ? 'bg-gray-800 text-purple-400 border-b-2 border-purple-400'
        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
    }`}
  >
    {label}
  </button>
);

export default TabButton;
