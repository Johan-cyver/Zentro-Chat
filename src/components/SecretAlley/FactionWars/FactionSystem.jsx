import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShieldAlt,
  FaFire,
  FaCode,
  FaCrown,
  FaFighterJet,
  FaMap,
  FaUsers,
  FaBolt,
  FaSkull,
  FaGem
} from 'react-icons/fa';

const FactionSystem = ({ shadowProfile, onBack }) => {
  const [selectedFaction, setSelectedFaction] = useState(null);
  const [userFaction, setUserFaction] = useState(null);
  const [territoryMap, setTerritoryMap] = useState({});
  const [activeWars, setActiveWars] = useState([]);
  const [factionStats, setFactionStats] = useState({});
  const [showJoinConfirm, setShowJoinConfirm] = useState(false);
  const [currentView, setCurrentView] = useState('overview'); // overview, territories, wars, members

  // Faction definitions with unique abilities and themes
  const FACTIONS = {
    VOID_WALKERS: {
      id: 'VOID_WALKERS',
      name: 'Void Walkers',
      icon: FaSkull,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20',
      borderColor: 'border-purple-400',
      description: 'Masters of the unknown, wielding forbidden knowledge',
      philosophy: 'Embrace the darkness to transcend limitations',
      specialties: ['Void Missions', 'Forbidden Archives', 'Reality Manipulation'],
      bonuses: {
        voidXP: '+50%',
        mysteryAccess: 'Exclusive',
        riskReward: '+100%'
      },
      requirements: {
        maskLevel: 5,
        voidMissions: 3,
        reputation: 1000
      },
      members: 127,
      territories: 8,
      power: 2340
    },
    CIPHER_COLLECTIVE: {
      id: 'CIPHER_COLLECTIVE',
      name: 'Cipher Collective',
      icon: FaCode,
      color: 'text-green-400',
      bgColor: 'bg-green-900/20',
      borderColor: 'border-green-400',
      description: 'Elite cryptographers and code breakers',
      philosophy: 'Information is the ultimate weapon',
      specialties: ['Cryptography', 'Data Mining', 'Intelligence Gathering'],
      bonuses: {
        cipherXP: '+75%',
        decryptSpeed: '+50%',
        intelAccess: 'Priority'
      },
      requirements: {
        maskLevel: 3,
        ciphersSolved: 10,
        reputation: 500
      },
      members: 234,
      territories: 12,
      power: 3120
    },
    SHADOW_GUARD: {
      id: 'SHADOW_GUARD',
      name: 'Shadow Guard',
      icon: FaShieldAlt,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20',
      borderColor: 'border-blue-400',
      description: 'Protectors of the shadow realm and its secrets',
      philosophy: 'Honor through protection, strength through unity',
      specialties: ['Defense Systems', 'Squad Tactics', 'Territory Control'],
      bonuses: {
        squadXP: '+60%',
        defenseBonus: '+40%',
        leadershipAccess: 'Enhanced'
      },
      requirements: {
        maskLevel: 4,
        squadWins: 5,
        reputation: 750
      },
      members: 189,
      territories: 15,
      power: 2890
    },
    NEON_PHANTOMS: {
      id: 'NEON_PHANTOMS',
      name: 'Neon Phantoms',
      icon: FaBolt,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-900/20',
      borderColor: 'border-cyan-400',
      description: 'Speed demons of the digital realm',
      philosophy: 'Velocity is victory, adaptation is survival',
      specialties: ['Speed Challenges', 'Quick Strikes', 'Rapid Deployment'],
      bonuses: {
        speedBonus: '+80%',
        cooldownReduction: '-30%',
        mobilityAccess: 'Unlimited'
      },
      requirements: {
        maskLevel: 2,
        speedChallenges: 8,
        reputation: 300
      },
      members: 312,
      territories: 10,
      power: 2650
    },
    CRIMSON_SYNDICATE: {
      id: 'CRIMSON_SYNDICATE',
      name: 'Crimson Syndicate',
      icon: FaFire,
      color: 'text-red-400',
      bgColor: 'bg-red-900/20',
      borderColor: 'border-red-400',
      description: 'Ruthless operators who dominate through power',
      philosophy: 'Might makes right, fear ensures respect',
      specialties: ['Combat Operations', 'Intimidation', 'Resource Control'],
      bonuses: {
        combatXP: '+70%',
        intimidationFactor: '+90%',
        resourceGain: '+45%'
      },
      requirements: {
        maskLevel: 4,
        arenaWins: 15,
        reputation: 800
      },
      members: 156,
      territories: 18,
      power: 3450
    }
  };

  // Territory zones that factions can control
  const TERRITORIES = {
    CENTRAL_HUB: { name: 'Central Hub', value: 500, controller: 'SHADOW_GUARD', contested: false },
    CIPHER_VAULTS: { name: 'Cipher Vaults', value: 400, controller: 'CIPHER_COLLECTIVE', contested: false },
    VOID_NEXUS: { name: 'Void Nexus', value: 600, controller: 'VOID_WALKERS', contested: true },
    SPEED_CIRCUITS: { name: 'Speed Circuits', value: 350, controller: 'NEON_PHANTOMS', contested: false },
    COMBAT_ARENA: { name: 'Combat Arena', value: 450, controller: 'CRIMSON_SYNDICATE', contested: true },
    DATA_MINES: { name: 'Data Mines', value: 300, controller: 'CIPHER_COLLECTIVE', contested: false },
    SHADOW_OUTPOST: { name: 'Shadow Outpost', value: 250, controller: 'SHADOW_GUARD', contested: false },
    NEON_DISTRICT: { name: 'Neon District', value: 380, controller: 'NEON_PHANTOMS', contested: false },
    CRIMSON_FORTRESS: { name: 'Crimson Fortress', value: 520, controller: 'CRIMSON_SYNDICATE', contested: false },
    VOID_GATEWAY: { name: 'Void Gateway', value: 700, controller: null, contested: true }
  };

  useEffect(() => {
    loadFactionData();
    generateActiveWars();
  }, []);

  const loadFactionData = () => {
    // Check if user already belongs to a faction
    const userFactionId = shadowProfile?.faction || null;
    if (userFactionId && FACTIONS[userFactionId]) {
      setUserFaction(FACTIONS[userFactionId]);
    }

    // Load territory control
    setTerritoryMap(TERRITORIES);

    // Generate faction stats
    const stats = {};
    Object.values(FACTIONS).forEach(faction => {
      stats[faction.id] = {
        weeklyXP: Math.floor(Math.random() * 10000) + 5000,
        territoriesHeld: Object.values(TERRITORIES).filter(t => t.controller === faction.id).length,
        activeMembers: Math.floor(faction.members * 0.7),
        warScore: Math.floor(Math.random() * 1000) + 500
      };
    });
    setFactionStats(stats);
  };

  const generateActiveWars = () => {
    const wars = [
      {
        id: 'war_001',
        attacker: 'CRIMSON_SYNDICATE',
        defender: 'SHADOW_GUARD',
        territory: 'CENTRAL_HUB',
        startTime: Date.now() - 3600000, // 1 hour ago
        duration: 7200000, // 2 hours
        attackerScore: 1250,
        defenderScore: 1180,
        phase: 'active'
      },
      {
        id: 'war_002',
        attacker: 'VOID_WALKERS',
        defender: 'CIPHER_COLLECTIVE',
        territory: 'VOID_NEXUS',
        startTime: Date.now() - 1800000, // 30 minutes ago
        duration: 5400000, // 1.5 hours
        attackerScore: 890,
        defenderScore: 920,
        phase: 'active'
      }
    ];
    setActiveWars(wars);
  };

  const canJoinFaction = (faction) => {
    if (userFaction) return false; // Already in a faction
    
    const requirements = faction.requirements;
    const userLevel = shadowProfile?.maskLevel || 1;
    const userRep = shadowProfile?.reputation || 0;
    
    return userLevel >= requirements.maskLevel && userRep >= requirements.reputation;
  };

  const handleJoinFaction = (faction) => {
    if (!canJoinFaction(faction)) {
      alert('❌ You do not meet the requirements to join this faction.');
      return;
    }
    
    setSelectedFaction(faction);
    setShowJoinConfirm(true);
  };

  const confirmJoinFaction = () => {
    setUserFaction(selectedFaction);
    setShowJoinConfirm(false);
    alert(`✅ Welcome to ${selectedFaction.name}! Your faction abilities are now active.`);
  };

  const renderFactionCard = (faction) => {
    const stats = factionStats[faction.id] || {};
    const canJoin = canJoinFaction(faction);
    const isUserFaction = userFaction?.id === faction.id;
    
    return (
      <motion.div
        key={faction.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className={`${faction.bgColor} border-2 ${faction.borderColor} rounded-lg p-6 cursor-pointer transition-all ${
          isUserFaction ? 'ring-2 ring-yellow-400' : ''
        }`}
        onClick={() => !isUserFaction && handleJoinFaction(faction)}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-16 h-16 rounded-lg border-2 ${faction.borderColor} ${faction.bgColor} flex items-center justify-center`}>
              <faction.icon className={`text-3xl ${faction.color}`} />
            </div>
            <div>
              <h3 className={`text-xl font-bold ${faction.color}`}>{faction.name}</h3>
              <p className="text-gray-400 text-sm">{faction.description}</p>
            </div>
          </div>
          {isUserFaction && (
            <div className="text-yellow-400">
              <FaCrown className="text-2xl" />
            </div>
          )}
        </div>

        <div className="mb-4">
          <p className="text-gray-300 text-sm italic">"{faction.philosophy}"</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <h4 className={`font-bold ${faction.color}`}>Specialties</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              {faction.specialties.map((specialty, index) => (
                <li key={index}>• {specialty}</li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className={`font-bold ${faction.color}`}>Bonuses</h4>
            <div className="text-sm text-gray-300 space-y-1">
              {Object.entries(faction.bonuses).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}:</span>
                  <span className="text-green-400">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4 text-center text-sm">
          <div>
            <div className={`font-bold ${faction.color}`}>{faction.members}</div>
            <div className="text-gray-400">Members</div>
          </div>
          <div>
            <div className={`font-bold ${faction.color}`}>{stats.territoriesHeld || 0}</div>
            <div className="text-gray-400">Territories</div>
          </div>
          <div>
            <div className={`font-bold ${faction.color}`}>{faction.power}</div>
            <div className="text-gray-400">Power</div>
          </div>
          <div>
            <div className={`font-bold ${faction.color}`}>{stats.warScore || 0}</div>
            <div className="text-gray-400">War Score</div>
          </div>
        </div>

        {!isUserFaction && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-gray-400 font-bold mb-2">Requirements</h4>
            <div className="text-sm space-y-1">
              <div className={`flex justify-between ${
                (shadowProfile?.maskLevel || 0) >= faction.requirements.maskLevel ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>Mask Level:</span>
                <span>{faction.requirements.maskLevel}+</span>
              </div>
              <div className={`flex justify-between ${
                (shadowProfile?.reputation || 0) >= faction.requirements.reputation ? 'text-green-400' : 'text-red-400'
              }`}>
                <span>Reputation:</span>
                <span>{faction.requirements.reputation}+</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: canJoin ? 1.05 : 1 }}
              whileTap={{ scale: canJoin ? 0.95 : 1 }}
              disabled={!canJoin}
              className={`w-full mt-3 px-4 py-2 rounded-lg font-bold transition-colors ${
                canJoin
                  ? `${faction.borderColor.replace('border', 'bg')} hover:opacity-80 text-white`
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canJoin ? 'JOIN FACTION' : 'REQUIREMENTS NOT MET'}
            </motion.button>
          </div>
        )}
      </motion.div>
    );
  };

  const renderTerritoryMap = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-cyan-400">TERRITORY CONTROL</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(territoryMap).map(([id, territory]) => {
            const controller = territory.controller ? FACTIONS[territory.controller] : null;
            
            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border-2 rounded-lg p-4 ${
                  territory.contested 
                    ? 'border-red-400 bg-red-900/20' 
                    : controller 
                      ? `${controller.borderColor} ${controller.bgColor}`
                      : 'border-gray-600 bg-gray-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-white">{territory.name}</h4>
                  <div className="flex items-center space-x-2">
                    <FaGem className="text-yellow-400" />
                    <span className="text-yellow-400 font-bold">{territory.value}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {controller ? (
                      <>
                        <controller.icon className={controller.color} />
                        <span className={controller.color}>{controller.name}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">Unclaimed</span>
                    )}
                  </div>
                  
                  {territory.contested && (
                    <div className="flex items-center space-x-1 text-red-400">
                      <FaFighterJet className="text-sm" />
                      <span className="text-xs font-bold">WAR</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderActiveWars = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-cyan-400">ACTIVE WARS</h3>
        <div className="space-y-4">
          {activeWars.map(war => {
            const attacker = FACTIONS[war.attacker];
            const defender = FACTIONS[war.defender];
            const timeRemaining = war.startTime + war.duration - Date.now();
            const progress = Math.max(0, Math.min(100, ((Date.now() - war.startTime) / war.duration) * 100));
            
            return (
              <motion.div
                key={war.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900/50 border border-red-400/50 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-bold text-red-400">
                    BATTLE FOR {territoryMap[war.territory]?.name.toUpperCase()}
                  </h4>
                  <div className="text-red-400 font-mono">
                    {Math.floor(timeRemaining / 60000)}:{Math.floor((timeRemaining % 60000) / 1000).toString().padStart(2, '0')}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mb-4">
                  <div className={`${attacker.bgColor} border ${attacker.borderColor} rounded-lg p-4`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <attacker.icon className={`text-xl ${attacker.color}`} />
                      <span className={`font-bold ${attacker.color}`}>{attacker.name}</span>
                      <span className="text-gray-400">(Attacker)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{war.attackerScore}</div>
                  </div>
                  
                  <div className={`${defender.bgColor} border ${defender.borderColor} rounded-lg p-4`}>
                    <div className="flex items-center space-x-3 mb-2">
                      <defender.icon className={`text-xl ${defender.color}`} />
                      <span className={`font-bold ${defender.color}`}>{defender.name}</span>
                      <span className="text-gray-400">(Defender)</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{war.defenderScore}</div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-400 mb-1">
                    <span>War Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
                
                {userFaction && (userFaction.id === war.attacker || userFaction.id === war.defender) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
                  >
                    ⚔️ JOIN BATTLE
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Header */}
      <div className="p-6 border-b border-cyan-400/30 bg-black/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              ← BACK
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">FACTION WARS</h1>
              <p className="text-gray-400">Choose your allegiance • Control territories • Dominate the shadows</p>
            </div>
          </div>
          
          {userFaction && (
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <userFaction.icon className={userFaction.color} />
                <span className={`font-bold ${userFaction.color}`}>{userFaction.name}</span>
              </div>
              <div className="text-xs text-gray-400">Your Faction</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-b border-cyan-400/30">
        <div className="flex space-x-4">
          {[
            { id: 'overview', label: 'FACTIONS', icon: FaUsers },
            { id: 'territories', label: 'TERRITORIES', icon: FaMap },
            { id: 'wars', label: 'ACTIVE WARS', icon: FaFighterJet }
          ].map(tab => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentView(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-colors ${
                currentView === tab.id
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {currentView === 'overview' && (
          <div className="space-y-6">
            <div className="grid gap-6">
              {Object.values(FACTIONS).map(renderFactionCard)}
            </div>
          </div>
        )}

        {currentView === 'territories' && renderTerritoryMap()}
        {currentView === 'wars' && renderActiveWars()}
      </div>

      {/* Join confirmation modal */}
      <AnimatePresence>
        {showJoinConfirm && selectedFaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`${selectedFaction.bgColor} border-2 ${selectedFaction.borderColor} rounded-lg p-8 max-w-md w-full mx-4`}
            >
              <div className="text-center mb-6">
                <selectedFaction.icon className={`text-6xl mx-auto mb-4 ${selectedFaction.color}`} />
                <h2 className="text-2xl font-bold text-white mb-2">JOIN {selectedFaction.name.toUpperCase()}?</h2>
                <p className="text-gray-300">This decision is permanent and will affect your entire Shadow Network experience.</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className={`${selectedFaction.bgColor} border ${selectedFaction.borderColor} rounded-lg p-4`}>
                  <h4 className={`font-bold ${selectedFaction.color} mb-2`}>You will gain:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {Object.entries(selectedFaction.bonuses).map(([key, value]) => (
                      <li key={key}>• {key}: {value}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={confirmJoinFaction}
                  className={`flex-1 ${selectedFaction.borderColor.replace('border', 'bg')} text-white px-4 py-3 rounded-lg font-bold transition-colors`}
                >
                  ✅ CONFIRM
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowJoinConfirm(false)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                >
                  CANCEL
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FactionSystem;
