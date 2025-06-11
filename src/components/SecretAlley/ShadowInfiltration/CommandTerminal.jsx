import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTerminal,
  FaEye,
  FaSkull,
  FaVoteYea,
  FaShieldAlt,
  FaExclamationTriangle,
  FaLock,
  FaCode,
  FaGhost
} from 'react-icons/fa';

const CommandTerminal = ({ 
  shadowProfile, 
  playerRole, 
  connectedPlayers, 
  actionLogs, 
  onVote, 
  onDiscussion, 
  onBack,
  votingPhase,
  timeRemaining 
}) => {
  const [activeTab, setActiveTab] = useState('logs');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [discussionMessage, setDiscussionMessage] = useState('');
  const [votes, setVotes] = useState({});
  const [showVoteConfirm, setShowVoteConfirm] = useState(false);
  const [decryptedLogs, setDecryptedLogs] = useState([]);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const terminalRef = useRef(null);

  useEffect(() => {
    processActionLogs();
    analyzeSuspiciousActivity();
  }, [actionLogs, playerRole]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [decryptedLogs]);

  const processActionLogs = () => {
    // Process and decrypt logs based on player role
    const processed = actionLogs.map(log => {
      let decrypted = { ...log };
      
      // Cipher role can detect false logs
      if (playerRole === 'CIPHER') {
        decrypted.isForgery = Math.random() < 0.3; // 30% chance of detecting forgery
        decrypted.encryptionLevel = Math.floor(Math.random() * 5) + 1;
      }
      
      // Agent role gets additional information
      if (playerRole === 'AGENT') {
        decrypted.playerLocation = log.zone;
        decrypted.timeAccuracy = 'PRECISE';
      }
      
      // Ghost role sees their own sabotages differently
      if (playerRole === 'GHOST' && log.type === 'sabotage' && log.playerId === shadowProfile?.shadowId) {
        decrypted.isOwnAction = true;
      }
      
      return decrypted;
    });
    
    setDecryptedLogs(processed);
  };

  const analyzeSuspiciousActivity = () => {
    const suspicious = [];
    const playerActivity = {};
    
    // Count activities per player
    actionLogs.forEach(log => {
      if (!playerActivity[log.playerId]) {
        playerActivity[log.playerId] = { tasks: 0, movements: 0, sabotages: 0 };
      }
      
      if (log.type === 'task_complete') playerActivity[log.playerId].tasks++;
      if (log.type === 'movement') playerActivity[log.playerId].movements++;
      if (log.type === 'sabotage') playerActivity[log.playerId].sabotages++;
    });
    
    // Identify suspicious patterns
    Object.entries(playerActivity).forEach(([playerId, activity]) => {
      const player = connectedPlayers.find(p => p.shadowId === playerId);
      if (!player) return;
      
      // Too many movements without tasks
      if (activity.movements > 5 && activity.tasks === 0) {
        suspicious.push({
          playerId,
          playerName: player.alias,
          reason: 'High movement, no task completion',
          severity: 'medium'
        });
      }
      
      // Sabotages detected near player
      if (activity.sabotages > 0) {
        suspicious.push({
          playerId,
          playerName: player.alias,
          reason: 'Present during sabotage events',
          severity: 'high'
        });
      }
      
      // Very low activity (could be hiding)
      if (activity.movements < 2 && activity.tasks < 2) {
        suspicious.push({
          playerId,
          playerName: player.alias,
          reason: 'Unusually low activity',
          severity: 'low'
        });
      }
    });
    
    setSuspiciousActivities(suspicious);
  };

  const handleVote = (targetPlayerId) => {
    if (!votingPhase) return;
    
    setSelectedPlayer(targetPlayerId);
    setShowVoteConfirm(true);
  };

  const confirmVote = () => {
    if (!selectedPlayer) return;
    
    setVotes(prev => ({
      ...prev,
      [shadowProfile?.shadowId]: selectedPlayer
    }));
    
    onVote(selectedPlayer);
    setShowVoteConfirm(false);
    setSelectedPlayer(null);
  };

  const handleDiscussion = (e) => {
    e.preventDefault();
    if (!discussionMessage.trim()) return;
    
    onDiscussion(discussionMessage);
    setDiscussionMessage('');
  };

  const getLogIcon = (log) => {
    switch (log.type) {
      case 'task_complete': return FaShieldAlt;
      case 'movement': return FaEye;
      case 'sabotage': return FaExclamationTriangle;
      case 'vote': return FaVoteYea;
      default: return FaTerminal;
    }
  };

  const getLogColor = (log) => {
    if (playerRole === 'CIPHER' && log.isForgery) return 'text-red-400';
    
    switch (log.type) {
      case 'task_complete': return 'text-green-400';
      case 'movement': return 'text-cyan-400';
      case 'sabotage': return 'text-red-400';
      case 'vote': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* CRT-style scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.1) 2px, rgba(0, 255, 0, 0.1) 4px)',
        }} />
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-green-400/30 bg-black/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-green-400 hover:text-cyan-400 transition-colors"
            >
              ← BACK TO MAP
            </button>
            <div>
              <h1 className="text-2xl font-bold text-green-400 flex items-center">
                <FaTerminal className="mr-3" />
                COMMAND TERMINAL
              </h1>
              <p className="text-sm opacity-70">
                Encrypted Voting & Log Analysis • Role: {playerRole}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            {votingPhase && (
              <div className="text-red-400 font-bold text-lg">
                VOTING: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            )}
            <div className="text-xs opacity-70">
              Connected: {connectedPlayers.length} shadows
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 border-b border-green-400/30 bg-black/80">
        <div className="flex">
          {['logs', 'analysis', 'voting', 'discussion'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold transition-colors ${
                activeTab === tab 
                  ? 'text-cyan-400 border-b-2 border-cyan-400' 
                  : 'text-gray-400 hover:text-green-400'
              }`}
            >
              {tab.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 p-4 overflow-hidden">
        
        {/* Action Logs Tab */}
        {activeTab === 'logs' && (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-green-400 font-bold">ENCRYPTED ACTION LOGS</h3>
              <div className="text-xs text-gray-400">
                {playerRole === 'CIPHER' && 'FORGERY DETECTION ACTIVE'}
                {playerRole === 'AGENT' && 'ENHANCED TRACKING ENABLED'}
              </div>
            </div>
            
            <div 
              ref={terminalRef}
              className="h-full bg-black/50 border border-green-400/30 rounded p-4 overflow-y-auto font-mono text-sm"
            >
              {decryptedLogs.map((log, index) => {
                const LogIcon = getLogIcon(log);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start space-x-3 mb-2 p-2 rounded ${
                      log.isForgery ? 'bg-red-900/20 border border-red-400/30' : 'bg-gray-900/20'
                    }`}
                  >
                    <LogIcon className={`${getLogColor(log)} mt-1 flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={getLogColor(log)}>
                          [{formatTimestamp(log.timestamp)}] {log.playerId}
                        </span>
                        {log.isForgery && (
                          <span className="text-red-400 text-xs font-bold">FORGERY DETECTED</span>
                        )}
                      </div>
                      <div className="text-gray-300 text-xs mt-1">
                        {log.action} {log.zone && `in ${log.zone}`}
                        {log.isOwnAction && <span className="text-purple-400 ml-2">[YOUR ACTION]</span>}
                      </div>
                      {playerRole === 'CIPHER' && log.encryptionLevel && (
                        <div className="text-purple-400 text-xs mt-1">
                          Encryption Level: {log.encryptionLevel}/5
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Suspicious Activity Analysis */}
        {activeTab === 'analysis' && (
          <div className="h-full">
            <h3 className="text-yellow-400 font-bold mb-4">BEHAVIORAL ANALYSIS</h3>
            
            <div className="grid grid-cols-1 gap-4 max-h-full overflow-y-auto">
              {suspiciousActivities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-black/50 border rounded p-4 ${
                    activity.severity === 'high' ? 'border-red-400/50' :
                    activity.severity === 'medium' ? 'border-yellow-400/50' :
                    'border-gray-400/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-cyan-400 font-bold">{activity.playerName}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      activity.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      activity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {activity.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{activity.reason}</p>
                </motion.div>
              ))}
              
              {suspiciousActivities.length === 0 && (
                <div className="text-center text-gray-400 py-20">
                  <FaShieldAlt className="text-6xl mx-auto mb-4" />
                  <p>No suspicious activity detected</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voting Interface */}
        {activeTab === 'voting' && (
          <div className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-red-400 font-bold">EXPOSURE VOTING</h3>
              {votingPhase && (
                <div className="text-red-400 font-bold">
                  TIME REMAINING: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                </div>
              )}
            </div>
            
            {votingPhase ? (
              <div className="grid grid-cols-2 gap-4">
                {connectedPlayers
                  .filter(player => player.shadowId !== shadowProfile?.shadowId)
                  .map(player => (
                    <motion.button
                      key={player.shadowId}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleVote(player.shadowId)}
                      className={`bg-black/50 border rounded-lg p-4 text-left transition-all ${
                        votes[shadowProfile?.shadowId] === player.shadowId
                          ? 'border-red-400 bg-red-900/20'
                          : 'border-gray-600 hover:border-red-400/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-cyan-400 font-bold">{player.alias}</span>
                        {votes[shadowProfile?.shadowId] === player.shadowId && (
                          <FaVoteYea className="text-red-400" />
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        Mask Level: {player.maskLevel} | Rep: {player.reputation}
                      </div>
                    </motion.button>
                  ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-20">
                <FaLock className="text-6xl mx-auto mb-4" />
                <p>Voting phase not active</p>
              </div>
            )}
          </div>
        )}

        {/* Discussion Interface */}
        {activeTab === 'discussion' && (
          <div className="h-full flex flex-col">
            <h3 className="text-cyan-400 font-bold mb-4">ENCRYPTED DISCUSSION</h3>
            
            <div className="flex-1 bg-black/50 border border-cyan-400/30 rounded p-4 mb-4 overflow-y-auto">
              {/* Discussion messages would go here */}
              <div className="text-center text-gray-400 py-20">
                <FaCode className="text-6xl mx-auto mb-4" />
                <p>Encrypted discussion channel</p>
                <p className="text-sm mt-2">Messages are anonymized and encrypted</p>
              </div>
            </div>
            
            <form onSubmit={handleDiscussion} className="flex space-x-3">
              <input
                type="text"
                value={discussionMessage}
                onChange={(e) => setDiscussionMessage(e.target.value)}
                placeholder="Enter encrypted message..."
                className="flex-1 bg-black border border-cyan-400/30 text-cyan-400 px-4 py-2 rounded focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded font-bold transition-colors"
              >
                SEND
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Vote Confirmation Modal */}
      <AnimatePresence>
        {showVoteConfirm && selectedPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black border-2 border-red-400 rounded-lg p-6 max-w-md mx-4 text-center"
            >
              <FaSkull className="text-red-400 text-4xl mx-auto mb-4" />
              
              <h3 className="text-red-400 font-bold text-xl mb-4">
                CONFIRM EXPOSURE VOTE
              </h3>
              
              <p className="text-gray-300 mb-6">
                You are about to vote to expose:
              </p>
              
              <div className="bg-red-900/20 border border-red-400/30 rounded p-3 mb-6">
                <div className="text-cyan-400 font-bold text-lg">
                  {connectedPlayers.find(p => p.shadowId === selectedPlayer)?.alias}
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={confirmVote}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded font-bold"
                >
                  CONFIRM VOTE
                </button>
                <button
                  onClick={() => setShowVoteConfirm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded font-bold"
                >
                  CANCEL
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandTerminal;
