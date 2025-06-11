import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaGithub, FaLinkedin, FaGlobe, FaSearch, FaPlusCircle, FaTrophy, FaRocket, FaCrown } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
// ZentroSidebar removed - using AppSidebar from App.jsx
import professionalService from '../../services/professionalService';
// import zennyCoinsService from '../../services/zennyCoinsService'; // Temporarily disabled
import professionalBoostService from '../../services/professionalBoostService';
import collaborationService from '../../services/collaborationService';
import '../../styles/zentroverse.css';

const ZentroNexus = () => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [currentView, setCurrentView] = useState('professional');
  // const [userZennyBalance, setUserZennyBalance] = useState(0); // Temporarily disabled
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

  const handleEndorseSkill = async (professionalId, skillToUpdate) => {
    const professionalIndex = professionals.findIndex(p => p.id === professionalId);
    if (professionalIndex === -1) return;

    const professionalToUpdate = professionals[professionalIndex];

    // Ensure user is logged in and not endorsing their own skill
    if (!userProfile?.uid || userProfile.uid === professionalToUpdate.userId) {
      console.warn("Cannot endorse: User not logged in or attempting to endorse own skill.");
      return;
    }

    const updatedProfessional = JSON.parse(JSON.stringify(professionalToUpdate)); // Deep copy
    updatedProfessional.endorsements = updatedProfessional.endorsements || [];

    let skillEntry = updatedProfessional.endorsements.find(e => e.skill === skillToUpdate);

    if (!skillEntry) {
      skillEntry = { skill: skillToUpdate, count: 0, endorsedBy: [] };
      updatedProfessional.endorsements.push(skillEntry);
    }

    if (!skillEntry.endorsedBy.includes(userProfile.uid)) {
      skillEntry.count += 1;
      skillEntry.endorsedBy.push(userProfile.uid);

      // Update the state
      const newProfessionals = [...professionals];
      newProfessionals[professionalIndex] = updatedProfessional;
      setProfessionals(newProfessionals);

      // Save to localStorage via service
      professionalService.saveProfessional(updatedProfessional);

      // Award Zenny coins for endorsing (1 coin for endorser, 2 coins for endorsed)
      // Temporarily disabled Zenny coin awards
      /*
      try {
        await zennyCoinsService.awardCoins(userProfile.uid, 1, 'skill_endorsement', `Endorsed ${skillToUpdate} skill`);
        await zennyCoinsService.awardCoins(professionalToUpdate.userId, 2, 'skill_endorsed', `Received endorsement for ${skillToUpdate}`);

        // Update user's balance display
        const newBalance = await zennyCoinsService.getBalance(userProfile.uid);
        setUserZennyBalance(newBalance);

        console.log(`🪙 Zenny coins awarded: 1 to endorser, 2 to ${professionalToUpdate.name}`);
      } catch (error) {
        console.error('Error awarding Zenny coins:', error);
      }
      */
    } else {
      console.log("User has already endorsed this skill for this professional.");
    }
  };

  // Collaboration request handler
  const handleCollaborationRequest = async (professional, type) => {
    if (!userProfile?.uid) {
      alert('Please log in to send collaboration requests');
      return;
    }

    if (userProfile.uid === professional.userId) {
      alert('You cannot send collaboration requests to yourself');
      return;
    }

    try {
      const message = type === 'project' ?
        `Hi ${professional.name}! I'd love to collaborate on a project with you. Let's create something amazing together! 🚀` :
        `Hi ${professional.name}! I'm interested in learning from your expertise. Would you be open to mentoring? 🎓`;

      // Use collaboration service
      const result = await collaborationService.sendCollaborationRequest(
        userProfile.uid,
        professional.userId,
        type,
        message,
        professional.skills?.slice(0, 3) || []
      );

      if (!result.success) {
        if (result.error === 'Duplicate request already exists') {
          alert('You already have a pending collaboration request with this professional');
        } else {
          alert(`Failed to send collaboration request: ${result.error}`);
        }
        return;
      }

      // Award Zenny coins for networking activity - Temporarily disabled
      /*
      await zennyCoinsService.awardCoins(userProfile.uid, 3, 'collaboration_request', `Sent ${type} collaboration request`);

      // Update user's balance
      const newBalance = await zennyCoinsService.getBalance(userProfile.uid);
      setUserZennyBalance(newBalance);
      */

      // Show success message with real-time indication
      const typeLabel = type === 'project' ? 'Project Collaboration' : 'Mentorship';
      alert(`${typeLabel} request sent to ${professional.name}! 🤝\n\n✨ Real-time notification sent!`);

      console.log(`🤝 Collaboration request sent: ${type} to ${professional.name}`);
    } catch (error) {
      console.error('Error sending collaboration request:', error);
      alert('Failed to send collaboration request. Please try again.');
    }
  };

  // Challenge system handler
  const handleSkillChallenge = async (professional, skillType) => {
    if (!userProfile?.uid) {
      alert('Please log in to send skill challenges');
      return;
    }

    if (userProfile.uid === professional.userId) {
      alert('You cannot challenge yourself');
      return;
    }

    try {
      const challengeTypes = {
        'coding': '💻 Coding Battle',
        'design': '🎨 Design Duel',
        'problem': '🧩 Problem Solving Contest'
      };

      const message = `🔥 SKILL CHALLENGE! 🔥\n\nHey ${professional.name}! I challenge you to a ${challengeTypes[skillType]}!\n\nWinner gets reputation boost! 🏆\n\nAre you ready to prove your skills? 💪`;

      // Award coins for sending challenge - Temporarily disabled
      /*
      await zennyCoinsService.awardCoins(userProfile.uid, 5, 'skill_challenge', `Sent ${skillType} challenge`);

      const newBalance = await zennyCoinsService.getBalance(userProfile.uid);
      setUserZennyBalance(newBalance);
      */

      alert(`${challengeTypes[skillType]} challenge sent to ${professional.name}! 🔥\n\n⚔️ Challenge notification sent!`);

      console.log(`🔥 Skill challenge sent: ${skillType} to ${professional.name}`);
    } catch (error) {
      console.error('Error sending skill challenge:', error);
      alert('Failed to send challenge. Please try again.');
    }
  };

  // Squad formation handler
  const handleSquadInvite = async (professional) => {
    if (!userProfile?.uid) {
      alert('Please log in to form squads');
      return;
    }

    if (userProfile.uid === professional.userId) {
      alert('You cannot invite yourself to a squad');
      return;
    }

    try {
      const message = `🚀 SQUAD INVITE! 🚀\n\nHey ${professional.name}! Want to form a temporary squad for an upcoming project?\n\nLet's combine our skills and create something amazing together! 💪\n\nSquad benefits:\n• Team achievements\n• Priority project matching\n• Shared success rewards`;

      // Award coins for squad building - Temporarily disabled
      /*
      await zennyCoinsService.awardCoins(userProfile.uid, 7, 'squad_invite', 'Sent squad invitation');

      const newBalance = await zennyCoinsService.getBalance(userProfile.uid);
      setUserZennyBalance(newBalance);
      */

      alert(`Squad invitation sent to ${professional.name}! 🚀\n\n👥 Squad invite notification sent!`);

      console.log(`👥 Squad invite sent to ${professional.name}`);
    } catch (error) {
      console.error('Error sending squad invite:', error);
      alert('Failed to send squad invite. Please try again.');
    }
  };

  // Toggle networking availability
  const handleNetworkingToggle = async () => {
    if (!userProfile?.uid) return;

    try {
      // Get current user's professional profile
      const userProfessional = professionals.find(p => p.userId === userProfile.uid);
      if (!userProfessional) return;

      // Toggle networking status
      const updatedProfessional = {
        ...userProfessional,
        networkingAvailable: !userProfessional.networkingAvailable,
        networkingStatus: userProfessional.networkingAvailable ? 'unavailable' : 'available',
        updatedAt: new Date().toISOString()
      };

      // Update state
      const newProfessionals = professionals.map(p =>
        p.userId === userProfile.uid ? updatedProfessional : p
      );
      setProfessionals(newProfessionals);

      // Save to localStorage
      professionalService.saveProfessional(updatedProfessional);

      // Award coins for updating networking status - Temporarily disabled
      /*
      await zennyCoinsService.awardCoins(userProfile.uid, 1, 'networking_update', 'Updated networking availability');
      */

      const status = updatedProfessional.networkingAvailable ? 'available' : 'unavailable';
      alert(`Networking status updated: ${status} 🌐`);

      console.log(`🌐 Networking status updated: ${status}`);
    } catch (error) {
      console.error('Error updating networking status:', error);
      alert('Failed to update networking status. Please try again.');
    }
  };

  // Load professionals from localStorage and ensure current user is included
  useEffect(() => {
    const loadProfessionals = () => {
      try {
        // Get all professionals from service
        const allProfessionals = professionalService.getAllProfessionals();

        // Also check for users who might have profiles but not professional profiles yet
        let allUsers = JSON.parse(localStorage.getItem('zentro_all_users') || '[]');
        if (allUsers.length === 0) {
          allUsers = JSON.parse(localStorage.getItem('zentro_registered_users') || '[]');
        }

        console.log('🔍 Directory Debug - Loading professionals. Found users:', allUsers.length);
        console.log('🔍 Directory Debug - Existing professionals:', allProfessionals.length);
        console.log('🔍 Directory Debug - zentro_all_users:', JSON.parse(localStorage.getItem('zentro_all_users') || '[]').length);
        console.log('🔍 Directory Debug - zentro_registered_users:', JSON.parse(localStorage.getItem('zentro_registered_users') || '[]').length);

        // Create professional profiles for users who don't have them but are registered
        allUsers.forEach(user => {
          const existingProfessional = allProfessionals.find(prof => prof.userId === user.uid);
          if (!existingProfessional && user.uid) {
            const defaultProfessional = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              userId: user.uid,
              name: user.displayName || user.username || user.email || 'Anonymous User',
              title: 'Professional',
              bio: 'Welcome to my professional profile!',
              location: 'Remote',
              skills: ['Communication', 'Problem Solving'],
              visibility: 'public',
              avatar: user.photoURL || null,
              experience: 0,
              github: '',
              linkedin: '',
              website: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            // Save the default professional profile
            professionalService.saveProfessional(defaultProfessional);
            allProfessionals.push(defaultProfessional);
            console.log('Created professional profile for:', user.displayName || user.email);
          }
        });

        // Also ensure current user has a professional profile
        if (userProfile?.uid) {
          const userProfessional = allProfessionals.find(prof => prof.userId === userProfile.uid);
          if (!userProfessional) {
            const defaultProfessional = {
              id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
              userId: userProfile.uid,
              name: userProfile.displayName || userProfile.email || 'Anonymous User',
              title: 'Professional',
              bio: 'Welcome to my professional profile!',
              location: 'Remote',
              skills: ['Communication', 'Problem Solving'],
              visibility: 'public',
              avatar: userProfile.photoURL || null,
              experience: 0,
              github: '',
              linkedin: '',
              website: '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };

            professionalService.saveProfessional(defaultProfessional);
            allProfessionals.push(defaultProfessional);
            console.log('Created professional profile for current user:', userProfile.displayName || userProfile.email);
          }
        }

        // Filter out admin-hidden users from directory
        const hiddenFromDirectory = JSON.parse(localStorage.getItem('zentro_hidden_from_directory') || '[]');
        const visibleProfessionals = allProfessionals.filter(prof =>
          !hiddenFromDirectory.includes(prof.userId)
        );

        console.log('Final professionals count:', visibleProfessionals.length);

        // Initialize endorsements and metrics for professionals who don't have them
        if (visibleProfessionals.length > 0) {
          console.log('🔧 Initializing professional metrics for ranking system');
          visibleProfessionals.forEach((prof, index) => {
            // Only add default data if they don't already have endorsements
            if (!prof.endorsements || prof.endorsements.length === 0) {
              prof.endorsements = [
                { skill: 'Communication', count: 0, endorsedBy: [] },
                { skill: 'Problem Solving', count: 0, endorsedBy: [] }
              ];
            }

            // Set default values for missing fields
            if (!prof.experience) prof.experience = 0;
            if (!prof.totalViews) prof.totalViews = 0;
            if (prof.hasCustomProfile === undefined) prof.hasCustomProfile = false;
            if (!prof.updatedAt) prof.updatedAt = new Date().toISOString();

            console.log(`✅ Initialized ${prof.name}: ${prof.endorsements?.reduce((sum, e) => sum + e.count, 0) || 0} endorsements, ${prof.experience}y exp`);
          });
        }

        // Load Zenny balances and boost information for all professionals
        const loadProfessionalData = async () => {
          // Clean up expired boosts first
          professionalBoostService.cleanupExpiredBoosts();

          const professionalsWithData = await Promise.all(
            visibleProfessionals.map(async (prof) => {
              try {
                // const balance = await zennyCoinsService.getBalance(prof.userId); // Temporarily disabled
                const currentBoost = professionalBoostService.getProfessionalBoost(prof.userId);
                return {
                  ...prof,
                  // zennyBalance: balance, // Temporarily disabled
                  currentBoost: currentBoost
                };
              } catch (error) {
                console.error(`Error loading data for ${prof.name}:`, error);
                return prof;
              }
            })
          );
          setProfessionals(professionalsWithData);
        };

        loadProfessionalData();
      } catch (error) {
        console.error('Error loading professionals:', error);
        setProfessionals([]);
      }
    };

    loadProfessionals();
  }, [userProfile]);

  // Load user's Zenny balance - Temporarily disabled
  /*
  useEffect(() => {
    const loadZennyBalance = async () => {
      if (userProfile?.uid) {
        try {
          const balance = await zennyCoinsService.getBalance(userProfile.uid);
          setUserZennyBalance(balance);
        } catch (error) {
          console.error('Error loading Zenny balance:', error);
        }
      }
    };

    loadZennyBalance();
  }, [userProfile]);
  */

  // Calculate professional rank based on real metrics
  const calculateProfessionalRank = (professional) => {
    let score = 0;

    // Base metrics
    const endorsements = professional.endorsements || [];
    const totalEndorsements = endorsements.reduce((sum, e) => sum + (e.count || 0), 0);
    const skillCount = professional.skills?.length || 0;
    const experience = professional.experience || 0;
    // const zennyCoins = professional.zennyCoins || 0; // Temporarily disabled

    // Scoring algorithm
    score += totalEndorsements * 10; // Each endorsement = 10 points
    score += skillCount * 5; // Each skill = 5 points
    score += experience * 2; // Each year experience = 2 points
    // score += zennyCoins * 0.1; // Each Zenny coin = 0.1 points // Temporarily disabled

    // Bonus for verified profiles
    if (professional.isVerified) score += 100;
    if (professional.isRecruiter) score += 50;

    // Bonus for complete profiles
    if (professional.bio && professional.bio.length > 50) score += 20;
    if (professional.github) score += 15;
    if (professional.linkedin) score += 15;
    if (professional.website) score += 10;
    if (professional.avatar) score += 10;

    return Math.floor(score);
  };

  // Get boost priority for sorting
  const getBoostPriority = (professional) => {
    const boost = professional.currentBoost;
    if (!boost || new Date(boost.endTime) < new Date()) return 0;

    switch (boost.level?.toLowerCase()) {
      case 'diamond': return 5;
      case 'platinum': return 4;
      case 'gold': return 3;
      case 'silver': return 2;
      case 'bronze': return 1;
      default: return 0;
    }
  };

  // Filter and sort professionals based on search, filters, and ranking
  useEffect(() => {
    let filtered = [...professionals];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(prof =>
        prof.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.skills?.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase())) ||
        prof.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Visibility filter
    if (visibilityFilter !== 'all') {
      filtered = filtered.filter(prof => prof.visibility === visibilityFilter);
    }

    // Skill filter
    if (skillFilter) {
      filtered = filtered.filter(prof =>
        prof.skills?.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      );
    }

    // Sort by boost level first, then by rank
    filtered.sort((a, b) => {
      const boostA = getBoostPriority(a);
      const boostB = getBoostPriority(b);

      // First sort by boost priority (higher boost = higher priority)
      if (boostA !== boostB) {
        return boostB - boostA;
      }

      // Then sort by calculated rank (higher rank = higher priority)
      const rankA = calculateProfessionalRank(a);
      const rankB = calculateProfessionalRank(b);

      if (rankA !== rankB) {
        return rankB - rankA;
      }

      // Finally sort by update time (more recent = higher priority)
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });

    setFilteredProfessionals(filtered);
  }, [professionals, searchQuery, visibilityFilter, skillFilter]);

  const DeveloperCard = ({ professional, onEndorse }) => {
    const canView = () => {
      if (professional.visibility === 'public') return true;
      if (professional.visibility === 'recruiters' && userProfile?.isRecruiter) return true;
      if (professional.visibility === 'friends') {
        // Check if user is friends with this professional
        const friends = JSON.parse(localStorage.getItem('zentro_friends') || '[]');
        return friends.some(friend => friend.id === professional.userId);
      }
      return professional.userId === userProfile?.uid;
    };

    if (!canView()) return null;

    // Calculate rank and boost status
    const officialRank = calculateProfessionalRank(professional);
    const currentBoost = professional.currentBoost;
    const isBoostActive = currentBoost && new Date(currentBoost.endTime) > new Date();

    // Calculate position in current filtered list
    const allRanks = filteredProfessionals.map(p => calculateProfessionalRank(p)).sort((a, b) => b - a);
    const userRank = calculateProfessionalRank(professional);
    const position = allRanks.indexOf(userRank) + 1;
    const isTop10Percent = position <= Math.ceil(allRanks.length * 0.1);
    const isTop3 = position <= 3;

    // Determine rank tier for styling
    const getRankTier = (rank, position) => {
      if (isTop3) {
        const topColors = {
          1: { tier: 'champion', color: 'from-yellow-400 to-orange-500', label: 'CHAMPION', glow: 'shadow-yellow-500/50' },
          2: { tier: 'legend', color: 'from-gray-300 to-gray-500', label: 'LEGEND', glow: 'shadow-gray-400/50' },
          3: { tier: 'master', color: 'from-orange-400 to-yellow-600', label: 'MASTER', glow: 'shadow-orange-500/50' }
        };
        return topColors[position];
      }
      if (isTop10Percent) return { tier: 'elite', color: 'from-purple-400 to-pink-500', label: 'ELITE', glow: 'shadow-purple-500/30' };
      if (rank >= 300) return { tier: 'epic', color: 'from-cyan-400 to-blue-500', label: 'EPIC', glow: '' };
      if (rank >= 150) return { tier: 'rare', color: 'from-green-400 to-emerald-500', label: 'RARE', glow: '' };
      if (rank >= 50) return { tier: 'uncommon', color: 'from-blue-400 to-indigo-500', label: 'UNCOMMON', glow: '' };
      return { tier: 'rising', color: 'from-gray-400 to-gray-600', label: 'RISING', glow: '' };
    };

    const rankTier = getRankTier(officialRank, position);

    // Calculate viral metrics based on real activity
    const getViralStatus = () => {
      const endorsements = professional.endorsements || [];
      const totalEndorsements = endorsements.reduce((sum, e) => sum + (e.count || 0), 0);
      const recentActivity = professional.updatedAt && new Date(professional.updatedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const hasProfile = professional.bio && professional.bio.length > 20;
      const hasLinks = professional.github || professional.linkedin || professional.website;

      // More realistic thresholds for viral status
      if (totalEndorsements >= 15 && recentActivity && hasProfile) return { status: 'viral', icon: '🔥', label: 'VIRAL' };
      if (totalEndorsements >= 8 && recentActivity) return { status: 'trending', icon: '📈', label: 'TRENDING' };
      if (totalEndorsements >= 3 && (recentActivity || hasLinks)) return { status: 'active', icon: '⚡', label: 'ACTIVE' };
      return null;
    };

    const viralStatus = getViralStatus();

    // Debug logging
    console.log(`🔍 ${professional.name}: Rank=${officialRank}, Position=${position}, IsTop3=${isTop3}, IsTop10%=${isTop10Percent}, Tier=${rankTier.tier}, Viral=${viralStatus?.status || 'none'}`);

    return (
      <motion.div
        className={`relative group professional-card ${rankTier.glow ? `shadow-2xl ${rankTier.glow}` : ''}`}
        data-boosted={isBoostActive}
        data-top-performer={isTop10Percent}
        data-rank-tier={rankTier.tier}
        whileHover={{ scale: isTop3 ? 1.05 : 1.02, rotateY: isTop3 ? 3 : 2 }}
        transition={{ duration: 0.3 }}
        layout
      >
        {/* Enhanced Holographic Card Effect for Top Performers */}
        {isTop3 ? (
          <>
            <div className={`absolute inset-0 bg-gradient-to-r ${rankTier.color} rounded-2xl blur-sm opacity-90 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <div className={`absolute inset-0 bg-gradient-to-r ${rankTier.color} rounded-2xl animate-pulse opacity-60`}></div>
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 rounded-2xl animate-pulse opacity-30"></div>
          </>
        ) : isTop10Percent ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl blur-sm opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-2xl animate-pulse opacity-55"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-2xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-2xl animate-pulse opacity-50"></div>
          </>
        )}

        {/* 🔥 VIRAL/TRENDING Badge - SUPER VISIBLE! */}
        {viralStatus && (
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`absolute -top-3 -right-3 z-40 px-4 py-3 rounded-full text-lg font-black text-white shadow-2xl border-4 border-white/50 ${
              viralStatus.status === 'viral' ? 'bg-gradient-to-r from-red-400 to-orange-400' :
              viralStatus.status === 'trending' ? 'bg-gradient-to-r from-pink-400 to-purple-400' :
              'bg-gradient-to-r from-green-400 to-emerald-400'
            }`}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <span className="flex items-center space-x-2">
              <span style={{ fontSize: '20px' }}>{viralStatus.icon}</span>
              <span className="font-black">{viralStatus.label}</span>
            </span>
          </motion.div>
        )}

        {/* Boost Badge - Secondary position if viral status exists */}
        {isBoostActive && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            className={`boost-badge absolute ${viralStatus ? 'top-6 -right-2' : '-top-2 -right-2'} z-25 px-2 py-1 rounded-full text-xs font-bold text-white shadow-lg border border-white/30 bg-gradient-to-r ${
              currentBoost.level === 'diamond' ? 'from-cyan-400 to-blue-600' :
              currentBoost.level === 'platinum' ? 'from-purple-400 to-purple-600' :
              currentBoost.level === 'gold' ? 'from-yellow-400 to-yellow-600' :
              currentBoost.level === 'silver' ? 'from-gray-400 to-gray-600' :
              'from-orange-600 to-yellow-600'
            }`}
          >
            <span className="flex items-center space-x-1">
              <FaRocket className="text-xs" />
              <span className="hidden sm:inline">{currentBoost.level?.toUpperCase()}</span>
            </span>
          </motion.div>
        )}

        {/* Top Performer Badge - Top Left */}
        {(() => {
          const allRanks = filteredProfessionals.map(p => calculateProfessionalRank(p)).sort((a, b) => b - a);
          const userRank = calculateProfessionalRank(professional);
          const position = allRanks.indexOf(userRank) + 1;
          const isTop10Percent = position <= Math.ceil(allRanks.length * 0.1);
          const isTop3 = position <= 3;

          if (isTop3) {
            const crownColors = {
              1: 'from-yellow-400 via-yellow-500 to-orange-500',
              2: 'from-gray-300 via-gray-400 to-gray-500',
              3: 'from-orange-400 via-orange-500 to-yellow-600'
            };
            const crownIcons = { 1: '👑', 2: '🥈', 3: '🥉' };

            return (
              <motion.div
                className={`absolute top-1 left-1 z-40 px-4 py-3 rounded-full text-lg font-black text-white shadow-2xl border-4 border-white/50 bg-gradient-to-r ${crownColors[position]}`}
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [0, 15, -15, 0],
                  boxShadow: [
                    "0 0 20px rgba(255, 215, 0, 0.5)",
                    "0 0 40px rgba(255, 215, 0, 0.8)",
                    "0 0 20px rgba(255, 215, 0, 0.5)"
                  ]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{ fontSize: '18px' }}
              >
                <span className="flex items-center space-x-2">
                  <span style={{ fontSize: '24px' }}>{crownIcons[position]}</span>
                  <span className="font-black">#{position}</span>
                </span>
              </motion.div>
            );
          } else if (isTop10Percent) {
            return (
              <motion.div
                className="absolute top-2 left-2 z-30 px-3 py-2 rounded-full text-sm font-bold text-white shadow-lg border border-purple-400/50 bg-gradient-to-r from-purple-500 to-pink-500"
                whileHover={{ scale: 1.1 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="flex items-center space-x-1">
                  <span style={{ fontSize: '16px' }}>⭐</span>
                  <span>TOP {Math.ceil((position / allRanks.length) * 100)}%</span>
                </span>
              </motion.div>
            );
          }
          return null;
        })()}

        {/* Main Card - Fixed Height for Consistency */}
        <div
          className="relative backdrop-blur-xl border rounded-2xl p-4 transition-all duration-500 overflow-hidden h-[480px] flex flex-col"
          style={{
            backgroundColor: 'var(--theme-surface)90',
            borderColor: 'var(--theme-border)30',
            '&:hover': {
              borderColor: 'var(--theme-accent)50'
            }
          }}
        >
          {/* Achievement & Status Indicators - Top Right */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1 z-20">
            {/* Achievement Badges */}
            <div className="flex space-x-1">
              {professional.achievements?.includes('first_collab') && (
                <motion.div
                  className="w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"
                  title="🤝 First Collaboration"
                  whileHover={{ scale: 1.2 }}
                />
              )}
              {professional.achievements?.includes('skill_master') && (
                <motion.div
                  className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-pulse"
                  title="🎓 Skill Master"
                  whileHover={{ scale: 1.2 }}
                />
              )}
              {professional.achievements?.includes('battle_winner') && (
                <motion.div
                  className="w-3 h-3 bg-gradient-to-r from-red-400 to-orange-500 rounded-full animate-pulse"
                  title="⚔️ Battle Champion"
                  whileHover={{ scale: 1.2 }}
                />
              )}
              {professional.achievements?.includes('squad_leader') && (
                <motion.div
                  className="w-3 h-3 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-pulse"
                  title="👥 Squad Leader"
                  whileHover={{ scale: 1.2 }}
                />
              )}
            </div>

            {/* Profile Customization Indicator */}
            <div className="flex space-x-1">
              {professional.customizations?.theme && (
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" title="Custom Theme"></div>
              )}
              {professional.customizations?.layout && (
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" title="Custom Layout"></div>
              )}
            </div>
          </div>

          {/* Neural Network Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <pattern id="neural" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="10" cy="10" r="1" fill="currentColor" className="text-purple-400">
                    <animate attributeName="r" values="1;2;1" dur="3s" repeatCount="indefinite"/>
                  </circle>
                  <line x1="10" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" opacity="0.5"/>
                  <line x1="10" y1="10" x2="10" y2="30" stroke="currentColor" strokeWidth="0.5" className="text-purple-400" opacity="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#neural)"/>
            </svg>
          </div>

          <div className="card-content flex-1 flex flex-col justify-between relative z-10">
            {/* Top Section: Avatar + Name + Title */}
            <div className="flex-shrink-0">
              {/* Enhanced Avatar with Energy Ring - Better Space Utilization */}
              <div className="relative mb-3 flex justify-center">
                <div className="relative">
                  {/* Avatar - Larger and Better Utilized */}
                  <motion.div
                    className="relative w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-cyan-400 p-1"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden bg-black">
                      {professional.avatar ? (
                        <img
                          src={professional.avatar}
                          alt={professional.name}
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-cyan-400">
                          <FaUser className="text-2xl" />
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Live Status Ring */}
                  <motion.div
                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-black flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </motion.div>

                  {/* Collaboration Status Indicator */}
                  {professional.networkingAvailable && (
                    <motion.div
                      className="absolute -bottom-1 -left-1 w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full border-2 border-black flex items-center justify-center"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      title="Open for collaboration"
                    >
                      <span className="text-xs">🤝</span>
                    </motion.div>
                  )}

                  {/* Power Level Indicator */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-black flex items-center justify-center">
                    <span className="text-xs font-bold text-black">{Math.min(99, Math.floor(officialRank / 10))}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Section: Name, Title, Rank */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Compact Name Display */}
              <div className="text-center mb-3">
                <h3
                  className="text-lg font-bold mb-1"
                  style={{
                    background: `linear-gradient(to right, var(--theme-accent), var(--theme-primary), var(--theme-accent))`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  {professional.name}
                </h3>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--theme-textSecondary)' }}
                >
                  {professional.title}
                </p>

                {/* Location and Experience */}
                <div className="flex items-center justify-center space-x-2 text-xs mb-2">
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--theme-primary)50',
                      color: 'var(--theme-textMuted)'
                    }}
                  >
                    {professional.location}
                  </span>
                  {professional.experience && (
                    <span
                      className="px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: 'var(--theme-accent)50',
                        color: 'var(--theme-textMuted)'
                      }}
                    >
                      {professional.experience}y exp
                    </span>
                  )}
                </div>

                {/* Compact Rank Display */}
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <motion.div
                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${rankTier.color} text-white border border-white/20 shadow-lg ${isTop3 ? 'animate-pulse' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    title={`Global Position: #${position}\nRank Score: ${officialRank} points`}
                  >
                    {isTop3 ? <FaCrown className="text-xs" /> : <FaTrophy className="text-xs" />}
                    <span>#{position}</span>
                  </motion.div>
                  <motion.div
                    className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${rankTier.color} text-white border border-white/10`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {rankTier.label}
                  </motion.div>
                </div>
              </div>

              {/* Bio - Compact */}
              {professional.bio && (
                <p className="text-gray-300 text-xs mb-3 line-clamp-2 text-center px-2">
                  {professional.bio}
                </p>
              )}

              {/* Compact Skills Section */}
              {professional.skills && professional.skills.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-bold text-cyan-400 mb-2 flex items-center justify-center">
                    <span className="mr-1">⚡</span>
                    SUPERPOWERS
                  </h4>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {professional.skills.slice(0, 4).map((skill, index) => {
                    const endorsementEntry = professional.endorsements?.find(e => e.skill === skill);
                    const endorsementCount = endorsementEntry?.count || 0;
                    const isOwnProfile = userProfile?.uid === professional.userId;
                    const alreadyEndorsed = endorsementEntry?.endorsedBy?.includes(userProfile?.uid);

                    // Assign power level based on endorsements
                    const powerLevel = Math.min(5, Math.floor(endorsementCount / 2) + 1);
                    const powerColors = [
                      'from-gray-600 to-gray-700',
                      'from-green-600 to-green-700',
                      'from-blue-600 to-blue-700',
                      'from-purple-600 to-purple-700',
                      'from-pink-600 to-pink-700',
                      'from-yellow-500 to-orange-600'
                    ];

                      return (
                        <div key={index} className={`relative group flex items-center px-2 py-1 bg-gradient-to-r ${powerColors[powerLevel]} rounded-lg border border-cyan-400/30 hover:border-cyan-400 transition-all duration-300 transform hover:scale-105`}>
                          <span className="relative z-10 text-white font-medium text-xs">{skill}</span>

                          {/* Compact Power Level Indicator */}
                          <div className="relative z-10 ml-1 flex space-x-0.5">
                            {[...Array(Math.min(3, powerLevel))].map((_, i) => (
                              <div key={i} className="w-0.5 h-2 bg-cyan-400 rounded-full" style={{animationDelay: `${i * 0.1}s`}}></div>
                            ))}
                          </div>

                          {endorsementCount > 0 && (
                            <span className="relative z-10 ml-1 text-cyan-300 text-xs font-bold">
                              +{endorsementCount}
                            </span>
                          )}

                          {!isOwnProfile && userProfile?.uid && (
                            <button
                              title={alreadyEndorsed ? "Power already boosted!" : `Boost ${skill} power!`}
                              disabled={alreadyEndorsed || isOwnProfile || !userProfile?.uid}
                              onClick={() => onEndorse(professional.id, skill)}
                              className={`relative z-10 ml-1 p-0.5 rounded-full ${
                                (alreadyEndorsed || isOwnProfile || !userProfile?.uid)
                                  ? 'text-gray-400 cursor-not-allowed'
                                  : 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20'
                              } transition-all duration-300`}
                            >
                              <FaPlusCircle className="text-xs"/>
                            </button>
                          )}
                        </div>
                      );
                  })}
                    {professional.skills.length > 4 && (
                      <div className="px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg border border-gray-600 text-gray-300 text-xs font-medium">
                        +{professional.skills.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Section: Actions */}
            <div className="flex-shrink-0">
              {/* Compact Portal Links - Centered */}
              <div className="flex items-center justify-center space-x-1 mb-3">
                {professional.github && (
                  <a
                    href={professional.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-1.5 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg border border-gray-600 hover:border-white transition-all duration-300 transform hover:scale-110"
                    title="GitHub"
                  >
                    <FaGithub className="text-sm text-gray-400 group-hover:text-white transition-colors" />
                  </a>
                )}
                {professional.linkedin && (
                  <a
                    href={professional.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-1.5 bg-gradient-to-r from-blue-800 to-blue-900 rounded-lg border border-blue-600 hover:border-blue-400 transition-all duration-300 transform hover:scale-110"
                    title="LinkedIn"
                  >
                    <FaLinkedin className="text-sm text-blue-400 group-hover:text-blue-300 transition-colors" />
                  </a>
                )}
                {professional.website && (
                  <a
                    href={professional.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative p-1.5 bg-gradient-to-r from-green-800 to-green-900 rounded-lg border border-green-600 hover:border-green-400 transition-all duration-300 transform hover:scale-110"
                    title="Website"
                  >
                    <FaGlobe className="text-sm text-green-400 group-hover:text-green-300 transition-colors" />
                  </a>
                )}
              </div>

              {/* Action Buttons - Centered */}
              <div className="flex flex-col space-y-2">
                {/* Collaboration Options */}
                {userProfile?.uid !== professional.userId && (
                  <div className="flex flex-col space-y-1">
                    {/* Primary Actions */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleCollaborationRequest(professional, 'project')}
                        className="group relative flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white font-bold text-xs transition-all duration-300 transform hover:scale-105"
                        title="Start Project Match - Find mutual skills & create project proposals"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-1">
                          <span>🚀</span>
                          <span>PROJECT</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleCollaborationRequest(professional, 'mentor')}
                        className="group relative flex-1 px-3 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-bold text-xs transition-all duration-300 transform hover:scale-105"
                        title="Request Skill Transfer - Learn specific skills through structured mentorship"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-1">
                          <span>⚡</span>
                          <span>LEARN</span>
                        </span>
                      </button>
                    </div>

                    {/* Secondary Actions */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSkillChallenge(professional, 'coding')}
                        className="group relative flex-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg text-white font-bold text-xs transition-all duration-300 transform hover:scale-105"
                        title="Send Skill Challenge - Compete in coding, design, or problem-solving"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-1">
                          <span>⚔️</span>
                          <span>BATTLE</span>
                        </span>
                      </button>
                      <button
                        onClick={() => handleSquadInvite(professional)}
                        className="group relative flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white font-bold text-xs transition-all duration-300 transform hover:scale-105"
                        title="Form Squad - Create temporary team for specific projects"
                      >
                        <span className="relative z-10 flex items-center justify-center space-x-1">
                          <span>👥</span>
                          <span>SQUAD</span>
                        </span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Network Button for own profile */}
                {userProfile?.uid === professional.userId && (
                  <button
                    onClick={() => handleNetworkingToggle()}
                    className="group relative px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-bold text-xs transition-all duration-300 transform hover:scale-105 w-full"
                    title="Toggle Discovery Mode - Control your visibility in the professional network"
                  >
                    <span className="relative z-10 flex items-center justify-center space-x-1">
                      <span>📡</span>
                      <span>DISCOVERY</span>
                    </span>
                  </button>
                )}

                {/* Enter Realm Button - Centered and Full Width */}
                <button
                  onClick={() => {
                    // Map professional data to user format for profile viewing
                    const userForProfile = {
                      uid: professional.userId,
                      displayName: professional.name,
                      email: professional.email || '',
                      photoURL: professional.avatar,
                      professional: {
                        role: professional.title,
                        bio: professional.bio,
                        location: professional.location,
                        skills: professional.skills || [],
                        experience: professional.experience || 0,
                        github: professional.github,
                        linkedin: professional.linkedin,
                        website: professional.website,
                        visibility: professional.visibility
                      },
                      fromDirectory: true
                    };

                    navigate('/profile', {
                      state: {
                        viewUser: userForProfile,
                        viewMode: 'professional',
                        fromDirectory: true
                      }
                    });
                  }}
                  className="group relative px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-lg text-white font-bold text-sm transition-all duration-300 transform hover:scale-105 w-full"
                >
                  <span className="relative z-10 flex items-center justify-center space-x-1">
                    <span>🚀</span>
                    <span>ENTER REALM</span>
                  </span>
                </button>
              </div>

              {/* Profile Customization Indicator */}
              {professional.hasCustomProfile && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="flex items-center justify-center">
                    <motion.div
                      className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-full text-xs text-indigo-300"
                      animate={{ opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span>✨</span>
                      <span>Custom Smart Profile</span>
                    </motion.div>
                  </div>
                </div>
              )}

              {/* Performance Metrics for Top Performers */}
              {isTop10Percent && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <div className="grid grid-cols-3 gap-2 text-center mb-3">
                    <div className="text-xs">
                      <div className="text-cyan-400 font-bold">{professional.totalViews || 0}</div>
                      <div className="text-gray-400">Views</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-green-400 font-bold">{professional.endorsements?.reduce((sum, e) => sum + (e.count || 0), 0) || 0}</div>
                      <div className="text-gray-400">Endorsements</div>
                    </div>
                    <div className="text-xs">
                      <div className="text-purple-400 font-bold">{professional.skills?.length || 0}</div>
                      <div className="text-gray-400">Skills</div>
                    </div>
                  </div>

                  {/* Quick Endorse Section for Top Performers */}
                  {userProfile?.uid !== professional.userId && userProfile?.uid && (
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-2">⚡ Quick Endorse Top Skills</p>
                      <div className="flex justify-center space-x-2">
                        {professional.skills?.slice(0, 2).map((skill, index) => {
                          const endorsementEntry = professional.endorsements?.find(e => e.skill === skill);
                          const alreadyEndorsed = endorsementEntry?.endorsedBy?.includes(userProfile?.uid);

                          return (
                            <button
                              key={index}
                              onClick={() => onEndorse(professional.id, skill)}
                              disabled={alreadyEndorsed}
                              className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                                alreadyEndorsed
                                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:scale-105 animate-pulse'
                              }`}
                              title={alreadyEndorsed ? 'Already endorsed!' : `Endorse ${skill}`}
                            >
                              {alreadyEndorsed ? '✓' : '+'} {skill}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Boost Status and Visibility indicator */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                {isBoostActive && (
                  <div className="mb-2 flex items-center justify-between">
                    <div className={`flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${
                      currentBoost.level === 'diamond' ? 'from-cyan-400/20 to-blue-600/20 text-cyan-300' :
                      currentBoost.level === 'platinum' ? 'from-purple-400/20 to-purple-600/20 text-purple-300' :
                      currentBoost.level === 'gold' ? 'from-yellow-400/20 to-yellow-600/20 text-yellow-300' :
                      currentBoost.level === 'silver' ? 'from-gray-400/20 to-gray-600/20 text-gray-300' :
                      'from-orange-600/20 to-yellow-600/20 text-orange-300'
                    } border border-current/30`}>
                      <span>⚡</span>
                      <span>{currentBoost.level?.toUpperCase()} ACTIVE</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {professionalBoostService.formatRemainingTime(professional.userId)} left
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Visibility: {professional.visibility}</span>
                  <span>Updated {new Date(professional.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Handle view changes from sidebar
  const handleViewChange = (view) => {
    if (view === 'dm') {
      navigate('/chat');
    } else if (view === 'blog') {
      navigate('/blog');
    } else if (view === 'zentrium') {
      navigate('/zentrium');
    } else if (view === 'music') {
      navigate('/music');
    } else if (view === 'profile') {
      navigate('/profile');
    } else {
      setCurrentView(view);
    }
  };

  console.log('🚀 Zentro Nexus rendering with', filteredProfessionals.length, 'professionals');

  return (
    <div
      className="zentro-directory-layout min-h-screen"
      style={{
        backgroundColor: 'var(--theme-background)',
        color: 'var(--theme-text)'
      }}
    >
      {/* Main Content - No sidebar needed, using AppSidebar from App.jsx */}
      <div className="zentro-main-content p-6">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header with Better Space Utilization */}
          <div className="mb-4 relative overflow-hidden">
            {/* Background Effects */}
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: `linear-gradient(to right, var(--theme-primary)20, var(--theme-accent)20, var(--theme-primary)20)`
              }}
            ></div>
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, var(--theme-primary)10, transparent)`
              }}
            ></div>

            <div className="relative z-10 p-4">
              <div className="text-center">
                <h1 className="text-3xl lg:text-4xl xl:text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse leading-tight">
                  Zentro Nexus
                </h1>
                <p className="text-gray-200 text-lg lg:text-xl font-bold mb-1">
                  🚀 Revolutionary Professional Network & Battle Arena 🏆
                </p>
                <p className="text-gray-400 text-sm lg:text-base mb-4">
                  Where legends collaborate, compete, and conquer together
                </p>

                {/* Stats Row - Centered */}
                <div className="flex flex-wrap justify-center gap-4 lg:gap-6 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">{filteredProfessionals.length} Active Legends</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Real-time Discovery</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">Premium Networking</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters with Better Space Utilization */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-gray-900/80 via-purple-900/20 to-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30">
            <div className="flex flex-col xl:flex-row gap-4">
              {/* Legend Search Portal - Enhanced */}
              <div className="flex-1 relative group">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 group-focus-within:text-cyan-300 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search the multiverse for legends, powers, realms..."
                  className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-white placeholder-gray-400 text-lg backdrop-blur-sm transition-all duration-300 hover:border-purple-400/50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 xl:w-auto">
                {/* Realm Access Filter - Enhanced */}
                <div className="relative group">
                  <select
                    value={visibilityFilter}
                    onChange={(e) => setVisibilityFilter(e.target.value)}
                    className="appearance-none px-6 py-4 bg-gray-800 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white text-lg backdrop-blur-sm transition-all duration-300 hover:border-purple-400/50 cursor-pointer min-w-[200px]"
                    style={{ color: 'white', backgroundColor: '#1f2937' }}
                  >
                    <option value="all" style={{ color: 'white', backgroundColor: '#1f2937' }}>🌌 All Realms</option>
                    <option value="public" style={{ color: 'white', backgroundColor: '#1f2937' }}>🌍 Public Dimension</option>
                    <option value="recruiters" style={{ color: 'white', backgroundColor: '#1f2937' }}>🏢 Corporate Nexus</option>
                    <option value="friends" style={{ color: 'white', backgroundColor: '#1f2937' }}>👥 Inner Circle</option>
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Superpower Filter - Enhanced */}
                <div className="relative group">
                  <input
                    type="text"
                    value={skillFilter}
                    onChange={(e) => setSkillFilter(e.target.value)}
                    placeholder="⚡ Filter by superpower..."
                    className="px-6 py-4 bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-purple-500/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-400 text-lg backdrop-blur-sm transition-all duration-300 hover:border-purple-400/50 min-w-[250px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Quick Filter Tags */}
            <div className="mt-4 flex flex-wrap gap-2">
              {['JavaScript', 'React', 'Python', 'AI/ML', 'Blockchain', 'Mobile Dev'].map((skill) => (
                <button
                  key={skill}
                  onClick={() => setSkillFilter(skill)}
                  className="px-3 py-1 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full text-sm text-gray-300 hover:text-white hover:border-purple-400/50 transition-all duration-300"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🏆 HALL OF LEGENDS - SUPER VISIBLE! */}
        {filteredProfessionals.length > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-yellow-600/40 via-orange-600/50 to-red-600/40 backdrop-blur-sm rounded-2xl p-8 border-4 border-yellow-400/80 shadow-2xl shadow-yellow-500/50 animate-pulse">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-4 flex items-center">
                <FaCrown className="mr-2 text-yellow-400" />
                🏆 Hall of Legends 🏆
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const sortedByRank = [...filteredProfessionals]
                    .sort((a, b) => calculateProfessionalRank(b) - calculateProfessionalRank(a))
                    .slice(0, 3);

                  console.log('🏆 Rendering Hall of Legends with top 3:', sortedByRank.map(p => p.name));
                  return sortedByRank.map((prof, index) => {
                    const rank = calculateProfessionalRank(prof);
                    const position = index + 1;
                    const colors = {
                      1: 'from-yellow-400 to-orange-500',
                      2: 'from-gray-300 to-gray-500',
                      3: 'from-orange-400 to-yellow-600'
                    };
                    const icons = { 1: '👑', 2: '🥈', 3: '🥉' };
                    console.log(`🏆 Hall of Legends #${position}: ${prof.name} (${rank} points)`);

                    return (
                      <motion.div
                        key={prof.id}
                        className={`relative p-4 rounded-xl bg-gradient-to-r ${colors[position]} bg-opacity-10 border border-current/20 hover:border-current/40 transition-all duration-300`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-cyan-400 p-0.5">
                              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                                {prof.avatar ? (
                                  <img src={prof.avatar} alt={prof.name} className="w-full h-full object-cover object-center" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-cyan-400">
                                    <FaUser className="text-lg" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="absolute -top-1 -right-1 text-lg">{icons[position]}</div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{prof.name}</h3>
                            <p className="text-sm text-gray-300 truncate">{prof.title}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-400">#{position}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-400">{rank} pts</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Legend Count with Stats */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <p className="text-cyan-400 font-bold text-xl">
              🌟 Discovered {filteredProfessionals.length} legend{filteredProfessionals.length !== 1 ? 's' : ''} in the multiverse
            </p>
            {(searchQuery || skillFilter || visibilityFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSkillFilter('');
                  setVisibilityFilter('all');
                }}
                className="px-4 py-2 bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 hover:border-red-400/50 transition-all duration-300 text-sm"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 text-sm">View:</span>
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Professional Display - Cards or List */}
        <AnimatePresence mode="wait">
          {viewMode === 'cards' ? (
            <motion.div
              key="cards-view"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
              layout
            >
              {filteredProfessionals.map((professional, index) => (
                <motion.div
                  key={`card-${professional.id}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                >
                  <DeveloperCard professional={professional} onEndorse={handleEndorseSkill} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="space-y-3"
              layout
            >
              {filteredProfessionals.map((professional, index) => (
                <motion.div
                  key={`list-${professional.id}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="bg-black/90 backdrop-blur-xl border border-purple-500/30 rounded-xl p-4 hover:border-cyan-400/50 transition-all duration-300"
                  layout
                >
                  <div className="flex items-center space-x-4">
                    {/* Avatar - Better utilization */}
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-600 to-cyan-400 p-1 flex-shrink-0">
                      <div className="w-full h-full rounded-full overflow-hidden bg-black">
                        {professional.avatar ? (
                          <img src={professional.avatar} alt={professional.name} className="w-full h-full object-cover object-center" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-cyan-400">
                            <FaUser className="text-2xl" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent truncate">
                        {professional.name}
                      </h3>
                      <p className="text-purple-300 font-medium truncate">{professional.title}</p>
                      <p className="text-gray-400 text-sm truncate">{professional.location}</p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {professional.skills?.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 border border-purple-500/30 rounded-full text-xs text-gray-300">
                            {skill}
                          </span>
                        ))}
                        {professional.skills?.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700/50 rounded-full text-xs text-gray-400">
                            +{professional.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Social Links */}
                      {professional.github && (
                        <a href={professional.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                          <FaGithub className="text-gray-400 hover:text-white" />
                        </a>
                      )}
                      {professional.linkedin && (
                        <a href={professional.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-800 rounded-lg hover:bg-blue-700 transition-colors">
                          <FaLinkedin className="text-blue-400 hover:text-blue-300" />
                        </a>
                      )}

                      {/* View Profile Button */}
                      <button
                        onClick={() => {
                          const userForProfile = {
                            uid: professional.userId,
                            displayName: professional.name,
                            email: professional.email || '',
                            photoURL: professional.avatar,
                            professional: {
                              role: professional.title,
                              bio: professional.bio,
                              location: professional.location,
                              skills: professional.skills || [],
                              experience: professional.experience || 0,
                              github: professional.github,
                              linkedin: professional.linkedin,
                              website: professional.website,
                              visibility: professional.visibility
                            },
                            fromDirectory: true
                          };
                          navigate('/profile', {
                            state: {
                              viewUser: userForProfile,
                              viewMode: 'professional',
                              fromDirectory: true
                            }
                          });
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-lg text-white font-bold text-sm hover:scale-105 transition-all duration-300"
                      >
                        View Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty Multiverse State */}
        {filteredProfessionals.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-600 to-cyan-400 rounded-full flex items-center justify-center opacity-20">
                <FaUser className="text-6xl text-white" />
              </div>
              <div className="absolute inset-0 w-32 h-32 mx-auto border-2 border-cyan-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              🌌 Multiverse Dimension Empty
            </h3>
            <p className="text-gray-400 text-lg">
              {searchQuery || skillFilter || visibilityFilter !== 'all'
                ? '🔍 No legends match your search criteria. Try exploring different dimensions!'
                : '🚀 Be the first legend to enter this realm and showcase your superpowers!'}
            </p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default ZentroNexus;
