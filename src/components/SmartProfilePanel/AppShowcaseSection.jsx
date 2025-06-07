import React, { useState, useEffect } from 'react';
import { FaRocket, FaEdit, FaTrash, FaCode, FaExternalLinkAlt, FaDownload, FaStar, FaEye } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const AppShowcaseSection = ({ displayUser, isViewingOwnProfile, onUploadApp }) => {
  const { userProfile } = useUser();
  const [userApps, setUserApps] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Load user's apps
  useEffect(() => {
    const loadUserApps = () => {
      try {
        const stored = localStorage.getItem('zentro_apps');
        const allApps = stored ? JSON.parse(stored) : [];

        // Filter apps by the displayed user (check both userId and developerId for compatibility)
        const filteredApps = allApps.filter(app =>
          (app.userId === displayUser?.uid || app.developerId === displayUser?.uid) &&
          (isViewingOwnProfile || app.visibility === 'public')
        );

        // Remove duplicates based on app ID
        const uniqueApps = filteredApps.reduce((acc, current) => {
          const existing = acc.find(app => app.id === current.id);
          if (!existing) {
            acc.push(current);
          }
          return acc;
        }, []);

        setUserApps(uniqueApps);
      } catch (error) {
        console.error('Error loading user apps:', error);
        setUserApps([]);
      }
    };

    if (displayUser?.uid) {
      loadUserApps();
    }
  }, [displayUser?.uid, isViewingOwnProfile]);

  // Delete app
  const handleDeleteApp = (appId) => {
    try {
      const stored = localStorage.getItem('zentro_apps');
      const allApps = stored ? JSON.parse(stored) : [];
      const updatedApps = allApps.filter(app => app.id !== appId);
      localStorage.setItem('zentro_apps', JSON.stringify(updatedApps));

      // Update local state
      setUserApps(prev => prev.filter(app => app.id !== appId));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting app:', error);
    }
  };

  // Edit app
  const handleEditApp = (app) => {
    // This will be handled by the parent component
    onUploadApp(app);
  };

  const AppCard = ({ app }) => {
    const isOwner = app.userId === userProfile?.uid || app.developerId === userProfile?.uid;

    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 relative group">

        {/* Edit/Delete buttons for owner */}
        {isOwner && isViewingOwnProfile && (
          <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={() => handleEditApp(app)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
              title="Edit App"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(app.id)}
              className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
              title="Delete App"
            >
              <FaTrash />
            </button>
          </div>
        )}

        {/* App Logo */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
            {app.logo ? (
              <img
                src={app.logo}
                alt={app.title || app.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <FaCode className="text-2xl text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white mb-1 truncate">
              {app.title || app.name || 'Untitled App'}
            </h3>
            <p className="text-sm text-gray-400 mb-2">
              Created by {app.creatorName || displayUser?.displayName || 'Anonymous'}
            </p>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FaStar className="text-yellow-400" />
                <span>{app.rating || '4.5'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaDownload className="text-green-400" />
                <span>{app.downloads || 0}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FaEye className="text-blue-400" />
                <span>{app.views || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* App Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3">
          {app.description || 'No description available'}
        </p>

        {/* Tech Stack */}
        {app.techStack && app.techStack.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {app.techStack.slice(0, 3).map((tech, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                >
                  {tech}
                </span>
              ))}
              {app.techStack.length > 3 && (
                <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
                  +{app.techStack.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {app.demoUrl && (
            <button
              onClick={() => {
                // Open demo in parent component's in-app browser if available
                if (window.openInAppDemo) {
                  window.openInAppDemo(app.demoUrl);
                } else {
                  window.open(app.demoUrl, '_blank');
                }
              }}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-colors"
            >
              <FaExternalLinkAlt />
              <span>Demo</span>
            </button>
          )}

          {app.downloadUrl && (
            <button
              onClick={() => window.open(app.downloadUrl, '_blank')}
              className="flex items-center space-x-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-colors"
            >
              <FaDownload />
              <span>Download</span>
            </button>
          )}

          {app.githubUrl && (
            <button
              onClick={() => window.open(app.githubUrl, '_blank')}
              className="flex items-center space-x-1 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-colors"
            >
              <FaCode />
              <span>Code</span>
            </button>
          )}
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full border border-purple-500/30">
            {app.category || 'General'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-purple-400 mb-2">App Showcase</h2>
          <p className="text-gray-400 text-sm">
            {isViewingOwnProfile
              ? 'Showcase your development skills and share your apps with the community.'
              : `Apps created by ${displayUser?.displayName || 'this user'}`
            }
          </p>
        </div>

        {isViewingOwnProfile && (
          <button
            onClick={() => onUploadApp()}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
          >
            <FaRocket className="text-sm" />
            <span className="font-medium">Upload App</span>
          </button>
        )}
      </div>

      {/* Apps Grid */}
      {userApps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <FaCode className="text-4xl text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            {isViewingOwnProfile ? 'No apps uploaded yet' : 'No public apps available'}
          </h3>
          <p className="text-gray-500 text-sm">
            {isViewingOwnProfile
              ? 'Upload your first app to showcase your development skills!'
              : 'This user hasn\'t shared any public apps yet.'
            }
          </p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Delete App</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this app? This action cannot be undone.
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleDeleteApp(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppShowcaseSection;
