import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaGithub, FaLinkedin, FaGlobe, FaEye, FaSearch, FaPlusCircle } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import ZentroSidebar from '../../componenents/UI/ZentroSidebar';
import professionalService from '../../services/professionalService';

const ZentroDirectory = () => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [professionals, setProfessionals] = useState([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('');
  const [currentView, setCurrentView] = useState('professional');

  const handleEndorseSkill = (professionalId, skillToUpdate) => {
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
    } else {
      console.log("User has already endorsed this skill for this professional.");
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
        setProfessionals(visibleProfessionals);
      } catch (error) {
        console.error('Error loading professionals:', error);
        setProfessionals([]);
      }
    };

    loadProfessionals();
  }, [userProfile]);

  // Filter professionals based on search and filters
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

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
            {professional.avatar ? (
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <FaUser className="text-2xl" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white mb-1 truncate">
              {professional.name}
            </h3>
            <p className="text-purple-400 font-medium mb-2 truncate">
              {professional.title}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{professional.location}</span>
              {professional.experience && (
                <>
                  <span>•</span>
                  <span>{professional.experience} years exp</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {professional.bio && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-3">
            {professional.bio}
          </p>
        )}

        {/* Skills */}
        {professional.skills && professional.skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {professional.skills.slice(0, 6).map((skill, index) => {
                const endorsementEntry = professional.endorsements?.find(e => e.skill === skill);
                const endorsementCount = endorsementEntry?.count || 0;
                const isOwnProfile = userProfile?.uid === professional.userId;
                const alreadyEndorsed = endorsementEntry?.endorsedBy?.includes(userProfile?.uid);

                return (
                  <div key={index} className="flex items-center px-2.5 py-1.5 bg-purple-600/10 text-purple-300 text-xs rounded-full border border-purple-600/30">
                    <span>{skill}</span>
                    {endorsementCount > 0 && (
                      <span className="ml-1.5 text-purple-400">({endorsementCount})</span>
                    )}
                    {!isOwnProfile && userProfile?.uid && (
                      <button 
                        title={alreadyEndorsed ? "You already endorsed this" : `Endorse ${skill}`}
                        disabled={alreadyEndorsed || isOwnProfile || !userProfile?.uid}
                        onClick={() => onEndorse(professional.id, skill)}
                        className={`ml-2 p-0.5 rounded-full ${
                          (alreadyEndorsed || isOwnProfile || !userProfile?.uid) 
                            ? 'text-gray-500 cursor-not-allowed' 
                            : 'text-green-400 hover:text-green-300 hover:bg-green-500/20'
                        } transition-colors`}
                      >
                        <FaPlusCircle className="text-sm"/>
                      </button>
                    )}
                  </div>
                );
              })}
              {professional.skills.length > 6 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                  +{professional.skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            {professional.github && (
              <a
                href={professional.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaGithub className="text-lg" />
              </a>
            )}
            {professional.linkedin && (
              <a
                href={professional.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <FaLinkedin className="text-lg" />
              </a>
            )}
            {professional.website && (
              <a
                href={professional.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-green-400 transition-colors"
              >
                <FaGlobe className="text-lg" />
              </a>
            )}
          </div>

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
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <FaEye className="text-sm" />
            <span className="text-sm">View Profile</span>
          </button>
        </div>

        {/* Visibility indicator */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Visibility: {professional.visibility}</span>
            <span>Updated {new Date(professional.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
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

  return (
    <div className="flex h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <ZentroSidebar currentView={currentView} setCurrentView={handleViewChange} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-4">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ZentroNet
              </h1>
              <p className="text-gray-400 text-lg">
                Discover talented professionals and showcase your skills
              </p>
            </div>
          </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, title, skills, or bio..."
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              />
            </div>

            {/* Visibility Filter */}
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            >
              <option value="all">All Visibility</option>
              <option value="public">Public</option>
              <option value="recruiters">Recruiters Only</option>
              <option value="friends">Friends Only</option>
            </select>

            {/* Skill Filter */}
            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="Filter by skill..."
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white lg:w-64"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredProfessionals.length} professional{filteredProfessionals.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Professional Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProfessionals.map((professional) => (
            <DeveloperCard key={professional.id} professional={professional} onEndorse={handleEndorseSkill} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProfessionals.length === 0 && (
          <div className="text-center py-16">
            <FaUser className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No professionals found</h3>
            <p className="text-gray-500">
              {searchQuery || skillFilter || visibilityFilter !== 'all'
                ? 'Try adjusting your search filters'
                : 'Be the first to create a professional profile!'}
            </p>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZentroDirectory;
