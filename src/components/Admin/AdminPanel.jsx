import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, 
  FaBan, 
  FaUserSlash, 
  FaEyeSlash, 
  FaBuilding, 
  FaChartBar,
  FaTimes,
  FaClock,
  FaExclamationTriangle,
  FaCheck,
  FaSearch
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import adminService from '../../services/adminService';

const AdminPanel = ({ onClose }) => {
  const { userProfile, canAccessAdminPanel } = useUser();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showBanModal, setShowBanModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);
  const [banDuration, setBanDuration] = useState(24);
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    if (!canAccessAdminPanel()) {
      onClose();
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, adminStats] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getAdminStats()
      ]);
      
      setUsers(allUsers);
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBanUser = async () => {
    if (!selectedUser || !banDuration) return;
    
    setActionLoading(true);
    try {
      await adminService.banUser(userProfile.uid, selectedUser.id, banDuration, actionReason);
      await loadData();
      setShowBanModal(false);
      setSelectedUser(null);
      setActionReason('');
      alert(`✅ User ${selectedUser.displayName} has been banned for ${banDuration} hours`);
    } catch (error) {
      console.error('Error banning user:', error);
      alert(`❌ Failed to ban user: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleKickUser = async () => {
    if (!selectedUser) return;
    
    setActionLoading(true);
    try {
      await adminService.kickUser(userProfile.uid, selectedUser.id, actionReason);
      await loadData();
      setShowKickModal(false);
      setSelectedUser(null);
      setActionReason('');
      alert(`✅ User ${selectedUser.displayName} has been permanently kicked`);
    } catch (error) {
      console.error('Error kicking user:', error);
      alert(`❌ Failed to kick user: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFriendSuggestion = async (user) => {
    setActionLoading(true);
    try {
      const hiddenUsers = JSON.parse(localStorage.getItem('zentro_hidden_from_suggestions') || '[]');
      const isHidden = hiddenUsers.includes(user.id);
      
      await adminService.toggleFriendSuggestionVisibility(userProfile.uid, user.id, isHidden);
      await loadData();
      
      alert(`✅ User ${user.displayName} ${isHidden ? 'shown in' : 'hidden from'} friend suggestions`);
    } catch (error) {
      console.error('Error toggling friend suggestion:', error);
      alert(`❌ Failed to update friend suggestion visibility: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveFromDirectory = async (user) => {
    if (!window.confirm(`Are you sure you want to remove ${user.displayName} from the professional directory?`)) {
      return;
    }

    setActionLoading(true);
    try {
      await adminService.removeFromProfessionalDirectory(userProfile.uid, user.id);
      await loadData();
      alert(`✅ User ${user.displayName} removed from professional directory`);
    } catch (error) {
      console.error('Error removing from directory:', error);
      alert(`❌ Failed to remove from directory: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (!canAccessAdminPanel()) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <FaUsers className="text-2xl text-red-500" />
            <div>
              <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
              <p className="text-gray-400">User Management & Moderation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Stats Bar */}
        <div className="p-6 border-b border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <FaUsers className="text-2xl text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalUsers || 0}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <FaBan className="text-2xl text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.activeBans || 0}</div>
              <div className="text-sm text-gray-400">Active Bans</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <FaUserSlash className="text-2xl text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.totalKicks || 0}</div>
              <div className="text-sm text-gray-400">Total Kicks</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <FaEyeSlash className="text-2xl text-purple-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.hiddenFromSuggestions || 0}</div>
              <div className="text-sm text-gray-400">Hidden from Suggestions</div>
            </div>
            <div className="bg-gray-700 p-4 rounded-lg text-center">
              <FaBuilding className="text-2xl text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{stats.hiddenFromDirectory || 0}</div>
              <div className="text-sm text-gray-400">Hidden from Directory</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaUsers className="inline mr-2" />
            User Management
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'text-white border-b-2 border-red-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <FaChartBar className="inline mr-2" />
            Statistics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'users' && (
            <div className="h-full flex flex-col">
              {/* Search */}
              <div className="p-6 border-b border-gray-700">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="text-center text-gray-400 py-8">Loading users...</div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onBan={() => {
                          setSelectedUser(user);
                          setShowBanModal(true);
                        }}
                        onKick={() => {
                          setSelectedUser(user);
                          setShowKickModal(true);
                        }}
                        onToggleFriendSuggestion={() => handleToggleFriendSuggestion(user)}
                        onRemoveFromDirectory={() => handleRemoveFromDirectory(user)}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="p-6">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-4">Recent Admin Actions</h3>
                <div className="space-y-2">
                  {stats.recentActions?.map((action, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-white">
                          {action.type === 'temporary' ? '🚫 Ban' : '❌ Kick'}: {action.userId}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {new Date(action.banStartTime || action.kickTime).toLocaleString()}
                        </span>
                      </div>
                      {action.reason && (
                        <div className="text-gray-400 text-sm mt-1">Reason: {action.reason}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Ban Modal */}
        {showBanModal && (
          <BanModal
            user={selectedUser}
            banDuration={banDuration}
            setBanDuration={setBanDuration}
            reason={actionReason}
            setReason={setActionReason}
            onConfirm={handleBanUser}
            onCancel={() => {
              setShowBanModal(false);
              setSelectedUser(null);
              setActionReason('');
            }}
            loading={actionLoading}
          />
        )}

        {/* Kick Modal */}
        {showKickModal && (
          <KickModal
            user={selectedUser}
            reason={actionReason}
            setReason={setActionReason}
            onConfirm={handleKickUser}
            onCancel={() => {
              setShowKickModal(false);
              setSelectedUser(null);
              setActionReason('');
            }}
            loading={actionLoading}
          />
        )}
      </motion.div>
    </div>
  );
};

// User Card Component
const UserCard = ({ user, onBan, onKick, onToggleFriendSuggestion, onRemoveFromDirectory, actionLoading }) => {
  const hiddenFromSuggestions = JSON.parse(localStorage.getItem('zentro_hidden_from_suggestions') || '[]');
  const hiddenFromDirectory = JSON.parse(localStorage.getItem('zentro_hidden_from_directory') || '[]');
  
  const isHiddenFromSuggestions = hiddenFromSuggestions.includes(user.id);
  const isHiddenFromDirectory = hiddenFromDirectory.includes(user.id);

  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={user.photoURL || '/default-avatar.png'}
            alt={user.displayName}
            className="w-12 h-12 rounded-full"
          />
          <div>
            <div className="text-white font-medium">{user.displayName || 'Unknown User'}</div>
            <div className="text-gray-400 text-sm">{user.email}</div>
            <div className="text-gray-500 text-xs">ID: {user.id}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onBan}
            disabled={actionLoading}
            className="px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white rounded text-sm transition-colors disabled:opacity-50"
            title="Temporary Ban"
          >
            <FaBan className="inline mr-1" />
            Ban
          </button>
          
          <button
            onClick={onKick}
            disabled={actionLoading}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors disabled:opacity-50"
            title="Permanent Kick"
          >
            <FaUserSlash className="inline mr-1" />
            Kick
          </button>
          
          <button
            onClick={onToggleFriendSuggestion}
            disabled={actionLoading}
            className={`px-3 py-1 rounded text-sm transition-colors disabled:opacity-50 ${
              isHiddenFromSuggestions
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            }`}
            title={isHiddenFromSuggestions ? 'Show in Suggestions' : 'Hide from Suggestions'}
          >
            <FaEyeSlash className="inline mr-1" />
            {isHiddenFromSuggestions ? 'Show' : 'Hide'}
          </button>
          
          <button
            onClick={onRemoveFromDirectory}
            disabled={actionLoading || isHiddenFromDirectory}
            className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors disabled:opacity-50"
            title="Remove from Professional Directory"
          >
            <FaBuilding className="inline mr-1" />
            {isHiddenFromDirectory ? 'Removed' : 'Remove'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Ban Modal Component
const BanModal = ({ user, banDuration, setBanDuration, reason, setReason, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
    <div className="bg-gray-800 p-6 rounded-lg w-96">
      <h3 className="text-xl font-bold text-white mb-4">
        <FaExclamationTriangle className="inline text-orange-500 mr-2" />
        Ban User
      </h3>
      
      <div className="text-gray-300 mb-4">
        Are you sure you want to ban <strong>{user?.displayName}</strong>?
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-300 text-sm mb-2">Ban Duration (hours)</label>
        <input
          type="number"
          value={banDuration}
          onChange={(e) => setBanDuration(parseInt(e.target.value))}
          min="1"
          max="8760"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-300 text-sm mb-2">Reason (optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for ban..."
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white h-20 resize-none"
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Banning...' : 'Confirm Ban'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

// Kick Modal Component
const KickModal = ({ user, reason, setReason, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
    <div className="bg-gray-800 p-6 rounded-lg w-96">
      <h3 className="text-xl font-bold text-white mb-4">
        <FaExclamationTriangle className="inline text-red-500 mr-2" />
        Permanently Kick User
      </h3>
      
      <div className="text-gray-300 mb-4">
        <strong>⚠️ WARNING:</strong> This will permanently remove <strong>{user?.displayName}</strong> from Zentro Chat. 
        They will not be able to rejoin with the same email address.
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-300 text-sm mb-2">Reason (optional)</label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for permanent kick..."
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white h-20 resize-none"
        />
      </div>
      
      <div className="flex space-x-3">
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded transition-colors disabled:opacity-50"
        >
          {loading ? 'Kicking...' : 'Confirm Kick'}
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default AdminPanel;
