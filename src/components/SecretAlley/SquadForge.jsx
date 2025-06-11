import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaShieldAlt,
  FaCrown,
  FaFighterJet,
  FaPlus,
  FaEye,
  FaLock,
  FaFire,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import shadowWebSocketService from '../../services/shadowWebSocket';

const SquadForge = ({ shadowProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('squads');
  const [availableSquads, setAvailableSquads] = useState([]);
  const [mySquad, setMySquad] = useState(null);
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [showCreateSquad, setShowCreateSquad] = useState(false);
  const [newSquad, setNewSquad] = useState({
    name: '',
    description: '',
    maxMembers: 5,
    isPublic: true
  });

  useEffect(() => {
    loadSquadData();
  }, []);

  const loadSquadData = () => {
    // Mock data for now - will connect to Firebase later
    setAvailableSquads([
      {
        id: 'squad_001',
        name: 'SHADOW COLLECTIVE',
        tag: 'SHAD',
        leader: 'PHANTOM_BLADE_777',
        members: 8,
        maxMembers: 10,
        description: 'Elite hackers and cipher masters. Seeking skilled shadows for upcoming wars.',
        wins: 15,
        losses: 3,
        rank: 'LEGENDARY',
        isPublic: true,
        requirements: 'Min 500 Shadow XP',
        specialization: 'CIPHER_WARFARE'
      },
      {
        id: 'squad_002',
        name: 'VOID HUNTERS',
        tag: 'VOID',
        leader: 'VOID_HUNTER_123',
        members: 5,
        maxMembers: 8,
        description: 'Aggressive battle squad focused on arena domination.',
        wins: 22,
        losses: 7,
        rank: 'ELITE',
        isPublic: true,
        requirements: 'Battle experience required',
        specialization: 'ARENA_COMBAT'
      },
      {
        id: 'squad_003',
        name: 'CIPHER SYNDICATE',
        tag: 'CIPH',
        leader: 'CIPHER_MASTER_X',
        members: 6,
        maxMembers: 6,
        description: 'Puzzle solvers and code breakers. Full roster.',
        wins: 18,
        losses: 2,
        rank: 'MASTER',
        isPublic: false,
        requirements: 'Invitation only',
        specialization: 'PUZZLE_SOLVING'
      },
      {
        id: 'squad_004',
        name: 'NEON REBELS',
        tag: 'NEON',
        leader: 'NEON_STORM_666',
        members: 3,
        maxMembers: 7,
        description: 'New squad looking for ambitious shadows to build something great.',
        wins: 4,
        losses: 1,
        rank: 'RISING',
        isPublic: true,
        requirements: 'Open to all',
        specialization: 'MIXED'
      }
    ]);

    // Mock user's squad (if any)
    setMySquad(null); // User not in a squad yet
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 'LEGENDARY': return 'text-purple-400';
      case 'MASTER': return 'text-yellow-400';
      case 'ELITE': return 'text-red-400';
      case 'RISING': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getSpecializationIcon = (spec) => {
    switch (spec) {
      case 'CIPHER_WARFARE': return '🧩';
      case 'ARENA_COMBAT': return '⚔️';
      case 'PUZZLE_SOLVING': return '🔍';
      case 'MIXED': return '🌟';
      default: return '🛡️';
    }
  };

  const handleJoinSquad = async (squad) => {
    if (squad.members >= squad.maxMembers) {
      alert('Squad is full!');
      return;
    }

    if (!squad.isPublic) {
      alert('This squad requires an invitation.');
      return;
    }

    try {
      await shadowWebSocketService.joinSquad(squad.id, shadowProfile);
      alert(`✅ Successfully joined ${squad.name}!`);

      // Update local state
      setAvailableSquads(prev => prev.map(s =>
        s.id === squad.id
          ? { ...s, members: s.members + 1 }
          : s
      ));
      setSelectedSquad(null);
    } catch (error) {
      alert(`❌ Failed to join squad: ${error.message}`);
    }
  };

  const handleCreateSquad = async (e) => {
    e.preventDefault();
    if (!newSquad.name.trim()) return;

    try {
      const squadData = {
        name: newSquad.name,
        description: newSquad.description,
        maxMembers: newSquad.maxMembers,
        isPublic: newSquad.isPublic,
        tag: newSquad.name.substring(0, 4).toUpperCase(),
        specialization: 'MIXED'
      };

      const squad = await shadowWebSocketService.createSquad(squadData, shadowProfile);

      setMySquad({
        ...squad,
        wins: 0,
        losses: 0,
        rank: 'ROOKIE'
      });

      setNewSquad({ name: '', description: '', maxMembers: 5, isPublic: true });
      setShowCreateSquad(false);
      alert(`✅ Squad "${squad.name}" created successfully!`);
    } catch (error) {
      alert(`❌ Failed to create squad: ${error.message}`);
    }
  };

  const renderSquadCard = (squad) => {
    const isFull = squad.members >= squad.maxMembers;
    
    return (
      <motion.div
        key={squad.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900/50 border border-green-400/30 rounded-lg p-4 cursor-pointer hover:border-green-400 transition-all"
        onClick={() => setSelectedSquad(squad)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">{squad.tag}</span>
            </div>
            <div>
              <h3 className="text-white font-bold">{squad.name}</h3>
              <p className="text-gray-400 text-sm">Led by {squad.leader}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`font-bold ${getRankColor(squad.rank)}`}>
              {squad.rank}
            </div>
            <div className="text-gray-400 text-sm">
              {squad.members}/{squad.maxMembers} members
            </div>
          </div>
        </div>

        <div className="text-gray-300 text-sm mb-3 line-clamp-2">
          {squad.description}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-green-400">{squad.wins}W</span>
              <span className="text-gray-400 mx-1">-</span>
              <span className="text-red-400">{squad.losses}L</span>
            </div>
            <div className="text-sm text-gray-400">
              {getSpecializationIcon(squad.specialization)} {squad.specialization.replace('_', ' ')}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {!squad.isPublic && <FaLock className="text-yellow-400" />}
            {isFull && <span className="text-red-400 text-sm font-bold">FULL</span>}
          </div>
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
            className="absolute text-green-400 text-xs"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            🛡️
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-green-400/30 bg-black/50 backdrop-blur-sm">
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
            <FaUsers className="text-3xl text-green-400" />
            <div>
              <h1 className="text-3xl font-bold text-green-400">SQUAD FORGE</h1>
              <p className="text-sm opacity-70">Form shadow alliances • Dominate together</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-green-400 font-bold">SHADOW: {shadowProfile?.alias}</div>
              <div className="text-xs opacity-70">
                SQUAD: {mySquad ? mySquad.name : 'NONE'}
              </div>
            </div>
            {!mySquad && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateSquad(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
              >
                🛡️ CREATE SQUAD
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 p-6">
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'squads', label: 'AVAILABLE SQUADS', icon: FaUsers },
            { id: 'my-squad', label: 'MY SQUAD', icon: FaShieldAlt },
            { id: 'wars', label: 'SQUAD WARS', icon: FaFighterJet }
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
                    ? 'bg-green-600 text-white'
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
          {activeTab === 'squads' && (
            <div className="grid gap-4">
              {availableSquads.map(renderSquadCard)}
            </div>
          )}

          {activeTab === 'my-squad' && (
            <div className="text-center text-gray-400 py-20">
              {mySquad ? (
                <div>
                  <FaShieldAlt className="text-6xl mx-auto mb-4 text-green-400" />
                  <h3 className="text-xl font-bold mb-2">{mySquad.name}</h3>
                  <p>Squad management coming soon...</p>
                </div>
              ) : (
                <div>
                  <FaUsers className="text-6xl mx-auto mb-4 text-gray-600" />
                  <h3 className="text-xl font-bold mb-2">NO SQUAD</h3>
                  <p>Join or create a squad to begin your alliance journey.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'wars' && (
            <div className="text-center text-gray-400 py-20">
              <FaFighterJet className="text-6xl mx-auto mb-4 text-green-400" />
              <h3 className="text-xl font-bold mb-2">SQUAD WARS</h3>
              <p>Coming in Phase 3...</p>
            </div>
          )}
        </div>
      </div>

      {/* Squad Detail Modal */}
      <AnimatePresence>
        {selectedSquad && (
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
              className="bg-gray-900 border-2 border-green-500 rounded-2xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{selectedSquad.tag}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-green-400">{selectedSquad.name}</h2>
                    <p className="text-gray-400">Led by {selectedSquad.leader}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSquad(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <h3 className="text-green-400 font-bold mb-2">DESCRIPTION:</h3>
                  <p className="text-white">{selectedSquad.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-green-400 font-bold mb-1">MEMBERS</h4>
                    <p className="text-white">{selectedSquad.members}/{selectedSquad.maxMembers}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-green-400 font-bold mb-1">RANK</h4>
                    <p className={getRankColor(selectedSquad.rank)}>{selectedSquad.rank}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-green-400 font-bold mb-1">RECORD</h4>
                    <p className="text-white">{selectedSquad.wins}W - {selectedSquad.losses}L</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-green-400 font-bold mb-1">SPECIALIZATION</h4>
                    <p className="text-white">
                      {getSpecializationIcon(selectedSquad.specialization)} {selectedSquad.specialization.replace('_', ' ')}
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-3">
                  <h4 className="text-yellow-400 font-bold mb-1">REQUIREMENTS:</h4>
                  <p className="text-yellow-300">{selectedSquad.requirements}</p>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleJoinSquad(selectedSquad)}
                    disabled={selectedSquad.members >= selectedSquad.maxMembers || !selectedSquad.isPublic}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-bold transition-colors"
                  >
                    {selectedSquad.members >= selectedSquad.maxMembers ? 'SQUAD FULL' : 
                     !selectedSquad.isPublic ? 'INVITATION ONLY' : '🛡️ REQUEST TO JOIN'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSquad(null)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                  >
                    CLOSE
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Squad Modal */}
      <AnimatePresence>
        {showCreateSquad && (
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
              className="bg-gray-900 border-2 border-green-500 rounded-2xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-green-400">Create Squad</h2>
                <button
                  onClick={() => setShowCreateSquad(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateSquad} className="space-y-4">
                <div>
                  <label className="block text-green-400 font-bold mb-2">SQUAD NAME:</label>
                  <input
                    type="text"
                    value={newSquad.name}
                    onChange={(e) => setNewSquad(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter squad name..."
                    className="w-full bg-black border-2 border-green-400 rounded-lg px-4 py-3 text-green-400 font-mono focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-green-400 font-bold mb-2">DESCRIPTION:</label>
                  <textarea
                    value={newSquad.description}
                    onChange={(e) => setNewSquad(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your squad's mission..."
                    rows={3}
                    className="w-full bg-black border-2 border-green-400 rounded-lg px-4 py-3 text-white resize-none focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-green-400 font-bold mb-2">MAX MEMBERS:</label>
                    <select
                      value={newSquad.maxMembers}
                      onChange={(e) => setNewSquad(prev => ({ ...prev, maxMembers: parseInt(e.target.value) }))}
                      className="w-full bg-black border-2 border-green-400 rounded-lg px-4 py-3 text-green-400 focus:outline-none focus:border-cyan-400"
                    >
                      <option value={3}>3 members</option>
                      <option value={5}>5 members</option>
                      <option value={8}>8 members</option>
                      <option value={10}>10 members</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-green-400 font-bold mb-2">VISIBILITY:</label>
                    <select
                      value={newSquad.isPublic}
                      onChange={(e) => setNewSquad(prev => ({ ...prev, isPublic: e.target.value === 'true' }))}
                      className="w-full bg-black border-2 border-green-400 rounded-lg px-4 py-3 text-green-400 focus:outline-none focus:border-cyan-400"
                    >
                      <option value={true}>Public</option>
                      <option value={false}>Private</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                  >
                    🛡️ CREATE SQUAD
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateSquad(false)}
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

export default SquadForge;
