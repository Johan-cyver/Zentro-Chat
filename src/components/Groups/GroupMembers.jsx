import React, { useState } from 'react';
import { FaArrowLeft, FaUsers, FaCrown, FaUserMinus, FaUserPlus, FaRobot } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import groupService from '../../services/groupService';

const GroupMembers = ({ group, onBack, onLeaveGroup }) => {
  const { userProfile } = useUser();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');

  const isAdmin = group.admins?.includes(userProfile?.uid);
  const isOwner = group.ownerId === userProfile?.uid;

  const handleRemoveMember = async (memberId) => {
    if (!isAdmin || memberId === userProfile?.uid) return;

    if (window.confirm('Are you sure you want to remove this member from the group?')) {
      try {
        await groupService.removeMemberFromGroup(group.id, memberId);
        // Trigger a refresh by calling onBack and then navigating back
        window.location.reload();
      } catch (error) {
        console.error('Error removing member:', error);
        alert('Failed to remove member. Please try again.');
      }
    }
  };

  const handlePromoteToAdmin = async (memberId) => {
    if (!isOwner) return;

    try {
      await groupService.promoteToAdmin(group.id, memberId);
      // Refresh group data would happen here
    } catch (error) {
      console.error('Error promoting member:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteUsername.trim()) return;

    try {
      await groupService.inviteMemberByUsername(group.id, inviteUsername);
      setInviteUsername('');
      setShowInviteModal(false);
      alert('Member invited successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error inviting member:', error);
      alert(error.message || 'Failed to invite member. Please try again.');
    }
  };

  const getMemberRole = (memberId) => {
    if (group.ownerId === memberId) return 'Owner';
    if (group.admins?.includes(memberId)) return 'Admin';
    return 'Member';
  };

  const getMemberInfo = (memberId) => {
    // Handle Zenny bot
    if (memberId === 'zentro_bot' || memberId === 'zenny_bot') {
      return {
        id: memberId,
        name: 'Zenny',
        avatar: null,
        online: true
      };
    }

    // Handle current user
    if (memberId === userProfile?.uid) {
      return {
        id: memberId,
        name: userProfile.displayName || userProfile.email || 'You',
        avatar: userProfile.photoURL,
        online: true
      };
    }

    // Try to get user info from localStorage (check both possible keys)
    let allUsers = JSON.parse(localStorage.getItem('zentro_all_users') || '[]');
    if (allUsers.length === 0) {
      allUsers = JSON.parse(localStorage.getItem('zentro_registered_users') || '[]');
    }
    const userInfo = allUsers.find(user => user.uid === memberId);

    if (userInfo) {
      return {
        id: memberId,
        name: userInfo.displayName || userInfo.username || userInfo.email || 'Unknown User',
        avatar: userInfo.photoURL || null,
        online: Math.random() > 0.5 // In real app, this would be actual online status
      };
    }

    // Fallback for unknown users
    return {
      id: memberId,
      name: `User ${memberId.slice(-4)}`,
      avatar: null,
      online: false
    };
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h2 className="text-xl font-bold flex items-center space-x-2">
              <FaUsers />
              <span>Members</span>
            </h2>
            <p className="text-sm text-gray-400">{group.members?.length || 0} members</p>
          </div>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            title="Invite Member"
          >
            <FaUserPlus />
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {group.members?.map(memberId => {
            const member = getMemberInfo(memberId);
            const role = getMemberRole(memberId);
            const isBot = memberId === 'zentro_bot';

            return (
              <div
                key={memberId}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-medium">
                          {isBot ? '🤖' : member.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      )}
                    </div>
                    {member.online && !isBot && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800"></div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{member.name}</h3>
                      {isBot && <FaRobot className="text-purple-400 text-sm" />}
                      {role === 'Owner' && <FaCrown className="text-yellow-400 text-sm" />}
                      {role === 'Admin' && <FaCrown className="text-orange-400 text-sm" />}
                    </div>
                    <p className="text-sm text-gray-400">{role}</p>
                  </div>
                </div>

                {/* Actions */}
                {isAdmin && memberId !== userProfile?.uid && !isBot && (
                  <div className="flex items-center space-x-2">
                    {isOwner && role === 'Member' && (
                      <button
                        onClick={() => handlePromoteToAdmin(memberId)}
                        className="p-1 text-orange-400 hover:text-orange-300 text-sm"
                        title="Promote to Admin"
                      >
                        <FaCrown />
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className="p-1 text-red-400 hover:text-red-300 text-sm"
                      title="Remove Member"
                    >
                      <FaUserMinus />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Leave Group Button */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={onLeaveGroup}
          className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Leave Group
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">Invite Member</h3>
            <input
              type="text"
              value={inviteUsername}
              onChange={(e) => setInviteUsername(e.target.value)}
              placeholder="Enter username or display name"
              className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupMembers;
