import React from 'react';

const ServerView = () => {
  const servers = ['Zentro Admin Server', 'Anime World', 'Music Chatroom'];

  return (
    <div>
      <h2 className="text-purple-400 text-lg font-bold mb-4">Servers</h2>
      {servers.map(server => (
        <div key={server} className="py-2 border-b border-purple-800 hover:bg-purple-900 px-4 rounded">
          {server}
        </div>
      ))}
    </div>
  );
};

export default ServerView;
