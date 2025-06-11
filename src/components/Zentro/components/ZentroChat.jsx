import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaComments, FaUsers, FaRobot, FaPlus, FaSearch } from 'react-icons/fa';

const ZentroChat = ({ user, theme }) => {
  const [activeChat, setActiveChat] = useState(null);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <FaComments className="mr-3 text-blue-400" />
          Zentro Chat
        </h1>
        <p className="text-lg opacity-70">Connect, collaborate, and communicate</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Conversations</h3>
          <div className="space-y-3">
            <div className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  ZB
                </div>
                <div>
                  <div className="font-bold">Zentro Bot</div>
                  <div className="text-sm opacity-70">How can I help you today?</div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-700 p-3 rounded-lg cursor-pointer hover:bg-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                  SA
                </div>
                <div>
                  <div className="font-bold">Shadow Alliance</div>
                  <div className="text-sm opacity-70">New mission available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-6">
          <div className="text-center text-gray-400 py-20">
            <FaComments className="text-6xl mb-4 mx-auto" />
            <h3 className="text-xl font-bold mb-2">Select a conversation</h3>
            <p>Choose a chat from the sidebar to start messaging</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZentroChat;
