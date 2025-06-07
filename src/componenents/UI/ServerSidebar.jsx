// src/componenents/ui/ServerSidebar.jsx
import React from 'react';

const ServerSidebar = ({ onSelectServer }) => {
  const servers = ['Admin Server', 'Zentro Lounge', 'CodeRoom'];

  return (
    <div className="w-72 bg-black text-white p-4 border-r border-purple-500">
      <h2 className="text-purple-400 text-xl font-bold mb-4">SERVERS</h2>
      <ul>
        {servers.map((server, index) => (
          <li
            key={index}
            onClick={() => onSelectServer(server)}
            className="cursor-pointer hover:text-purple-300 flex items-center space-x-2 mb-3"
          >
            <span>🛰️</span>
            <span>{server}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ServerSidebar;
