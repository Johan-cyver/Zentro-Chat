import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEdit, FaEnvelope, FaBriefcase, FaSignOutAlt, FaRocket, FaUsers, FaDatabase, FaCog } from "react-icons/fa";
import { clearAuthState } from "../../firebase";
import { useUser } from "../../contexts/UserContext";
import DataManager from "../../components/Debug/DataManager";
import AdminPanel from "../../components/Admin/AdminPanel";

const icons = [
  { icon: <FaEnvelope />, label: "Messages", view: "dm" },
  { icon: <FaUsers />, label: "Groups", view: "groups", isRoute: true },
  { icon: <FaEdit />, label: "Zentro Network", view: "blog" },
  { icon: <FaBriefcase />, label: "ZentroNet", view: "professional" },
  { icon: <FaRocket />, label: "Zentrium", view: "zentrium" },
  // Add more icons/views as needed
];

const ZentroSidebar = ({ currentView, setCurrentView }) => {
  const navigate = useNavigate();
  const { isAdmin, canAccessAdminPanel } = useUser();
  const [showDataManager, setShowDataManager] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

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
      <div className="flex flex-col gap-6 mt-4">
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
                // Navigate to chat room with professional view
                navigate('/chat', { state: { view: 'professional' } });
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