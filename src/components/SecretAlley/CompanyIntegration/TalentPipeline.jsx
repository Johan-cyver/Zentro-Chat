import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUsers,
  FaTrophy,
  FaChartLine,
  FaEye,
  FaDownload,
  FaEnvelope,
  FaCalendarAlt,
  FaCode,
  FaShieldAlt,
  FaPalette,
  FaDatabase,
  FaCrown,
  FaFire,
  FaGem,
  FaRocket
} from 'react-icons/fa';
import shadowAIEngine from '../../../services/shadowAIEngine';

const TalentPipeline = ({ onBack }) => {
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, candidates, analytics, recruitment
  const [talentPool, setTalentPool] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [recruitmentCampaigns, setRecruitmentCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [filters, setFilters] = useState({
    skillLevel: 'all',
    experience: 'all',
    availability: 'all',
    location: 'all'
  });

  // Role categories for recruitment
  const ROLE_CATEGORIES = {
    FRONTEND: {
      name: 'Frontend Developer',
      icon: FaPalette,
      color: 'text-purple-400',
      skills: ['React', 'Vue', 'Angular', 'CSS', 'JavaScript'],
      avgSalary: '$75,000 - $120,000'
    },
    BACKEND: {
      name: 'Backend Developer',
      icon: FaCode,
      color: 'text-green-400',
      skills: ['Node.js', 'Python', 'Java', 'APIs', 'Databases'],
      avgSalary: '$80,000 - $130,000'
    },
    FULLSTACK: {
      name: 'Full-Stack Developer',
      icon: FaRocket,
      color: 'text-blue-400',
      skills: ['React', 'Node.js', 'Databases', 'DevOps', 'APIs'],
      avgSalary: '$85,000 - $140,000'
    },
    SECURITY: {
      name: 'Security Engineer',
      icon: FaShieldAlt,
      color: 'text-red-400',
      skills: ['Cybersecurity', 'Penetration Testing', 'Cryptography', 'Compliance'],
      avgSalary: '$90,000 - $150,000'
    },
    DATA: {
      name: 'Data Engineer',
      icon: FaDatabase,
      color: 'text-cyan-400',
      skills: ['Python', 'SQL', 'Big Data', 'ML', 'Analytics'],
      avgSalary: '$85,000 - $135,000'
    },
    LEAD: {
      name: 'Technical Lead',
      icon: FaCrown,
      color: 'text-yellow-400',
      skills: ['Leadership', 'Architecture', 'Mentoring', 'Strategy'],
      avgSalary: '$120,000 - $180,000'
    }
  };

  useEffect(() => {
    loadTalentData();
    loadAnalytics();
    loadRecruitmentCampaigns();
  }, []);

  const loadTalentData = () => {
    // Simulate talent pool from Shadow Network
    const mockTalentPool = [
      {
        shadowId: 'PHANTOM_BLADE_777',
        alias: 'PHANTOM_BLADE_777',
        realName: 'Anonymous', // Can be revealed with permission
        overallScore: 92,
        marketValue: 125000,
        careerPath: 'Full-Stack Developer',
        skills: {
          technical: 95,
          problemSolving: 88,
          collaboration: 85,
          leadership: 78,
          communication: 82,
          creativity: 90,
          adaptability: 87
        },
        strengths: ['Technical Excellence', 'Creative Problem Solving', 'Fast Learning'],
        experience: 'Mid-Senior',
        availability: 'Open to opportunities',
        location: 'Remote',
        faction: 'CIPHER_COLLECTIVE',
        achievements: ['Void Walker', 'Cipher Master', 'Squad Leader'],
        projectsCompleted: 8,
        lastActive: Date.now() - 3600000, // 1 hour ago
        interestLevel: 'high',
        contactStatus: 'not_contacted'
      },
      {
        shadowId: 'VOID_HUNTER_123',
        alias: 'VOID_HUNTER_123',
        realName: 'Anonymous',
        overallScore: 88,
        marketValue: 110000,
        careerPath: 'Security Specialist',
        skills: {
          technical: 90,
          problemSolving: 92,
          collaboration: 75,
          leadership: 70,
          communication: 78,
          creativity: 85,
          adaptability: 80
        },
        strengths: ['Security Expertise', 'Problem Solving', 'Technical Depth'],
        experience: 'Mid-Level',
        availability: 'Actively looking',
        location: 'US/Canada',
        faction: 'SHADOW_GUARD',
        achievements: ['Security Master', 'Void Explorer', 'Faction Warrior'],
        projectsCompleted: 5,
        lastActive: Date.now() - 1800000, // 30 minutes ago
        interestLevel: 'very_high',
        contactStatus: 'contacted'
      },
      {
        shadowId: 'CIPHER_MASTER_X',
        alias: 'CIPHER_MASTER_X',
        realName: 'Anonymous',
        overallScore: 96,
        marketValue: 145000,
        careerPath: 'Technical Lead',
        skills: {
          technical: 98,
          problemSolving: 95,
          collaboration: 88,
          leadership: 92,
          communication: 90,
          creativity: 88,
          adaptability: 85
        },
        strengths: ['Technical Leadership', 'Mentoring', 'System Architecture'],
        experience: 'Senior',
        availability: 'Considering offers',
        location: 'Global',
        faction: 'VOID_WALKERS',
        achievements: ['Legendary Cipher', 'Project Architect', 'Faction Leader'],
        projectsCompleted: 15,
        lastActive: Date.now() - 900000, // 15 minutes ago
        interestLevel: 'medium',
        contactStatus: 'in_discussion'
      }
    ];

    setTalentPool(mockTalentPool);
  };

  const loadAnalytics = () => {
    setAnalytics({
      totalTalent: 1247,
      activeThisWeek: 892,
      topPerformers: 156,
      readyToHire: 78,
      averageSkillLevel: 82,
      responseRate: 73,
      hireConversionRate: 28,
      timeToHire: 14 // days
    });
  };

  const loadRecruitmentCampaigns = () => {
    const campaigns = [
      {
        id: 'campaign_001',
        title: 'Senior Full-Stack Developers',
        status: 'active',
        targetRole: 'FULLSTACK',
        candidates: 23,
        responses: 16,
        interviews: 8,
        offers: 2,
        budget: 150000,
        deadline: Date.now() + 14 * 24 * 60 * 60 * 1000 // 2 weeks
      },
      {
        id: 'campaign_002',
        title: 'Security Engineers',
        status: 'active',
        targetRole: 'SECURITY',
        candidates: 15,
        responses: 12,
        interviews: 6,
        offers: 1,
        budget: 140000,
        deadline: Date.now() + 21 * 24 * 60 * 60 * 1000 // 3 weeks
      }
    ];

    setRecruitmentCampaigns(campaigns);
  };

  const getSkillLevelColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getInterestLevelColor = (level) => {
    switch (level) {
      case 'very_high': return 'text-green-400';
      case 'high': return 'text-yellow-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const handleContactCandidate = (candidate) => {
    // Simulate contacting candidate
    setTalentPool(prev => prev.map(c =>
      c.shadowId === candidate.shadowId
        ? { ...c, contactStatus: 'contacted', lastContacted: Date.now() }
        : c
    ));

    alert(`📧 Contact request sent to ${candidate.alias}\nThey will be notified through the Shadow Network.`);
  };

  const handleScheduleInterview = (candidate) => {
    alert(`📅 Interview scheduling initiated for ${candidate.alias}\nCalendar integration will be available soon.`);
  };

  const renderTalentCard = (candidate) => {
    const roleCategory = Object.values(ROLE_CATEGORIES).find(role =>
      role.name.toLowerCase().includes(candidate.careerPath.toLowerCase())
    ) || ROLE_CATEGORIES.FULLSTACK;

    return (
      <motion.div
        key={candidate.shadowId}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-6 cursor-pointer hover:border-cyan-400 transition-all"
        onClick={() => setSelectedCandidate(candidate)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg border-2 ${roleCategory.color.replace('text', 'border')} bg-black/50 flex items-center justify-center`}>
              <roleCategory.icon className={`text-xl ${roleCategory.color}`} />
            </div>
            <div>
              <h3 className="text-white font-bold">{candidate.alias}</h3>
              <p className="text-gray-400 text-sm">{candidate.careerPath}</p>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${candidate.lastActive < Date.now() - 3600000 ? 'bg-gray-400' : 'bg-green-400'}`} />
                <span className="text-xs text-gray-400">
                  {candidate.lastActive < Date.now() - 3600000 ? 'Offline' : 'Online'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold ${getSkillLevelColor(candidate.overallScore)}`}>
              {candidate.overallScore}
            </div>
            <div className="text-gray-400 text-sm">Overall Score</div>
            <div className={`text-xs font-bold ${getInterestLevelColor(candidate.interestLevel)}`}>
              {candidate.interestLevel.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-green-400 font-bold">${(candidate.marketValue / 1000).toFixed(0)}k</div>
            <div className="text-gray-400 text-xs">Market Value</div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">{candidate.projectsCompleted}</div>
            <div className="text-gray-400 text-xs">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">{candidate.achievements.length}</div>
            <div className="text-gray-400 text-xs">Achievements</div>
          </div>
        </div>

        <div className="mb-4">
          <h4 className="text-cyan-400 font-bold text-sm mb-2">TOP SKILLS</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.strengths.slice(0, 3).map((strength, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-800 border border-gray-600 rounded text-xs text-gray-300"
              >
                {strength}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-400">Availability: </span>
            <span className={`font-bold ${
              candidate.availability === 'Actively looking' ? 'text-green-400' :
              candidate.availability === 'Open to opportunities' ? 'text-yellow-400' :
              'text-orange-400'
            }`}>
              {candidate.availability}
            </span>
          </div>

          <div className="flex space-x-2">
            {candidate.contactStatus === 'not_contacted' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleContactCandidate(candidate);
                }}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
              >
                <FaEnvelope className="inline mr-1" />
                Contact
              </motion.button>
            )}

            {candidate.contactStatus === 'contacted' && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleScheduleInterview(candidate);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-bold transition-colors"
              >
                <FaCalendarAlt className="inline mr-1" />
                Interview
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderAnalyticsDashboard = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-cyan-400">TALENT ANALYTICS</h2>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-cyan-400">{analytics.totalTalent}</div>
                <div className="text-gray-400 text-sm">Total Talent Pool</div>
              </div>
              <FaUsers className="text-cyan-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-900/50 border border-green-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-400">{analytics.readyToHire}</div>
                <div className="text-gray-400 text-sm">Ready to Hire</div>
              </div>
              <FaTrophy className="text-green-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-900/50 border border-yellow-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-400">{analytics.responseRate}%</div>
                <div className="text-gray-400 text-sm">Response Rate</div>
              </div>
              <FaChartLine className="text-yellow-400 text-2xl" />
            </div>
          </div>

          <div className="bg-gray-900/50 border border-purple-400/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-400">{analytics.timeToHire}</div>
                <div className="text-gray-400 text-sm">Days to Hire</div>
              </div>
              <FaRocket className="text-purple-400 text-2xl" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-6">
            <h3 className="text-cyan-400 font-bold mb-4">SKILL DISTRIBUTION</h3>
            <div className="space-y-3">
              {Object.entries(ROLE_CATEGORIES).map(([key, role]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <role.icon className={`${role.color} text-sm`} />
                    <span className="text-gray-300 text-sm">{role.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${role.color.replace('text', 'bg')}`}
                        style={{ width: `${Math.random() * 80 + 20}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-xs w-8">{Math.floor(Math.random() * 200 + 50)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-6">
            <h3 className="text-cyan-400 font-bold mb-4">RECRUITMENT FUNNEL</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Talent Pool</span>
                <span className="text-cyan-400 font-bold">{analytics.totalTalent}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Contacted</span>
                <span className="text-yellow-400 font-bold">{Math.floor(analytics.totalTalent * 0.15)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Responded</span>
                <span className="text-green-400 font-bold">{Math.floor(analytics.totalTalent * 0.11)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Interviewed</span>
                <span className="text-purple-400 font-bold">{Math.floor(analytics.totalTalent * 0.05)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Hired</span>
                <span className="text-red-400 font-bold">{Math.floor(analytics.totalTalent * 0.014)}</span>
              </div>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-cyan-400">TALENT PIPELINE</h1>
              <p className="text-gray-400">Shadow Network Recruitment Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              <FaDownload className="inline mr-2" />
              EXPORT DATA
            </motion.button>

            <div className="text-right">
              <div className="text-cyan-400 font-bold">ZENTRO CORP</div>
              <div className="text-xs opacity-70">Recruitment Dashboard</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-6 border-b border-cyan-400/30">
        <div className="flex space-x-4">
          {[
            { id: 'dashboard', label: 'OVERVIEW', icon: FaChartLine },
            { id: 'candidates', label: 'TALENT POOL', icon: FaUsers },
            { id: 'analytics', label: 'ANALYTICS', icon: FaTrophy },
            { id: 'recruitment', label: 'CAMPAIGNS', icon: FaRocket }
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
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-cyan-400">{analytics.totalTalent}</div>
                <div className="text-gray-400 text-sm">Total Shadows</div>
              </div>
              <div className="bg-gray-900/50 border border-green-400/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{analytics.readyToHire}</div>
                <div className="text-gray-400 text-sm">Ready to Hire</div>
              </div>
              <div className="bg-gray-900/50 border border-yellow-400/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{analytics.activeThisWeek}</div>
                <div className="text-gray-400 text-sm">Active This Week</div>
              </div>
              <div className="bg-gray-900/50 border border-purple-400/30 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-400">{analytics.topPerformers}</div>
                <div className="text-gray-400 text-sm">Top Performers</div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-6">
              <h3 className="text-cyan-400 font-bold mb-4">TOP CANDIDATES</h3>
              <div className="grid gap-4">
                {talentPool.slice(0, 3).map(renderTalentCard)}
              </div>
            </div>
          </div>
        )}

        {currentView === 'candidates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-cyan-400">TALENT POOL</h2>
              <div className="text-gray-400 text-sm">
                {talentPool.length} candidates available
              </div>
            </div>

            <div className="grid gap-4">
              {talentPool.map(renderTalentCard)}
            </div>
          </div>
        )}

        {currentView === 'analytics' && renderAnalyticsDashboard()}

        {currentView === 'recruitment' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-cyan-400">RECRUITMENT CAMPAIGNS</h2>

            <div className="grid gap-4">
              {recruitmentCampaigns.map(campaign => (
                <div key={campaign.id} className="bg-gray-900/50 border border-cyan-400/30 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold text-lg">{campaign.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      campaign.status === 'active' ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {campaign.status.toUpperCase()}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-cyan-400 font-bold text-xl">{campaign.candidates}</div>
                      <div className="text-gray-400 text-sm">Candidates</div>
                    </div>
                    <div className="text-center">
                      <div className="text-green-400 font-bold text-xl">{campaign.responses}</div>
                      <div className="text-gray-400 text-sm">Responses</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-bold text-xl">{campaign.interviews}</div>
                      <div className="text-gray-400 text-sm">Interviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold text-xl">{campaign.offers}</div>
                      <div className="text-gray-400 text-sm">Offers</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-400">
                      Budget: <span className="text-green-400 font-bold">${campaign.budget.toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Deadline: <span className="text-red-400 font-bold">
                        {Math.ceil((campaign.deadline - Date.now()) / (24 * 60 * 60 * 1000))} days
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
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
              className="bg-gray-900 border border-cyan-400 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-cyan-400">{selectedCandidate.alias}</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCandidate(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </motion.button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="text-cyan-400 font-bold mb-3">SKILL BREAKDOWN</h3>
                    <div className="space-y-2">
                      {Object.entries(selectedCandidate.skills).map(([skill, score]) => (
                        <div key={skill} className="flex items-center justify-between">
                          <span className="text-gray-300 capitalize">{skill.replace(/([A-Z])/g, ' $1')}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-800 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getSkillLevelColor(score).replace('text', 'bg')}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${getSkillLevelColor(score)}`}>{score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="text-cyan-400 font-bold mb-3">ACHIEVEMENTS</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.achievements.map((achievement, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-yellow-900/20 border border-yellow-400/30 rounded-full text-xs text-yellow-400 font-bold"
                        >
                          🏆 {achievement}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="text-cyan-400 font-bold mb-3">PROFILE SUMMARY</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overall Score:</span>
                        <span className={`font-bold ${getSkillLevelColor(selectedCandidate.overallScore)}`}>
                          {selectedCandidate.overallScore}/100
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Market Value:</span>
                        <span className="text-green-400 font-bold">${selectedCandidate.marketValue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Experience:</span>
                        <span className="text-white font-bold">{selectedCandidate.experience}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Availability:</span>
                        <span className="text-yellow-400 font-bold">{selectedCandidate.availability}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location:</span>
                        <span className="text-white font-bold">{selectedCandidate.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Faction:</span>
                        <span className="text-purple-400 font-bold">{selectedCandidate.faction}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/50 rounded-lg p-4">
                    <h3 className="text-cyan-400 font-bold mb-3">RECRUITMENT ACTIONS</h3>
                    <div className="space-y-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleContactCandidate(selectedCandidate)}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                      >
                        <FaEnvelope className="inline mr-2" />
                        SEND RECRUITMENT MESSAGE
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleScheduleInterview(selectedCandidate)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                      >
                        <FaCalendarAlt className="inline mr-2" />
                        SCHEDULE INTERVIEW
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-bold transition-colors"
                      >
                        <FaDownload className="inline mr-2" />
                        EXPORT PROFILE
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TalentPipeline;