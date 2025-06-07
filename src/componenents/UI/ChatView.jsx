import React from 'react';

const ChatView = () => {
  return (
    <div className="text-purple-300 p-6">
      <h2 className="text-2xl font-bold mb-4">Chats</h2>
      <div className="space-y-2">
        <div className="bg-[#111] p-3 rounded hover:bg-[#222] cursor-pointer">Zentro Bot</div>
        <div className="bg-[#111] p-3 rounded hover:bg-[#222] cursor-pointer">Random Chat</div>
        <div className="bg-[#111] p-3 rounded hover:bg-[#222] cursor-pointer">User1</div>
        <div className="bg-[#111] p-3 rounded hover:bg-[#222] cursor-pointer">User2</div>
      </div>
    </div>
  );
};

export default ChatView;
