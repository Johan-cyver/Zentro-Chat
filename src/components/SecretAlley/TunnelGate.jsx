import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TunnelGate = ({ onEnter }) => {
  const [phase, setPhase] = useState('approaching'); // approaching, tunneling, materializing
  const [glitchText, setGlitchText] = useState('');
  const navigate = useNavigate();

  const glitchMessages = [
    '01001000 01100001 01100011 01101011 01101001 01101110 01100111...',
    'ACCESSING SHADOW PROTOCOL...',
    'IDENTITY FRAGMENTING...',
    'ENTERING THE UNDERGROUND...',
    'WELCOME TO THE ALLEY...'
  ];

  useEffect(() => {
    const sequence = async () => {
      // Phase 1: Approaching
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase 2: Tunneling with glitch text
      setPhase('tunneling');
      
      for (let i = 0; i < glitchMessages.length; i++) {
        setGlitchText(glitchMessages[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      // Phase 3: Materializing
      setPhase('materializing');
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Enter the Alley
      onEnter();
    };

    sequence();
  }, [onEnter]);

  const tunnelVariants = {
    approaching: {
      scale: 0.1,
      opacity: 0.3,
      rotate: 0
    },
    tunneling: {
      scale: [0.1, 2, 0.8, 1.2, 1],
      opacity: [0.3, 0.8, 0.6, 0.9, 1],
      rotate: [0, 180, 360, 540, 720],
      transition: {
        duration: 4,
        ease: "easeInOut"
      }
    },
    materializing: {
      scale: 1,
      opacity: 1,
      rotate: 720,
      transition: {
        duration: 1.5,
        ease: "easeOut"
      }
    }
  };

  const glitchVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: [0, 1, 0.7, 1, 0.3, 1],
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      style={{
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        zoom: '1',
        minZoom: '1',
        maxZoom: '1'
      }}
      onWheel={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
        }
      }}
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0')) {
          e.preventDefault();
        }
      }}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Main Tunnel Effect */}
      <motion.div
        variants={tunnelVariants}
        animate={phase}
        className="relative"
      >
        {/* Outer Ring */}
        <motion.div
          className="w-96 h-96 border-4 border-cyan-400 rounded-full"
          animate={{
            rotate: 360,
            borderColor: ['#00ffff', '#ff00ff', '#ffff00', '#00ffff']
          }}
          transition={{
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            borderColor: { duration: 1, repeat: Infinity }
          }}
        />
        
        {/* Middle Ring */}
        <motion.div
          className="absolute inset-8 border-2 border-purple-500 rounded-full"
          animate={{
            rotate: -360,
            borderColor: ['#ff00ff', '#00ffff', '#ff00ff']
          }}
          transition={{
            rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
            borderColor: { duration: 0.8, repeat: Infinity }
          }}
        />
        
        {/* Inner Core */}
        <motion.div
          className="absolute inset-16 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 1,
            repeat: Infinity
          }}
        >
          <motion.div
            className="text-white text-4xl font-mono font-bold"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity
            }}
          >
            SA
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Glitch Text */}
      <AnimatePresence>
        {glitchText && (
          <motion.div
            variants={glitchVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute bottom-32 left-1/2 transform -translate-x-1/2"
          >
            <div className="font-mono text-green-400 text-xl tracking-wider">
              {glitchText}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scan Lines Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="w-full h-1 bg-cyan-400 opacity-30"
          animate={{
            y: [0, window.innerHeight, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Corner Brackets */}
      <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-cyan-400"></div>
      <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-cyan-400"></div>
      <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-cyan-400"></div>
      <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-cyan-400"></div>
    </div>
  );
};

export default TunnelGate;
