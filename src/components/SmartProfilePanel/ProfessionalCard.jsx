import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaBriefcase, FaMapMarkerAlt, FaGithub, FaLinkedin, FaGlobe, FaUserShield, FaUserFriends, FaCommentDots, FaCrown, FaStar, FaFire, FaBolt, FaGem, FaTrophy, FaRocket, FaShieldAlt } from 'react-icons/fa';
import firebaseChatService from '../../services/firebaseChat';
import { useUser } from '../../contexts/UserContext';
import realAchievementService from '../../services/realAchievementService';

/**
 * ZentroVerse Nexus Professional Card - Premium Gaming-Style Profile Card
 *
 * Features:
 * - Premium gaming-style design with holographic effects
 * - Dynamic rarity system based on user level and achievements
 * - Animated borders, glitch effects, and particle systems
 * - Professional information displayed in gaming UI style
 * - Perfect for the ZentroVerse professional directory
 */
const ProfessionalCard = ({ user, onViewProfile, className = "" }) => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const [glitchEffect, setGlitchEffect] = useState(false);

  // Trigger glitch effect periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 8000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const { professional = {} } = user;

  // Calculate user level based on experience and skills
  const calculateLevel = () => {
    const baseExp = professional.experience || 0;
    const skillsBonus = (professional.skills?.length || 0) * 5;
    const endorsementsBonus = (Array.isArray(professional.endorsements)
      ? professional.endorsements.reduce((acc, e) => acc + (e.count || 0), 0)
      : 0) * 2;
    return Math.floor((baseExp + skillsBonus + endorsementsBonus) / 10) + 1;
  };

  const userLevel = calculateLevel();
  const isLegendary = userLevel >= 50;
  const isEpic = userLevel >= 30;
  const isRare = userLevel >= 15;

  const handleSendMessage = async () => {
    if (!userProfile?.uid) {
      alert('Please log in to send messages.');
      return;
    }

    if (userProfile.uid === user.uid) {
      alert('You cannot send a message to yourself.');
      return;
    }

    try {
      console.log('🔄 Starting chat with:', user.displayName);

      // Create or get the chat room
      const chatId = await firebaseChatService.createChatRoom(userProfile.uid, user.uid);

      // Format the chat data for navigation
      const selectedChat = {
        id: chatId,
        otherUser: {
          id: user.uid,
          name: user.displayName,
          avatar: user.photoURL,
          email: user.email,
          online: true
        },
        participants: [userProfile.uid, user.uid]
      };

      console.log('✅ Navigating to chat:', selectedChat);

      // Navigate to chat with the selected user
      navigate('/chat', { state: { selectedChat } });
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  // Get achievement badges using the achievement service
  const achievementBadges = []; // Temporarily disabled - will integrate with real achievement system

  // Dynamic card styling based on rarity
  const getCardStyle = () => {
    if (isLegendary) {
      return {
        background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #ffd700 50%, #ff6b35 75%, #f7931e 100%)',
        borderColor: '#ffd700',
        glowColor: 'rgba(255, 215, 0, 0.6)',
        animation: 'legendary-pulse 2s ease-in-out infinite alternate'
      };
    } else if (isEpic) {
      return {
        background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 25%, #c084fc 50%, #8b5cf6 75%, #a855f7 100%)',
        borderColor: '#a855f7',
        glowColor: 'rgba(168, 85, 247, 0.5)',
        animation: 'epic-pulse 2.5s ease-in-out infinite alternate'
      };
    } else if (isRare) {
      return {
        background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 25%, #0e7490 50%, #06b6d4 75%, #0891b2 100%)',
        borderColor: '#06b6d4',
        glowColor: 'rgba(6, 182, 212, 0.4)',
        animation: 'rare-pulse 3s ease-in-out infinite alternate'
      };
    }
    return {
      background: 'linear-gradient(135deg, #1f2937 0%, #374151 25%, #4b5563 50%, #1f2937 75%, #374151 100%)',
      borderColor: '#6b7280',
      glowColor: 'rgba(107, 114, 128, 0.3)',
      animation: 'common-pulse 4s ease-in-out infinite alternate'
    };
  };

  const cardStyle = getCardStyle();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20, rotateY: -15 }}
        animate={{ opacity: 1, y: 0, rotateY: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        whileHover={{
          scale: 1.05,
          rotateY: 5,
          transition: { duration: 0.3 }
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group ${className} ${glitchEffect ? 'animate-pulse' : ''}`}
        style={{
          background: cardStyle.background,
          backgroundSize: '400% 400%',
          animation: `${cardStyle.animation}, holographic 6s ease infinite`,
          border: `2px solid ${cardStyle.borderColor}`,
          boxShadow: `0 0 20px ${cardStyle.glowColor}, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
        }}
      >

        {/* Holographic Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 translate-x-full group-hover:translate-x-[-100%] transition-transform duration-1000"></div>

        {/* Rarity Badge */}
        <div className="absolute top-4 right-4 z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
              isLegendary ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' :
              isEpic ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
              isRare ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white' :
              'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-200'
            }`}
          >
            {isLegendary && <FaCrown className="text-yellow-200" />}
            {isEpic && <FaGem className="text-purple-200" />}
            {isRare && <FaStar className="text-cyan-200" />}
            {!isRare && <FaShieldAlt className="text-gray-300" />}
            <span>LVL {userLevel}</span>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="relative p-6">
          {/* Profile Section */}
          <div className="flex items-start space-x-4 mb-6">
            {/* Avatar with Premium Frame */}
            <div className="relative">
              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-black">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-2xl font-bold ${
                    isLegendary ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white' :
                    isEpic ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' :
                    isRare ? 'bg-gradient-to-br from-cyan-400 to-blue-500 text-white' :
                    'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200'
                  }`}>
                    {user.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
              </div>

              {/* Status Indicators */}
              <div className="absolute -bottom-1 -right-1 flex space-x-1">
                <div className="w-5 h-5 bg-green-500 rounded-full border-2 border-black flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                {isLegendary && (
                  <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-2 border-black flex items-center justify-center">
                    <FaFire className="text-white text-xs" />
                  </div>
                )}
              </div>
            </div>

            {/* Name & Info */}
            <div className="flex-1 min-w-0">
              {/* Name with Glitch Effect */}
              <div className="relative mb-2">
                <h3 className={`text-xl font-bold mb-1 ${glitchEffect ? 'animate-pulse' : ''} ${
                  isLegendary ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500' :
                  isEpic ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600' :
                  isRare ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-600' :
                  'text-white'
                }`}>
                  {user.displayName}
                </h3>
                {glitchEffect && (
                  <h3 className="absolute inset-0 text-xl font-bold mb-1 text-red-500 opacity-50 transform translate-x-0.5 translate-y-0.5" style={{ animation: 'glitch 0.2s infinite' }}>
                    {user.displayName}
                  </h3>
                )}
              </div>

              {/* Title with Special Effects */}
              <p className={`font-semibold text-sm mb-2 ${
                isLegendary ? 'text-orange-300' :
                isEpic ? 'text-purple-300' :
                isRare ? 'text-cyan-300' :
                'text-gray-300'
              }`}>
                {professional.role || 'Professional'}
              </p>

              {/* Stats Row */}
              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1">
                  <FaMapMarkerAlt className="text-gray-400" />
                  <span className="text-gray-300">{professional.location || user.location || 'Remote'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaBriefcase className="text-gray-400" />
                  <span className="text-gray-300">{professional.experience || 0}y exp</span>
                </div>
              </div>
            </div>

            {/* ZennyCoins & Power Level - Premium Display */}
            <div className="flex flex-col items-end space-y-2 relative z-20">
              <motion.div
                animate={{ rotate: isHovered ? 360 : 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg relative z-30"
              >
                <span className="text-xs">💰</span>
                <span>{professional.zennyCoins || 0}</span>
              </motion.div>

              {/* Power Level */}
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold relative z-30 ${
                isLegendary ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' :
                isEpic ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' :
                isRare ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-200'
              }`}>
                <FaBolt className="text-[10px]" />
                <span>{Math.floor(userLevel * 100 + (professional.zennyCoins || 0) / 10)}</span>
              </div>
            </div>
          </div>

          {/* Achievement Badges - Premium Style */}
          {achievementBadges.length > 0 && (
            <div className="flex items-center space-x-2 mb-4">
              {achievementBadges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, type: "spring", stiffness: 200 }}
                  className={`flex items-center space-x-1 bg-gradient-to-r ${badge.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg border border-white/20`}
                >
                  <span className="text-sm">{badge.icon}</span>
                  <span>{badge.name}</span>
                </motion.div>
              ))}
            </div>
          )}

          {/* Skills - Gaming Style */}
          {professional.skills && professional.skills.length > 0 && (
            <div className="mb-4">
              <h4 className={`text-xs font-bold mb-2 flex items-center ${
                isLegendary ? 'text-orange-400' :
                isEpic ? 'text-purple-400' :
                isRare ? 'text-cyan-400' :
                'text-gray-400'
              }`}>
                <FaBolt className="mr-1" />
                ABILITIES
              </h4>
              <div className="flex flex-wrap gap-2">
                {professional.skills.slice(0, 4).map((skill, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${
                      isLegendary ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/40' :
                      isEpic ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/40' :
                      isRare ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40' :
                      'bg-gradient-to-r from-gray-600/20 to-gray-700/20 text-gray-300 border-gray-600/40'
                    }`}
                  >
                    {skill}
                  </motion.span>
                ))}
                {professional.skills.length > 4 && (
                  <span className="px-3 py-1 bg-gray-800/50 text-gray-400 text-xs rounded-full border border-gray-700/50 whitespace-nowrap">
                    +{professional.skills.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons - ZentroVerse Gaming Style */}
          <div className="flex items-center space-x-3">
            {/* Main Action Button */}
            <motion.button
              onClick={onViewProfile}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-1 flex items-center justify-center space-x-2 font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg transform ${
                isLegendary ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black shadow-orange-500/25' :
                isEpic ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-purple-500/25' :
                isRare ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/25' :
                'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-gray-500/25'
              }`}
            >
              <FaRocket className="text-sm" />
              <span>ENTER REALM</span>
            </motion.button>

            {/* Secondary Actions */}
            <div className="flex space-x-2">
              <motion.button
                onClick={handleSendMessage}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                title="Send Message"
              >
                <FaCommentDots className="text-sm" />
              </motion.button>

              {/* Social Links */}
              {professional.links?.github && (
                <motion.a
                  href={professional.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-gray-800/80 hover:bg-gray-700 text-gray-300 hover:text-white rounded-xl transition-all duration-300 shadow-lg"
                  title="GitHub"
                >
                  <FaGithub className="text-sm" />
                </motion.a>
              )}
              {professional.links?.linkedin && (
                <motion.a
                  href={professional.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-blue-600/80 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg"
                  title="LinkedIn"
                >
                  <FaLinkedin className="text-sm" />
                </motion.a>
              )}
            </div>
          </div>

          {/* Status Bar - Gaming Style */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                <span className="text-green-400 text-sm font-semibold">ONLINE</span>
              </div>

              {/* Visibility Status */}
              <div className="text-xs">
                {(user.visibility === 'public' || professional.visibility === 'public') && (
                  <div className="flex items-center space-x-1 text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                    <FaGlobe className="text-[10px]" />
                    <span>PUBLIC</span>
                  </div>
                )}
                {(user.visibility === 'recruiters' || professional.visibility === 'recruiters') && (
                  <div className="flex items-center space-x-1 text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
                    <FaUserShield className="text-[10px]" />
                    <span>RECRUITERS</span>
                  </div>
                )}
                {(user.visibility === 'friends' || professional.visibility === 'friends') && (
                  <div className="flex items-center space-x-1 text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                    <FaUserFriends className="text-[10px]" />
                    <span>FRIENDS</span>
                  </div>
                )}
              </div>
            </div>

            {/* Power Rating */}
            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold ${
              isLegendary ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-orange-300 border border-orange-500/30' :
              isEpic ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30' :
              isRare ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30' :
              'bg-gradient-to-r from-gray-600/20 to-gray-700/20 text-gray-300 border border-gray-600/30'
            }`}>
              <FaTrophy className="text-[10px]" />
              <span>RANK #{Math.floor(Math.random() * 1000) + 1}</span>
            </div>
          </div>
        </div>

        {/* Particle Effects */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: Math.random() * 300,
                    y: Math.random() * 200,
                    scale: 0
                  }}
                  animate={{
                    x: Math.random() * 300,
                    y: Math.random() * 200,
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                  className={`absolute w-1 h-1 rounded-full ${
                    isLegendary ? 'bg-yellow-400' :
                    isEpic ? 'bg-purple-400' :
                    isRare ? 'bg-cyan-400' :
                    'bg-gray-400'
                  }`}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default ProfessionalCard;
