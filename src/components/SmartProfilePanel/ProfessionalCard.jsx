import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaGithub, FaLinkedin, FaFileAlt, FaLink, FaEye, FaGlobe, FaUserShield, FaUserFriends, FaCommentDots } from 'react-icons/fa';
import firebaseChatService from '../../services/firebaseChat';
import { useUser } from '../../contexts/UserContext';

/**
 * ProfessionalCard - A compact recruitment-focused profile card
 *
 * Features:
 * - Compact design showing key professional information
 * - "View Profile" button that redirects to full professional profile
 * - Recruitment-friendly layout with skills, experience, and contact info
 * - Perfect for recruiters and startup founders to quickly assess candidates
 */
const ProfessionalCard = ({ user, onViewProfile, className = "" }) => {
  const navigate = useNavigate();
  const { userProfile } = useUser();

  if (!user) return null;

  const { professional = {} } = user;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg hover:shadow-purple-500/20 transition-all duration-300 ${className}`}
    >
      {/* Header with profile picture and basic info */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-16 h-16 rounded-full border-2 border-purple-500/30 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-2 border-purple-500/30 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user.displayName?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white truncate">{user.displayName}</h3>
            {/* Visibility Badge */}
            <div className="flex items-center space-x-1 text-xs">
              {user.visibility === 'public' && (
                <div className="flex items-center space-x-1 bg-green-600/20 text-green-400 px-2 py-1 rounded-full">
                  <FaGlobe className="text-xs" />
                  <span>Public</span>
                </div>
              )}
              {user.visibility === 'recruiters' && (
                <div className="flex items-center space-x-1 bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full">
                  <FaUserShield className="text-xs" />
                  <span>Recruiters</span>
                </div>
              )}
              {user.visibility === 'friends' && (
                <div className="flex items-center space-x-1 bg-purple-600/20 text-purple-400 px-2 py-1 rounded-full">
                  <FaUserFriends className="text-xs" />
                  <span>Friends</span>
                </div>
              )}
            </div>
          </div>
          <p className="text-purple-400 font-medium">{professional.role || 'Professional'}</p>
          <p className="text-gray-400 text-sm">{professional.industry || 'Technology'}</p>
          {user.location && (
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <FaMapMarkerAlt className="mr-1 text-xs" />
              <span>{user.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Bio */}
      {professional.bio && (
        <div className="mb-4">
          <p className="text-gray-300 text-sm line-clamp-3">
            {professional.bio}
          </p>
        </div>
      )}

      {/* Key Skills */}
      {professional.skills && professional.skills.length > 0 && (
        <div className="mb-3">
          <h4 className="text-white font-medium text-sm mb-2">Key Skills</h4>
          <div className="flex flex-wrap gap-1">
            {professional.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30"
              >
                {skill}
              </span>
            ))}
            {professional.skills.length > 4 && (
              <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                +{professional.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job-Relevant Skills Preview */}
      {professional.jobSkills && (
        <div className="mb-3">
          <h4 className="text-white font-medium text-sm mb-2">Job-Relevant Skills</h4>
          <p className="text-gray-300 text-sm line-clamp-2">
            {professional.jobSkills}
          </p>
        </div>
      )}

      {/* Quick Links */}
      <div className="flex items-center space-x-3 mb-4">
        {professional.links?.github && (
          <a
            href={professional.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title="GitHub"
          >
            <FaGithub className="text-lg" />
          </a>
        )}
        {professional.links?.linkedin && (
          <a
            href={professional.links.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title="LinkedIn"
          >
            <FaLinkedin className="text-lg" />
          </a>
        )}
        {professional.links?.portfolio && (
          <a
            href={professional.links.portfolio}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title="Portfolio"
          >
            <FaLink className="text-lg" />
          </a>
        )}
        {professional.links?.resume && (
          <a
            href={professional.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title="Resume"
          >
            <FaFileAlt className="text-lg" />
          </a>
        )}
        {user.email && (
          <a
            href={`mailto:${user.email}`}
            className="text-gray-400 hover:text-purple-400 transition-colors"
            title="Email"
          >
            <FaEnvelope className="text-lg" />
          </a>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onViewProfile}
          className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-all duration-300 text-sm"
        >
          <FaEye className="text-xs" />
          <span>View Profile</span>
        </button>

        <button
          onClick={handleSendMessage}
          className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-300"
          title="Send Message"
        >
          <FaCommentDots className="text-sm" />
        </button>

        {user.email && (
          <button
            onClick={() => window.open(`mailto:${user.email}`, '_blank')}
            className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-300"
            title="Email"
          >
            <FaEnvelope className="text-sm" />
          </button>
        )}
      </div>

      {/* Availability Status */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm">Available for opportunities</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Open to work</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfessionalCard;
