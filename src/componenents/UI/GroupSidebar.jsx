// src/componenents/ui/GroupSidebar.jsx
import React from 'react';

const GroupSidebar = ({ onSelectGroup }) => {
  const groups = ['Group Alpha', 'Study Circle', 'Anime Club'];

  return (
    <div className="w-72 bg-black text-white p-4 border-r border-purple-500">
      <h2 className="text-purple-400 text-xl font-bold mb-4">GROUPS</h2>
      <ul>
        {groups.map((group, index) => (
          <li
            key={index}
            onClick={() => onSelectGroup(group)}
            className="cursor-pointer hover:text-purple-300 flex items-center space-x-2 mb-3"
          >
            <span>👥</span>
            <span>{group}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupSidebar;
