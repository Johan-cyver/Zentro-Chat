import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaTimes, FaComments, FaPaperPlane } from 'react-icons/fa';

const ZentroBot = ({ user, theme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: `Welcome to Zentro, ${user?.displayName || 'User'}! I'm your AI assistant. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: getBotResponse(inputMessage),
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const getBotResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('secret alley')) {
      return "Secret Alley is your dark training ground! It's where you can test your skills, complete missions, and climb the shadow hierarchy. Would you like me to explain how to access it?";
    }
    
    if (lowerMessage.includes('zentro score')) {
      return `Your current Zentro Score is ${user?.zentroStats?.zentroScore || 8.7}. This score reflects your overall activity, skill level, and contributions to the Zentro ecosystem.`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('commands')) {
      return "I can help you with:\n• Navigating Zentro features\n• Understanding your stats and progress\n• Secret Alley guidance\n• Talent Directory tips\n• Zentrium marketplace info\n\nJust ask me anything!";
    }
    
    if (lowerMessage.includes('profile')) {
      return "Your profile is your digital identity in Zentro! You can switch between Personal and Professional modes. Your professional profile is especially important for the Talent Directory.";
    }
    
    return "I understand you're asking about " + message + ". I'm here to help with all things Zentro! Feel free to ask me about features, navigation, or your progress.";
  };

  return (
    <>
      {/* Bot Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg z-40"
      >
        {isOpen ? <FaTimes /> : <FaRobot />}
      </motion.button>

      {/* Bot Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 h-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-40 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center space-x-3">
                <FaRobot className="text-xl" />
                <div>
                  <div className="font-bold">Zentro Bot</div>
                  <div className="text-xs opacity-80">AI Assistant</div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-100'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-line">{message.content}</div>
                    <div className="text-xs opacity-70 mt-1">{message.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything..."
                  className="flex-1 p-2 bg-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  className="bg-purple-600 text-white p-2 rounded-lg"
                >
                  <FaPaperPlane />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ZentroBot;
