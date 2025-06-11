import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaUserSecret,
  FaTerminal,
  FaShieldAlt,
  FaLock,
  FaUnlock,
  FaEye,
  FaCode,
  FaSkull,
  FaFire,
  FaRocket
} from 'react-icons/fa';

// Simple portal to our existing Secret Alley - preserving our masterpiece!

const SecretAlleyPortal = ({ user, theme, userLevel, onEnterSecretAlley }) => {
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterSecretAlley = () => {
    setIsEntering(true);
    setTimeout(() => {
      // This will trigger the parent to show our existing Secret Alley
      if (onEnterSecretAlley) {
        onEnterSecretAlley();
      }
    }, 2000);
  };

  if (isEntering) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-8xl mb-8"
          >
            🕳️
          </motion.div>
          <h2 className="text-4xl font-bold text-red-400 mb-4">ENTERING SECRET ALLEY</h2>
          <p className="text-gray-400 text-lg">Initializing encrypted connection...</p>
          <div className="mt-8 flex justify-center">
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
                className="h-full bg-gradient-to-r from-red-500 to-purple-500"
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Portal Header */}
      <div className="text-center mb-12">
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="text-8xl mb-6"
        >
          🕳️
        </motion.div>
        <h1 className="text-4xl font-bold mb-4 text-red-400">SECRET ALLEY</h1>
        <p className="text-xl text-gray-400 mb-2">The Dark Training Ground</p>
        <p className="text-gray-500">Where skills are forged in shadows</p>
      </div>

      {/* What Awaits Inside */}
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 mb-8">
        <h3 className="text-2xl font-bold text-purple-400 mb-6">What Awaits in the Shadows</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <FaTerminal className="text-4xl text-green-400 mb-3 mx-auto" />
            <h4 className="font-bold mb-2">Shadow Terminal</h4>
            <p className="text-sm text-gray-400">Command-line interface with Master Control</p>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <FaCode className="text-4xl text-blue-400 mb-3 mx-auto" />
            <h4 className="font-bold mb-2">Skill Missions</h4>
            <p className="text-sm text-gray-400">Real-world challenges to test your abilities</p>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <FaSkull className="text-4xl text-red-400 mb-3 mx-auto" />
            <h4 className="font-bold mb-2">Faction Wars</h4>
            <p className="text-sm text-gray-400">Team-based competitive challenges</p>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <FaEye className="text-4xl text-yellow-400 mb-3 mx-auto" />
            <h4 className="font-bold mb-2">Deception Protocol</h4>
            <p className="text-sm text-gray-400">Social deduction and strategy games</p>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <FaRocket className="text-4xl text-purple-400 mb-3 mx-auto" />
            <h4 className="font-bold mb-2">Project Deployment</h4>
            <p className="text-sm text-gray-400">Launch your creations to Zentrium</p>
          </div>
          
          <div className="text-center p-4 bg-gray-900 rounded-lg">
            <FaFire className="text-4xl text-orange-400 mb-3 mx-auto" />
            <h4 className="font-bold mb-2">Elite Rankings</h4>
            <p className="text-sm text-gray-400">Climb the shadow hierarchy</p>
          </div>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-8">
        <h4 className="text-xl font-bold text-red-400 mb-3 flex items-center">
          <FaSkull className="mr-2" />
          ⚠️ WARNING
        </h4>
        <p className="text-red-300 mb-4">
          Secret Alley is an immersive, full-screen experience designed to challenge your skills and push your limits. 
          Once entered, you'll be in a completely different digital realm with its own rules and consequences.
        </p>
        <ul className="text-red-300 text-sm space-y-1">
          <li>• Full-screen takeover - no browser controls</li>
          <li>• Real-time multiplayer interactions</li>
          <li>• Permanent record of actions and achievements</li>
          <li>• Advanced skill requirements for progression</li>
          <li>• Exit only via completion or emergency codes</li>
        </ul>
      </div>

      {/* Entry Button */}
      <div className="text-center">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)' }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEnterSecretAlley}
          className="bg-gradient-to-r from-red-600 to-purple-600 text-white px-12 py-4 rounded-lg text-xl font-bold shadow-lg"
        >
          <div className="flex items-center space-x-3">
            <FaUserSecret />
            <span>ENTER SECRET ALLEY</span>
            <FaUserSecret />
          </div>
        </motion.button>
      </div>

      {/* Current Stats */}
      <div className="mt-12 text-center">
        <h4 className="text-lg font-bold mb-4 text-gray-400">Your Current Shadow Stats</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{user?.zentroStats?.secretAlleyRank || 'Shadow Architect'}</div>
            <div className="text-sm text-gray-400">Shadow Rank</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{user?.zentroStats?.completedMissions || 23}</div>
            <div className="text-sm text-gray-400">Missions</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{userLevel}</div>
            <div className="text-sm text-gray-400">Current Level</div>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{user?.zentroStats?.zentroScore || 8.7}</div>
            <div className="text-sm text-gray-400">Zentro Score</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecretAlleyPortal;
