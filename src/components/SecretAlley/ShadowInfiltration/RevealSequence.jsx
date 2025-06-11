import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSkull,
  FaEye,
  FaCode,
  FaShieldAlt,
  FaBolt,
  FaGhost,
  FaCrown,
  FaFire,
  FaTrophy
} from 'react-icons/fa';

const RevealSequence = ({ shadowProfile, playerRole, gameState, onComplete }) => {
  const [revealPhase, setRevealPhase] = useState('counting'); // counting, revealing, results
  const [revealedPlayers, setRevealedPlayers] = useState([]);
  const [voteResults, setVoteResults] = useState({});
  const [gameResults, setGameResults] = useState(null);
  const [currentRevealIndex, setCurrentRevealIndex] = useState(0);

  // Role definitions for reveal
  const roleData = {
    ECHO: { icon: FaEye, color: 'text-green-400', name: 'Echo' },
    GHOST: { icon: FaGhost, color: 'text-red-400', name: 'Ghost' },
    CIPHER: { icon: FaCode, color: 'text-purple-400', name: 'Cipher' },
    AGENT: { icon: FaShieldAlt, color: 'text-blue-400', name: 'Agent' },
    GLITCH: { icon: FaBolt, color: 'text-yellow-400', name: 'Glitch' }
  };

  useEffect(() => {
    startRevealSequence();
  }, []);

  const startRevealSequence = async () => {
    // Phase 1: Count votes
    await countVotes();
    
    // Phase 2: Reveal players one by one
    setRevealPhase('revealing');
    await revealPlayers();
    
    // Phase 3: Show final results
    setRevealPhase('results');
    calculateGameResults();
  };

  const countVotes = async () => {
    // Simulate vote counting with dramatic effect
    const votes = gameState.votes || {};
    const voteCount = {};
    
    // Count votes for each player
    Object.values(votes).forEach(targetId => {
      voteCount[targetId] = (voteCount[targetId] || 0) + 1;
    });
    
    // Add some random votes from NPCs
    const npcs = gameState.connectedPlayers.filter(p => p.shadowId !== shadowProfile?.shadowId);
    npcs.forEach(npc => {
      const randomTarget = npcs[Math.floor(Math.random() * npcs.length)];
      if (randomTarget && Math.random() > 0.3) {
        voteCount[randomTarget.shadowId] = (voteCount[randomTarget.shadowId] || 0) + 1;
      }
    });
    
    setVoteResults(voteCount);
    
    // Wait for dramatic effect
    await new Promise(resolve => setTimeout(resolve, 3000));
  };

  const revealPlayers = async () => {
    // Assign roles to all players (mock for demo)
    const playerRoles = {
      [shadowProfile?.shadowId]: playerRole,
      'PHANTOM_BLADE_777': 'ECHO',
      'CIPHER_MASTER_X': 'CIPHER',
      'VOID_HUNTER_123': 'GHOST',
      'GHOST_PROTOCOL_7': 'GHOST',
      'NEON_STORM_666': 'ECHO'
    };

    const playersToReveal = gameState.connectedPlayers.map(player => ({
      ...player,
      assignedRole: playerRoles[player.shadowId] || 'ECHO',
      votes: voteResults[player.shadowId] || 0
    }));

    // Sort by vote count (most voted first)
    playersToReveal.sort((a, b) => b.votes - a.votes);

    // Reveal players one by one with dramatic timing
    for (let i = 0; i < playersToReveal.length; i++) {
      setCurrentRevealIndex(i);
      setRevealedPlayers(prev => [...prev, playersToReveal[i]]);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  };

  const calculateGameResults = () => {
    const ghosts = revealedPlayers.filter(p => p.assignedRole === 'GHOST');
    const echoes = revealedPlayers.filter(p => p.assignedRole === 'ECHO');
    const mostVotedPlayer = revealedPlayers.reduce((max, player) => 
      player.votes > (max?.votes || 0) ? player : max, null);

    // Determine if Echoes won
    const echoesWon = mostVotedPlayer && mostVotedPlayer.assignedRole === 'GHOST';
    const playerWon = (playerRole === 'ECHO' || playerRole === 'CIPHER' || playerRole === 'AGENT') ? echoesWon : !echoesWon;

    const results = {
      echoesWon,
      playerWon,
      mostVotedPlayer,
      ghostsRevealed: ghosts.length,
      totalGhosts: ghosts.length,
      xpGained: calculateXPGain(playerWon, playerRole),
      reputationGained: calculateReputationGain(playerWon, playerRole),
      maskEvolution: checkMaskEvolution()
    };

    setGameResults(results);
    
    // Auto-complete after showing results
    setTimeout(() => {
      onComplete(results);
    }, 5000);
  };

  const calculateXPGain = (won, role) => {
    let baseXP = 50;
    if (won) baseXP += 100;
    if (role === 'GHOST') baseXP += 25;
    if (role === 'CIPHER') baseXP += 15;
    return baseXP;
  };

  const calculateReputationGain = (won, role) => {
    let baseRep = 10;
    if (won) baseRep += 50;
    if (role === 'GHOST' && won) baseRep += 25; // Bonus for successful deception
    return baseRep;
  };

  const checkMaskEvolution = () => {
    const currentXP = shadowProfile?.shadowXP || 0;
    const newXP = currentXP + calculateXPGain(gameResults?.playerWon, playerRole);
    const currentLevel = shadowProfile?.maskLevel || 1;
    const newLevel = Math.floor(newXP / 500) + 1;
    
    return newLevel > currentLevel ? newLevel : null;
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Dramatic background effects */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 1,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Vote Counting Phase */}
      {revealPhase === 'counting' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 flex items-center justify-center h-full"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-8"
            >
              <FaSkull className="text-8xl text-red-400 mx-auto" />
            </motion.div>
            
            <h1 className="text-4xl font-bold text-red-400 mb-4">
              COUNTING VOTES
            </h1>
            
            <div className="text-xl text-gray-300 mb-8">
              Analyzing encrypted ballots...
            </div>
            
            <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
              {Object.entries(voteResults).map(([playerId, votes]) => {
                const player = gameState.connectedPlayers.find(p => p.shadowId === playerId);
                return (
                  <motion.div
                    key={playerId}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-black/50 border border-red-400/30 rounded p-3 flex justify-between"
                  >
                    <span className="text-cyan-400">{player?.alias || 'UNKNOWN'}</span>
                    <span className="text-red-400 font-bold">{votes} votes</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Player Reveal Phase */}
      {revealPhase === 'revealing' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative z-10 p-8"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-cyan-400 mb-4">
              IDENTITY REVEAL
            </h1>
            <div className="text-lg text-gray-300">
              Unmasking the shadows...
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
            {revealedPlayers.map((player, index) => {
              const role = roleData[player.assignedRole];
              const isCurrentReveal = index === currentRevealIndex;
              
              return (
                <motion.div
                  key={player.shadowId}
                  initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    rotateY: 0,
                    boxShadow: isCurrentReveal ? '0 0 50px rgba(6, 182, 212, 0.8)' : 'none'
                  }}
                  transition={{ 
                    duration: 1.5,
                    delay: index * 0.5
                  }}
                  className={`bg-black/70 border-2 rounded-lg p-6 text-center ${
                    player.assignedRole === 'GHOST' ? 'border-red-400' : 'border-green-400'
                  }`}
                >
                  <motion.div
                    animate={isCurrentReveal ? { 
                      scale: [1, 1.2, 1],
                      rotate: [0, 360, 0]
                    } : {}}
                    transition={{ duration: 2 }}
                  >
                    {React.createElement(role.icon, { className: `text-6xl ${role.color} mx-auto mb-4` })}
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-cyan-400 mb-2">
                    {player.alias}
                  </h3>
                  
                  <div className={`text-lg font-bold ${role.color} mb-2`}>
                    {role.name.toUpperCase()}
                  </div>
                  
                  <div className="text-sm text-gray-400 mb-2">
                    Votes received: {player.votes}
                  </div>
                  
                  {player.shadowId === shadowProfile?.shadowId && (
                    <div className="bg-cyan-400/20 border border-cyan-400/50 rounded p-2 mt-3">
                      <span className="text-cyan-400 font-bold">YOU</span>
                    </div>
                  )}
                  
                  {player.assignedRole === 'GHOST' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="bg-red-400/20 border border-red-400/50 rounded p-2 mt-3"
                    >
                      <span className="text-red-400 font-bold">THREAT IDENTIFIED</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Results Phase */}
      {revealPhase === 'results' && gameResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex items-center justify-center h-full"
        >
          <div className="bg-black/80 border-2 border-cyan-400 rounded-lg p-8 max-w-2xl mx-4 text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {gameResults.playerWon ? (
                <FaTrophy className="text-8xl text-yellow-400 mx-auto mb-6" />
              ) : (
                <FaSkull className="text-8xl text-red-400 mx-auto mb-6" />
              )}
            </motion.div>
            
            <h1 className={`text-4xl font-bold mb-6 ${
              gameResults.playerWon ? 'text-green-400' : 'text-red-400'
            }`}>
              {gameResults.playerWon ? 'VICTORY' : 'DEFEAT'}
            </h1>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-green-900/20 border border-green-400/30 rounded p-4">
                <h3 className="text-green-400 font-bold mb-2">XP GAINED</h3>
                <div className="text-3xl text-green-400">+{gameResults.xpGained}</div>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-400/30 rounded p-4">
                <h3 className="text-purple-400 font-bold mb-2">REPUTATION</h3>
                <div className="text-3xl text-purple-400">+{gameResults.reputationGained}</div>
              </div>
            </div>
            
            {gameResults.maskEvolution && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-yellow-900/20 border border-yellow-400/30 rounded p-4 mb-6"
              >
                <FaCrown className="text-yellow-400 text-3xl mx-auto mb-2" />
                <h3 className="text-yellow-400 font-bold">MASK EVOLUTION!</h3>
                <div className="text-lg">Level {gameResults.maskEvolution} Unlocked</div>
              </motion.div>
            )}
            
            <div className="text-gray-300 space-y-2 mb-6">
              <div>Your Role: <span className="text-cyan-400">{playerRole}</span></div>
              <div>Outcome: <span className={gameResults.echoesWon ? 'text-green-400' : 'text-red-400'}>
                {gameResults.echoesWon ? 'Echoes Prevailed' : 'Ghosts Succeeded'}
              </span></div>
              <div>Most Voted: <span className="text-yellow-400">
                {gameResults.mostVotedPlayer?.alias || 'None'}
              </span></div>
            </div>
            
            <div className="text-sm text-gray-400">
              Session complete. Returning to results...
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RevealSequence;
