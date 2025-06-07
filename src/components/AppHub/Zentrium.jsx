import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaExternalLinkAlt, FaSearch, FaStar, FaCode, FaPlus, FaEdit, FaGithub, FaTimes } from 'react-icons/fa';
import { MdInstallDesktop } from 'react-icons/md';
import { useUser } from '../../contexts/UserContext';
import AppUploader from '../Professional/AppUploader';
import AppRatingSystem from './AppRatingSystem';
import InAppBrowser from './InAppBrowser';
import professionalService from '../../services/professionalService';
import ZentroSidebar from '../../componenents/UI/ZentroSidebar';

const Zentrium = () => {
  const { userProfile } = useUser();
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showAppUploader, setShowAppUploader] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [showInAppBrowser, setShowInAppBrowser] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('');
  const [currentView, setCurrentView] = useState('zentrium');

  // Load apps from localStorage
  useEffect(() => {
    const loadApps = () => {
      try {
        const stored = localStorage.getItem('zentro_apps');
        const data = stored ? JSON.parse(stored) : [];
        const publicApps = data.filter(app => app.visibility === 'public');
        setApps(publicApps);
      } catch (error) {
        console.error('Error loading apps:', error);
        setApps([]);
      }
    };

    loadApps();
  }, []);

  // Filter apps based on search and category
  useEffect(() => {
    let filtered = apps;

    if (searchQuery) {
      filtered = filtered.filter(app =>
        (app.title && app.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.name && app.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (app.category && app.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(app => app.category === categoryFilter);
    }

    setFilteredApps(filtered);
  }, [apps, searchQuery, categoryFilter]);

  const categories = ['all', 'productivity', 'entertainment', 'education', 'utility', 'social', 'other'];

  const AppCard = ({ app }) => {
    const isOwner = userProfile?.uid === app.developerId;

    const handleEdit = (e) => {
      e.stopPropagation();
      setEditingApp(app);
      setShowAppUploader(true);
    };

    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer relative group"
           onClick={() => setSelectedApp(app)}>

        {/* Edit Button for Owner */}
        {isOwner && (
          <button
            onClick={handleEdit}
            className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10"
            title="Edit App"
          >
            <FaEdit className="text-sm" />
          </button>
        )}

        {/* App Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
          <FaCode className="text-2xl text-white" />
        </div>

        {/* App Info */}
        <h3 className="text-xl font-bold text-white mb-2 truncate">{app.title || app.name || 'Untitled App'}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{app.description || 'No description available'}</p>

        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
            {app.category || 'Other'}
          </span>
          <div className="flex items-center space-x-1">
            <FaStar className="text-yellow-400 text-sm" />
            <span className="text-gray-300 text-sm">
              {app.averageRating && typeof app.averageRating === 'number' ? app.averageRating.toFixed(1) : '0.0'}
            </span>
            <span className="text-gray-500 text-xs">
              ({app.ratingCount || 0})
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center space-x-1">
            <FaDownload className="text-xs" />
            <span>{app.downloads || 0}</span>
          </div>
          <span className="text-xs">
            by {app.developerName || 'Unknown'}
          </span>
        </div>
      </div>
    );
  };

  const AppModal = ({ app, onClose }) => {
    const [currentApp, setCurrentApp] = useState(app);

    if (!app) return null;

    const handleDownload = () => {
      if (currentApp.downloadUrl) {
        window.open(currentApp.downloadUrl, '_blank');
        // Increment download count
        const updatedApp = { ...currentApp, downloads: (currentApp.downloads || 0) + 1 };
        professionalService.saveApp(updatedApp);
        setCurrentApp(updatedApp);
        // Update the main apps list
        setApps(prevApps => prevApps.map(a => a.id === updatedApp.id ? updatedApp : a));
      }
    };

    const handleOpenDemo = () => {
      if (currentApp.demoUrl) {
        // Open demo in in-app browser
        setBrowserUrl(currentApp.demoUrl);
        setShowInAppBrowser(true);
      }
    };

    const handleGithubOpen = () => {
      if (currentApp.githubUrl) {
        window.open(currentApp.githubUrl, '_blank');
      }
    };

    // Determine file type and appropriate action
    const getFileType = (url) => {
      if (!url) return null;
      const extension = url.split('.').pop()?.toLowerCase();
      if (extension === 'exe') return 'executable';
      if (url.includes('github.com')) return 'github';
      return 'demo';
    };

    const renderActionButton = () => {
      const downloadFileType = getFileType(currentApp.downloadUrl);
      const hasDemo = currentApp.demoUrl;
      const hasGithub = currentApp.githubUrl;

      return (
        <div className="flex flex-wrap gap-3">
          {/* Download/Install Button */}
          {currentApp.downloadUrl && (
            <button
              onClick={handleDownload}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 shadow-lg ${
                downloadFileType === 'executable'
                  ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
              }`}
            >
              {downloadFileType === 'executable' ? (
                <>
                  <MdInstallDesktop className="text-lg" />
                  <span>Install App</span>
                </>
              ) : (
                <>
                  <FaDownload className="text-lg" />
                  <span>Download</span>
                </>
              )}
            </button>
          )}

          {/* GitHub Button */}
          {hasGithub && (
            <button
              onClick={handleGithubOpen}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-lg transition-all duration-300 shadow-lg"
            >
              <FaGithub className="text-lg" />
              <span>View Source</span>
            </button>
          )}

          {/* Try Out Button */}
          {hasDemo && (
            <button
              onClick={handleOpenDemo}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 shadow-lg"
            >
              <FaExternalLinkAlt className="text-lg" />
              <span>Try Out</span>
            </button>
          )}
        </div>
      );
    };

    const handleAppUpdated = (updatedApp) => {
      setCurrentApp(updatedApp);
      setApps(prevApps => prevApps.map(a => a.id === updatedApp.id ? updatedApp : a));
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <FaCode className="text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{currentApp.title || currentApp.name || 'Untitled App'}</h2>
                  <p className="text-gray-400 mb-2">{currentApp.description || 'No description available'}</p>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-sm rounded-full border border-purple-500/30">
                      {currentApp.category || 'Other'}
                    </span>
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-white font-medium">
                        {currentApp.averageRating && typeof currentApp.averageRating === 'number' ? currentApp.averageRating.toFixed(1) : '0.0'}
                      </span>
                      <span className="text-gray-400">
                        ({currentApp.ratingCount || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-400">
                      <FaDownload />
                      <span>{currentApp.downloads || 0} downloads</span>
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {/* Developer Info */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-3">Developer</h3>
                <p className="text-gray-300">{currentApp.developerName || 'Unknown Developer'}</p>
              </div>

              {/* Detailed Description */}
              {currentApp.longDescription && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">About</h3>
                  <p className="text-gray-300 leading-relaxed">{currentApp.longDescription}</p>
                </div>
              )}

              {/* Features */}
              {currentApp.features && currentApp.features.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Features</h3>
                  <ul className="space-y-2">
                    {currentApp.features.map((feature, index) => (
                      <li key={index} className="text-gray-300 flex items-start">
                        <span className="text-purple-400 mr-2">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Technologies */}
              {currentApp.technologies && currentApp.technologies.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentApp.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg border border-gray-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Screenshots */}
              {currentApp.screenshots && currentApp.screenshots.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3">Screenshots</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentApp.screenshots.map((screenshot, index) => (
                      <img
                        key={index}
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="rounded-lg border border-gray-700"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Rating and Comments System */}
              <AppRatingSystem app={currentApp} onAppUpdated={handleAppUpdated} />
            </div>

          </div>

          {/* Actions */}
          <div className="p-6 border-t border-gray-700">
            {renderActionButton()}
          </div>
        </div>
      </div>
    );
  };

  const handleViewChange = (view) => {
    if (view === 'dm') {
      navigate('/chat');
    } else if (view === 'blog') {
      navigate('/blog');
    } else if (view === 'professional') {
      navigate('/directory');
    } else if (view === 'music') {
      navigate('/music');
    } else if (view === 'profile') {
      navigate('/profile');
    } else if (view === 'groups') {
      navigate('/groups');
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Zentrium
                </h1>
                <p className="text-gray-400 text-lg">
                  Professional Application Hub - Discover and explore amazing applications built by our community
                </p>
              </div>
              <button
                onClick={() => setShowAppUploader(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
              >
                <FaPlus className="text-lg" />
                <span className="font-medium">Upload App</span>
              </button>
            </div>
          </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        {/* Empty State */}
        {filteredApps.length === 0 && (
          <div className="text-center py-16">
            <FaCode className="text-6xl text-gray-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No apps found</h3>
            <p className="text-gray-500">
              {searchQuery || categoryFilter !== 'all'
                ? 'Try adjusting your search filters'
                : 'Be the first to submit an app!'}
            </p>
          </div>
        )}
        </div>

        {/* App Modal */}
        {selectedApp && (
          <AppModal app={selectedApp} onClose={() => setSelectedApp(null)} />
        )}

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
              // Reload apps to show the new one
              const loadApps = () => {
                try {
                  const stored = localStorage.getItem('zentro_apps');
                  const data = stored ? JSON.parse(stored) : [];
                  const publicApps = data.filter(app => app.visibility === 'public');
                  setApps(publicApps);
                } catch (error) {
                  console.error('Error loading apps:', error);
                  setApps([]);
                }
              };
              loadApps();
            }}
          />
        )}

        {/* In-App Browser */}
        {showInAppBrowser && (
          <InAppBrowser
            url={browserUrl}
            onClose={() => setShowInAppBrowser(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Zentrium;
