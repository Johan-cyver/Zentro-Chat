import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCode,
  FaPalette,
  FaShieldAlt,
  FaDatabase,
  FaClock,
  FaTrophy,
  FaFire,
  FaLightbulb,
  FaCheck,
  FaTimes,
  FaPlay
} from 'react-icons/fa';

const SkillMissionSystem = ({ shadowProfile, onMissionComplete, onBack }) => {
  const [activeCategory, setActiveCategory] = useState('code_ops');
  const [activeMission, setActiveMission] = useState(null);
  const [missionProgress, setMissionProgress] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [missionResults, setMissionResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Mission categories with real challenges
  const missionCategories = {
    code_ops: {
      name: 'CODE OPS',
      icon: FaCode,
      color: 'text-green-400',
      description: 'Backend, APIs, scripts, bug-hunting challenges',
      missions: [
        {
          id: 'code_001',
          title: 'API Endpoint Debug',
          difficulty: 'EASY',
          timeLimit: 300, // 5 minutes
          xpReward: 50,
          description: 'Fix the broken API endpoint that returns 500 errors',
          challenge: `
// This API endpoint is broken. Find and fix the bug:

app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Bug is here - what's wrong?
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// What's the issue? (Answer with the field name)
          `,
          solution: 'createdAt',
          hint: 'Check the database field naming convention vs response field'
        },
        {
          id: 'code_002',
          title: 'SQL Injection Prevention',
          difficulty: 'MEDIUM',
          timeLimit: 600,
          xpReward: 100,
          description: 'Secure this vulnerable database query',
          challenge: `
// This query is vulnerable to SQL injection. Fix it:

const getUserByEmail = (email) => {
  const query = "SELECT * FROM users WHERE email = '" + email + "'";
  return db.query(query);
};

// Rewrite using parameterized queries (PostgreSQL syntax)
// What should replace the vulnerable line?
          `,
          solution: 'SELECT * FROM users WHERE email = $1',
          hint: 'Use parameterized queries with $1 placeholder'
        }
      ]
    },
    design_dives: {
      name: 'DESIGN DIVES',
      icon: FaPalette,
      color: 'text-purple-400',
      description: 'Redesign UI under pressure, solve visual traps',
      missions: [
        {
          id: 'design_001',
          title: 'CSS Flexbox Challenge',
          difficulty: 'EASY',
          timeLimit: 240,
          xpReward: 40,
          description: 'Center a div both horizontally and vertically',
          challenge: `
/* Complete this CSS to center the .content div perfectly */

.container {
  width: 100vw;
  height: 100vh;
  /* Add your CSS here */
}

.content {
  width: 200px;
  height: 100px;
  background: #333;
}

/* What display property should .container have? */
          `,
          solution: 'flex',
          hint: 'Use flexbox with justify-content and align-items'
        },
        {
          id: 'design_002',
          title: 'Responsive Grid Layout',
          difficulty: 'MEDIUM',
          timeLimit: 480,
          xpReward: 80,
          description: 'Create a responsive grid that adapts to screen size',
          challenge: `
/* Create a grid that shows:
- 4 columns on desktop (>1024px)
- 2 columns on tablet (768px-1024px)  
- 1 column on mobile (<768px)

What CSS Grid property handles the columns? */
          `,
          solution: 'grid-template-columns',
          hint: 'Use CSS Grid with media queries'
        }
      ]
    },
    security_protocols: {
      name: 'SECURITY PROTOCOLS',
      icon: FaShieldAlt,
      color: 'text-red-400',
      description: 'Learn and break fake systems (ethically)',
      missions: [
        {
          id: 'security_001',
          title: 'Password Hash Cracking',
          difficulty: 'MEDIUM',
          timeLimit: 600,
          xpReward: 120,
          description: 'Identify the hashing algorithm used',
          challenge: `
// Analyze this password hash:
// $2b$10$N9qo8uLOickgx2ZMRZoMye.IjdQXvbVt2qOB1Nz4f3Ej9.JrjSUxG

// This hash format indicates which algorithm?
// (Answer with the algorithm name)
          `,
          solution: 'bcrypt',
          hint: 'Look at the prefix - $2b$ is a clue'
        },
        {
          id: 'security_002',
          title: 'JWT Token Analysis',
          difficulty: 'HARD',
          timeLimit: 900,
          xpReward: 200,
          description: 'Decode and analyze a JWT token',
          challenge: `
// JWT Token:
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

// What is the 'name' field value in the payload?
          `,
          solution: 'John Doe',
          hint: 'Decode the middle section (payload) from base64'
        }
      ]
    },
    database_ops: {
      name: 'DATABASE OPS',
      icon: FaDatabase,
      color: 'text-blue-400',
      description: 'Structure real-time data, debug, build schemas',
      missions: [
        {
          id: 'db_001',
          title: 'Query Optimization',
          difficulty: 'MEDIUM',
          timeLimit: 480,
          xpReward: 90,
          description: 'Optimize this slow database query',
          challenge: `
-- This query is slow. What's missing?

SELECT u.name, p.title, p.created_at
FROM users u, posts p
WHERE u.id = p.user_id
AND p.created_at > '2024-01-01'
ORDER BY p.created_at DESC;

-- What database feature would speed this up?
          `,
          solution: 'index',
          hint: 'Think about what helps databases find data quickly'
        },
        {
          id: 'db_002',
          title: 'Schema Design',
          difficulty: 'HARD',
          timeLimit: 720,
          xpReward: 150,
          description: 'Design a many-to-many relationship',
          challenge: `
-- Design tables for: Users can belong to multiple Teams, 
-- Teams can have multiple Users

-- What is the junction table typically called?
-- (users_teams, user_teams, or team_members)
          `,
          solution: 'user_teams',
          hint: 'Follow naming conventions: singular_singular'
        }
      ]
    }
  };

  useEffect(() => {
    let timer;
    if (activeMission && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeMission, timeRemaining]);

  const startMission = (mission) => {
    setActiveMission(mission);
    setTimeRemaining(mission.timeLimit);
    setUserAnswer('');
    setMissionProgress(0);
    setShowResults(false);
  };

  const submitAnswer = () => {
    if (!activeMission || !userAnswer.trim()) return;

    const isCorrect = userAnswer.toLowerCase().trim() === activeMission.solution.toLowerCase();
    const timeBonus = Math.max(0, Math.floor(timeRemaining / 10)); // Bonus for speed
    const finalXP = isCorrect ? activeMission.xpReward + timeBonus : Math.floor(activeMission.xpReward * 0.1);

    const results = {
      correct: isCorrect,
      userAnswer: userAnswer.trim(),
      correctAnswer: activeMission.solution,
      xpEarned: finalXP,
      timeBonus,
      timeUsed: activeMission.timeLimit - timeRemaining,
      mission: activeMission
    };

    setMissionResults(results);
    setShowResults(true);

    // Update shadow profile
    if (onMissionComplete) {
      onMissionComplete(results);
    }
  };

  const handleTimeUp = () => {
    if (!showResults) {
      submitAnswer();
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HARD': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const renderMissionCard = (mission) => {
    return (
      <motion.div
        key={mission.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-4 cursor-pointer hover:border-cyan-400 transition-all"
        onClick={() => startMission(mission)}
      >
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-white font-bold">{mission.title}</h3>
            <p className="text-gray-400 text-sm">{mission.description}</p>
          </div>
          <div className="text-right">
            <div className={`font-bold ${getDifficultyColor(mission.difficulty)}`}>
              {mission.difficulty}
            </div>
            <div className="text-gray-400 text-sm">
              <FaClock className="inline mr-1" />
              {Math.floor(mission.timeLimit / 60)}m
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FaTrophy className="text-yellow-400" />
            <span className="text-yellow-400 font-bold">{mission.xpReward} XP</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm font-bold"
          >
            <FaPlay className="inline mr-1" />
            START
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Mission interface
  if (activeMission && !showResults) {
    return (
      <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
        {/* Header */}
        <div className="p-6 border-b border-cyan-400/30 bg-black/80">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-cyan-400">{activeMission.title}</h1>
              <p className="text-gray-400">{activeMission.description}</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-400' : 'text-cyan-400'}`}>
                <FaClock className="inline mr-2" />
                {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-400">
                {activeMission.xpReward} XP Reward
              </div>
            </div>
          </div>
        </div>

        {/* Challenge content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Challenge description */}
            <div className="bg-gray-900/50 border border-purple-400/30 rounded-lg p-6">
              <h3 className="text-purple-400 font-bold mb-3">MISSION BRIEFING</h3>
              <pre className="text-gray-300 whitespace-pre-wrap text-sm">
                {activeMission.challenge}
              </pre>
            </div>

            {/* Hint */}
            <div className="bg-yellow-900/20 border border-yellow-400/30 rounded-lg p-4">
              <h4 className="text-yellow-400 font-bold mb-2">
                <FaLightbulb className="inline mr-2" />
                HINT
              </h4>
              <p className="text-yellow-300">{activeMission.hint}</p>
            </div>

            {/* Answer input */}
            <div className="bg-black/50 border border-green-400/30 rounded-lg p-6">
              <h3 className="text-green-400 font-bold mb-3">YOUR SOLUTION</h3>
              <div className="space-y-4">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Enter your answer here..."
                  className="w-full bg-black border-2 border-green-400 rounded-lg px-4 py-3 text-green-400 font-mono focus:outline-none focus:border-cyan-400 resize-none"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    🚀 SUBMIT SOLUTION
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveMission(null)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    ABORT MISSION
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results screen
  if (showResults && missionResults) {
    return (
      <div className="fixed inset-0 bg-black text-green-400 font-mono overflow-hidden relative z-50">
        <div className="flex items-center justify-center h-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900/80 border-2 border-cyan-400 rounded-lg p-8 max-w-2xl w-full mx-4"
          >
            <div className="text-center mb-6">
              {missionResults.correct ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FaCheck className="text-6xl text-green-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-green-400">MISSION COMPLETE</h2>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <FaTimes className="text-6xl text-red-400 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-red-400">MISSION FAILED</h2>
                </motion.div>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 rounded-lg p-4">
                  <h4 className="text-cyan-400 font-bold mb-2">YOUR ANSWER</h4>
                  <p className="text-white">{missionResults.userAnswer}</p>
                </div>
                <div className="bg-black/50 rounded-lg p-4">
                  <h4 className="text-cyan-400 font-bold mb-2">CORRECT ANSWER</h4>
                  <p className="text-green-400">{missionResults.correctAnswer}</p>
                </div>
              </div>

              <div className="bg-black/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">XP Earned:</span>
                  <span className="text-yellow-400 font-bold">{missionResults.xpEarned}</span>
                </div>
                {missionResults.timeBonus > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Speed Bonus:</span>
                    <span className="text-green-400 font-bold">+{missionResults.timeBonus}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Time Used:</span>
                  <span className="text-cyan-400">{formatTime(missionResults.timeUsed)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveMission(null);
                  setShowResults(false);
                }}
                className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
              >
                CONTINUE TRAINING
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-bold transition-colors"
              >
                EXIT
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Main mission selection interface
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
              <h1 className="text-3xl font-bold text-cyan-400">SKILL MISSIONS</h1>
              <p className="text-gray-400">Prove your abilities • Earn Shadow XP</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-cyan-400 font-bold">SHADOW: {shadowProfile?.alias}</div>
            <div className="text-xs opacity-70">TOTAL XP: {shadowProfile?.shadowXP || 0}</div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="p-6 border-b border-cyan-400/30">
        <div className="flex space-x-4 overflow-x-auto">
          {Object.entries(missionCategories).map(([key, category]) => {
            const CategoryIcon = category.icon;
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === key
                    ? `bg-cyan-600 text-white`
                    : `bg-gray-800 text-gray-400 hover:text-white`
                }`}
              >
                <CategoryIcon className={category.color} />
                <span>{category.name}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Mission content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-cyan-400 mb-2">
              {missionCategories[activeCategory].name}
            </h2>
            <p className="text-gray-400">
              {missionCategories[activeCategory].description}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {missionCategories[activeCategory].missions.map(renderMissionCard)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillMissionSystem;
