// src/componenents/ui/AppsSidebar.jsx
import React from 'react';

const AppSidebar = ({ onOpenApp }) => {
  const apps = [
    { name: 'Kahoot Clone', emoji: '📚' },
    { name: 'AmongUs Chat', emoji: '🛸' },
    { name: 'Submit Your App', emoji: '📤' }
  ];

  return (
    <div className="w-72 bg-black text-white p-4 border-r border-purple-500">
      <h2 className="text-purple-400 text-xl font-bold mb-4">APPS</h2>
      <ul>
        {apps.map((app, index) => (
          <li
            key={index}
            onClick={() => onOpenApp(app.name)}
            className="cursor-pointer hover:text-purple-300 flex items-center space-x-2 mb-3"
          >
            <span>{app.emoji}</span>
            <span>{app.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppSidebar;
