import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBlog, FaInbox, FaUsers, FaRocket, FaUserFriends, FaCog, FaUser } from 'react-icons/fa'; // Changed FaRobot to FaRocket, added FaUser

const ZentroSidebar = ({ currentView, setCurrentView }) => {
  const navigate = useNavigate();

  const handleNavigation = (view, path) => {
    setCurrentView(view);
    navigate(path); // This will trigger the useEffect in ChatRoom.jsx to update the view
  };

  // Define navigation items array for cleaner mapping
  const navItems = [
    {
      key: 'chat', // Added a key for Chat/DM, assuming /chat is the primary DM/Chat interface path
      label: 'Chat',
      icon: FaInbox, // Example icon for Chat/DM
      path: '/chat'
    },
    {
      key: 'messages',
      label: 'Messages', // This was the old label for DMs, maybe merge with Chat or keep separate if distinct functionality
      icon: FaInbox, // Redundant if Chat handles DMs, adjust as needed
      path: '/messages'
    },
    {
      key: 'groups',
      label: 'Groups',
      icon: FaUsers,
      path: '/groups'
    },
    {
      key: 'blog',
      label: 'Blog',
      icon: FaBlog,
      path: '/blog'
    },
    {
      key: 'profile',
      label: 'Profile',
      icon: FaUser, 
      path: '/profile' 
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: FaCog,
      path: '/settings'
    },
    {
      key: 'friend-requests',
      label: 'Friend Requests',
      icon: FaUserFriends,
      path: '/friend-requests'
    },
    {
      key: 'zentrium',
      label: 'Zentrium',
      icon: FaRocket,
      path: '/zentrium'
    }
    // Add other main navigation items here if needed
  ];

  return (
    <div className="w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Zentro</h1>
      </div>
      
      <nav className="mt-4 flex-grow">
        <ul className="space-y-1">
          {navItems.map(item => (
            <li key={item.key}>
              <button
                onClick={() => handleNavigation(item.key, item.path)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors duration-150 ${
                  currentView === item.key // Use item.key for highlighting
                    ? 'text-white bg-gradient-to-r from-purple-600 to-blue-500 shadow-md'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${currentView === item.key ? 'text-white' : 'text-gray-400 dark:text-gray-500'}`} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Sidebar Footer - Profile/Settings (can be integrated into navItems or kept separate) */}
      {/* This section might be redundant if Profile and Settings are in navItems now */}
      {/* Consider removing if covered above */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Example: User profile quick access - this could also be a navItem */}
        {/* <button ... onClick={() => handleNavigation('profile', '/profile')} ... > ... </button> */}
        {/* Example: Settings quick access - this could also be a navItem */}
        {/* <button ... onClick={() => handleNavigation('settings', '/settings')} ... > ... </button> */}
      </div>
    </div>
  );
};

export default ZentroSidebar; 