import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrophy, 
  FaCoins, 
  FaMap, 
  FaCrown,
  FaGem,
  FaRocket,
  FaLock,
  FaFire
} from 'react-icons/fa';

const Phase3Preview = ({ onBack }) => {
  const [selectedFeature, setSelectedFeature] = useState(null);

  const phase3Features = [
    {
      id: 'leaderboards',
      title: 'SHADOW LEADERBOARDS',
      icon: FaTrophy,
      color: 'from-yellow-500 to-orange-500',
      description: 'Global rankings across all underground activities',
      features: [
        'Arena Champions Board',
        'Cipher Master Rankings',
        'Squad War Legends',
        'Weekly/Monthly/All-time boards',
        'Reputation-based scoring',
        'Anonymous achievement tracking'
      ],
      status: 'COMING SOON'
    },
    {
      id: 'economy',
      title: 'SHADOW ECONOMY',
      icon: FaCoins,
      color: 'from-purple-500 to-pink-500',
      description: 'Underground currency and trading system',
      features: [
        'Shadow Coins (SHAD) currency',
        'Stake battles and tournaments',
        'Trade rare cipher keys',
        'Underground marketplace',
        'Reputation-based lending',
        'Anonymous transactions'
      ],
      status: 'IN DEVELOPMENT'
    },
    {
      id: 'quests',
      title: 'UNDERGROUND QUESTS',
      icon: FaMap,
      color: 'from-cyan-500 to-blue-500',
      description: 'Dynamic missions and challenges',
      features: [
        'Daily shadow missions',
        'Multi-stage quest chains',
        'Collaborative squad quests',
        'Hidden achievement hunts',
        'Time-limited events',
        'Legendary artifact rewards'
      ],
      status: 'PLANNED'
    },
    {
      id: 'reputation',
      title: 'REPUTATION SYSTEM',
      icon: FaCrown,
      color: 'from-red-500 to-pink-500',
      description: 'Advanced trust and influence mechanics',
      features: [
        'Multi-dimensional reputation',
        'Skill-based credibility',
        'Anonymous vouching system',
        'Reputation staking',
        'Influence networks',
        'Trust-based privileges'
      ],
      status: 'RESEARCH'
    },
    {
      id: 'artifacts',
      title: 'SHADOW ARTIFACTS',
      icon: FaGem,
      color: 'from-green-500 to-emerald-500',
      description: 'Rare collectibles and power-ups',
      features: [
        'Legendary cipher keys',
        'Battle enhancement items',
        'Exclusive mask designs',
        'Squad banners and emblems',
        'Time-limited collectibles',
        'Cross-zone benefits'
      ],
      status: 'CONCEPT'
    },
    {
      id: 'advanced',
      title: 'ADVANCED PROTOCOLS',
      icon: FaRocket,
      color: 'from-indigo-500 to-purple-500',
      description: 'Next-generation underground features',
      features: [
        'AI-powered opponents',
        'Dynamic difficulty scaling',
        'Procedural challenge generation',
        'Cross-platform integration',
        'Advanced encryption layers',
        'Quantum-resistant security'
      ],
      status: 'FUTURE'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMING SOON': return 'text-green-400';
      case 'IN DEVELOPMENT': return 'text-yellow-400';
      case 'PLANNED': return 'text-blue-400';
      case 'RESEARCH': return 'text-purple-400';
      case 'CONCEPT': return 'text-orange-400';
      case 'FUTURE': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const renderFeatureCard = (feature) => {
    const FeatureIcon = feature.icon;
    
    return (
      <motion.div
        key={feature.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05, rotateY: 5 }}
        className="relative bg-gray-900/50 border border-gray-600/30 rounded-xl p-6 cursor-pointer overflow-hidden group"
        onClick={() => setSelectedFeature(feature)}
      >
        {/* Animated background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
        
        {/* Lock overlay for future features */}
        {(feature.status === 'CONCEPT' || feature.status === 'FUTURE') && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <FaLock className="text-4xl text-gray-500" />
          </div>
        )}

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <FeatureIcon className={`text-3xl bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} />
            <div className={`text-xs font-bold px-2 py-1 rounded ${getStatusColor(feature.status)} border border-current`}>
              {feature.status}
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
          <p className="text-gray-400 text-sm mb-4">{feature.description}</p>

          <div className="space-y-1">
            {feature.features.slice(0, 3).map((feat, index) => (
              <div key={index} className="text-xs text-gray-500 flex items-center">
                <div className="w-1 h-1 bg-cyan-400 rounded-full mr-2" />
                {feat}
              </div>
            ))}
            {feature.features.length > 3 && (
              <div className="text-xs text-gray-500">
                +{feature.features.length - 3} more features...
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-purple-400 text-xs"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.5, 1],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: Math.random() * 8 + 5,
              repeat: Infinity,
              delay: Math.random() * 3
            }}
          >
            🚀
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-purple-400/30 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onBack}
              className="text-cyan-400 hover:text-white transition-colors"
            >
              ← BACK TO ALLEY
            </motion.button>
            <FaRocket className="text-3xl text-purple-400" />
            <div>
              <motion.h1 
                animate={{
                  textShadow: [
                    '0 0 10px rgba(168, 85, 247, 0.8)',
                    '0 0 20px rgba(168, 85, 247, 1)',
                    '0 0 10px rgba(168, 85, 247, 0.8)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-3xl font-bold text-purple-400"
              >
                PHASE 3: FUTURE PROTOCOLS
              </motion.h1>
              <p className="text-sm opacity-70">Next-generation underground features</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-purple-400 font-bold">STATUS: DEVELOPMENT</div>
            <div className="text-xs opacity-70">ETA: Q2 2024</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">UPCOMING FEATURES</h2>
          <p className="text-gray-400">
            The underground is evolving. These advanced protocols will transform Secret Alley into 
            the ultimate anonymous collaboration platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {phase3Features.map(renderFeatureCard)}
        </div>

        {/* Development Timeline */}
        <div className="mt-8 bg-gray-900/30 border border-gray-600/30 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <FaFire className="text-orange-400 mr-2" />
            DEVELOPMENT ROADMAP
          </h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-400/30 rounded-lg">
              <span className="text-green-400 font-bold">Q1 2024</span>
              <span className="text-white">Shadow Leaderboards & Economy Foundation</span>
              <span className="text-green-400 text-sm">IN PROGRESS</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-400/30 rounded-lg">
              <span className="text-yellow-400 font-bold">Q2 2024</span>
              <span className="text-white">Underground Quests & Reputation System</span>
              <span className="text-yellow-400 text-sm">PLANNED</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-400/30 rounded-lg">
              <span className="text-blue-400 font-bold">Q3 2024</span>
              <span className="text-white">Shadow Artifacts & Advanced Protocols</span>
              <span className="text-blue-400 text-sm">RESEARCH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Detail Modal */}
      <AnimatePresence>
        {selectedFeature && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
              className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <selectedFeature.icon className={`text-4xl bg-gradient-to-r ${selectedFeature.color} bg-clip-text text-transparent`} />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedFeature.title}</h2>
                    <p className={`text-sm font-bold ${getStatusColor(selectedFeature.status)}`}>
                      {selectedFeature.status}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFeature(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <h3 className="text-purple-400 font-bold mb-2">DESCRIPTION:</h3>
                  <p className="text-white">{selectedFeature.description}</p>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-purple-400 font-bold mb-3">PLANNED FEATURES:</h3>
                  <div className="grid gap-2">
                    {selectedFeature.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-gray-300">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>

                {(selectedFeature.status === 'CONCEPT' || selectedFeature.status === 'FUTURE') && (
                  <div className="bg-red-900/20 border border-red-400/30 rounded-lg p-4">
                    <h4 className="text-red-400 font-bold mb-2">⚠️ EARLY CONCEPT</h4>
                    <p className="text-red-300 text-sm">
                      This feature is in early conceptual stages. Details may change significantly 
                      during development based on community feedback and technical feasibility.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Phase3Preview;
