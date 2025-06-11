import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaUsers, FaBriefcase, FaEye, FaUserShield, FaGlobe, FaUserFriends, FaCalendarAlt, FaLock, FaUser, FaGithub, FaLinkedin, FaPlusCircle } from 'react-icons/fa';
import ProfessionalCard from '../../components/SmartProfilePanel/ProfessionalCard';
import { isCurrentUserProfessionalEligible, getProfessionalRestrictionMessage } from '../../utils/ageUtils';
import { useUser } from '../../contexts/UserContext';
import firebaseChatService from '../../services/firebaseChat';
import { useNavigate } from 'react-router-dom';
import realAchievementService from '../../services/realAchievementService';
import '../../styles/zentroverse.css';

/**
 * ProfessionalDirectory - A dedicated section for professional profile IDs
 *
 * Features:
 * - Integrated into the main sidebar navigation
 * - Shows professional profile cards with visibility filtering
 * - Similar to DMs and Smart Profile Panel sections
 * - Allows users to discover and connect with professionals
 */
const ProfessionalDirectory = ({ onViewProfile }) => {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedVisibility, setSelectedVisibility] = useState('all');
  const [userType, setUserType] = useState('public'); // 'public', 'recruiter', 'friend'
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is eligible for professional features
  const isEligible = isCurrentUserProfessionalEligible();
  const birthDate = localStorage.getItem('zentro_user_birthDate');

  // Load professional profiles from Firebase with fallback to localStorage
  useEffect(() => {
    const loadProfessionals = async () => {
      setLoading(true);
      try {
        // Try Firebase first
        const firebaseProfessionals = await firebaseChatService.getProfessionalProfiles(userProfile?.uid);
        setProfessionals(firebaseProfessionals);
      } catch (error) {
        console.error('Error loading professionals from Firebase, falling back to localStorage:', error);

        // Fallback to localStorage data
        try {
          const localUsers = JSON.parse(localStorage.getItem('zentro_all_users') || '[]');
          const localProfessionals = localUsers.map(user => ({
            uid: user.uid,
            displayName: user.displayName || user.username || 'Unknown User',
            email: user.email || '',
            photoURL: user.photoURL,
            location: user.location || 'Remote',
            bio: user.bio || 'Professional user on Zentro Chat',
            professional: {
              role: user.professional?.role || 'Professional',
              industry: user.professional?.industry || 'Technology',
              skills: user.professional?.skills || ['Communication', 'Problem Solving'],
              bio: user.professional?.bio || user.bio || 'Professional user on Zentro Chat',
              ...user.professional
            },
            visibility: user.visibility || 'public',
            online: user.online || false,
            lastSeen: user.lastSeen
          }));

          console.log('✅ Loaded professionals from localStorage:', localProfessionals.length);
          setProfessionals(localProfessionals);
        } catch (localError) {
          console.error('Error loading from localStorage:', localError);
          setProfessionals([]);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfessionals();
  }, [userProfile?.uid]);

  // Use Firebase professionals data
  const allProfessionals = useMemo(() => {
    return professionals;
  }, [professionals]);

  const industries = ['all', 'Technology', 'Design', 'Marketing', 'Finance'];
  const visibilityOptions = ['all', 'public', 'recruiters', 'friends'];

  // If user is not eligible, show restriction message
  if (!isEligible) {
    return (
      <div className="h-full bg-black text-white flex items-center justify-center">
        <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700 max-w-md">
          <FaCalendarAlt className="text-4xl text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-300 mb-2">Professional Directory Restricted</h3>
          <p className="text-gray-400 mb-4">
            {getProfessionalRestrictionMessage(birthDate) ||
             'Please set your birth date in your profile to access professional features.'}
          </p>
          <div className="text-sm text-gray-500">
            Professional features including the directory are available for users 21 and older.
          </div>
        </div>
      </div>
    );
  }

  // Function to check if user can view a profile based on visibility settings
  const canViewProfile = (professional) => {
    // Always allow viewing own profile
    if (professional.uid === userProfile?.uid) {
      return true;
    }

    switch (professional.visibility) {
      case 'public':
        return true;
      case 'recruiters':
        // Check if current user has recruiter privileges (admin or verified recruiter)
        return userProfile?.isAdmin || userProfile?.professional?.isRecruiter || userProfile?.professional?.isVerified;
      case 'friends':
        // TODO: Implement proper backend friends system
        // For now, check if users have interacted (messages, connections)
        // This should be replaced with actual friendship/connection data from Firebase
        return userProfile?.connections?.includes(professional.uid) ||
               professional.connections?.includes(userProfile?.uid);
      default:
        return true;
    }
  };

  const filteredProfessionals = allProfessionals.filter(professional => {
    const matchesSearch = professional.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.professional.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         professional.professional.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesIndustry = selectedIndustry === 'all' || professional.professional.industry === selectedIndustry;
    const matchesVisibility = selectedVisibility === 'all' || professional.visibility === selectedVisibility;

    // Enhanced visibility filtering based on user type
    let canView = false;
    switch (userType) {
      case 'public':
        canView = professional.visibility === 'public';
        break;
      case 'recruiter':
        // Only show recruiter-accessible profiles if user has recruiter privileges
        const hasRecruiterAccess = userProfile?.isAdmin ||
                                  userProfile?.professional?.isRecruiter ||
                                  userProfile?.professional?.isVerified;
        canView = professional.visibility === 'public' ||
                 (professional.visibility === 'recruiters' && hasRecruiterAccess);
        break;
      case 'friend':
        // Check actual connections/friendships from backend
        const isConnected = userProfile?.connections?.includes(professional.uid) ||
                           professional.connections?.includes(userProfile?.uid);
        canView = professional.visibility === 'public' ||
                 (professional.visibility === 'recruiters' && hasRecruiterAccess) ||
                 (professional.visibility === 'friends' && isConnected);
        break;
      default:
        canView = professional.visibility === 'public';
    }

    // Always allow viewing own profile
    if (professional.uid === userProfile?.uid) {
      canView = true;
    }

    return matchesSearch && matchesIndustry && matchesVisibility && canView;
  });

  return (
    <div className="h-full bg-gradient-to-br from-gray-950 via-black to-purple-950 text-white flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-purple-600/20 via-cyan-400/20 to-pink-600/20 animate-gradient-shift"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-purple-500/30">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
            Zentro Talent Hub
          </h1>
          <p className="text-gray-300 text-xl font-medium">
            🏆 Discover Elite Professionals & Rising Stars 🌟
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Where skills become superpowers and professionals become digital legends
          </p>
        </div>

        {/* Realm Access Portal */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-xl p-1 border border-purple-500/30">
            <button
              onClick={() => setUserType('public')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                userType === 'public'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <FaGlobe className="inline mr-2" />
              🌍 Public Dimension
            </button>
            <button
              onClick={() => setUserType('recruiter')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                userType === 'recruiter'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <FaUserShield className="inline mr-2" />
              🏢 Corporate Nexus
            </button>
            <button
              onClick={() => setUserType('friend')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                userType === 'friend'
                  ? 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg shadow-purple-500/25'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <FaUserFriends className="inline mr-2" />
              👥 Inner Circle
            </button>
          </div>
        </div>

        {/* Legend Search Portal */}
        <div className="relative mb-6">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            placeholder="🔍 Search the multiverse for legends, powers, realms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gradient-to-r from-gray-900 to-black border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300"
          />
        </div>

        {/* Dimensional Filters - Gaming Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Industry Filter */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur opacity-50"></div>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="relative w-full px-4 py-3 bg-gradient-to-r from-gray-900/90 to-black/90 border border-purple-500/50 rounded-xl text-white text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer hover:border-purple-400"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              {industries.map(industry => (
                <option key={industry} value={industry} className="bg-gray-900 text-white">
                  {industry === 'all' ? '🌌 All Realms' : `⚡ ${industry} Dimension`}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FaFilter className="text-purple-400 text-sm" />
            </div>
          </div>

          {/* Visibility Filter */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-xl blur opacity-50"></div>
            <select
              value={selectedVisibility}
              onChange={(e) => setSelectedVisibility(e.target.value)}
              className="relative w-full px-4 py-3 bg-gradient-to-r from-gray-900/90 to-black/90 border border-purple-500/50 rounded-xl text-white text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/50 transition-all duration-300 backdrop-blur-sm appearance-none cursor-pointer hover:border-purple-400"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em'
              }}
            >
              {visibilityOptions.map(visibility => (
                <option key={visibility} value={visibility} className="bg-gray-900 text-white">
                  {visibility === 'all' ? '🌌 All Access Levels' :
                   visibility === 'public' ? '🌍 Public Dimension' :
                   visibility === 'recruiters' ? '🏢 Corporate Nexus' :
                   '👥 Inner Circle'}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <FaEye className="text-cyan-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Nexus Statistics */}
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-900/30 to-cyan-900/30 rounded-xl p-4 border border-purple-500/20">
          <div className="flex items-center space-x-2">
            <span className="text-cyan-400 font-bold text-lg">{filteredProfessionals.length}</span>
            <span className="text-gray-300">Digital Legends Discovered</span>
          </div>
          <div className="flex items-center space-x-2">
            {userType === 'public' && <span className="text-purple-400">🌍 Exploring Public Dimension</span>}
            {userType === 'recruiter' && <span className="text-cyan-400">🏢 Corporate Nexus Active</span>}
            {userType === 'friend' && <span className="text-pink-400">👥 Inner Circle Connected</span>}
          </div>
        </div>
      </div>

      {/* Digital Legends Gallery */}
      <div className="flex-1 overflow-y-auto p-6 zentroverse-scroll relative">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-cyan-400 mx-auto mb-4"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-2 border-purple-400/20 mx-auto"></div>
              </div>
              <p className="text-cyan-400 font-medium">🌌 Scanning the multiverse for legends...</p>
              <p className="text-gray-500 text-sm mt-2">Initializing quantum professional discovery</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProfessionals.map((professional, index) => (
                <motion.div
                  key={professional.uid}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 100
                  }}
                  whileHover={{
                    scale: 1.03,
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="h-fit relative group"
                >
                  {/* Glow Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Professional Card with Enhanced Styling */}
                  <div className="relative holographic-card rounded-xl overflow-hidden">
                    <ProfessionalCard
                      user={professional}
                      onViewProfile={() => {
                        // Prepare userForProfile similar to ZentroDirectory.jsx
                        const userForProfile = {
                          uid: professional.uid, // uid is the correct user identifier here
                          displayName: professional.displayName,
                          email: professional.email || '',
                          photoURL: professional.photoURL,
                          // The 'professional' object is already nested in the 'professional' prop from firebase
                          professional: professional.professional,
                          fromDirectory: true,
                          // Ensure all fields expected by ProfilePanel's ProfessionalView are present or defaulted
                          // Fields like experience, github, linkedin, website might be directly in professional.professional
                        };
                        navigate('/profile', {
                          state: {
                            viewUser: userForProfile,
                            viewMode: 'professional',
                            fromDirectory: true
                          }
                        });
                      }}
                      className="w-full h-full relative z-10"
                    />

                    {/* Dynamic Achievement Badge - Fixed positioning to not overlap Zenny coins */}
                    {(() => {
                      const prof = professional.professional || {};
                      const topBadge = null; // Temporarily disabled - will integrate with real achievement system

                      return topBadge ? (
                        <div className={`absolute top-3 left-3 bg-gradient-to-r ${topBadge.color} text-white px-2 py-1 rounded-full text-xs font-bold z-10 shadow-lg animate-pulse`}>
                          <span className="mr-1">{topBadge.icon}</span>
                          {topBadge.name}
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 bg-gradient-to-r from-gray-600 to-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold z-10">
                          🌟 MEMBER
                        </div>
                      );
                    })()}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Empty Dimension State */}
            {filteredProfessionals.length === 0 && (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <div className="text-6xl mb-4 animate-float">🌌</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
                </div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mb-4">
                  This Dimension Appears Empty
                </h3>
                <p className="text-gray-400 text-lg mb-6">
                  No digital legends found in this realm. Try exploring different dimensions or adjusting your quantum filters.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedIndustry('all');
                      setSelectedVisibility('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-cyan-700 transition-all duration-300 transform hover:scale-105"
                  >
                    🔄 Reset Quantum Filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDirectory;
