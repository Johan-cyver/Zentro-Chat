import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUser, FaImage, FaVideo, FaVolumeUp, FaVolumeMute, FaBan, FaFlag, FaEye } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';

const DMUserInfoPage = ({ user, onBack, onViewProfile, onMute, onBlock, onReport }) => {
  const { userProfile } = useUser();
  const { currentTheme } = useTheme();
  const [sharedMedia, setSharedMedia] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if users are friends
  const areFriends = () => {
    const friends = JSON.parse(localStorage.getItem('zentro_friends') || '[]');
    return friends.some(friend => friend.id === user.id);
  };

  // Load shared media from DM history
  useEffect(() => {
    const loadSharedMedia = () => {
      try {
        // Get DM history from localStorage
        const dmHistory = JSON.parse(localStorage.getItem(`zentro_dm_${user.id}`) || '[]');
        
        // Filter for media messages
        const mediaMessages = dmHistory.filter(msg => 
          msg.type === 'image' || msg.type === 'video' || msg.type === 'gif'
        );

        setSharedMedia(mediaMessages);
      } catch (error) {
        console.error('Error loading shared media:', error);
        setSharedMedia([]);
      } finally {
        setLoading(false);
      }
    };

    loadSharedMedia();
  }, [user.id]);

  // Check if user is muted
  useEffect(() => {
    const mutedUsers = JSON.parse(localStorage.getItem('zentro_muted_users') || '[]');
    setIsMuted(mutedUsers.includes(user.id));
  }, [user.id]);

  const handleMute = () => {
    const mutedUsers = JSON.parse(localStorage.getItem('zentro_muted_users') || '[]');
    
    if (isMuted) {
      // Unmute
      const updated = mutedUsers.filter(id => id !== user.id);
      localStorage.setItem('zentro_muted_users', JSON.stringify(updated));
      setIsMuted(false);
    } else {
      // Mute
      mutedUsers.push(user.id);
      localStorage.setItem('zentro_muted_users', JSON.stringify(mutedUsers));
      setIsMuted(true);
    }

    if (onMute) onMute(user.id, !isMuted);
  };

  const handleBlock = () => {
    if (onBlock) onBlock(user.id);
  };

  const handleReport = () => {
    if (onReport) onReport(user.id);
  };

  const handleViewProfile = () => {
    if (onViewProfile) {
      // Pass user data with appropriate visibility based on friendship
      const profileData = {
        ...user,
        canViewPrivateContent: areFriends()
      };
      onViewProfile(profileData);
    }
  };

  const renderMediaItem = (media, index) => {
    const mediaUrl = media.mediaData?.url || media.imageData || media.videoData || media.gifData?.url || media.text;
    
    return (
      <div key={index} className="relative group cursor-pointer">
        {media.type === 'image' || media.type === 'gif' ? (
          <img
            src={mediaUrl}
            alt="Shared media"
            className="w-full h-24 object-cover rounded-lg hover:opacity-80 transition-opacity"
            onClick={() => window.open(mediaUrl, '_blank')}
          />
        ) : media.type === 'video' ? (
          <div className="relative">
            <video
              src={mediaUrl}
              className="w-full h-24 object-cover rounded-lg"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
              <FaVideo className="text-white text-xl" />
            </div>
          </div>
        ) : null}
        
        {/* Media overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
      </div>
    );
  };

  return (
    <div 
      className="h-full flex flex-col"
      style={{
        backgroundColor: currentTheme.colors.background,
        color: currentTheme.colors.text
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center p-4 border-b"
        style={{ borderColor: currentTheme.colors.borderMuted }}
      >
        <button
          onClick={onBack}
          className="mr-3 p-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          <FaArrowLeft />
        </button>
        <h2 className="text-lg font-semibold">User Info</h2>
      </div>

      {/* User Profile Section */}
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <FaUser className="text-2xl" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-bold">{user.name}</h3>
            <p className="text-gray-400">@{user.username || user.id}</p>
            {user.bio && (
              <p className="text-sm text-gray-300 mt-2">{user.bio}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleViewProfile}
            className="flex items-center justify-center space-x-2 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
          >
            <FaEye />
            <span>View Profile</span>
          </button>
          
          <button
            onClick={handleMute}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg transition-colors ${
              isMuted 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isMuted ? <FaVolumeUp /> : <FaVolumeMute />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={handleBlock}
            className="flex items-center justify-center space-x-2 p-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            <FaBan />
            <span>Block</span>
          </button>
          
          <button
            onClick={handleReport}
            className="flex items-center justify-center space-x-2 p-3 bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors"
          >
            <FaFlag />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Shared Media Section */}
      <div className="flex-1 p-6">
        <h4 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <FaImage />
          <span>Shared Media ({sharedMedia.length})</span>
        </h4>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : sharedMedia.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {sharedMedia.map((media, index) => renderMediaItem(media, index))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <FaImage className="text-4xl mx-auto mb-2 opacity-50" />
            <p>No shared media yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DMUserInfoPage;
