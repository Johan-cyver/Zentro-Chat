import React, { useState, useEffect } from 'react';
import { FaUsers } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import GroupList from './GroupList';
import GroupChat from './GroupChat';
import GroupMembers from './GroupMembers';
import GroupSettings from './GroupSettings';
import ZentroSidebar from '../../componenents/UI/ZentroSidebar';
import groupService from '../../services/groupService';

const GroupsView = () => {
  const { userProfile } = useUser();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [currentView, setCurrentView] = useState('groups');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    setShowMembers(false);
    setShowSettings(false);
  };

  const handleBackToList = () => {
    setSelectedGroup(null);
    setShowMembers(false);
    setShowSettings(false);
  };

  const handleShowMembers = () => {
    setShowMembers(true);
    setShowSettings(false);
  };

  const handleShowSettings = () => {
    setShowSettings(true);
    setShowMembers(false);
  };

  const handleGroupUpdated = (updatedGroup) => {
    setSelectedGroup(updatedGroup);
  };

  const handleLeaveGroup = async () => {
    if (selectedGroup && userProfile?.uid) {
      try {
        await groupService.leaveGroup(selectedGroup.id, userProfile.uid);
        setSelectedGroup(null);
        setShowMembers(false);
        setShowSettings(false);
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    }
  };

  // Handle view changes from sidebar
  const handleViewChange = (view) => {
    if (view === 'dm') {
      navigate('/chat');
    } else if (view === 'blog') {
      navigate('/blog');
    } else if (view === 'zentrium') {
      navigate('/zentrium');
    } else if (view === 'professional') {
      navigate('/directory');
    } else if (view === 'profile') {
      navigate('/profile');
    } else {
      setCurrentView(view);
    }
  };

  // Mobile view - show only one panel at a time
  if (isMobile) {
    if (showMembers && selectedGroup) {
      return (
        <div
          className="h-screen flex"
          style={{ backgroundColor: currentTheme.colors.background }}
        >
          <ZentroSidebar currentView={currentView} setCurrentView={handleViewChange} />
          <div className="flex-1">
            <GroupMembers
              group={selectedGroup}
              onBack={() => setShowMembers(false)}
              onLeaveGroup={handleLeaveGroup}
            />
          </div>
        </div>
      );
    }

    if (showSettings && selectedGroup) {
      return (
        <div
          className="h-screen flex"
          style={{ backgroundColor: currentTheme.colors.background }}
        >
          <ZentroSidebar currentView={currentView} setCurrentView={handleViewChange} />
          <div className="flex-1">
            <GroupSettings
              group={selectedGroup}
              onBack={() => setShowSettings(false)}
              onGroupUpdated={handleGroupUpdated}
              onLeaveGroup={handleLeaveGroup}
            />
          </div>
        </div>
      );
    }

    if (selectedGroup) {
      return (
        <div
          className="h-screen flex"
          style={{ backgroundColor: currentTheme.colors.background }}
        >
          <ZentroSidebar currentView={currentView} setCurrentView={handleViewChange} />
          <div className="flex-1">
            <GroupChat
              group={selectedGroup}
              onBack={handleBackToList}
              onShowMembers={handleShowMembers}
              onShowSettings={handleShowSettings}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        className="h-screen flex"
        style={{ backgroundColor: currentTheme.colors.background }}
      >
        <ZentroSidebar currentView={currentView} setCurrentView={handleViewChange} />
        <div className="flex-1">
          <GroupList
            onSelectGroup={handleSelectGroup}
            selectedGroupId={selectedGroup?.id}
          />
        </div>
      </div>
    );
  }

  // Desktop view - show multiple panels
  return (
    <div
      className="h-screen flex"
      style={{ backgroundColor: currentTheme.colors.background }}
    >
      {/* Sidebar */}
      <ZentroSidebar currentView={currentView} setCurrentView={handleViewChange} />

      {/* Groups List - Minimal when group is selected */}
      <div
        className={`${selectedGroup ? 'w-16' : 'w-80'} border-r transition-all duration-300`}
        style={{ borderColor: currentTheme.colors.borderMuted }}
      >
        <GroupList
          onSelectGroup={handleSelectGroup}
          selectedGroupId={selectedGroup?.id}
          isMinimal={selectedGroup !== null}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className={`${showMembers || showSettings ? 'flex-1' : 'w-full'}`}>
          {selectedGroup ? (
            <GroupChat
              group={selectedGroup}
              onBack={handleBackToList}
              onShowMembers={handleShowMembers}
              onShowSettings={handleShowSettings}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FaUsers
                  className="text-6xl mx-auto mb-4"
                  style={{ color: currentTheme.colors.textMuted }}
                />
                <h3
                  className="text-2xl font-semibold mb-2"
                  style={{ color: currentTheme.colors.text }}
                >
                  Welcome to Groups
                </h3>
                <p
                  className="mb-6 max-w-md"
                  style={{ color: currentTheme.colors.textMuted }}
                >
                  Create or join groups to chat with multiple people at once.
                  Invite Zentro Bot for AI assistance in your conversations.
                </p>
                <div
                  className="space-y-2 text-sm"
                  style={{ color: currentTheme.colors.textMuted }}
                >
                  <p>• Create public, private, or secret groups</p>
                  <p>• Add Zentro Bot with '/zentro' commands</p>
                  <p>• Share secret codes for exclusive access</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {(showMembers || showSettings) && selectedGroup && (
          <div
            className="w-80 border-l"
            style={{ borderColor: currentTheme.colors.borderMuted }}
          >
            {showMembers && (
              <GroupMembers
                group={selectedGroup}
                onBack={() => setShowMembers(false)}
                onLeaveGroup={handleLeaveGroup}
              />
            )}
            {showSettings && (
              <GroupSettings
                group={selectedGroup}
                onBack={() => setShowSettings(false)}
                onGroupUpdated={handleGroupUpdated}
                onLeaveGroup={handleLeaveGroup}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsView;
