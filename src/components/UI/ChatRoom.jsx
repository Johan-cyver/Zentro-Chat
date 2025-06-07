import React, { useState, useEffect, lazy, Suspense, useOutletContext } from 'react';
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
import ZentroSidebar from './ZentroSidebar';
import MobileBottomNav from './MobileBottomNav';
import MobileTopBar from './MobileTopBar';
import { useResponsive } from '../../hooks/useResponsive';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';

// Lazy load components
// const ChatInterface = lazy(() => import('../Chat/ChatInterface'));
// const GroupsView = lazy(() => import('../Groups/GroupsView'));
// const BlogSection = lazy(() => import('../Blog/BlogSection'));
// const UserProfile = lazy(() => import('../User/UserProfile'));
// const Settings = lazy(() => import('../Settings/Settings'));
// const DMView = lazy(() => import('../DM/DMView'));
// const FriendRequests = lazy(() => import('../Friends/FriendRequests'));
// const ZentriumView = lazy(() => import('../AppHub/ZentriumView'));
// const AppDetailView = lazy(() => import('../AppHub/AppDetailView'));

const ChatRoom = () => {
  const [currentView, setCurrentView] = useState('chat');
  const location = useLocation();
  const { userProfile } = useUser();
  const { currentTheme } = useTheme();
  const { isMobile, shouldShowMobileLayout } = useResponsive();

  useEffect(() => {
    console.log('[ChatRoom] Component MOUNTED');
  }, []);

  // Log context ChatRoom itself receives from its parent Outlet (e.g., PrivateRoute)
  const parentOutletContext = useOutletContext();
  console.log('[ChatRoom] Context received by ChatRoom itself:', parentOutletContext);

  useEffect(() => {
    // Logic to highlight sidebar item based on location.pathname
    const pathSegments = location.pathname.split('/').filter(Boolean);
    let viewKey = pathSegments[0] || 'chat'; // Default to chat
    if (viewKey === 'apphub' && pathSegments[1] === 'app') {
      viewKey = 'apphub/app'; // Special case for sidebar highlighting if needed
    }
    setCurrentView(viewKey);
  }, [location]);

  // Context provided by ChatRoom MAY or MAY NOT need to include browser functions
  // For now, assuming they are NOT needed by other children of ChatRoom's Outlet.
  // If they are, they should be added back here.
  const contextValue = {}; // Or any other context ChatRoom needs to provide
  console.log('[ChatRoom] Passing context to Outlet (browser functions removed):', contextValue);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar - Hidden on mobile */}
      {!isMobile && (
        <div className="hidden md:flex bg-gray-200 dark:bg-gray-800">
          <ZentroSidebar currentView={currentView} setCurrentView={setCurrentView} />
        </div>
      )}

      {/* Main Content */}
      <div className={`flex-1 h-full overflow-y-auto ${shouldShowMobileLayout ? 'pt-16 pb-16' : ''}`}>
        {shouldShowMobileLayout && <MobileTopBar currentView={currentView} />}
        {/* <Suspense fallback={<div className="flex justify-center items-center h-full text-white">Loading page...</div>}> */}
          {/* Outlet will render the matched child route component from App.jsx */}
          {/* We need to pass browser functions via context or route state if Outlet children need them */}
          <Outlet context={contextValue} />
        {/* </Suspense> */}
      </div>

      {/* Mobile Bottom Navigation - Only on mobile */}
      {shouldShowMobileLayout && <MobileBottomNav currentView={currentView} setCurrentView={setCurrentView} />}

      {/* In-App Browser Modal REMOVED from ChatRoom */}
      {/* {showInAppBrowser && (
        <Suspense fallback={<div>Loading browser...</div>}>
            <InAppBrowser url={browserUrl} onClose={() => setShowInAppBrowser(false)} />
        </Suspense>
      )} */}
    </div>
  );
};

export default ChatRoom; 