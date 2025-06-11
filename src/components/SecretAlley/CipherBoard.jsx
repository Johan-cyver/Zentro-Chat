import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCode, 
  FaPuzzlePiece, 
  FaBrain, 
  FaLock,
  FaUnlock,
  FaEye,
  FaClock,
  FaTrophy
} from 'react-icons/fa';

const CipherBoard = ({ shadowProfile, onBack }) => {
  const [activeTab, setActiveTab] = useState('puzzles');
  const [activePuzzles, setActivePuzzles] = useState([]);
  const [myPuzzles, setMyPuzzles] = useState([]);
  const [selectedPuzzle, setSelectedPuzzle] = useState(null);
  const [solution, setSolution] = useState('');
  const [showCreatePuzzle, setShowCreatePuzzle] = useState(false);

  useEffect(() => {
    loadCipherData();
  }, []);

  const loadCipherData = () => {
    // Mock data for now - will connect to Firebase later
    setActivePuzzles([
      {
        id: 'cipher_001',
        title: 'Binary Whispers',
        creator: 'CIPHER_MASTER_X',
        difficulty: 'MEDIUM',
        puzzle: '01001000 01100101 01101100 01101100 01101111',
        solution: 'Hello', // Actual solution for checking
        hint: 'ASCII conversion required',
        solvers: 12,
        attempts: 45,
        reward: 30,
        timeLimit: 300,
        category: 'ENCODING'
      },
      {
        id: 'cipher_002',
        title: 'Caesar\'s Shadow',
        creator: 'ANCIENT_CODER_99',
        difficulty: 'EASY',
        puzzle: 'KHOOR ZRUOG',
        solution: 'HELLO WORLD', // Caesar cipher shifted by 3
        hint: 'Shift by 3',
        solvers: 28,
        attempts: 67,
        reward: 15,
        timeLimit: 180,
        category: 'CLASSICAL'
      },
      {
        id: 'cipher_003',
        title: 'Matrix Riddle',
        creator: 'NEO_PHANTOM_777',
        difficulty: 'HARD',
        puzzle: '[[1,2],[3,4]] * [[5,6],[7,8]] = ?',
        solution: '[[19,22],[43,50]]', // Matrix multiplication result
        hint: 'Matrix multiplication',
        solvers: 5,
        attempts: 89,
        reward: 75,
        timeLimit: 600,
        category: 'MATHEMATICS'
      },
      {
        id: 'cipher_004',
        title: 'Recursive Mystery',
        creator: 'VOID_RECURSION',
        difficulty: 'EXTREME',
        puzzle: 'f(n) = f(n-1) + f(n-2), f(0)=0, f(1)=1. What is f(10)?',
        solution: '55', // Fibonacci sequence f(10) = 55
        hint: 'Famous sequence',
        solvers: 2,
        attempts: 156,
        reward: 150,
        timeLimit: 900,
        category: 'ALGORITHMS'
      }
    ]);

    setMyPuzzles([
      {
        id: 'my_001',
        title: 'XOR Challenge',
        difficulty: 'MEDIUM',
        solvers: 8,
        attempts: 23,
        status: 'ACTIVE',
        created: '2024-01-15'
      }
    ]);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HARD': return 'text-orange-400';
      case 'EXTREME': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ENCODING': return FaCode;
      case 'CLASSICAL': return FaLock;
      case 'MATHEMATICS': return FaBrain;
      case 'ALGORITHMS': return FaPuzzlePiece;
      default: return FaCode;
    }
  };

  const handleSolutionSubmit = (e) => {
    e.preventDefault();
    if (!selectedPuzzle || !solution.trim()) return;

    // Real solution checking
    const userSolution = solution.trim().toLowerCase();
    const correctSolution = selectedPuzzle.solution.toLowerCase();
    const isCorrect = userSolution === correctSolution;

    if (isCorrect) {
      alert(`🎉 Correct! You earned ${selectedPuzzle.reward} Shadow XP!`);
      // Update puzzle stats
      setActivePuzzles(prev => prev.map(p =>
        p.id === selectedPuzzle.id
          ? { ...p, solvers: p.solvers + 1, attempts: p.attempts + 1 }
          : p
      ));
      setSelectedPuzzle(null);
      setSolution('');
    } else {
      alert('❌ Incorrect solution. Try again!');
      // Update attempt count
      setActivePuzzles(prev => prev.map(p =>
        p.id === selectedPuzzle.id
          ? { ...p, attempts: p.attempts + 1 }
          : p
      ));
      setSolution('');
    }
  };

  const renderPuzzleCard = (puzzle) => {
    const CategoryIcon = getCategoryIcon(puzzle.category);
    
    return (
      <motion.div
        key={puzzle.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900/50 border border-purple-400/30 rounded-lg p-4 cursor-pointer hover:border-purple-400 transition-all"
        onClick={() => setSelectedPuzzle(puzzle)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <CategoryIcon className="text-purple-400 text-xl" />
            <div>
              <h3 className="text-white font-bold">{puzzle.title}</h3>
              <p className="text-gray-400 text-sm">{puzzle.category}</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-bold ${getDifficultyColor(puzzle.difficulty)}`}>
              {puzzle.difficulty}
            </div>
            <div className="text-gray-400 text-sm">
              <FaClock className="inline mr-1" />
              {Math.floor(puzzle.timeLimit / 60)}m
            </div>
          </div>
        </div>

        <div className="bg-black/50 rounded p-3 mb-3">
          <div className="text-cyan-400 font-mono text-sm break-all">
            {puzzle.puzzle}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <span className="text-gray-400">By:</span>
              <span className="text-purple-400 ml-1">{puzzle.creator}</span>
            </div>
            <div className="text-sm text-gray-400">
              <FaEye className="inline mr-1" />
              {puzzle.solvers} solved
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <FaTrophy className="text-yellow-400" />
            <span className="text-yellow-400 font-bold">{puzzle.reward}</span>
            <span className="text-gray-400 text-sm">XP</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMyPuzzleCard = (puzzle) => {
    return (
      <motion.div
        key={puzzle.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-900/30 border border-gray-600/30 rounded-lg p-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold">{puzzle.title}</h3>
            <p className="text-gray-400 text-sm">{puzzle.difficulty} • Created {puzzle.created}</p>
          </div>
          <div className="text-right">
            <div className="text-green-400 font-bold">{puzzle.status}</div>
            <div className="text-gray-400 text-sm">
              {puzzle.solvers} solved • {puzzle.attempts} attempts
            </div>
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
            className="absolute text-purple-400 text-xs"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.1, 0.5, 0.1],
              rotate: [0, 360, 0]
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            🧩
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
              ← BACK
            </motion.button>
            <FaCode className="text-3xl text-purple-400" />
            <div>
              <h1 className="text-3xl font-bold text-purple-400">CIPHER BOARD</h1>
              <p className="text-sm opacity-70">Decode the mysteries • Earn shadow XP</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-purple-400 font-bold">SHADOW: {shadowProfile?.alias}</div>
              <div className="text-xs opacity-70">CIPHERS SOLVED: {shadowProfile?.ciphersSolved || 0}</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreatePuzzle(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              🧩 CREATE CIPHER
            </motion.button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="relative z-10 p-6">
        <div className="flex space-x-4 mb-6">
          {[
            { id: 'puzzles', label: 'ACTIVE CIPHERS', icon: FaPuzzlePiece },
            { id: 'my-puzzles', label: 'MY CIPHERS', icon: FaBrain },
            { id: 'leaderboard', label: 'CIPHER MASTERS', icon: FaTrophy }
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
                    ? 'bg-purple-600 text-white'
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
        <div className="space-y-4">
          {activeTab === 'puzzles' && (
            <div className="grid gap-4">
              {activePuzzles.map(renderPuzzleCard)}
            </div>
          )}

          {activeTab === 'my-puzzles' && (
            <div className="grid gap-3">
              {myPuzzles.map(renderMyPuzzleCard)}
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="text-center text-gray-400 py-20">
              <FaTrophy className="text-6xl mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-bold mb-2">CIPHER MASTERS</h3>
              <p>Coming in Phase 3...</p>
            </div>
          )}
        </div>
      </div>

      {/* Puzzle Detail Modal */}
      <AnimatePresence>
        {selectedPuzzle && (
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
              className="bg-gray-900 border-2 border-purple-500 rounded-2xl p-6 max-w-2xl w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-purple-400">{selectedPuzzle.title}</h2>
                <button
                  onClick={() => setSelectedPuzzle(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <h3 className="text-cyan-400 font-bold mb-2">CIPHER:</h3>
                  <div className="text-white font-mono text-lg break-all">
                    {selectedPuzzle.puzzle}
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-lg p-4">
                  <h3 className="text-yellow-400 font-bold mb-2">HINT:</h3>
                  <div className="text-gray-300">{selectedPuzzle.hint}</div>
                </div>

                <form onSubmit={handleSolutionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-green-400 font-bold mb-2">YOUR SOLUTION:</label>
                    <input
                      type="text"
                      value={solution}
                      onChange={(e) => setSolution(e.target.value)}
                      placeholder="Enter your solution..."
                      className="w-full bg-black border-2 border-cyan-400 rounded-lg px-4 py-3 text-cyan-400 font-mono focus:outline-none focus:border-purple-400"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                    >
                      🔓 SUBMIT SOLUTION
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedPuzzle(null)}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                    >
                      CANCEL
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CipherBoard;
