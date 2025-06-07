import React, { useState } from 'react';
import { FaEdit, FaLink, FaGithub, FaLinkedin, FaFileAlt, FaRocket } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import SkillsEndorsements from './SkillsEndorsements';
import ExperienceTimeline from './ExperienceTimeline';
import PortfolioCertifications from './PortfolioCertifications';
import ProfessionalAvailability from './ProfessionalAvailability';
import AnalyticsPanel from './AnalyticsPanel';
import ActivityTracker from './ActivityTracker';
import AppUploader from '../Professional/AppUploader';
import AppShowcaseSection from './AppShowcaseSection';

const ProfessionalView = ({ user = null }) => {
  const { userProfile, updateProfessionalProfile, updateVisibility } = useUser();
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSkillInput, setShowSkillInput] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [showAppUploader, setShowAppUploader] = useState(false);
  const [editingApp, setEditingApp] = useState(null);

  // Use the passed user prop if viewing someone else's profile, otherwise use current user
  const displayUser = user || userProfile;
  const isViewingOwnProfile = !user || (user.uid === userProfile.uid);

  // Product showcase data
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'DevFlow',
      description: 'A developer productivity tool that streamlines workflow and increases efficiency.',
      thumbnail: null,
      demoLink: 'https://devflow.example.com',
      techStack: ['React', 'Node.js', 'MongoDB'],
      stats: {
        users: '5,000+',
        mrr: '$12,000'
      }
    },
    {
      id: 2,
      name: 'DesignMate',
      description: 'AI-powered design assistant for creating beautiful UI components.',
      thumbnail: null,
      demoLink: 'https://designmate.example.com',
      techStack: ['Vue.js', 'Python', 'TensorFlow'],
      stats: {
        users: '3,200+',
        mrr: '$8,500'
      }
    }
  ]);

  // Use visibility from displayUser, fallback to 'public'
  const visibility = displayUser?.visibility || 'public';

  // Handle professional profile data change (only for own profile)
  const handleProfileChange = (field, value) => {
    if (isViewingOwnProfile) {
      updateProfessionalProfile({
        [field]: value
      });
    }
  };

  // Add a skill (only for own profile)
  const addSkill = () => {
    if (!isViewingOwnProfile || !newSkill.trim()) return;

    const updatedSkills = [...(userProfile?.professional?.skills || []), newSkill.trim()];
    updateProfessionalProfile({ skills: updatedSkills });
    setNewSkill('');
    setShowSkillInput(false);
  };

  // Remove a skill (only for own profile)
  const removeSkill = (skillToRemove) => {
    if (!isViewingOwnProfile) return;

    const updatedSkills = (userProfile?.professional?.skills || []).filter(skill => skill !== skillToRemove);
    updateProfessionalProfile({ skills: updatedSkills });
  };

  // Add or update a product
  const saveProduct = (product) => {
    if (editingProduct) {
      // Update existing product
      setProducts(products.map(p => p.id === editingProduct.id ? { ...product, id: editingProduct.id } : p));
    } else {
      // Add new product
      setProducts([...products, { ...product, id: Date.now() }]);
    }
    setShowProductModal(false);
    setEditingProduct(null);
  };

  // Remove a product
  const removeProduct = (productId) => {
    setProducts(products.filter(product => product.id !== productId));
  };

  // Update a link
  const updateLink = (type, url) => {
    updateProfessionalProfile({
      links: {
        ...(userProfile?.professional?.links || {}),
        [type]: url
      }
    });
    setShowLinkModal(false);
    setEditingLink(null);
  };

  // Toggle edit mode (only for own profile)
  const toggleEditMode = () => {
    if (isViewingOwnProfile) {
      setIsEditMode(!isEditMode);
    }
  };

  // Save profile changes
  const saveProfileChanges = () => {
    // Already saved via updateProfessionalProfile
    setIsEditMode(false);
  };

  return (
    <div className="space-y-8">
      {/* Professional ID Card */}
      <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg relative overflow-hidden">
        {/* Glowing background effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-70"></div>

        <div className="flex justify-between items-start">
          <div className="space-y-4 flex-1">
            <div className="flex items-center space-x-3">
              {isEditMode && isViewingOwnProfile ? (
                <input
                  type="text"
                  value={displayUser.professional?.role || ''}
                  onChange={(e) => handleProfileChange('role', e.target.value)}
                  className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-xl font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Your Professional Role"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{displayUser.professional?.role || 'Professional'}</h2>
              )}

              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full border border-green-500/30">
                {isEditMode && isViewingOwnProfile ? (
                  <select
                    value={displayUser.professional?.status || 'Available'}
                    onChange={(e) => handleProfileChange('status', e.target.value)}
                    className="bg-transparent border-none text-green-400 text-xs focus:ring-0"
                  >
                    <option value="Available">Available</option>
                    <option value="Open to work">Open to work</option>
                    <option value="Freelancer">Freelancer</option>
                    <option value="Not available">Not available</option>
                  </select>
                ) : (
                  displayUser.professional?.status || 'Available'
                )}
              </span>
            </div>

            <div className="flex space-x-4">
              <div>
                <span className="text-gray-400 text-sm">Industry</span>
                {isEditMode && isViewingOwnProfile ? (
                  <input
                    type="text"
                    value={displayUser.professional?.industry || ''}
                    onChange={(e) => handleProfileChange('industry', e.target.value)}
                    className="block w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 mt-1"
                    placeholder="Your Industry"
                  />
                ) : (
                  <p className="text-white">{displayUser.professional?.industry || 'Not specified'}</p>
                )}
              </div>
            </div>

            {isEditMode && isViewingOwnProfile ? (
              <textarea
                value={displayUser.professional?.bio || ''}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                rows="3"
                placeholder="Your professional bio"
              />
            ) : (
              <p className="text-gray-300">{displayUser.professional?.bio || 'No bio available'}</p>
            )}

            {/* Skills */}
            <div>
              <h3 className="text-gray-400 text-sm mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(displayUser.professional?.skills || []).map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-800 text-purple-400 text-sm rounded-full border border-purple-500/30 flex items-center"
                  >
                    {skill}
                    {isEditMode && isViewingOwnProfile && (
                      <button
                        onClick={() => removeSkill(skill)}
                        className="ml-2 text-gray-400 hover:text-red-400"
                      >
                        &times;
                      </button>
                    )}
                  </span>
                ))}
                {isEditMode && isViewingOwnProfile && !showSkillInput && (
                  <button
                    onClick={() => setShowSkillInput(true)}
                    className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-full border border-gray-700 hover:border-purple-500/30"
                  >
                    + Add
                  </button>
                )}
                {isEditMode && isViewingOwnProfile && showSkillInput && (
                  <div className="flex">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="New skill"
                      className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-l-full text-white text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <button
                      onClick={addSkill}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-r-full hover:bg-purple-700"
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ProfessionalLink
                label="Resume"
                url={displayUser.professional?.links?.resume || ''}
                icon={<FaFileAlt />}
                isEditMode={isEditMode && isViewingOwnProfile}
                onEdit={() => {
                  setEditingLink('resume');
                  setShowLinkModal(true);
                }}
              />
              <ProfessionalLink
                label="GitHub"
                url={displayUser.professional?.links?.github || ''}
                icon={<FaGithub />}
                isEditMode={isEditMode && isViewingOwnProfile}
                onEdit={() => {
                  setEditingLink('github');
                  setShowLinkModal(true);
                }}
              />
              <ProfessionalLink
                label="Portfolio"
                url={displayUser.professional?.links?.portfolio || ''}
                icon={<FaLink />}
                isEditMode={isEditMode && isViewingOwnProfile}
                onEdit={() => {
                  setEditingLink('portfolio');
                  setShowLinkModal(true);
                }}
              />
              <ProfessionalLink
                label="LinkedIn"
                url={displayUser.professional?.links?.linkedin || ''}
                icon={<FaLinkedin />}
                isEditMode={isEditMode && isViewingOwnProfile}
                onEdit={() => {
                  setEditingLink('linkedin');
                  setShowLinkModal(true);
                }}
              />
            </div>
          </div>

          {/* Edit Button - only show for own profile */}
          {isViewingOwnProfile && (
            <div>
              {isEditMode ? (
                <button
                  onClick={saveProfileChanges}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                >
                  Save
                </button>
              ) : (
                <button
                  onClick={toggleEditMode}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors duration-300"
                >
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Professional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills & Endorsements */}
        <SkillsEndorsements />

        {/* Professional Availability */}
        <ProfessionalAvailability />
      </div>

      {/* Experience Timeline */}
      <ExperienceTimeline />

      {/* Portfolio & Certifications */}
      <PortfolioCertifications />

      {/* Analytics & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analytics Panel */}
        <AnalyticsPanel />

        {/* Activity Tracker */}
        <ActivityTracker />
      </div>

      {/* Visibility Settings - only show for own profile */}
      {isViewingOwnProfile && (
        <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">Visibility Settings</h2>

          <div className="space-y-3">
            <VisibilityOption
              label="Public"
              description="Anyone can view your professional profile"
              selected={visibility === 'public'}
              onClick={() => updateVisibility('public')}
            />
            <VisibilityOption
              label="Recruiters Only"
              description="Only verified recruiters can view your profile"
              selected={visibility === 'recruiters'}
              onClick={() => updateVisibility('recruiters')}
            />
            <VisibilityOption
              label="Friends Only"
              description="Only your connections can view your profile"
              selected={visibility === 'friends'}
              onClick={() => updateVisibility('friends')}
            />
          </div>
        </div>
      )}

      {/* App Showcase Section */}
      <AppShowcaseSection
        displayUser={displayUser}
        isViewingOwnProfile={isViewingOwnProfile}
        onUploadApp={(editingApp = null) => {
          setEditingApp(editingApp);
          setShowAppUploader(true);
        }}
      />

      {/* App Uploader Modal */}
      {showAppUploader && (
        <AppUploader
          editingApp={editingApp}
          onClose={() => {
            setShowAppUploader(false);
            setEditingApp(null);
          }}
          onAppUploaded={(app) => {
            console.log('App uploaded:', app);
            setShowAppUploader(false);
            setEditingApp(null);
            // Refresh to show updated apps
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// Professional link component
const ProfessionalLink = ({ label, url, icon, isEditMode, onEdit }) => {
  return (
    <div>
      {isEditMode ? (
        <div>
          <label className="block text-gray-400 text-sm mb-1">{label}</label>
          <button
            onClick={onEdit}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-sm hover:bg-gray-700 flex items-center justify-between"
          >
            <span className="truncate">{url || `Add ${label} URL`}</span>
            <FaEdit className="text-purple-400" />
          </button>
        </div>
      ) : (
        url ? (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 p-2 rounded-lg transition-colors duration-300"
          >
            <span className="text-purple-400">{icon}</span>
            <span className="text-white">{label}</span>
          </a>
        ) : (
          <div className="flex items-center space-x-2 bg-gray-800 p-2 rounded-lg opacity-50">
            <span className="text-purple-400">{icon}</span>
            <span className="text-white">{label}</span>
          </div>
        )
      )}
    </div>
  );
};

// Product card component
const ProductCard = ({ product, isEditMode }) => {
  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
      <div className="aspect-video bg-gray-700 relative flex items-center justify-center">
        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <div className="text-4xl mb-2">📱</div>
            <div className="text-sm">No Preview</div>
          </div>
        )}
        {isEditMode && (
          <button className="absolute top-2 right-2 bg-gray-900/80 p-1 rounded-full text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
        <p className="text-gray-300 text-sm mb-4">{product.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {product.techStack.map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>

        {product.stats && (
          <div className="flex justify-between text-sm mb-4">
            <div>
              <span className="text-gray-400">Users:</span>
              <span className="text-green-400 ml-1">{product.stats.users}</span>
            </div>
            <div>
              <span className="text-gray-400">MRR:</span>
              <span className="text-green-400 ml-1">{product.stats.mrr}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <a
            href={product.demoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1 bg-purple-600/80 hover:bg-purple-600 rounded text-white text-sm transition-colors duration-300"
          >
            Try Demo
          </a>
          <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors duration-300">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
};

// Visibility option component
const VisibilityOption = ({ label, description, selected, onClick }) => {
  return (
    <div
      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
        selected
          ? 'bg-purple-900/20 border border-purple-500/30'
          : 'bg-gray-800 border border-gray-700 hover:border-gray-600'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`w-4 h-4 rounded-full mr-3 ${
          selected
            ? 'bg-purple-500'
            : 'border border-gray-600'
        }`} />
        <div>
          <h3 className="text-white font-medium">{label}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalView;
