import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaRobot, 
  FaComments, 
  FaTimes, 
  FaPaperPlane, 
  FaMicrophone,
  FaVolumeUp,
  FaHeart,
  FaBrain,
  FaLightbulb,
  FaFire,
  FaGamepad,
  FaUsers,
  FaCode
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import zentroIdService from '../../services/zentroIdService';

const ZennyCompanion = () => {
  const userContext = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mood, setMood] = useState('focused'); // focused, chill, grinding, excited
  const [voiceMode, setVoiceMode] = useState(false);
  const [zentroId, setZentroId] = useState(null);

  const { userProfile } = userContext || {};

  useEffect(() => {
    if (userProfile?.uid) {
      loadZentroId();
      initializeZenny();
    }
  }, [userProfile]);

  // Handle loading state - return early if no user context
  if (!userContext) {
    return null;
  }

  const loadZentroId = async () => {
    if (userProfile?.uid) {
      const id = await zentroIdService.getZentroId(userProfile.uid);
      setZentroId(id);
    }
  };

  const initializeZenny = () => {
    // Initial greeting based on time and user activity
    const hour = new Date().getHours();
    let greeting = '';
    
    if (hour < 12) {
      greeting = "Good morning! Ready to code some magic today? ✨";
    } else if (hour < 18) {
      greeting = "Hey there! How's your coding session going? 🚀";
    } else {
      greeting = "Evening warrior! Still grinding? I'm here to help! 🔥";
    }

    setMessages([{
      id: 1,
      text: greeting,
      sender: 'zenny',
      timestamp: new Date().toISOString(),
      mood: 'excited'
    }]);
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'focused': return 'from-blue-500 to-cyan-500';
      case 'chill': return 'from-green-500 to-emerald-500';
      case 'grinding': return 'from-red-500 to-orange-500';
      case 'excited': return 'from-purple-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'focused': return '🎯';
      case 'chill': return '😌';
      case 'grinding': return '🔥';
      case 'excited': return '🚀';
      default: return '🤖';
    }
  };

  const generateZennyResponse = (userMessage) => {
    const responses = {
      battle: [
        "Ready for battle? I suggest starting with a Code Duel to warm up! 💪",
        "Battle time! Your win rate is looking good - let's keep that streak going! ⚔️",
        "I see you're in battle mode! Remember, consistency beats perfection. You got this! 🎯"
      ],
      squad: [
        "Squad up! Teamwork makes the dream work. Have you checked out any squads lately? 🛡️",
        "Your collaboration skills are improving! Maybe it's time to join or create a squad? 👥",
        "Squad goals! I think you'd be a great team player. Want me to find some squads for you? 🤝"
      ],
      code: [
        "Coding time! Remember, every expert was once a beginner. Keep pushing! 💻",
        "I love your coding energy! Want to try a quick coding challenge to sharpen your skills? ⚡",
        "Code like a boss! Your problem-solving skills are getting stronger every day! 🧠"
      ],
      motivation: [
        "You're doing amazing! Every line of code is progress. Keep going! 🌟",
        "Believe in yourself! You've overcome challenges before, and you'll do it again! 💪",
        "Progress over perfection! You're building something incredible, one step at a time! 🚀"
      ],
      stats: [
        `You're Level ${zentroId?.level || 1} with ${zentroId?.xp || 0} XP! Your journey is inspiring! 📈`,
        `${zentroId?.stats?.battlesWon || 0} battles won! You're becoming a true warrior! ⚔️`,
        `${zentroId?.stats?.collabsCompleted || 0} collaborations completed! Teamwork champion! 🤝`
      ]
    };

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('battle') || lowerMessage.includes('fight') || lowerMessage.includes('duel')) {
      return responses.battle[Math.floor(Math.random() * responses.battle.length)];
    } else if (lowerMessage.includes('squad') || lowerMessage.includes('team') || lowerMessage.includes('group')) {
      return responses.squad[Math.floor(Math.random() * responses.squad.length)];
    } else if (lowerMessage.includes('code') || lowerMessage.includes('program') || lowerMessage.includes('debug')) {
      return responses.code[Math.floor(Math.random() * responses.code.length)];
    } else if (lowerMessage.includes('help') || lowerMessage.includes('stuck') || lowerMessage.includes('difficult')) {
      return responses.motivation[Math.floor(Math.random() * responses.motivation.length)];
    } else if (lowerMessage.includes('stats') || lowerMessage.includes('progress') || lowerMessage.includes('level')) {
      return responses.stats[Math.floor(Math.random() * responses.stats.length)];
    } else {
      const general = [
        "That's interesting! Tell me more about what you're working on! 🤔",
        "I'm here to help! What would you like to explore today? 🌟",
        "Awesome! How can I support your coding journey today? 💫",
        "Great question! Let's figure this out together! 🧠"
      ];
      return general[Math.floor(Math.random() * general.length)];
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate Zenny thinking
    setTimeout(() => {
      const zennyResponse = {
        id: Date.now() + 1,
        text: generateZennyResponse(inputMessage),
        sender: 'zenny',
        timestamp: new Date().toISOString(),
        mood: mood
      };

      setMessages(prev => [...prev, zennyResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    { icon: FaGamepad, text: "Start Battle", action: () => window.location.href = '/battle' },
    { icon: FaUsers, text: "Find Squad", action: () => window.location.href = '/squads' },
    { icon: FaCode, text: "Code Challenge", action: () => setInputMessage("Give me a coding challenge!") },
    { icon: FaBrain, text: "Get Tips", action: () => setInputMessage("Any tips for improving?") }
  ];

  return (
    <>
      {/* Floating Zenny Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-16 h-16 rounded-full bg-gradient-to-r ${getMoodColor(mood)} shadow-2xl flex items-center justify-center text-white text-2xl relative overflow-hidden`}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <FaTimes /> : <FaRobot />}
          </motion.div>
          
          {/* Mood indicator */}
          <div className="absolute -top-1 -right-1 text-lg">
            {getMoodEmoji(mood)}
          </div>
          
          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 rounded-full bg-white/20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-gray-900/95 backdrop-blur-lg rounded-2xl border border-gray-700 shadow-2xl z-40 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${getMoodColor(mood)} p-4 flex items-center justify-between`}>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <FaRobot className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Zenny</h3>
                  <p className="text-white/80 text-xs">Your AI Companion</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setVoiceMode(!voiceMode)}
                  className={`p-2 rounded-lg ${voiceMode ? 'bg-white/20' : 'bg-white/10'} text-white`}
                >
                  {voiceMode ? <FaVolumeUp /> : <FaMicrophone />}
                </motion.button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : `bg-gradient-to-r ${getMoodColor(message.mood || mood)} text-white`
                  }`}>
                    <p className="text-sm">{message.text}</p>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className={`bg-gradient-to-r ${getMoodColor(mood)} text-white p-3 rounded-2xl`}>
                    <div className="flex space-x-1">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-3 border-t border-gray-700">
              <div className="grid grid-cols-4 gap-2 mb-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={action.action}
                    className="p-2 bg-gray-700/50 rounded-lg text-gray-300 hover:text-white transition-colors flex flex-col items-center space-y-1"
                  >
                    <action.icon className="text-sm" />
                    <span className="text-xs">{action.text}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Zenny anything..."
                  className="flex-1 bg-gray-700/50 text-white p-3 rounded-xl border border-gray-600 focus:border-cyan-500 focus:outline-none"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className={`p-3 rounded-xl bg-gradient-to-r ${getMoodColor(mood)} text-white disabled:opacity-50`}
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

export default ZennyCompanion;
