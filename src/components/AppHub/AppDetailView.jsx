import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useParams, useOutletContext } from 'react-router-dom';
import { FaDownload, FaExternalLinkAlt, FaStar, FaCode, FaArrowLeft } from 'react-icons/fa';
import AppRatingSystem from './AppRatingSystem';
import professionalService from '../../services/professionalService';
import { useUser } from '../../contexts/UserContext'; // Added for potential owner-specific actions later

const AppDetailView = () => {
  const { appId } = useParams(); // Get appId from URL params
  const { setBrowserUrl, setShowInAppBrowser } = useOutletContext(); // Get functions from ChatRoom's Outlet context

  const [currentApp, setCurrentApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userProfile } = useUser(); // For potential future use (e.g., edit button for owner)

  useEffect(() => {
    console.log('[AppDetailView] Received appId:', appId);
    const loadApp = async () => { // Make async for Firebase
      setLoading(true);
      try {
        // Comment out localStorage logic
        /*
        const storedApps = localStorage.getItem('zentro_apps');
        console.log('[AppDetailView] Stored zentro_apps:', storedApps ? storedApps.substring(0, 100) + '...' : 'null');
        if (!storedApps) {
          console.error('[AppDetailView] No zentro_apps found in localStorage.');
          setError('App data source not found. Please ensure apps are loaded.');
          setLoading(false);
          return;
        }
        const apps = JSON.parse(storedApps);
        const appData = apps.find(a => a.id === appId);
        */

        // TODO: Replace with actual Firebase fetch
        // Example: const appData = await firebaseService.getAppById(appId);
        // For now, let's simulate a fetch and assume professionalService might have it
        // const appData = await professionalService.getAppDetails(appId); // Assuming this method exists or will be created
        const appData = await professionalService.getAppDetailsFromFirebase(appId); // Use the new Firebase method

        console.log('[AppDetailView] Fetched appData for id (' + appId + '):', appData);

        if (appData) {
          // Ensure visibility is public or user is owner/admin (future enhancement)
          // For now, assume if it was in ZentriumView list, it's accessible
          setCurrentApp(appData);
          setError('');
        } else {
          console.error('[AppDetailView] App with id ' + appId + ' not found in localStorage.');
          setError(`App not found (ID: ${appId}). It might have been removed or the ID is incorrect.`);
        }
      } catch (e) {
        console.error('[AppDetailView] Error loading app details:', e);
        setError('Failed to load app details due to an internal error.');
      }
      setLoading(false);
    };

    if (appId) {
      loadApp();
    } else {
      console.error('[AppDetailView] No App ID provided to component.');
      setError('No App ID was provided to display details.');
      setLoading(false);
    }
  }, [appId]);

  const handleDownload = () => {
    if (currentApp && currentApp.downloadUrl) {
      window.open(currentApp.downloadUrl, '_blank');
      const updatedAppLocal = { ...currentApp, downloads: (currentApp.downloads || 0) + 1 };
      professionalService.saveApp(updatedAppLocal); // Persist
      setCurrentApp(updatedAppLocal); // Update local state for immediate UI feedback
    }
  };

  const handleOpenDemo = () => {
    if (currentApp && currentApp.demoUrl && setBrowserUrl && setShowInAppBrowser) {
      setBrowserUrl(currentApp.demoUrl);
      setShowInAppBrowser(true);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-white bg-gray-900 p-4">
        <p className="text-xl">Loading app details for ID: {appId || 'N/A'}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400 bg-gray-900 p-4">
        <h2 className="text-2xl font-semibold mb-3">Error Loading App</h2>
        <p className="text-lg mb-4 text-center">{error}</p>
        <button
          onClick={() => navigate('/zentrium')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-lg"
        >
          Back to Zentrium
        </button>
      </div>
    );
  }

  if (!currentApp) {
    // This state should ideally be caught by the error logic above if appId was valid but app not found
    // Or if appId was invalid from the start.
    return (
      <div className="flex flex-col items-center justify-center h-full text-yellow-400 bg-gray-900 p-4">
        <h2 className="text-2xl font-semibold mb-3">App Not Available</h2>
        <p className="text-lg mb-4 text-center">The requested app data could not be displayed. This might be due to an invalid ID or missing data.</p>
        <p className="text-sm mb-4">App ID: {appId || 'Not Provided'}</p>
        <button
          onClick={() => navigate('/zentrium')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-lg"
        >
          Back to Zentrium
        </button>
      </div>
    );
  }
  
  // const isOwner = currentApp.userId === userProfile?.uid; // For edit button later

  return (
    <div className="h-full flex flex-col text-white bg-gray-950">
      {/* Header Section (App Icon, Title, Key Info) */}
      <div className="p-4 md:p-6 border-b border-gray-700 flex-shrink-0 bg-gray-900">
        <button
          onClick={() => navigate('/zentrium')}
          className="mb-6 flex items-center text-purple-400 hover:text-purple-300 transition-colors duration-200"
        >
          <FaArrowLeft className="mr-2" />
          Back to Zentrium
        </button>
        <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            {currentApp.iconUrl ? (
              <img src={currentApp.iconUrl} alt={`${currentApp.title || currentApp.name} icon`} className="w-20 h-20 md:w-24 md:h-24 object-contain rounded-lg" />
            ) : (
              <FaCode className="text-5xl md:text-6xl text-white" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 break-words">{currentApp.title || currentApp.name || 'Untitled App'}</h1>
            <p className="text-gray-400 mb-2 text-lg">Created by {currentApp.creatorName || 'Anonymous'}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-3">
              <span className="text-purple-300 px-3 py-1 bg-purple-500/30 rounded-full">
                {currentApp.category || 'General'}
              </span>
              <div className="flex items-center space-x-1 text-yellow-400">
                <FaStar />
                <span>{currentApp.rating || 'N/A'} ({currentApp.ratingCount || 0} reviews)</span>
              </div>
              <div className="flex items-center space-x-1 text-green-400">
                <FaDownload />
                <span>{currentApp.downloads || 0} downloads</span>
              </div>
            </div>
            <p className="text-gray-500 text-xs">Last updated: {new Date(currentApp.updatedAt || currentApp.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-8 custom-scrollbar">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {currentApp.demoUrl && (
            <button
              onClick={handleOpenDemo}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-base font-medium shadow-md hover:shadow-lg"
            >
              <FaExternalLinkAlt />
              <span>Try Demo</span>
            </button>
          )}
          {currentApp.downloadUrl && (
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 text-base font-medium shadow-md hover:shadow-lg"
            >
              <FaDownload />
              <span>Download</span>
            </button>
          )}
          {currentApp.githubUrl && (
            <button
              onClick={() => window.open(currentApp.githubUrl, '_blank')}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 text-base font-medium shadow-md hover:shadow-lg"
            >
              <FaCode />
              <span>Source Code</span>
            </button>
          )}
        </div>
        
        {/* Full Description */}
        {currentApp.description && (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">About this app</h2>
            <div className="prose prose-invert prose-sm md:prose-base max-w-none text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-800/30 p-4 rounded-lg">
              {currentApp.description}
            </div>
          </section>
        )}

        {/* Screenshots */}
        {currentApp.screenshots && currentApp.screenshots.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">Screenshots</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentApp.screenshots.map((screenshot, index) => (
                <img
                  key={index}
                  src={screenshot}
                  alt={`Screenshot ${index + 1}`}
                  className="w-full h-auto object-cover rounded-lg border border-gray-700 shadow-md cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => { /* TODO: Implement image lightbox/modal for screenshots */ alert('View screenshot: ' + screenshot); }}
                />
              ))}
            </div>
          </section>
        )}

        {/* Features */}
        {currentApp.features && currentApp.features.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Features</h2>
            <ul className="list-disc list-inside space-y-2 pl-2 text-gray-300 leading-relaxed">
              {currentApp.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Tech Stack */}
        {currentApp.techStack && currentApp.techStack.length > 0 && (
          <section>
            <h2 className="text-2xl font-semibold text-white mb-3">Tech Stack</h2>
            <div className="flex flex-wrap gap-2">
              {currentApp.techStack.map((tech, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full border border-gray-600"
                >
                  {tech}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Rating System */}
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">Ratings & Reviews</h2>
          <AppRatingSystem app={currentApp} onRatingSubmitted={(updatedApp) => setCurrentApp(updatedApp)} />
        </section>
      </div>
    </div>
  );
};

export default AppDetailView; 