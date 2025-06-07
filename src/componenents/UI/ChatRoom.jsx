import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ZentroSidebar from "./ZentroSidebar";
import "./ChatRoom.css";
import ProfilePanel from "./ProfilePanel";
import BlogSection from "../../components/Blog/BlogSection";
import DMView from "../../components/DM/DMView";
import ProfessionalDirectory from "./ProfessionalDirectory";
import ZentriumView from "../../components/AppHub/ZentriumView";
import MobileNavigation from "../../components/Mobile/MobileNavigation";
import { useMobileBehavior } from "../../hooks/useResponsive";

const ChatRoom = () => {
  const location = useLocation();
  const { shouldShowMobileLayout } = useMobileBehavior();
  const [currentView, setCurrentView] = useState(() => {
    // Set initial view based on current route
    if (location.pathname === '/blog') return 'blog';
    if (location.pathname === '/zentrium') return 'zentrium';
    if (location.pathname === '/groups') return 'groups';
    // Check for professional directory navigation
    if (location.state?.view === 'professional') return 'professional';
    return 'dm'; // Default to DM view
  });
  const [profileUser, setProfileUser] = useState(null);

  // Check for navigation state and route changes
  useEffect(() => {
    if (location.state?.selectedChat) {
      setCurrentView("dm");
    } else if (location.state?.view) {
      setCurrentView(location.state.view);
    } else if (location.pathname === '/blog') {
      setCurrentView('blog');
    } else if (location.pathname === '/zentrium') {
      setCurrentView('zentrium');
    } else if (location.pathname === '/groups') {
      setCurrentView('groups');
    }
  }, [location.state, location.pathname]);

  // Listen for blog view switch
  React.useEffect(() => {
    const handleSwitchToBlogView = () => {
      setCurrentView("blog");
    };

    window.addEventListener('switchToBlogView', handleSwitchToBlogView);

    return () => {
      window.removeEventListener('switchToBlogView', handleSwitchToBlogView);
    };
  }, []);

  // View switcher
  const renderView = () => {
    switch (currentView) {
      case "profile":
        return (
          <ProfilePanel
            user={profileUser}
            onBack={() => setCurrentView("dm")}
          />
        );

      case "blog":
        return <BlogSection />;

      case "dm":
        return <DMView />;

      case "professional":
        return (
          <ProfessionalDirectory
            onViewProfile={(professional) => {
              setProfileUser(professional);
              setCurrentView("profile");
            }}
          />
        );

      case "zentrium":
        return <ZentriumView />;

      default:
        return <DMView />;
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex">
        <ZentroSidebar currentView={currentView} setCurrentView={setCurrentView} />
      </div>

      {/* Main Content */}
      <div className={`flex-1 overflow-y-auto ${shouldShowMobileLayout ? 'pt-16 pb-16' : ''}`}>
        {renderView()}
      </div>

      {/* Mobile Navigation - Only shown on mobile */}
      {shouldShowMobileLayout && (
        <MobileNavigation currentView={currentView} setCurrentView={setCurrentView} />
      )}
    </div>
  );
};

export default ChatRoom;
