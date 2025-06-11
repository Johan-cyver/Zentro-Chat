import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEye, 
  FaEyeSlash, 
  FaPaperPlane, 
  FaLock,
  FaUnlock,
  FaClock,
  FaTrash,
  FaShieldAlt
} from 'react-icons/fa';

const WhisperNet = ({ shadowProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [whispers, setWhispers] = useState([]);
  const [sentWhispers, setSentWhispers] = useState([]);
  const [selectedWhisper, setSelectedWhisper] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [newWhisper, setNewWhisper] = useState({
    recipient: '',
    message: '',
    expiryMinutes: 60
  });

  useEffect(() => {
    loadWhisperData();
  }, []);

  const loadWhisperData = () => {
    // Mock data for now - will connect to Firebase later
    setWhispers([
      {
        id: 'whisper_001',
        from: 'PHANTOM_BLADE_777',
        message: 'The cipher you solved was impressive. Want to team up for the next squad war?',
        timestamp: Date.now() - 300000, // 5 minutes ago
        expiresAt: Date.now() + 3300000, // 55 minutes from now
        isRead: false,
        isEncrypted: true
      },
      {
        id: 'whisper_002',
        from: 'VOID_HUNTER_123',
        message: 'I have intel on the upcoming arena tournament. Meet me in the secure channel.',
        timestamp: Date.now() - 900000, // 15 minutes ago
        expiresAt: Date.now() + 2700000, // 45 minutes from now
        isRead: true,
        isEncrypted: true
      },
      {
        id: 'whisper_003',
        from: 'CIPHER_MASTER_X',
        message: 'Your solution to my binary puzzle was elegant. Here\'s a harder one: 01000011 01101000 01100001 01101100 01101100 01100101 01101110 01100111 01100101',
        timestamp: Date.now() - 1800000, // 30 minutes ago
        expiresAt: Date.now() + 1800000, // 30 minutes from now
        isRead: false,
        isEncrypted: true
      }
    ]);

    setSentWhispers([
      {
        id: 'sent_001',
        to: 'GLITCH_STORM_999',
        message: 'Good battle. Your algorithm was faster than mine.',
        timestamp: Date.now() - 600000, // 10 minutes ago
        expiresAt: Date.now() + 3000000, // 50 minutes from now
        status: 'delivered'
      }
    ]);
  };

  const getTimeRemaining = (expiresAt) => {
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) return 'EXPIRED';
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const handleSendWhisper = (e) => {
    e.preventDefault();
    if (!newWhisper.recipient || !newWhisper.message) return;

    // Mock sending whisper
    const whisper = {
      id: `sent_${Date.now()}`,
      to: newWhisper.recipient,
      message: newWhisper.message,
      timestamp: Date.now(),
      expiresAt: Date.now() + (newWhisper.expiryMinutes * 60000),
      status: 'delivered'
    };

    setSentWhispers(prev => [whisper, ...prev]);
    setNewWhisper({ recipient: '', message: '', expiryMinutes: 60 });
    setShowCompose(false);
  };

  const handleDeleteWhisper = (whisperId) => {
    setWhispers(prev => prev.filter(w => w.id !== whisperId));
    setSelectedWhisper(null);
  };

  const renderWhisperCard = (whisper, isSent = false) => {
    const timeRemaining = getTimeRemaining(whisper.expiresAt);
    const isExpired = timeRemaining === 'EXPIRED';
    
    return (
      <motion.div
        key={whisper.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`border rounded-lg p-4 cursor-pointer transition-all ${
          isExpired 
            ? 'bg-red-900/20 border-red-400/30 opacity-50' 
            : 'bg-gray-900/50 border-cyan-400/30 hover:border-cyan-400'
        }`}
        onClick={() => !isExpired && setSelectedWhisper(whisper)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <FaLock className="text-cyan-400" />
            <div>
              <div className="text-white font-bold">
                {isSent ? `To: ${whisper.to}` : `From: ${whisper.from}`}
              </div>
              <div className="text-gray-400 text-sm">
                {new Date(whisper.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!isSent && !whisper.isRead && (
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            )}
            <div className={`text-sm font-mono ${
              isExpired ? 'text-red-400' : 'text-yellow-400'
            }`}>
              <FaClock className="inline mr-1" />
              {timeRemaining}
            </div>
          </div>
        </div>

        <div className="text-gray-300 text-sm line-clamp-2">
          {isExpired ? '[MESSAGE EXPIRED]' : whisper.message}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-10">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cyan-400 text-xs"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              y: [0, -20, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            💬
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-cyan-400/30 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              ← BACK
            </motion.button>
            <FaEye className="text-3xl text-cyan-400" />
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">WHISPER NET</h1>
              <p className="text-sm opacity-70">Encrypted communications • Self-destructing messages</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-cyan-400 font-bold">SHADOW: {shadowProfile?.alias}</div>
              <div className="text-xs opacity-70">WHISPERS SENT: {shadowProfile?.whispersSent || 0}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCompose(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              💬 COMPOSE WHISPER
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 p-6">
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'inbox', label: 'INBOX', icon: FaEye },
            { id: 'sent', label: 'SENT', icon: FaPaperPlane },
            { id: 'secure', label: 'SECURE CHANNELS', icon: FaShieldAlt }
          ].map((tab) => {
            const TabIcon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                <TabIcon />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activeTab === 'inbox' && (
            <div className="grid gap-4">
              {whispers.map(whisper => renderWhisperCard(whisper))}
            </div>
          )}

          {activeTab === 'sent' && (
            <div className="grid gap-4">
              {sentWhispers.map(whisper => renderWhisperCard(whisper, true))}
            </div>
          )}

          {activeTab === 'secure' && (
            <div className="text-center text-gray-400 py-20">
              <FaShieldAlt className="text-6xl mx-auto mb-4 text-cyan-400" />
              <h3 className="text-xl font-bold mb-2">SECURE CHANNELS</h3>
              <p>Coming in Phase 3...</p>
            </div>
          )}
        </div>
      </div>

      {/* Whisper Detail Modal */}
      <AnimatePresence>
        {selectedWhisper && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 border-2 border-cyan-500 rounded-2xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <FaLock className="text-cyan-400 text-xl" />
                  <h2 className="text-xl font-bold text-cyan-400">
                    From: {selectedWhisper.from}
                  </h2>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDeleteWhisper(selectedWhisper.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <FaTrash />
                  </motion.button>
                  <button
                    onClick={() => setSelectedWhisper(null)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <div className="text-white leading-relaxed">
                    {selectedWhisper.message}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-gray-400">
                    Received: {new Date(selectedWhisper.timestamp).toLocaleString()}
                  </div>
                  <div className="text-yellow-400 font-mono">
                    <FaClock className="inline mr-1" />
                    Expires in: {getTimeRemaining(selectedWhisper.expiresAt)}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose Whisper Modal */}
      <AnimatePresence>
        {showCompose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900 border-2 border-cyan-500 rounded-2xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">Compose Whisper</h2>
                <button
                  onClick={() => setShowCompose(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSendWhisper} className="space-y-4">
                <div>
                  <label className="block text-cyan-400 font-bold mb-2">RECIPIENT SHADOW ID:</label>
                  <input
                    type="text"
                    value={newWhisper.recipient}
                    onChange={(e) => setNewWhisper(prev => ({ ...prev, recipient: e.target.value }))}
                    placeholder="SHADOW_ID_HERE"
                    className="w-full bg-black border-2 border-cyan-400 rounded-lg px-4 py-3 text-cyan-400 font-mono focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 font-bold mb-2">MESSAGE:</label>
                  <textarea
                    value={newWhisper.message}
                    onChange={(e) => setNewWhisper(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Your encrypted message..."
                    rows={4}
                    className="w-full bg-black border-2 border-cyan-400 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-purple-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 font-bold mb-2">EXPIRY TIME:</label>
                  <select
                    value={newWhisper.expiryMinutes}
                    onChange={(e) => setNewWhisper(prev => ({ ...prev, expiryMinutes: parseInt(e.target.value) }))}
                    className="w-full bg-black border-2 border-cyan-400 rounded-lg px-4 py-3 text-cyan-400 focus:outline-none focus:border-purple-400"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={180}>3 hours</option>
                    <option value={720}>12 hours</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                  >
                    🔒 SEND WHISPER
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCompose(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                  >
                    CANCEL
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhisperNet;
