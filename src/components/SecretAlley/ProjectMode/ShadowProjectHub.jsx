import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCode,
  FaUsers,
  FaRocket,
  FaCrown,
  FaEye,
  FaEyeSlash,
  FaGithub,
  FaServer,
  FaDatabase,
  FaPalette,
  FaShieldAlt,
  FaTrophy,
  FaClock,
  FaFire,
  FaGem,
  FaPlus
} from 'react-icons/fa';

const ShadowProjectHub = ({ shadowProfile, onBack }) => {
  const [currentView, setCurrentView] = useState('projects'); // projects, create, active, completed
  const [activeProjects, setActiveProjects] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [userProjects, setUserProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    category: 'web_app',
    difficulty: 'medium',
    teamSize: 3,
    duration: 14,
    isAnonymous: true,
    requirements: []
  });

  // Project categories with different requirements and rewards
  const PROJECT_CATEGORIES = {
    web_app: {
      name: 'Web Application',
      icon: FaCode,
      color: 'text-blue-400',
      description: 'Full-stack web applications',
      skills: ['Frontend', 'Backend', 'Database'],
      baseReward: 1000,
      zentroBonus: '+50%'
    },
    mobile_app: {
      name: 'Mobile Application',
      icon: FaRocket,
      color: 'text-green-400',
      description: 'iOS/Android mobile applications',
      skills: ['Mobile Dev', 'UI/UX', 'API Integration'],
      baseReward: 1200,
      zentroBonus: '+60%'
    },
    ai_tool: {
      name: 'AI/ML Tool',
      icon: FaEye,
      color: 'text-purple-400',
      description: 'Machine learning and AI applications',
      skills: ['Python', 'ML/AI', 'Data Science'],
      baseReward: 1500,
      zentroBonus: '+75%'
    },
    security_tool: {
      name: 'Security Tool',
      icon: FaShieldAlt,
      color: 'text-red-400',
      description: 'Cybersecurity and privacy tools',
      skills: ['Security', 'Cryptography', 'Network'],
      baseReward: 1300,
      zentroBonus: '+70%'
    },
    blockchain: {
      name: 'Blockchain App',
      icon: FaGem,
      color: 'text-yellow-400',
      description: 'Decentralized applications',
      skills: ['Blockchain', 'Smart Contracts', 'Web3'],
      baseReward: 1800,
      zentroBonus: '+90%'
    }
  };

  // Team roles with specific responsibilities
  const TEAM_ROLES = {
    ARCHITECT: {
      name: 'Shadow Architect',
      icon: FaCode,
      color: 'text-cyan-400',
      description: 'System design and technical leadership',
      responsibilities: ['Architecture', 'Code Review', 'Technical Decisions'],
      maxPerTeam: 1
    },
    DEVELOPER: {
      name: 'Code Phantom',
      icon: FaCode,
      color: 'text-green-400',
      description: 'Core development and implementation',
      responsibilities: ['Feature Development', 'Bug Fixes', 'Testing'],
      maxPerTeam: 3
    },
    DESIGNER: {
      name: 'Visual Ghost',
      icon: FaPalette,
      color: 'text-purple-400',
      description: 'UI/UX design and user experience',
      responsibilities: ['UI Design', 'UX Research', 'Prototyping'],
      maxPerTeam: 2
    },
    SECURITY: {
      name: 'Cipher Guardian',
      icon: FaShieldAlt,
      color: 'text-red-400',
      description: 'Security analysis and implementation',
      responsibilities: ['Security Audit', 'Penetration Testing', 'Compliance'],
      maxPerTeam: 1
    },
    DATA: {
      name: 'Data Wraith',
      icon: FaDatabase,
      color: 'text-blue-400',
      description: 'Data architecture and analytics',
      responsibilities: ['Database Design', 'Data Analysis', 'Performance'],
      maxPerTeam: 1
    }
  };

  useEffect(() => {
    loadProjectData();
  }, []);

  const loadProjectData = () => {
    // Load available projects from company
    const companyProjects = [
      {
        id: 'proj_001',
        title: 'Encrypted Messaging Platform',
        description: 'Build a secure, end-to-end encrypted messaging platform with disappearing messages',
        category: 'security_tool',
        difficulty: 'hard',
        teamSize: 4,
        duration: 21,
        reward: 2500,
        sponsor: 'Zentro Security Division',
        requirements: ['React/Vue', 'Node.js', 'Cryptography', 'WebRTC'],
        status: 'open',
        applicants: 12,
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
      },
      {
        id: 'proj_002',
        title: 'AI Code Review Assistant',
        description: 'Develop an AI-powered tool that automatically reviews code and suggests improvements',
        category: 'ai_tool',
        difficulty: 'extreme',
        teamSize: 5,
        duration: 28,
        reward: 3500,
        sponsor: 'Zentro AI Labs',
        requirements: ['Python', 'Machine Learning', 'NLP', 'Git Integration'],
        status: 'open',
        applicants: 8,
        deadline: Date.now() + 10 * 24 * 60 * 60 * 1000 // 10 days
      },
      {
        id: 'proj_003',
        title: 'Decentralized Social Network',
        description: 'Create a blockchain-based social network with user-owned data',
        category: 'blockchain',
        difficulty: 'extreme',
        teamSize: 6,
        duration: 35,
        reward: 5000,
        sponsor: 'Zentro Blockchain Division',
        requirements: ['Solidity', 'Web3.js', 'IPFS', 'React'],
        status: 'open',
        applicants: 15,
        deadline: Date.now() + 14 * 24 * 60 * 60 * 1000 // 14 days
      }
    ];

    setAvailableProjects(companyProjects);

    // Load user's active projects
    const userActiveProjects = [
      {
        id: 'user_proj_001',
        title: 'Shadow Portfolio Builder',
        description: 'Anonymous portfolio showcase for developers',
        category: 'web_app',
        role: 'ARCHITECT',
        team: [
          { shadowId: shadowProfile?.shadowId, role: 'ARCHITECT', alias: shadowProfile?.alias },
          { shadowId: 'dev_phantom_123', role: 'DEVELOPER', alias: 'DEV_PHANTOM_123' },
          { shadowId: 'ui_ghost_456', role: 'DESIGNER', alias: 'UI_GHOST_456' }
        ],
        progress: 65,
        deadline: Date.now() + 7 * 24 * 60 * 60 * 1000,
        status: 'in_progress'
      }
    ];

    setUserProjects(userActiveProjects);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const formatTimeRemaining = (timestamp) => {
    const remaining = timestamp - Date.now();
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const handleApplyToProject = (project) => {
    // Show role selection modal
    setSelectedProject(project);
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    
    const project = {
      id: `custom_${Date.now()}`,
      ...newProject,
      creator: shadowProfile?.shadowId,
      createdAt: Date.now(),
      status: 'recruiting',
      applicants: 0
    };

    setAvailableProjects(prev => [project, ...prev]);
    setShowCreateProject(false);
    setNewProject({
      title: '',
      description: '',
      category: 'web_app',
      difficulty: 'medium',
      teamSize: 3,
      duration: 14,
      isAnonymous: true,
      requirements: []
    });

    alert('✅ Project created! Other shadows can now apply to join your team.');
  };

  const renderProjectCard = (project) => {
    const category = PROJECT_CATEGORIES[project.category];
    const CategoryIcon = category.icon;
    
    return (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-6 cursor-pointer hover:border-cyan-400 transition-all"
        onClick={() => handleApplyToProject(project)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg border-2 ${category.color.replace('text', 'border')} bg-black/50 flex items-center justify-center`}>
              <CategoryIcon className={`text-xl ${category.color}`} />
            </div>
            <div>
              <h3 className="text-white font-bold">{project.title}</h3>
              <p className="text-gray-400 text-sm">{category.name}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`font-bold ${getDifficultyColor(project.difficulty)}`}>
              {project.difficulty.toUpperCase()}
            </div>
            <div className="text-gray-400 text-sm">
              <FaClock className="inline mr-1" />
              {formatTimeRemaining(project.deadline)}
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4">{project.description}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <h4 className="text-cyan-400 font-bold text-sm">PROJECT DETAILS</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Team Size:</span>
                <span className="text-white">{project.teamSize} shadows</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span className="text-white">{project.duration} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Applicants:</span>
                <span className="text-green-400">{project.applicants}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-cyan-400 font-bold text-sm">REWARDS</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-400">Base XP:</span>
                <span className="text-yellow-400">{project.reward}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Zentro Bonus:</span>
                <span className="text-green-400">{category.zentroBonus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue Share:</span>
                <span className="text-purple-400">15-30%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <h4 className="text-cyan-400 font-bold text-sm mb-2">REQUIREMENTS</h4>
          <div className="flex flex-wrap gap-2">
            {project.requirements.map((req, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-300"
              >
                {req}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            Sponsored by: <span className="text-cyan-400">{project.sponsor}</span>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            🚀 APPLY
          </motion.button>
        </div>
      </motion.div>
    );
  };

  const renderUserProjectCard = (project) => {
    const category = PROJECT_CATEGORIES[project.category];
    const CategoryIcon = category.icon;
    const userRole = TEAM_ROLES[project.role];
    
    return (
      <motion.div
        key={project.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900/50 border border-green-400/50 rounded-lg p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg border-2 ${category.color.replace('text', 'border')} bg-black/50 flex items-center justify-center`}>
              <CategoryIcon className={`text-xl ${category.color}`} />
            </div>
            <div>
              <h3 className="text-white font-bold">{project.title}</h3>
              <div className="flex items-center space-x-2">
                <userRole.icon className={`text-sm ${userRole.color}`} />
                <span className={`text-sm ${userRole.color}`}>{userRole.name}</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-green-400 font-bold">{project.progress}%</div>
            <div className="text-gray-400 text-sm">
              <FaClock className="inline mr-1" />
              {formatTimeRemaining(project.deadline)}
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progress</span>
            <span>{project.progress}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 1 }}
            />
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-cyan-400 font-bold text-sm mb-2">TEAM MEMBERS</h4>
          <div className="space-y-2">
            {project.team.map((member, index) => {
              const memberRole = TEAM_ROLES[member.role];
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <memberRole.icon className={`text-sm ${memberRole.color}`} />
                    <span className="text-gray-300 text-sm">{member.alias}</span>
                  </div>
                  <span className={`text-xs ${memberRole.color}`}>{memberRole.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
        >
          🔧 OPEN PROJECT
        </motion.button>
      </motion.div>
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
              <h1 className="text-3xl font-bold text-cyan-400">PROJECT MODE</h1>
              <p className="text-gray-400">Build • Collaborate • Deploy • Earn</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateProject(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              <FaPlus className="inline mr-2" />
              CREATE PROJECT
            </motion.button>
            
            <div className="text-right">
              <div className="text-cyan-400 font-bold">SHADOW: {shadowProfile?.alias}</div>
              <div className="text-xs opacity-70">PROJECT XP: {shadowProfile?.projectXP || 0}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-b border-cyan-400/30">
        <div className="flex space-x-4">
          {[
            { id: 'projects', label: 'AVAILABLE PROJECTS', icon: FaRocket },
            { id: 'active', label: 'MY PROJECTS', icon: FaCode },
            { id: 'completed', label: 'COMPLETED', icon: FaTrophy }
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
        {currentView === 'projects' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-cyan-400">AVAILABLE PROJECTS</h2>
              <div className="text-gray-400 text-sm">
                {availableProjects.length} projects available
              </div>
            </div>
            
            <div className="grid gap-6">
              {availableProjects.map(renderProjectCard)}
            </div>
          </div>
        )}

        {currentView === 'active' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-cyan-400">MY ACTIVE PROJECTS</h2>
              <div className="text-gray-400 text-sm">
                {userProjects.length} active projects
              </div>
            </div>
            
            <div className="grid gap-6">
              {userProjects.map(renderUserProjectCard)}
            </div>
          </div>
        )}

        {currentView === 'completed' && (
          <div className="text-center text-gray-400 py-20">
            <FaTrophy className="text-6xl mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold mb-2">NO COMPLETED PROJECTS</h3>
            <p>Complete your first project to see it here!</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <AnimatePresence>
        {showCreateProject && (
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
              className="bg-gray-900 border border-cyan-400 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-cyan-400 mb-6">CREATE NEW PROJECT</h2>
              
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div>
                  <label className="block text-cyan-400 font-bold mb-2">Project Title</label>
                  <input
                    type="text"
                    value={newProject.title}
                    onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                    placeholder="Enter project title..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-cyan-400 font-bold mb-2">Description</label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400 resize-none"
                    rows={4}
                    placeholder="Describe your project..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-cyan-400 font-bold mb-2">Category</label>
                    <select
                      value={newProject.category}
                      onChange={(e) => setNewProject(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                    >
                      {Object.entries(PROJECT_CATEGORIES).map(([key, category]) => (
                        <option key={key} value={key}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-cyan-400 font-bold mb-2">Team Size</label>
                    <input
                      type="number"
                      min="2"
                      max="8"
                      value={newProject.teamSize}
                      onChange={(e) => setNewProject(prev => ({ ...prev, teamSize: parseInt(e.target.value) }))}
                      className="w-full bg-black border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <input
                      type="checkbox"
                      checked={newProject.isAnonymous}
                      onChange={(e) => setNewProject(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Anonymous Project</span>
                  </label>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                  >
                    🚀 CREATE PROJECT
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateProject(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
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

export default ShadowProjectHub;
