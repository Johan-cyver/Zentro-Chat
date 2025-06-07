import React, { useState } from 'react';
import { FaCrown, FaUserShield, FaUser, FaTimes, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import groupService from '../../services/groupService';
import userDataSync from '../../utils/userDataSync';

const RoleManagement = ({ group, onClose, onRoleUpdate }) => {
  const { userProfile } = useUser();
  const [customRoles, setCustomRoles] = useState(group.customRoles || []);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    color: '#8B5CF6',
    permissions: {
      canInvite: false,
      canKick: false,
      canMute: false,
      canManageMessages: false,
      canChangeSettings: false
    }
  });

  const isOwner = group.ownerId === userProfile?.uid;
  const isAdmin = group.admins?.includes(userProfile?.uid);

  const defaultRoles = [
    { id: 'owner', name: 'Owner', color: '#FFD700', icon: FaCrown, level: 100 },
    { id: 'admin', name: 'Admin', color: '#FF6B6B', icon: FaUserShield, level: 80 },
    { id: 'member', name: 'Member', color: '#4ECDC4', icon: FaUser, level: 10 }
  ];

  const handleCreateRole = () => {
    if (!newRole.name.trim()) return;

    const role = {
      id: Date.now().toString(),
      ...newRole,
      level: 50 // Custom roles get medium level
    };

    const updatedRoles = [...customRoles, role];
    setCustomRoles(updatedRoles);

    // Update group with new roles
    groupService.updateGroupRoles(group.id, updatedRoles);

    setNewRole({
      name: '',
      color: '#8B5CF6',
      permissions: {
        canInvite: false,
        canKick: false,
        canMute: false,
        canManageMessages: false,
        canChangeSettings: false
      }
    });
    setShowCreateRole(false);

    if (onRoleUpdate) onRoleUpdate();
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      const updatedRoles = customRoles.filter(role => role.id !== roleId);
      setCustomRoles(updatedRoles);
      groupService.updateGroupRoles(group.id, updatedRoles);
      if (onRoleUpdate) onRoleUpdate();
    }
  };

  const handleAssignRole = (memberId, roleId) => {
    try {
      // Update role assignment
      groupService.assignMemberRole(group.id, memberId, roleId);

      // Handle admin promotion/demotion
      const groups = groupService.getAllGroups();
      const groupIndex = groups.findIndex(g => g.id === group.id);

      if (groupIndex !== -1) {
        const currentGroup = groups[groupIndex];

        // If promoting to admin, add to admins array
        if (roleId === 'admin' && !currentGroup.admins.includes(memberId)) {
          currentGroup.admins.push(memberId);
        }

        // If demoting from admin, remove from admins array (but not if they're owner)
        if (roleId !== 'admin' && roleId !== 'owner' && currentGroup.admins.includes(memberId) && currentGroup.ownerId !== memberId) {
          currentGroup.admins = currentGroup.admins.filter(id => id !== memberId);
        }

        // Update the group
        currentGroup.updatedAt = new Date().toISOString();
        localStorage.setItem('zentro_groups', JSON.stringify(groups));
      }

      if (onRoleUpdate) onRoleUpdate();

      // Force a page refresh to show updated roles
      setTimeout(() => {
        window.location.reload();
      }, 500);

    } catch (error) {
      console.error('Error assigning role:', error);
      alert('Failed to assign role. Please try again.');
    }
  };

  const getMemberRole = (memberId) => {
    if (group.ownerId === memberId) return 'owner';
    if (group.admins?.includes(memberId)) return 'admin';

    // Check custom roles
    const memberRoles = group.memberRoles || {};
    return memberRoles[memberId] || 'member';
  };

  const getRoleInfo = (roleId) => {
    const defaultRole = defaultRoles.find(r => r.id === roleId);
    if (defaultRole) return defaultRole;

    const customRole = customRoles.find(r => r.id === roleId);
    return customRole || defaultRoles[2]; // Default to member
  };

  // Get user display name
  const getUserDisplayName = (userId) => {
    if (userId === userProfile?.uid) {
      return userProfile.displayName || userProfile.email || 'You';
    }

    // Try to get from userDataSync
    const userName = userDataSync.getUserDisplayName(userId);
    if (userName && userName !== 'Unknown User') {
      return userName;
    }

    // Fallback to user ID (shortened)
    return userId.length > 10 ? `${userId.substring(0, 8)}...` : userId;
  };

  if (!isOwner && !isAdmin) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-white mb-4">Access Denied</h3>
          <p className="text-gray-300 mb-4">Only group owners and admins can manage roles.</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Role Management</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Available Roles */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-white mb-4">Available Roles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Roles */}
            {defaultRoles.map(role => {
              const Icon = role.icon;
              return (
                <div key={role.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Icon style={{ color: role.color }} />
                    <span className="font-medium text-white">{role.name}</span>
                    <span className="text-xs text-gray-400">Level {role.level}</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    {role.id === 'owner' && 'Full control over the group'}
                    {role.id === 'admin' && 'Can manage members and settings'}
                    {role.id === 'member' && 'Basic group participation'}
                  </p>
                </div>
              );
            })}

            {/* Custom Roles */}
            {customRoles.map(role => (
              <div key={role.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: role.color }}
                    />
                    <span className="font-medium text-white">{role.name}</span>
                    <span className="text-xs text-gray-400">Level {role.level}</span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-300">
                  Permissions: {Object.entries(role.permissions)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => key.replace('can', ''))
                    .join(', ') || 'None'}
                </div>
              </div>
            ))}
          </div>

          {/* Create New Role */}
          {isOwner && (
            <div className="mt-4">
              {!showCreateRole ? (
                <button
                  onClick={() => setShowCreateRole(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <FaPlus />
                  <span>Create Custom Role</span>
                </button>
              ) : (
                <div className="bg-gray-700 rounded-lg p-4">
                  <h5 className="font-medium text-white mb-3">Create New Role</h5>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Role Name</label>
                      <input
                        type="text"
                        value={newRole.name}
                        onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-600 text-white rounded-lg border border-gray-500 focus:border-purple-500 focus:outline-none"
                        placeholder="Enter role name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-1">Color</label>
                      <input
                        type="color"
                        value={newRole.color}
                        onChange={(e) => setNewRole(prev => ({ ...prev, color: e.target.value }))}
                        className="w-16 h-8 bg-gray-600 rounded border border-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-300 mb-2">Permissions</label>
                      <div className="space-y-2">
                        {Object.entries(newRole.permissions).map(([key, value]) => (
                          <label key={key} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setNewRole(prev => ({
                                ...prev,
                                permissions: { ...prev.permissions, [key]: e.target.checked }
                              }))}
                              className="rounded"
                            />
                            <span className="text-sm text-gray-300">
                              {key.replace('can', 'Can ').replace(/([A-Z])/g, ' $1')}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCreateRole}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        Create Role
                      </button>
                      <button
                        onClick={() => setShowCreateRole(false)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Member Role Assignments */}
        <div>
          <h4 className="text-lg font-medium text-white mb-4">Member Roles</h4>
          <div className="space-y-2">
            {group.members?.map(memberId => {
              const memberRole = getMemberRole(memberId);
              const roleInfo = getRoleInfo(memberRole);
              const Icon = roleInfo.icon || FaUser;
              const displayName = getUserDisplayName(memberId);
              const isCurrentUser = memberId === userProfile?.uid;

              return (
                <div key={memberId} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white font-medium">
                        {displayName}
                        {isCurrentUser && <span className="text-purple-400 text-sm ml-1">(You)</span>}
                      </span>
                      <span className="text-xs text-gray-400">
                        {memberId.length > 15 ? `${memberId.substring(0, 12)}...` : memberId}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Icon style={{ color: roleInfo.color }} className="text-sm" />
                      <span className="text-sm text-gray-300 font-medium">{roleInfo.name}</span>
                    </div>
                    {(isOwner || (isAdmin && memberRole !== 'owner' && !isCurrentUser)) && (
                      <select
                        value={memberRole}
                        onChange={(e) => {
                          if (window.confirm(`Are you sure you want to change ${displayName}'s role to ${e.target.options[e.target.selectedIndex].text}?`)) {
                            handleAssignRole(memberId, e.target.value);
                          }
                        }}
                        className="px-3 py-1 bg-gray-600 text-white rounded-lg text-sm border border-gray-500 focus:border-purple-500 focus:outline-none hover:bg-gray-500 transition-colors"
                      >
                        {defaultRoles.map(role => (
                          <option key={role.id} value={role.id} disabled={role.id === 'owner' && !isOwner}>
                            {role.name}
                          </option>
                        ))}
                        {customRoles.map(role => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    )}
                    {memberRole !== 'owner' && !isCurrentUser && (isOwner || isAdmin) && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${displayName} from the group?`)) {
                            groupService.removeMemberFromGroup(group.id, memberId);
                            if (onRoleUpdate) onRoleUpdate();
                            setTimeout(() => window.location.reload(), 500);
                          }
                        }}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        title="Remove from group"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
