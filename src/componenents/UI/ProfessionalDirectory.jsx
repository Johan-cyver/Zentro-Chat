import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFilter, FaUsers, FaBriefcase, FaEye, FaUserShield, FaGlobe, FaUserFriends, FaCalendarAlt, FaLock } from 'react-icons/fa';
import ProfessionalCard from '../../components/SmartProfilePanel/ProfessionalCard';
import { isCurrentUserProfessionalEligible, getProfessionalRestrictionMessage } from '../../utils/ageUtils';
import { useUser } from '../../contexts/UserContext';
import firebaseChatService from '../../services/firebaseChat';
import { useNavigate } from 'react-router-dom';

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

  // Load professional profiles from Firebase
  useEffect(() => {
    const loadProfessionals = async () => {
      setLoading(true);
      try {
        const firebaseProfessionals = await firebaseChatService.getProfessionalProfiles(userProfile?.uid);
        setProfessionals(firebaseProfessionals);
      } catch (error) {
        console.error('Error loading professionals:', error);
        setProfessionals([]);
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
        return userType === 'recruiter';
      case 'friends':
        // Check if the current user is actually friends with this professional
        const friends = JSON.parse(localStorage.getItem('zentro_friends') || '[]');
        const isFriend = friends.some(friend => friend.id === professional.uid);
        return isFriend;
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
        canView = professional.visibility === 'public' || professional.visibility === 'recruiters';
        break;
      case 'friend':
        // Check if the current user is actually friends with this professional
        const friends = JSON.parse(localStorage.getItem('zentro_friends') || '[]');
        const isFriend = friends.some(friend => friend.id === professional.uid);
        canView = professional.visibility === 'public' ||
                 (professional.visibility === 'recruiters' && userType === 'recruiter') ||
                 (professional.visibility === 'friends' && isFriend);
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
    <div className="h-full bg-black text-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-purple-700">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 mb-4">
          Professional Directory
        </h1>

        {/* User Type Toggle */}
        <div className="flex justify-center mb-4">
          <div className="bg-gray-800 rounded-lg p-1 border border-gray-600">
            <button
              onClick={() => setUserType('public')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                userType === 'public'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FaGlobe className="inline mr-1" />
              Public
            </button>
            <button
              onClick={() => setUserType('recruiter')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                userType === 'recruiter'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FaUserShield className="inline mr-1" />
              Recruiter
            </button>
            <button
              onClick={() => setUserType('friend')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                userType === 'friend'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              <FaUserFriends className="inline mr-1" />
              Friend
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search professionals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          >
            {industries.map(industry => (
              <option key={industry} value={industry}>
                {industry === 'all' ? 'All Industries' : industry}
              </option>
            ))}
          </select>

          <select
            value={selectedVisibility}
            onChange={(e) => setSelectedVisibility(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          >
            {visibilityOptions.map(visibility => (
              <option key={visibility} value={visibility}>
                {visibility === 'all' ? 'All Visibility' :
                 visibility === 'public' ? 'Public' :
                 visibility === 'recruiters' ? 'Recruiters' :
                 'Friends'}
              </option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
          <span>{filteredProfessionals.length} professionals found</span>
          <span>
            {userType === 'public' && '👁️ Public view'}
            {userType === 'recruiter' && '🛡️ Recruiter view'}
            {userType === 'friend' && '👥 Friend view'}
          </span>
        </div>
      </div>

      {/* Professional Cards */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading professionals...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredProfessionals.map((professional, index) => (
                <motion.div
                  key={professional.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="h-fit"
                >
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
                    className="w-full h-full"
                  />
                </motion.div>
              ))}
            </div>

            {/* Empty State */}
            {filteredProfessionals.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">No professionals found</h3>
                <p className="text-gray-400 text-sm">Try adjusting your search or filters.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfessionalDirectory;
