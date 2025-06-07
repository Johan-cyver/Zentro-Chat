import React, { useState } from 'react';
import { FaTimes, FaArrowLeft, FaArrowRight, FaRedo, FaHome } from 'react-icons/fa';

const InAppBrowser = ({ url, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState(url);
  const [loading, setLoading] = useState(true);

  const handleRefresh = () => {
    setLoading(true);
    // Force iframe reload
    const iframe = document.getElementById('app-browser-iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  };

  const handleUrlChange = (e) => {
    if (e.key === 'Enter') {
      setCurrentUrl(e.target.value);
      setLoading(true);
    }
  };

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-6xl h-[90vh] overflow-hidden border border-gray-700 flex flex-col">
        {/* Browser Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Close"
            >
              <FaTimes />
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                title="Refresh"
              >
                <FaRedo />
              </button>
            </div>
          </div>

          {/* URL Bar */}
          <div className="flex-1 mx-4">
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              onKeyDown={handleUrlChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Enter URL..."
            />
          </div>

          <div className="text-sm text-gray-400">
            Press Enter to navigate
          </div>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center h-16 bg-gray-800 border-b border-gray-700 flex-shrink-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-500 border-t-transparent"></div>
              <span>Loading...</span>
            </div>
          </div>
        )}

        {/* Browser Content - This must take up the remaining space */}
        <div className="flex-1 bg-white overflow-hidden">
          <iframe
            id="app-browser-iframe"
            src={currentUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            title="App Demo"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 bg-gray-800 text-center flex-shrink-0">
          <p className="text-xs text-gray-400">
            🔒 This app is running in a secure sandbox environment within Zentrium
          </p>
        </div>
      </div>
    </div>
  );
};

export default InAppBrowser;
