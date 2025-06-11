import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser,
  FaBriefcase,
  FaEdit,
  FaCamera,
  FaHeart,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaQuoteLeft,
  FaCode,
  FaTrophy,
  FaGraduationCap,
  FaDownload,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaStar,
  FaRocket,
  FaNetworkWired,
  FaBlog,
  FaUserSecret
} from 'react-icons/fa';

const ZentroProfile = ({ user, theme, zentroScore, userLevel, influenceXP, onUserUpdate }) => {
  const [profileMode, setProfileMode] = useState('personal'); // personal, professional
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user || {});

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-white',
          card: 'bg-gray-50 border-gray-200',
          text: 'text-gray-900',
          accent: 'text-blue-600'
        };
      case 'corporate':
        return {
          bg: 'bg-blue-50',
          card: 'bg-white border-blue-200',
          text: 'text-blue-900',
          accent: 'text-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-900',
          card: 'bg-gray-800 border-gray-700',
          text: 'text-white',
          accent: 'text-purple-400'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleSaveProfile = () => {
    onUserUpdate(editData);
    setIsEditing(false);
  };

  const ProfileStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className={`${themeClasses.card} border rounded-lg p-4 text-center`}>
        <div className="text-2xl font-bold text-purple-500">{userLevel}</div>
        <div className="text-sm opacity-70">Level</div>
      </div>
      <div className={`${themeClasses.card} border rounded-lg p-4 text-center`}>
        <div className="text-2xl font-bold text-blue-500">{zentroScore}</div>
        <div className="text-sm opacity-70">Zentro Score</div>
      </div>
      <div className={`${themeClasses.card} border rounded-lg p-4 text-center`}>
        <div className="text-2xl font-bold text-green-500">{influenceXP}</div>
        <div className="text-sm opacity-70">Influence XP</div>
      </div>
      <div className={`${themeClasses.card} border rounded-lg p-4 text-center`}>
        <div className="text-2xl font-bold text-yellow-500">{user?.zentroStats?.networkConnections || 0}</div>
        <div className="text-sm opacity-70">Connections</div>
      </div>
    </div>
  );

  const PersonalProfile = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className={`${themeClasses.card} border rounded-lg p-6`}>
        <div className="flex items-start space-x-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-4xl font-bold text-white">
              {user?.displayName?.charAt(0) || 'Z'}
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white"
            >
              <FaCamera />
            </motion.button>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold">{user?.displayName}</h1>
                <p className="text-lg opacity-70">@{user?.username}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditing(!isEditing)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
              >
                <FaEdit />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </motion.button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <FaMapMarkerAlt className="text-purple-400" />
                <span>{user?.personal?.location || 'Digital Realm'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaCalendarAlt className="text-blue-400" />
                <span>Born {user?.personal?.birthday || 'Unknown'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaHeart className="text-red-400" />
                <span>Mood: {user?.personal?.currentMood || 'Innovative'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FaUserSecret className="text-green-400" />
                <span>Rank: {user?.zentroStats?.secretAlleyRank || 'Initiate'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className={`${themeClasses.card} border rounded-lg p-6`}>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FaQuoteLeft className="mr-2 text-purple-400" />
          About Me
        </h3>
        {isEditing ? (
          <textarea
            value={editData?.personal?.bio || ''}
            onChange={(e) => setEditData({
              ...editData,
              personal: { ...editData.personal, bio: e.target.value }
            })}
            className="w-full h-32 p-4 bg-gray-700 text-white rounded-lg resize-none"
            placeholder="Tell the world about yourself..."
          />
        ) : (
          <p className="text-lg leading-relaxed">{user?.personal?.bio || 'Building the future of digital ecosystems'}</p>
        )}
      </div>

      {/* Interests & Hobbies */}
      <div className={`${themeClasses.card} border rounded-lg p-6`}>
        <h3 className="text-xl font-bold mb-4">Interests & Passions</h3>
        <div className="flex flex-wrap gap-2">
          {(user?.personal?.interests || ['AI', 'Blockchain', 'Design', 'Philosophy']).map((interest, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>

      {/* Favorite Quote */}
      <div className={`${themeClasses.card} border rounded-lg p-6`}>
        <h3 className="text-xl font-bold mb-4">Favorite Quote</h3>
        <blockquote className="text-lg italic text-center py-4">
          "{user?.personal?.favoriteQuote || 'Code is poetry in motion'}"
        </blockquote>
      </div>
    </div>
  );

  const ProfessionalProfile = () => (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className={`${themeClasses.card} border rounded-lg p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{user?.professional?.title}</h2>
            <p className="text-lg opacity-70">{user?.professional?.company}</p>
            <p className="text-sm text-green-400">{user?.professional?.hiringStatus}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-purple-500">{zentroScore}</div>
            <div className="text-sm opacity-70">Professional Score</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm opacity-70">{user?.professional?.experience}</span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaDownload />
            <span>Download Resume</span>
          </motion.button>
        </div>
      </div>

      {/* Skills */}
      <div className={`${themeClasses.card} border rounded-lg p-6`}>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FaCode className="mr-2 text-blue-400" />
          Technical Skills
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(user?.professional?.skills || ['React', 'Node.js', 'AI/ML', 'Blockchain', 'UI/UX']).map((skill, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded-lg">
              <span>{skill}</span>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-sm ${i < 4 ? 'text-yellow-400' : 'text-gray-500'}`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio */}
      <div className={`${themeClasses.card} border rounded-lg p-6`}>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FaRocket className="mr-2 text-green-400" />
          Portfolio Projects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(user?.professional?.portfolio || ['zentro-chat', 'secret-alley', 'ai-copilot']).map((project, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-bold text-lg mb-2">{project}</h4>
              <p className="text-sm opacity-70 mb-3">Advanced project showcasing cutting-edge technology</p>
              <div className="flex items-center justify-between">
                <span className="text-xs bg-purple-600 px-2 py-1 rounded">Featured</span>
                <div className="flex space-x-2">
                  <FaEye className="text-blue-400" />
                  <span className="text-sm">1.2k views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements */}
      <div className={`${themeClasses.card} border rounded-lg p-6`}>
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <FaTrophy className="mr-2 text-yellow-400" />
          Achievements & Certifications
        </h3>
        <div className="space-y-3">
          {(user?.professional?.achievements || ['Secret Alley Creator', 'AI Integration Expert']).map((achievement, index) => (
            <div key={index} className="flex items-center space-x-3 bg-gray-700 p-3 rounded-lg">
              <FaShieldAlt className="text-yellow-400" />
              <span className="font-semibold">{achievement}</span>
              <span className="text-xs bg-green-600 px-2 py-1 rounded ml-auto">Verified</span>
            </div>
          ))}
        </div>
      </div>

      {/* Secret Alley Clearance */}
      <div className={`${themeClasses.card} border border-red-500 rounded-lg p-6`}>
        <h3 className="text-xl font-bold mb-4 flex items-center text-red-400">
          <FaUserSecret className="mr-2" />
          Secret Alley Clearance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-red-400">{user?.zentroStats?.secretAlleyRank || 'Shadow Architect'}</div>
            <div className="text-sm opacity-70">Current Rank</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{user?.zentroStats?.completedMissions || 23}</div>
            <div className="text-sm opacity-70">Missions Completed</div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded-lg">
          <p className="text-sm text-red-400">
            🔒 This clearance level is visible to verified recruiters and demonstrates advanced problem-solving capabilities.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Profile Mode Toggle */}
      <div className="flex items-center justify-center mb-8">
        <div className={`${themeClasses.card} border rounded-lg p-2 flex`}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setProfileMode('personal')}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              profileMode === 'personal'
                ? 'bg-purple-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaUser />
            <span>Personal</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setProfileMode('professional')}
            className={`px-6 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              profileMode === 'professional'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaBriefcase />
            <span>Professional</span>
          </motion.button>
        </div>
      </div>

      {/* Profile Stats */}
      <ProfileStats />

      {/* Profile Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={profileMode}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {profileMode === 'personal' ? <PersonalProfile /> : <ProfessionalProfile />}
        </motion.div>
      </AnimatePresence>

      {/* Save Button (when editing) */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveProfile}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg"
          >
            Save Changes
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ZentroProfile;
