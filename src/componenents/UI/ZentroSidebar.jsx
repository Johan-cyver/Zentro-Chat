import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEdit, FaEnvelope, FaBriefcase, FaSignOutAlt, FaRocket, FaUsers, FaDatabase, FaCog, FaGamepad, FaShieldAlt, FaChartLine } from "react-icons/fa";
import { clearAuthState } from "../../firebase";
import { useUser } from "../../contexts/UserContext";
import DataManager from "../../components/Debug/DataManager";
import AdminPanel from "../../components/Admin/AdminPanel";
// import ZennyCoinsWidget from "../../components/ZennyCoins/ZennyCoinsWidget"; // Temporarily disabled

const icons = [
  { icon: <FaEnvelope />, label: "Messages", view: "dm" },
  { icon: <FaChartLine />, label: "Dashboard", view: "dashboard", isRoute: true },
  { icon: <FaUsers />, label: "Groups", view: "groups", isRoute: true },
  { icon: <FaEdit />, label: "Zentro Network", view: "blog" },
  { icon: <FaBriefcase />, label: "ZentroNet", view: "professional" },
  { icon: <FaGamepad />, label: "Battle Arena", view: "battle", isRoute: true },
  { icon: <FaShieldAlt />, label: "Squad Central", view: "squads", isRoute: true },
  { icon: <FaRocket />, label: "Zentrium", view: "zentrium" },
  // Add more icons/views as needed
];

const ZentroSidebar = ({ currentView, setCurrentView }) => {
  const navigate = useNavigate();
  const userContext = useUser();
  const [showDataManager, setShowDataManager] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Handle loading state
  if (!userContext) {
    return <div>Loading...</div>;
  }

  const { isAdmin, canAccessAdminPanel } = userContext;

  // Handle logout
  const handleLogout = async () => {
    try {
      await clearAuthState();
      // Clear all Zentro-related localStorage items
      localStorage.removeItem('zentro_user_displayName');
      localStorage.removeItem('zentro_user_email');
      localStorage.removeItem('zentro_user_age');
      localStorage.removeItem('zentro_remember_email');
      localStorage.removeItem('zentro_remember_me');
      localStorage.removeItem('zentro_profile_view');

      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="w-14 h-screen bg-black text-purple-400 flex flex-col items-center relative border-r border-purple-700">
      {/* ZennyCoins Widget at Top - Temporarily disabled */}
      {/*
      <div className="mt-2 mb-4">
        <ZennyCoinsWidget className="scale-75" />
      </div>
      */}

      <div className="flex flex-col gap-6">
        {icons.map(({ icon, label, view, isRoute }) => (
          <div
            key={view}
            title={label}
            className={`text-2xl hover:text-white cursor-pointer transition-transform ${
              currentView === view ? "scale-110" : ""
            }`}
            onClick={() => {
              if (isRoute) {
                navigate(`/${view}`);
              } else if (view === 'professional') {
                // Navigate directly to the enhanced ZentroDirectory
                navigate('/directory');
              } else {
                setCurrentView(view);
              }
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* User Menu at Bottom */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3">
        {/* Admin Panel - Only for Admin */}
        {canAccessAdminPanel() && (
          <FaCog
            className="text-xl hover:text-red-400 cursor-pointer transition-colors"
            title="Admin Panel"
            onClick={() => setShowAdminPanel(true)}
          />
        )}

        {/* Admin Data Manager - Only for Admin */}
        {isAdmin() && (
          <FaDatabase
            className="text-xl hover:text-red-400 cursor-pointer transition-colors"
            title="Data Manager (Admin)"
            onClick={() => setShowDataManager(true)}
          />
        )}

        {/* Profile Icon */}
        <FaUser
          className="text-2xl hover:text-white cursor-pointer transition-colors"
          title="Profile"
          onClick={() => navigate('/profile')}
        />

        {/* Logout Button */}
        <FaSignOutAlt
          className="text-xl hover:text-red-400 cursor-pointer transition-colors"
          title="Logout"
          onClick={handleLogout}
        />
      </div>

      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Data Manager Modal */}
      {showDataManager && (
        <DataManager onClose={() => setShowDataManager(false)} />
      )}
    </div>
  );
};

export default ZentroSidebar;