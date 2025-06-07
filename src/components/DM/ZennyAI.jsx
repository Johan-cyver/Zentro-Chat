import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const ZennyAI = ({ onClose }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the query to your AI backend
    console.log('AI Query:', query);
    setQuery('');
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Zenny AI Assistant</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <FaTimes />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* AI conversation history would go here */}
        <div className="text-center text-gray-500 dark:text-gray-400">
          Ask me anything! I'm here to help.
        </div>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask Zenny..."
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ZennyAI; 