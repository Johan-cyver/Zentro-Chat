import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FaDownload, FaExternalLinkAlt, FaSearch, FaStar, FaCode, FaPlus, FaEdit, FaArrowLeft, FaGithub, FaTimes, FaShareAlt, FaRocket, FaTrophy, FaGavel } from 'react-icons/fa';
import { MdInstallDesktop } from 'react-icons/md';
import { useUser } from '../../contexts/UserContext';
import AppUploader from '../Professional/AppUploader';
import professionalService from '../../services/professionalService';
import { useOutletContext } from 'react-router-dom';
import AppRatingSystem from './AppRatingSystem';
import SpotlightAuction from '../Spotlight/SpotlightAuction';
import BoostSystem from '../Boost/BoostSystem';


const ZentriumView = () => {
  const { userProfile, isAdmin } = useUser();
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [showAppUploader, setShowAppUploader] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);
  const [trendingApps, setTrendingApps] = useState([]);
  const [promotedApp, setPromotedApp] = useState(null);
  const [userCollections, setUserCollections] = useState([]);
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [viewingCollection, setViewingCollection] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [appsPerPage] = useState(12);
  const [showSpotlightAuction, setShowSpotlightAuction] = useState(false); // already added
  const [showBoostSystem, setShowBoostSystem] = useState(false); // <-- add this line to fix error
  const navigate = useNavigate();
  const { appIdFromUrl } = useParams();
  const reactRouterLocation = useLocation();

  console.log('[ZentriumView] Attempting to get outletContext...');
  const outletContext = useOutletContext();
  console.log('[ZentriumView] Received outletContext:', outletContext);

  const setShowInAppBrowser = outletContext?.setShowInAppBrowser || (() => console.warn('[ZentriumView] setShowInAppBrowser not available - outletContext:', outletContext));
  const setBrowserUrl = outletContext?.setBrowserUrl || (() => console.warn('[ZentriumView] setBrowserUrl not available - outletContext:', outletContext));

  const categories = ['all', 'productivity', 'games', 'utilities', 'social', 'education', 'business'];

  const handleClearDatabase = async () => {
    // Ensure userProfile and its uid exist for the admin check, though it's relaxed in the service for dev
    const adminId = userProfile?.uid || 'admin_action_initiated_by_unknown_user';

    if (window.confirm('Are you sure you want to clear the ENTIRE APP DATABASE from Firestore? This action cannot be undone.')) {
      try {
        console.log(`[ZentriumView] Attempting to clear Firestore app database. Admin ID: ${adminId}`);
        const numCleared = await professionalService.clearAllAppsFromFirestore(adminId);
        alert(`Successfully cleared ${numCleared} apps from Firestore.`);
        setApps([]); // Clear apps from local state
        // Optionally, also clear local storage if it was used as a cache or for other app-related data
        // professionalService.clearAppShowcase(); 
        console.log('[ZentriumView] Firestore app database clear process completed.');
        // Force a refresh of apps from the (now empty) database if needed, or rely on current empty state
        // fetchApps(); // Re-fetch, which should return empty
      } catch (error) {
        console.error('Error clearing Firestore app database from ZentriumView:', error);
        alert(`Failed to clear Firestore app database: ${error.message}`);
      }
    }
  };

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const publicApps = await professionalService.getPublicApps();
        setApps(publicApps);

        const currentTrendingApps = await professionalService.getTrendingApps(4, 3);
        setTrendingApps(currentTrendingApps);

        if (publicApps.length > 0) {
          const validTrendingApps = Array.isArray(currentTrendingApps) ? currentTrendingApps : [];
          const nonTrendingApps = publicApps.filter(pApp => !validTrendingApps.find(tApp => tApp.id === pApp.id));
          let appToPromote = null;

          if (nonTrendingApps.length > 0) {
            const highlyRatedNonTrending = nonTrendingApps.filter(app => app.averageRating && parseFloat(app.averageRating) >= 4);
            
            if (highlyRatedNonTrending.length > 0) {
              appToPromote = highlyRatedNonTrending[Math.floor(Math.random() * highlyRatedNonTrending.length)];
            } else {
              const sortedNonTrending = [...nonTrendingApps].sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt || 0);
                const dateB = new Date(b.updatedAt || b.createdAt || 0);
                return dateB - dateA;
              });
              if (sortedNonTrending.length > 0) {
                appToPromote = sortedNonTrending[0];
              }
            }
          }

          if (!appToPromote && publicApps.length > 0) {
            if (nonTrendingApps.length === 0 && validTrendingApps.length > 0) {
                appToPromote = validTrendingApps[Math.floor(Math.random() * validTrendingApps.length)];
            } else if (publicApps.length > 0) { 
                appToPromote = publicApps[Math.floor(Math.random() * publicApps.length)];
            }
          }
          setPromotedApp(appToPromote);
        } else {
          setPromotedApp(null); 
        }

      } catch (error) {
        console.error('Error loading apps from Firebase:', error);
        setApps([]);
        setTrendingApps([]);
        setPromotedApp(null);
      }
    };

    fetchApps();
  }, []);

  useEffect(() => {
    if (appIdFromUrl && apps.length > 0) {
      const appToSelect = apps.find(app => app.id === appIdFromUrl);
      if (appToSelect) {
        setSelectedApp(appToSelect);
      } else {
        console.warn(`[ZentriumView] App with ID "${appIdFromUrl}" not found for direct linking.`);
        if (reactRouterLocation.pathname.startsWith('/apphub/app/')) {
             navigate('/apphub', { replace: true });
        }
      }
    }
  }, [appIdFromUrl, apps, navigate, reactRouterLocation.pathname]);

  // Effect for debouncing search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    let filtered = apps;

    if (debouncedSearchQuery) {
      filtered = filtered.filter(app =>
        app.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        app.name?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        app.description?.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(app => app.category === categoryFilter);
    }

    // Apply sorting
    if (sortBy === 'downloads') {
      filtered.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (parseFloat(b.averageRating) || 0) - (parseFloat(a.averageRating) || 0));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0));
    }
    // 'relevance' doesn't require an explicit sort here as it's the baseline after text/category filtering.

    setFilteredApps(filtered);
  }, [apps, debouncedSearchQuery, categoryFilter, sortBy]);

  // Calculate current apps to display based on pagination
  const indexOfLastApp = currentPage * appsPerPage;
  const indexOfFirstApp = indexOfLastApp - appsPerPage;
  const currentAppsToDisplay = filteredApps.slice(indexOfFirstApp, indexOfLastApp);
  const totalPages = Math.ceil(filteredApps.length / appsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    }
  };

  useEffect(() => {
    // Reset to page 1 if filters change and current page becomes invalid
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    } else if (totalPages === 0 && currentPage !== 1) {
      // if no results, still reset to 1, handles case where all items are filtered out
      setCurrentPage(1);
    } 
  }, [filteredApps, totalPages, currentPage]);

  const AppCard = ({ app }) => {
    const isOwner = userProfile && app.userId === userProfile.uid;

    const handleEdit = (e) => {
      e.stopPropagation(); // Prevent card click when editing
      setEditingApp(app);
      setShowAppUploader(true);
    };

    return (
      <div 
        className={`bg-gray-800/60 border border-gray-700/60 rounded-xl p-5 hover:border-purple-500/80 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 cursor-pointer relative group flex flex-col h-full backdrop-blur-sm transform hover:-translate-y-1 hover:scale-[1.02] ${app.isBoosted ? 'border-yellow-400/70 hover:border-yellow-500/90 shadow-yellow-500/15' : ''}`}
        onClick={() => setSelectedApp(app)}
        title={`View details for ${app.title || app.name}`}
      >
        {isOwner && (
          <button
            onClick={handleEdit}
            className="absolute top-2.5 right-2.5 p-2.5 bg-gray-700/80 hover:bg-purple-600 text-gray-300 hover:text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-md hover:shadow-purple-500/30"
            title="Edit App"
          >
            <FaEdit className="text-base" />
          </button>
        )}

        {/* App Icon and Title Section */}
        <div className="flex items-center mb-4">
          <div className={`w-16 h-16 bg-gradient-to-br ${app.iconUrl ? 'p-0' : 'from-purple-600 to-blue-600'} rounded-lg flex items-center justify-center mr-4 flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow`}>
            {app.iconUrl ? (
              <img src={app.iconUrl} alt={`${app.title || app.name} icon`} className="w-full h-full object-cover rounded-lg" />
            ) : (
              <FaCode className="text-3xl text-white opacity-90" />
            )}
          </div>
          <div className="overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-100 truncate group-hover:text-purple-300 transition-colors duration-200" title={app.title || app.name}>{app.title || app.name || 'Untitled App'}</h3>
            <p className="text-xs text-gray-400 truncate group-hover:text-gray-300 transition-colors duration-200" title={app.developerName || 'Unknown Developer'}>{app.developerName || 'Unknown Developer'}</p>
          </div>
        </div>

        {/* Description Section */}
        <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-grow min-h-[60px] group-hover:text-gray-300 transition-colors duration-200">{app.description || 'No description available.'}</p>
        
        {/* Footer: Stats and Category */}
        <div className="mt-auto pt-4 border-t border-gray-700/50 space-y-3">
          {/* Stats: Rating and Downloads */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-1 text-yellow-400 group-hover:text-yellow-300 transition-colors" title={`Average Rating: ${app.averageRating ? parseFloat(app.averageRating).toFixed(1) : 'N/A'}${app.totalRatings !== undefined ? ' (' + app.totalRatings + ' ratings)' : ''}`}>
                <FaStar />
              <span>{app.averageRating ? parseFloat(app.averageRating).toFixed(1) : 'N/A'}</span>
              {app.totalRatings !== undefined && (
                <span className="text-gray-500 ml-1 group-hover:text-gray-400 transition-colors">({app.totalRatings})</span>
              )}
            </div>
            <div className="flex items-center space-x-1 text-green-400 group-hover:text-green-300 transition-colors" title={`Downloads: ${app.downloads || 0}`}>
                <FaDownload />
              <span>{app.downloads || 0}</span>
            </div>
          </div>
          
          {/* Category and Boosted Badge */}
          <div className="flex items-center justify-between">
            <span className="text-purple-400 text-xs px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-200">
            {app.category || 'General'}
          </span>
            {app.isBoosted && (
              <span className="text-yellow-400 text-xs px-3 py-1 bg-yellow-500/10 border border-yellow-500/40 rounded-full flex items-center space-x-1.5 shadow-sm group-hover:text-yellow-300 group-hover:bg-yellow-500/20 transition-all duration-200" title="This app is currently boosted!">
                <FaRocket className="text-xs"/> 
                <span>Boosted</span>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AppModal = ({ app: initialApp, onClose, modalSetShowInAppBrowser, modalSetBrowserUrl }) => {
    const [currentApp, setCurrentApp] = useState(initialApp);
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const [showBoostConfirmDialog, setShowBoostConfirmDialog] = useState(false);
    const { userProfile } = useUser();

    useEffect(() => {
      console.log('AppModal currentApp:', initialApp);
      setCurrentApp(initialApp);
    }, [initialApp]);

    if (!currentApp) return null;

    const handleDownload = async () => {
      if (currentApp.downloadUrl) {
        window.open(currentApp.downloadUrl, '_blank');
        const updatedApp = { ...currentApp, downloads: (currentApp.downloads || 0) + 1 };
        await professionalService.saveApp(updatedApp);
        setCurrentApp(updatedApp);
        setApps(prevApps => prevApps.map(a => a.id === updatedApp.id ? updatedApp : a));
      }
    };

    const handleOpenDemo = () => {
      console.log('[AppModal] handleOpenDemo called. currentApp.demoUrl:', currentApp.demoUrl);
      if (currentApp.demoUrl) {
        if (typeof modalSetBrowserUrl === 'function') {
        modalSetBrowserUrl(currentApp.demoUrl);
        } else {
          console.warn('[AppModal] modalSetBrowserUrl prop is not a function.');
        }
        if (typeof modalSetShowInAppBrowser === 'function') {
        modalSetShowInAppBrowser(true);
        } else {
          console.warn('[AppModal] modalSetShowInAppBrowser prop is not a function.');
        }
        onClose(); // Close the main app modal
      }
    };

    const handleGithubOpen = () => {
      if (currentApp.githubUrl) {
        window.open(currentApp.githubUrl, '_blank');
      }
    };

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
      const isAppOwner = currentApp.userId === userProfile?.uid;

      return (
        <div className="flex flex-wrap gap-3 items-center">
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
          {isAppOwner && !currentApp.isBoosted && !showBoostConfirmDialog && (
            <button
              onClick={() => setShowBoostConfirmDialog(true)}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-lg transition-all duration-300 shadow-lg text-sm"
              title="Boost this app for greater visibility"
            >
              <FaRocket />
              <span>Boost App</span>
            </button>
          )}
          {isAppOwner && currentApp.isBoosted && (
             <div className="flex items-center space-x-2 px-5 py-2.5 bg-gray-700 text-yellow-400 rounded-lg text-sm">
              <FaRocket />
              <span>App is Boosted!</span>
            </div>
          )}
          {hasGithub && (
            <button
              onClick={handleGithubOpen}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-lg transition-all duration-300 shadow-lg"
            >
              <FaGithub className="text-lg" />
              <span>View Source</span>
            </button>
          )}
          {hasDemo && (
            <button
              onClick={handleOpenDemo}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 shadow-lg"
            >
              <FaExternalLinkAlt className="text-lg" />
              <span>Try Demo</span>
            </button>
          )}
        </div>
      );
    };

    const handleAppUpdated = (updatedApp) => {
      setCurrentApp(updatedApp);
      setApps(prevApps => prevApps.map(a => a.id === updatedApp.id ? updatedApp : a));
      if (promotedApp && promotedApp.id === updatedApp.id) {
        setPromotedApp(updatedApp);
      }
      setTrendingApps(prevTrendingApps => 
        prevTrendingApps.map(trendApp => trendApp.id === updatedApp.id ? updatedApp : trendApp)
      );
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-gray-700/50 flex flex-col shadow-2xl shadow-purple-500/10" onClick={e => e.stopPropagation()}>
          {/* Modal Header */}
          <div className="p-5 border-b border-gray-700/50 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                  {currentApp.iconUrl ? (
                    <img src={currentApp.iconUrl} alt={`${currentApp.title || currentApp.name} icon`} className="w-10 h-10 object-contain rounded" />
                  ) : (
                    <FaCode className="text-2xl text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-100 mb-0.5">{currentApp.title || currentApp.name || 'Untitled App'}</h2>
                  <p className="text-gray-400 text-xs mb-1.5">
                    by <span className="font-medium text-gray-300">{currentApp.developerName || 'Unknown Developer'}</span>
                  </p>
                  <span className="px-3 py-1 bg-purple-600/20 text-purple-300 text-xs rounded-full border border-purple-500/30">
                    {currentApp.category || 'Other'}
                    </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    const appTitle = currentApp.title || currentApp.name || "Cool App";
                    const appDescription = currentApp.description || "Check it out on Zentro!";
                    const shareUrl = `${window.location.origin}/apphub/app/${currentApp.id}`;

                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: `Check out ${appTitle} on Zentro!`,
                          text: `I found this cool app on Zentro: ${appTitle}. ${appDescription.substring(0, 100)}${appDescription.length > 100 ? '...' : ''}`,
                          url: shareUrl,
                        });
                        console.log('App shared successfully');
                      } catch (err) {
                        console.error('Failed to share app:', err);
                        // Fallback to clipboard if native share fails (e.g., user cancels)
                        // Some browsers might throw error if user cancels, so clipboard fallback here is useful.
                        navigator.clipboard.writeText(shareUrl).then(() => {
                          setShowCopiedMessage(true);
                          setTimeout(() => setShowCopiedMessage(false), 2000);
                        }).catch(clipErr => console.error('Failed to copy share link after share failed:', clipErr));
                      }
                    } else {
                      // Fallback for browsers that do not support navigator.share
                      navigator.clipboard.writeText(shareUrl).then(() => {
                        setShowCopiedMessage(true);
                        setTimeout(() => setShowCopiedMessage(false), 2000);
                      }).catch(err => console.error('Failed to copy share link:', err));
                    }
                  }}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors relative"
                  title="Share App"
                >
                  <FaShareAlt />
                  {showCopiedMessage && (
                    <span className="absolute -top-8 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded shadow-lg">
                      Link Copied!
                    </span>
                  )}
                </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Close Modal"
              >
                <FaTimes />
              </button>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="overflow-y-auto flex-1 p-5 space-y-6">
            {/* App Banner/Video */}
            {currentApp.bannerUrl && (
              <div className="mb-5 rounded-lg overflow-hidden aspect-video bg-gray-800">
                {currentApp.bannerUrl.includes('youtube.com/embed') ? (
                  <iframe
                    src={currentApp.bannerUrl}
                    title="App Video Preview"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <img src={currentApp.bannerUrl} alt="App Banner" className="w-full h-full object-cover" />
                )}
              </div>
            )}
                        
            {/* Screenshots/Media Viewer */}
            {currentApp.screenshots && currentApp.screenshots.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-200">Screenshots</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {currentApp.screenshots.map((ss, index) => (
                    <img
                      key={index}
                                src={ss.url || ss} 
                      alt={`Screenshot ${index + 1}`}
                                className="rounded-md object-cover w-full h-auto aspect-video cursor-pointer hover:opacity-75 transition-opacity shadow-md hover:shadow-lg" 
                                onClick={() => {
                                  if (typeof modalSetBrowserUrl === 'function') {
                                    modalSetBrowserUrl(ss.url || ss);
                                  } else {
                                    console.warn('[AppModal] modalSetBrowserUrl prop is not a function for screenshot click.');
                                  }
                                  if (typeof modalSetShowInAppBrowser === 'function') {
                                    modalSetShowInAppBrowser(true);
                                  } else {
                                    console.warn('[AppModal] modalSetShowInAppBrowser prop is not a function for screenshot click.');
                                  }
                                }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Full Description */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-200">Description</h3>
              <p className="text-gray-300/90 whitespace-pre-wrap leading-relaxed text-sm">
                {currentApp.description || 'No detailed description available.'}
              </p>
              </div>

            {/* Version & Last Updated - Part of scrollable content */}
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 pt-4 border-t border-gray-700/50">
                <div>
                    <h4 className="font-medium text-gray-300 mb-0.5">Version</h4>
                    <p>{currentApp.version || 'N/A'}</p>
                </div>
                <div>
                    <h4 className="font-medium text-gray-300 mb-0.5">Last Updated</h4>
                    <p>{currentApp.lastUpdated ? new Date(currentApp.lastUpdated).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

            {/* App Rating System - Part of scrollable content */}
            <div className="pt-6 border-t border-gray-700/50">
              <AppRatingSystem app={currentApp} onAppUpdated={handleAppUpdated} />
            </div>
          </div>

          {/* Modal Footer (Action Buttons) - New Fixed Footer */}
          <div className="p-5 border-t border-gray-700/50 flex-shrink-0 bg-gray-900/70">
            {renderActionButton()}
          </div>

          {/* Boost Confirmation Dialog */}
          {showBoostConfirmDialog && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
              <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 max-w-sm w-full">
                <h3 className="text-lg font-semibold text-white mb-3">Boost "{currentApp.title || currentApp.name}"?</h3>
                <p className="text-sm text-gray-300 mb-4">
                  This will feature your app more prominently for 7 days.
                  (Placeholder: Costs 100 Creator Coins).
                </p>
                <div className="flex justify-end space-x-3">
                  <button 
                    onClick={() => setShowBoostConfirmDialog(false)}
                    className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => {
                      console.log(`Boost confirmed for app: ${currentApp.id}`);
                      const boostedApp = { ...currentApp, isBoosted: true };
                      // In a real scenario, here you would:
                      // 1. Call a service to deduct coins.
                      // 2. Call professionalService.saveApp(boostedApp) to persist the boost status.
                      // For now, we just update the local state via onAppUpdated.
                      handleAppUpdated(boostedApp); // Update state in ZentriumView
                      setShowBoostConfirmDialog(false);
                      onClose(); // Close the main app modal as the action is done
                    }}
                    className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors"
                  >
                    Confirm Boost
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Main container with padding */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Admin Controls: Call isAdmin as a function */}
        {isAdmin() && (
          <div className="mb-6 p-4 bg-red-800/20 border border-red-700/30 rounded-lg flex justify-between items-center">
            <p className="text-sm text-red-300">Admin: Use with caution.</p>
            <button
              onClick={handleClearDatabase}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors"
            >
              Clear App Database
            </button>
          </div>
        )}

        {/* Professional Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Zentrium
              </h1>
              <p className="text-lg text-gray-300">
                Professional app marketplace and deployment platform
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-purple-500/20">
                <div className="text-sm text-gray-400">Total Apps</div>
                <div className="text-xl font-bold text-purple-400">{apps.length}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-blue-500/20">
                <div className="text-sm text-gray-400">Downloads</div>
                <div className="text-xl font-bold text-blue-400">{apps.reduce((sum, app) => sum + (app.downloads || 0), 0)}</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2 items-center">
              {userProfile && (
                <button
                  onClick={() => {
                    setEditingApp(null);
                    setShowAppUploader(true);
                  }}
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md hover:shadow-purple-500/40 transition-all duration-300 font-semibold flex items-center space-x-2 text-sm md:text-base"
                >
                  <FaPlus />
                  <span>Upload Your App</span>
                </button>
              )}
              <button
                onClick={() => setShowSpotlightAuction(true)}
                className="px-5 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white rounded-lg shadow-md font-semibold flex items-center space-x-2 text-sm md:text-base"
              >
                <FaGavel />
                <span>Spotlight Auction</span>
              </button>
              <button
                onClick={() => setShowBoostSystem(true)}
                className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg shadow-md font-semibold flex items-center space-x-2 text-sm md:text-base"
              >
                <FaRocket />
                <span>Boost System</span>
              </button>
            </div>
          </div>
          <p className="mt-3 text-center md:text-left text-lg text-gray-400">
            Discover, share, and experience amazing community-built applications.
          </p>
        </header>

        {/* Spotlight Auction Modal */}
        {showSpotlightAuction && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={() => setShowSpotlightAuction(false)}
          >
            <div
              className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-2xl w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowSpotlightAuction(false)}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                title="Close"
              >
                <FaTimes size={20} />
              </button>
              <SpotlightAuction onClose={() => setShowSpotlightAuction(false)} isOpen={showSpotlightAuction} />
            </div>
          </div>
        )}

        {/* Boost System Modal */}
        {showBoostSystem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
            onClick={() => setShowBoostSystem(false)}
          >
            <div
              className="bg-gray-900 rounded-xl shadow-2xl p-6 max-w-2xl w-full relative"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowBoostSystem(false)}
                className="absolute top-3 right-3 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
                title="Close"
              >
                <FaTimes size={20} />
              </button>
              <BoostSystem onClose={() => setShowBoostSystem(false)} />
            </div>
          </div>
        )}

        {/* Promoted App Spotlight - Enhanced */}
        {promotedApp && (
          <section className="mb-10 md:mb-12 p-6 sm:p-8 bg-gradient-to-br from-gray-800 via-gray-800/90 to-gray-900/80 rounded-xl shadow-2xl border border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 group backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-center gap-6 sm:gap-8">
              {/* Icon / Image */} 
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden transform transition-all duration-500 group-hover:scale-105">
                {promotedApp.iconUrl ? (
                  <img src={promotedApp.iconUrl} alt={`${promotedApp.title || promotedApp.name} icon`} className="w-full h-full object-cover" />
                ) : (
                  <FaCode className="text-6xl md:text-7xl text-white opacity-80" />
                )}
              </div>
              {/* Details */}
              <div className="flex-1 text-center md:text-left">
                <span className="text-xs font-semibold uppercase tracking-wider bg-purple-500/80 text-white px-3 py-1 rounded-full mb-2 inline-block shadow">✨ Featured App Spotlight</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-100 mb-2 group-hover:text-purple-300 transition-colors duration-300">{promotedApp.title || promotedApp.name || 'Amazing App'}</h2>
                <p className="text-gray-400 mb-4 line-clamp-2 md:line-clamp-3 text-sm md:text-base">{promotedApp.description || 'No description available. Check it out to learn more!'}</p>
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                    {promotedApp.averageRating && (
                        <div className="flex items-center space-x-1 text-yellow-400" title={`Rating: ${parseFloat(promotedApp.averageRating).toFixed(1)} (${promotedApp.totalRatings || 0})`}>
                            <FaStar />
                            <span>{parseFloat(promotedApp.averageRating).toFixed(1)}</span>
                            {promotedApp.totalRatings !== undefined && <span className="text-gray-500 text-xs">({promotedApp.totalRatings})</span>}
                        </div>
                    )}
                    {promotedApp.downloads !== undefined && (
                        <div className="flex items-center space-x-1 text-green-400" title={`Downloads: ${promotedApp.downloads || 0}`}>
                            <FaDownload />
                            <span>{promotedApp.downloads || 0}</span>
                        </div>
                    )}
                    {promotedApp.category && (
                         <span className="text-pink-400 text-xs px-2.5 py-1 bg-pink-500/10 border border-pink-500/30 rounded-full">
                            {promotedApp.category}
                        </span>
                    )}
                </div>
                <button 
                  onClick={() => setSelectedApp(promotedApp)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white rounded-lg shadow-md hover:shadow-purple-500/40 transform transition-all duration-300 hover:scale-105 font-semibold text-sm md:text-base"
                >
                  View Details
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Search and Filter UI */}
        <div className="mb-6 md:mb-8 p-4 bg-gray-800/60 border border-gray-700/50 rounded-xl shadow-lg backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Search Input */}
            <div className="md:col-span-2">
              <label htmlFor="appSearch" className="block text-sm font-medium text-gray-300 mb-1">Search Apps</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
              <input
                type="text"
                  id="appSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, description, or developer..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/70 rounded-lg text-gray-200 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
              />
              </div>
            </div>
            {/* Category Filter */}
            <div>
              <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-300 mb-1">Category</label>
            <select
                id="categoryFilter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600/70 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors h-[50px]"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>
            </div>
            {/* Sort By */}
            <div>
                <label htmlFor="sortBy" className="block text-sm font-medium text-gray-300 mb-1">Sort By</label>
                <select 
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-3 bg-gray-700/50 border border-gray-600/70 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors h-[50px]"
                >
                    <option value="relevance">Relevance</option>
                    <option value="downloads">Downloads</option>
                    <option value="rating">Rating</option>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
            </select>
            </div>
          </div>
        </div>

        {/* Trending Apps Section (Community Favorites) */}
        {trendingApps && trendingApps.length > 0 && (
          <section className="mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-100 mb-3 md:mb-5 flex items-center">
                <FaStar className="mr-3 text-yellow-400" /> Community Favorites
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
              {trendingApps.map(app => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </section>
        )}

        {/* Main App Grid Title */}
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-100 mb-5 md:mb-6">
            {categoryFilter === 'all' && !searchQuery ? 'All Apps' : 'Filtered Results'}
        </h2>

        {/* Main App Grid */}
        {currentAppsToDisplay.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
            {currentAppsToDisplay.map(app => (
              <AppCard key={app.id} app={app} />
            ))}
        </div>
          ) : (
          <div className="text-center py-12 md:py-16 bg-gray-800/40 rounded-xl border border-dashed border-gray-700/50">
            <FaSearch className="text-5xl md:text-6xl text-purple-400 mb-6 mx-auto" />
            <h3 className="text-xl md:text-2xl font-semibold text-gray-100 mb-3">No Apps Found</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              {searchQuery || categoryFilter !== 'all'
                ? "Try adjusting your search or category filters, or check back later for new additions!"
                : "No apps available in the hub yet. Why not upload the first one?"
              }
            </p>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <nav className="mt-10 md:mt-12 flex justify-center items-center space-x-2" aria-label="Pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-md hover:bg-purple-600/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
                <FaArrowLeft className="mr-2 text-xs" /> Previous
            </button>
            {[...Array(totalPages).keys()].map(num => (
              <button 
                key={num + 1} 
                onClick={() => handlePageChange(num + 1)} 
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === num + 1 ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-300 bg-gray-700/50 hover:bg-purple-600/70'}`}
              >
                {num + 1}
              </button>
            ))}
            <button 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-md hover:bg-purple-600/70 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
                Next <FaArrowLeft className="ml-2 text-xs transform rotate-180" />
            </button>
          </nav>
        )}

      </div> {/* End main container */}

      {/* Modals: AppUploader and AppModal */}
      {showAppUploader && (
        <AppUploader
            appData={editingApp} 
            onClose={() => setShowAppUploader(false)} 
            onAppSaved={(savedApp) => {
                setApps(prev => {
                    const index = prev.findIndex(a => a.id === savedApp.id);
                    if (index !== -1) {
                        const newApps = [...prev];
                        newApps[index] = savedApp;
                        return newApps;
                    }
                    return [...prev, savedApp];
                });
                if (selectedApp && selectedApp.id === savedApp.id) {
                    setSelectedApp(savedApp); // Update selected app if it was being edited
                }
            setShowAppUploader(false);
          }}
        />
      )}

      {selectedApp && (
        <AppModal
          app={selectedApp}
          onClose={() => setSelectedApp(null)}
          modalSetShowInAppBrowser={setShowInAppBrowser}
          modalSetBrowserUrl={setBrowserUrl}
            onAppUpdated={(updatedApp) => {
                // Update the main apps list
                setApps(prevApps => prevApps.map(app => app.id === updatedApp.id ? updatedApp : app));
                // Update the selected app state if it's the one being viewed
                if (selectedApp && selectedApp.id === updatedApp.id) {
                    setSelectedApp(updatedApp);
                }
                // Update trending apps list if the updated app is in it
                setTrendingApps(prevTrending => prevTrending.map(app => app.id === updatedApp.id ? updatedApp : app));
                // Update promoted app if it's the one being viewed
                if (promotedApp && promotedApp.id === updatedApp.id) {
                    setPromotedApp(updatedApp);
                }
            }}
        />
      )}

      {showCreateCollectionModal && (
        <CreateCollectionModal 
          apps={apps} 
          onClose={() => setShowCreateCollectionModal(false)} 
          onSaveCollection={(newCollection) => {
            setUserCollections(prev => [...prev, newCollection]);
            setShowCreateCollectionModal(false);
          }}
        />
      )}

      {viewingCollection && (
        <ViewCollectionModal 
          collection={viewingCollection} 
          apps={apps} /* Pass all apps to find details */
          onClose={() => setViewingCollection(null)} 
          onSelectApp={(app) => setSelectedApp(app)}
        />
      )}

    </div>
  );
};

// Define CreateCollectionModal (can be moved to a separate file later)
const CreateCollectionModal = ({ onClose, onSaveCollection, apps }) => {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDescription, setCollectionDescription] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleToggleAppSelection = (appId) => {
    setSelectedAppIds(prevSelected =>
      prevSelected.includes(appId)
        ? prevSelected.filter(id => id !== appId)
        : [...prevSelected, appId]
    );
  };

  const handleSubmit = () => {
    if (!collectionName.trim()) {
      alert('Collection name is required.');
      return;
    }
    onSaveCollection({
      id: Date.now().toString(),
      name: collectionName.trim(),
      description: collectionDescription.trim(),
      appIds: selectedAppIds,
    });
  };

  const filteredApps = apps.filter(app => 
    (app.title || app.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl max-w-2xl w-full border border-gray-700/50 shadow-2xl shadow-sky-500/10 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-5 p-6 border-b border-gray-700/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-100">Create New Collection</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <FaTimes size={18}/>
          </button>
        </div>
        
        <div className="space-y-4 p-6 overflow-y-auto flex-grow">
          <div>
            <label htmlFor="collectionName" className="block text-sm font-medium text-gray-300 mb-1">Collection Name <span className="text-red-500">*</span></label>
            <input 
              type="text"
              id="collectionName"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800/70 border border-gray-700/60 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              placeholder="e.g., My Favorite Productivity Tools"
            />
          </div>
          <div>
            <label htmlFor="collectionDescription" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
            <textarea 
              id="collectionDescription"
              value={collectionDescription}
              onChange={(e) => setCollectionDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-800/70 border border-gray-700/60 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
              placeholder="A brief description of what this collection is about..."
            />
          </div>

          {/* App Selection Section */}
          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Apps for this Collection ({selectedAppIds.length} selected)</label>
            <input 
              type="text"
              placeholder={`Search ${apps.length} available apps...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 mb-3 bg-gray-800/70 border border-gray-700/60 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
            />
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2 border border-gray-700/50 rounded-md p-3 bg-gray-900/30">
              {filteredApps.length > 0 ? filteredApps.map(app => (
                <div key={app.id} className={`flex items-center justify-between p-2.5 rounded-md transition-colors duration-150 ${selectedAppIds.includes(app.id) ? 'bg-sky-600/30' : 'bg-gray-800/50 hover:bg-gray-700/50'}`}>
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                      {app.iconUrl ? (
                        <img src={app.iconUrl} alt={`${app.title || app.name} icon`} className="w-5 h-5 object-contain rounded-sm" />
                      ) : (
                        <FaCode className="text-sm text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-200 truncate" title={app.title || app.name}>{app.title || app.name || 'Untitled App'}</span>
                  </div>
                  <input 
                    type="checkbox"
                    checked={selectedAppIds.includes(app.id)}
                    onChange={() => handleToggleAppSelection(app.id)}
                    className="form-checkbox h-5 w-5 text-sky-500 bg-gray-700 border-gray-600 rounded focus:ring-sky-600 focus:ring-offset-gray-800 cursor-pointer"
                  />
                </div>
              )) : (
                <p className="text-sm text-gray-500 text-center py-4">No apps match your search, or no apps available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-auto p-6 border-t border-gray-700/50 flex-shrink-0">
          <div className="flex justify-end space-x-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-5 py-2 text-sm bg-sky-600 hover:bg-sky-500 text-white rounded-md transition-colors font-medium shadow-md hover:shadow-sky-500/30"
            >
              Save Collection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Define ViewCollectionModal (can be moved to a separate file later)
const ViewCollectionModal = ({ collection, apps, onClose, onSelectApp }) => {
  if (!collection) return null;

  const collectionApps = collection.appIds
    .map(appId => apps.find(app => app.id === appId))
    .filter(app => app); // Filter out any apps not found (e.g., if deleted)

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl max-w-2xl w-full border border-gray-700/50 shadow-2xl shadow-sky-500/10 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-700/50 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-semibold text-sky-300 mb-0.5 truncate" title={collection.name}>{collection.name}</h2>
            <p className="text-sm text-gray-400 line-clamp-2">{collection.description || 'No description for this collection.'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <FaTimes size={20}/>
          </button>
        </div>

        {/* Scrollable Content Area (Apps in Collection) */}
        <div className="overflow-y-auto flex-grow p-6 space-y-3">
          {collectionApps.length > 0 ? (
            collectionApps.map(app => (
              <div key={app.id} className="flex items-center justify-between bg-gray-800/70 p-3 rounded-lg hover:bg-gray-700/70 transition-colors">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
                    {app.iconUrl ? (
                      <img src={app.iconUrl} alt={`${app.title || app.name} icon`} className="w-7 h-7 object-contain rounded-sm" />
                    ) : (
                      <FaCode className="text-xl text-white" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-semibold text-gray-100 truncate" title={app.title || app.name}>{app.title || app.name || 'Untitled App'}</h4>
                    <p className="text-xs text-gray-400 truncate">{app.developerName || 'Unknown Developer'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectApp(app)}
                  className="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors whitespace-nowrap"
                >
                  View Details
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-6">This collection is currently empty.</p>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-700/50 flex-shrink-0 bg-gray-900/70 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZentriumView;
