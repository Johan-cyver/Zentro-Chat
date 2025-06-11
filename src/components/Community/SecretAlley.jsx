import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import TunnelGate from '../SecretAlley/TunnelGate';
import ShadowDashboard from '../SecretAlley/ShadowDashboard';
import shadowProtocol from '../../services/shadowProtocol';

const SecretAlley = () => {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('initializing'); // initializing, entry, tunneling, dashboard
  const [shadowProfile, setShadowProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [secretInput, setSecretInput] = useState('');
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [initProgress, setInitProgress] = useState(0);
  const [initMessages, setInitMessages] = useState([]);

  // Secret exit codes
  const EXIT_CODES = ['SURFACE', 'ESCAPE', 'RETURN', 'EXIT_PROTOCOL', 'JACK_OUT'];

  // Initialization messages
  const INIT_SEQUENCE = [
    'SCANNING NEURAL PATHWAYS...',
    'ESTABLISHING ENCRYPTED TUNNEL...',
    'BYPASSING SURFACE PROTOCOLS...',
    'INITIALIZING SHADOW MATRIX...',
    'LOADING UNDERGROUND DATABASE...',
    'ACTIVATING STEALTH MODE...',
    'SHADOW PROTOCOL READY...',
    'WELCOME TO THE ALLEY...'
  ];

  useEffect(() => {
    startInitialization();
    setupSecretExitListeners();

    return () => {
      document.removeEventListener('keydown', handleSecretKeyPress);
    };
  }, [userProfile]);

  const startInitialization = async () => {
    // Show initialization sequence
    for (let i = 0; i < INIT_SEQUENCE.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setInitMessages(prev => [...prev, INIT_SEQUENCE[i]]);
      setInitProgress((i + 1) / INIT_SEQUENCE.length * 100);
    }

    // Initialize shadow profile
    await initializeShadowProfile();

    // Complete initialization
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPhase('entry');
  };

  const setupSecretExitListeners = () => {
    document.addEventListener('keydown', handleSecretKeyPress);
  };

  const handleSecretKeyPress = (e) => {
    // Ctrl + Shift + E to show exit prompt
    if (e.ctrlKey && e.shiftKey && e.key === 'E') {
      e.preventDefault();
      setShowExitPrompt(true);
    }

    // ESC to close exit prompt
    if (e.key === 'Escape' && showExitPrompt) {
      setShowExitPrompt(false);
      setSecretInput('');
    }
  };

  const handleExitCodeSubmit = (e) => {
    e.preventDefault();
    const code = secretInput.toUpperCase().trim();

    if (EXIT_CODES.includes(code)) {
      // Successful exit with animation
      setPhase('exiting');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      // Wrong code - glitch effect
      setSecretInput('');
      // Add glitch animation here
    }
  };

  const initializeShadowProfile = async () => {
    if (!userProfile?.uid) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000)
      );

      // Check if user already has a shadow profile
      let existingShadow = await Promise.race([
        shadowProtocol.getShadowProfile(userProfile.uid),
        timeoutPromise
      ]);

      if (!existingShadow) {
        // Create new shadow profile
        existingShadow = await Promise.race([
          shadowProtocol.createShadowProfile(userProfile.uid, userProfile),
          timeoutPromise
        ]);
      }

      setShadowProfile(existingShadow);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing shadow profile:', error);

      // Create fallback shadow profile for offline mode
      const fallbackShadow = {
        shadowId: `SHADOW_${Date.now().toString(36).toUpperCase()}`,
        alias: `PHANTOM_USER_${Math.floor(Math.random() * 999)}`,
        shadowXP: 0,
        maskLevel: 1,
        battlesWon: 0,
        ciphersSolved: 0,
        whispersSent: 0,
        reputation: 0,
        maskType: 'BASIC',
        isRevealed: false,
        stats: {
          totalBattles: 0,
          winRate: 0,
          favoriteZone: null,
          achievements: []
        }
      };

      setShadowProfile(fallbackShadow);
      setLoading(false);
    }
  };

  const handleEnterAlley = () => {
    setPhase('tunneling');
    setTimeout(() => {
      setPhase('dashboard');
    }, 6000); // Duration of tunnel animation
  };

  const handleZoneNavigation = (zoneId) => {
    console.log(`Navigating to zone: ${zoneId}`);
    // TODO: Implement zone-specific components
  };

  // Enhanced initialization screen
  if (phase === 'initializing') {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50 overflow-hidden">
        {/* Matrix-style background */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-400 text-xs opacity-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: Math.random() * 3 + 1,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            >
              {Math.random() > 0.5 ? '01' : '10'}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 text-center max-w-2xl mx-auto p-8">
          {/* Main logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotate: 360,
                  boxShadow: [
                    '0 0 20px rgba(0, 255, 255, 0.5)',
                    '0 0 60px rgba(255, 0, 255, 0.8)',
                    '0 0 20px rgba(0, 255, 255, 0.5)'
                  ]
                }}
                transition={{
                  rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                  boxShadow: { duration: 2, repeat: Infinity }
                }}
                className="w-32 h-32 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto"
              >
                <span className="text-6xl">🕳️</span>
              </motion.div>

              {/* Orbiting elements */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 bg-cyan-400 rounded-full"
                  style={{
                    top: '50%',
                    left: '50%',
                    transformOrigin: '0 0'
                  }}
                  animate={{
                    rotate: 360,
                    x: Math.cos(i * 120 * Math.PI / 180) * 80,
                    y: Math.sin(i * 120 * Math.PI / 180) * 80
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-4 font-mono"
          >
            SECRET ALLEY
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="text-xl text-gray-300 mb-8 font-mono"
          >
            UNDERGROUND PROTOCOL INITIALIZING...
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-full bg-gray-800 rounded-full h-3 mb-4 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${initProgress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <div className="text-cyan-400 font-mono text-sm">
              {Math.round(initProgress)}% COMPLETE
            </div>
          </motion.div>

          {/* Messages */}
          <div className="h-32 overflow-hidden">
            <AnimatePresence>
              {initMessages.slice(-4).map((message, index) => (
                <motion.div
                  key={`${message}-${index}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="text-green-400 font-mono text-sm mb-2"
                >
                  &gt; {message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Glitch effect */}
          <motion.div
            animate={{
              opacity: [0, 1, 0],
              scaleX: [1, 1.1, 1],
              skewX: [0, 2, 0]
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
              repeatDelay: Math.random() * 5 + 2
            }}
            className="absolute inset-0 bg-red-500 mix-blend-multiply opacity-0"
          />
        </div>
      </div>
    );
  }




  return (
    <div className="fixed inset-0 z-50 bg-black">
      <AnimatePresence mode="wait">
        {phase === 'entry' && (
          <motion.div
            key="entry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Animated background particles */}
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
                    scale: [0, 1, 0],
                    y: [0, -100]
                  }}
                  transition={{
                    duration: Math.random() * 3 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 5
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="mb-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEnterAlley}
                  className="relative group"
                >
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-cyan-500 rounded-3xl blur-2xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />

                  {/* Main button */}
                  <div className="relative bg-black border-2 border-cyan-400 rounded-3xl p-12 text-center group-hover:border-purple-400 transition-colors">
                    {/* Central portal */}
                    <motion.div
                      animate={{
                        rotate: 360,
                        scale: [1, 1.1, 1],
                        boxShadow: [
                          '0 0 30px rgba(0, 255, 255, 0.5)',
                          '0 0 60px rgba(255, 0, 255, 0.8)',
                          '0 0 30px rgba(0, 255, 255, 0.5)'
                        ]
                      }}
                      transition={{
                        rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity },
                        boxShadow: { duration: 3, repeat: Infinity }
                      }}
                      className="w-32 h-32 bg-gradient-to-r from-red-500 via-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-8 relative"
                    >
                      <span className="text-6xl">🕳️</span>

                      {/* Orbiting rings */}
                      <motion.div
                        className="absolute inset-0 border-2 border-cyan-400 rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      />
                      <motion.div
                        className="absolute inset-2 border border-purple-400 rounded-full"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      />
                    </motion.div>

                    {/* Title with glitch effect */}
                    <motion.h1
                      animate={{
                        textShadow: [
                          '0 0 10px rgba(0, 255, 255, 0.8)',
                          '2px 0 0 rgba(255, 0, 0, 0.8), -2px 0 0 rgba(0, 255, 255, 0.8)',
                          '0 0 10px rgba(0, 255, 255, 0.8)'
                        ]
                      }}
                      transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 3 }}
                      className="text-6xl font-bold text-cyan-400 mb-4 font-mono"
                    >
                      SECRET ALLEY
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="text-xl text-gray-300 mb-8 font-mono"
                    >
                      Where legends are born in shadows
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="space-y-4"
                    >
                      <div className="text-green-400 font-mono text-2xl font-bold">
                        ENTER THE UNDERGROUND
                      </div>

                      <div className="text-sm text-gray-500 font-mono space-y-1">
                        <div>🔑 Exit Code: SURFACE</div>
                        <div>⌨️ Quick Exit: Ctrl + Shift + E</div>
                        <div>🌐 Status: ENCRYPTED</div>
                      </div>
                    </motion.div>
                  </div>
                </motion.button>
              </motion.div>

              {/* Warning message */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-red-400 font-mono text-sm border border-red-400/30 rounded-lg p-4 bg-red-500/10 max-w-md mx-auto"
              >
                ⚠️ WARNING: You are about to enter an encrypted zone. <br />
                All activities are anonymous and untraceable.
              </motion.div>
            </div>
          </motion.div>
        )}

        {phase === 'tunneling' && (
          <TunnelGate key="tunnel" onEnter={() => setPhase('dashboard')} />
        )}

        {phase === 'dashboard' && (
          <ShadowDashboard
            key="dashboard"
            shadowProfile={shadowProfile}
            onNavigate={handleZoneNavigation}
          />
        )}

        {phase === 'exiting' && (
          <motion.div
            key="exiting"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            className="fixed inset-0 bg-black flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.2, 0] }}
                transition={{ duration: 2 }}
                className="text-6xl mb-4"
              >
                🌅
              </motion.div>
              <motion.h1
                animate={{ opacity: [1, 0] }}
                transition={{ delay: 1, duration: 1 }}
                className="text-2xl text-cyan-400 font-mono"
              >
                RETURNING TO SURFACE...
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Secret Exit Prompt */}
      {showExitPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          {/* Glitch background */}
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-px bg-red-500"
                style={{ top: `${Math.random() * 100}%` }}
                animate={{
                  opacity: [0, 1, 0],
                  scaleX: [0, 1, 0]
                }}
                transition={{
                  duration: 0.1,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2 + 1
                }}
              />
            ))}
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, rotateX: -90 }}
            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
            className="relative bg-black border-2 border-red-500 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
            style={{
              boxShadow: '0 0 50px rgba(255, 0, 0, 0.5), inset 0 0 20px rgba(255, 0, 0, 0.1)'
            }}
          >
            {/* Warning header */}
            <motion.div
              animate={{
                textShadow: [
                  '0 0 10px rgba(255, 0, 0, 0.8)',
                  '0 0 20px rgba(255, 0, 0, 1)',
                  '0 0 10px rgba(255, 0, 0, 0.8)'
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-center mb-6"
            >
              <div className="text-4xl mb-2">🚨</div>
              <h2 className="text-2xl font-bold text-red-400 font-mono">
                EXIT PROTOCOL ACTIVATED
              </h2>
              <div className="text-sm text-gray-400 font-mono mt-2">
                UNAUTHORIZED ACCESS DETECTED
              </div>
            </motion.div>

            <div className="space-y-4">
              <p className="text-gray-300 font-mono text-sm text-center">
                🔐 ENTER AUTHORIZATION CODE TO RETURN TO SURFACE
              </p>

              <form onSubmit={handleExitCodeSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={secretInput}
                    onChange={(e) => setSecretInput(e.target.value)}
                    placeholder="ENTER SECRET CODE"
                    className="w-full bg-black border-2 border-cyan-400 rounded-lg px-4 py-3 text-cyan-400 font-mono placeholder-gray-500 focus:outline-none focus:border-red-400 focus:shadow-lg focus:shadow-red-400/25 transition-all text-center text-lg tracking-widest"
                    autoFocus
                  />
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400"
                  >
                    █
                  </motion.div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-mono font-bold transition-all shadow-lg hover:shadow-red-500/25"
                  >
                    🚀 EXECUTE
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowExitPrompt(false);
                      setSecretInput('');
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-mono font-bold transition-all"
                  >
                    ❌ ABORT
                  </motion.button>
                </div>
              </form>

              {/* Hints */}
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-2">
                <div className="text-xs text-gray-400 font-mono text-center">
                  💡 VALID EXIT CODES:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="text-green-400">• SURFACE</div>
                  <div className="text-blue-400">• ESCAPE</div>
                  <div className="text-purple-400">• RETURN</div>
                  <div className="text-yellow-400">• JACK_OUT</div>
                </div>
              </div>

              {/* Status */}
              <div className="text-center">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-xs text-red-400 font-mono"
                >
                  🔴 SECURE CONNECTION ACTIVE
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default SecretAlley;
