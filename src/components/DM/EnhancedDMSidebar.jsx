import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaRobot, FaSpinner, FaUsers, FaComments, FaUserPlus } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

const EnhancedDMSidebar = ({ onSelectChat, selectedChat, currentTheme }) => {
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' or 'discover'
  const [searchQuery, setSearchQuery] = useState('');
  const [recentChats, setRecentChats] = useState([]);
  const [discoveredUsers, setDiscoveredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  // Initialize with Zentro Bot
  useEffect(() => {
    const zentroBotChat = {
      id: 'zentro_bot_chat',
      otherUser: {
        id: 'zentro_bot',
        name: 'Zenny',
        avatar: null,
        online: true,
        isBot: true
      },
      lastMessage: '🤖 AI Assistant - Ask me anything!',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };

    setRecentChats([zentroBotChat]);
    loadRecentChats();
  }, [userProfile?.uid]);

  // Load recent chats from localStorage (for demo purposes)
  const loadRecentChats = () => {
    try {
      const savedChats = localStorage.getItem(`zentro_recent_chats_${userProfile?.uid}`);
      if (savedChats) {
        const chats = JSON.parse(savedChats);
        const zentroBotChat = {
          id: 'zentro_bot_chat',
          otherUser: {
            id: 'zentro_bot',
            name: 'Zentro Bot',
            avatar: null,
            online: true,
            isBot: true
          },
          lastMessage: '🤖 AI Assistant - Ask me anything!',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0
        };
        setRecentChats([zentroBotChat, ...chats]);
      }
    } catch (error) {
      console.error('Error loading recent chats:', error);
    }
  };

  // Discover users for messaging
  const discoverUsers = async () => {
    if (!userProfile?.uid) return;

    setDiscoverLoading(true);
    try {
      // Get all users except current user
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('uid', '!=', userProfile.uid),
        orderBy('lastActive', 'desc'),
        limit(20) // Get more than 10 for smart sorting
      );

      const snapshot = await getDocs(q);
      const allUsers = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        allUsers.push({
          id: userData.uid,
          name: userData.displayName || 'Unknown User',
          avatar: userData.photoURL,
          email: userData.email,
          bio: userData.bio || '',
          location: userData.location || '',
          age: userData.age || null,
          interests: userData.interests || [],
          lastActive: userData.lastActive?.toDate?.() || new Date(),
          online: userData.online || false
        });
      });

      // Smart sorting if more than 10 users
      let sortedUsers = allUsers;
      if (allUsers.length > 10) {
        sortedUsers = smartSortUsers(allUsers);
      }

      setDiscoveredUsers(sortedUsers.slice(0, 10));
    } catch (error) {
      console.error('Error discovering users:', error);
      // Fallback to mock users for demo
      setDiscoveredUsers(generateMockUsers());
    } finally {
      setDiscoverLoading(false);
    }
  };

  // Smart sorting algorithm
  const smartSortUsers = (users) => {
    const currentUser = userProfile;

    return users.map(user => {
      let score = 0;

      // Interest matching (highest weight)
      if (currentUser.interests && user.interests) {
        const commonInterests = currentUser.interests.filter(interest =>
          user.interests.includes(interest)
        );
        score += commonInterests.length * 10;
      }

      // Age proximity (if both have age)
      if (currentUser.age && user.age) {
        const ageDiff = Math.abs(currentUser.age - user.age);
        if (ageDiff <= 2) score += 8;
        else if (ageDiff <= 5) score += 5;
        else if (ageDiff <= 10) score += 2;
      }

      // Location matching
      if (currentUser.location && user.location) {
        if (currentUser.location.toLowerCase() === user.location.toLowerCase()) {
          score += 7;
        }
      }

      // Bio similarity (simple keyword matching)
      if (currentUser.bio && user.bio) {
        const currentWords = currentUser.bio.toLowerCase().split(' ');
        const userWords = user.bio.toLowerCase().split(' ');
        const commonWords = currentWords.filter(word =>
          word.length > 3 && userWords.includes(word)
        );
        score += commonWords.length * 3;
      }

      // Online status bonus
      if (user.online) score += 5;

      // Recent activity bonus
      const hoursSinceActive = (new Date() - user.lastActive) / (1000 * 60 * 60);
      if (hoursSinceActive < 1) score += 4;
      else if (hoursSinceActive < 24) score += 2;

      return { ...user, matchScore: score };
    }).sort((a, b) => b.matchScore - a.matchScore);
  };

  // Generate mock users for demo
  const generateMockUsers = () => {
    const mockUsers = [
      { id: 'user1', name: 'Alex Chen', avatar: null, online: true, bio: 'Love coding and music' },
      { id: 'user2', name: 'Sarah Johnson', avatar: null, online: false, bio: 'Artist and traveler' },
      { id: 'user3', name: 'Mike Rodriguez', avatar: null, online: true, bio: 'Gamer and tech enthusiast' },
      { id: 'user4', name: 'Emma Wilson', avatar: null, online: true, bio: 'Photographer and nature lover' },
      { id: 'user5', name: 'David Kim', avatar: null, online: false, bio: 'Musician and coffee addict' },
      { id: 'user6', name: 'Lisa Zhang', avatar: null, online: true, bio: 'Designer and bookworm' },
      { id: 'user7', name: 'Tom Brown', avatar: null, online: false, bio: 'Fitness enthusiast' },
      { id: 'user8', name: 'Anna Davis', avatar: null, online: true, bio: 'Writer and movie buff' }
    ];
    return mockUsers;
  };

  // Start new chat
  const handleStartChat = (user) => {
    // Add to recent chats
    const newChat = {
      id: `chat_${user.id}`,
      otherUser: user,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0
    };

    const updatedChats = [newChat, ...recentChats.filter(chat => chat.otherUser.id !== user.id)];
    setRecentChats(updatedChats);

    // Save to localStorage
    const chatsToSave = updatedChats.filter(chat => chat.otherUser.id !== 'zentro_bot');
    localStorage.setItem(`zentro_recent_chats_${userProfile?.uid}`, JSON.stringify(chatsToSave));

    // Select the chat
    onSelectChat(newChat);
    setActiveTab('chats');
  };

  const filteredChats = recentChats.filter(chat =>
    chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) return 'now';
    else if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    else return date.toLocaleDateString();
  };

  return (
    <div
      className="w-80 h-full flex flex-col border-r"
      style={{
        backgroundColor: currentTheme?.colors?.surface || '#1F2937',
        borderColor: currentTheme?.colors?.borderMuted || '#374151'
      }}
    >
      {/* Header */}
      <div className="p-4 border-b" style={{ borderColor: currentTheme?.colors?.borderMuted }}>
        <h2
          className="text-xl font-bold mb-4"
          style={{ color: currentTheme?.colors?.text || '#FFFFFF' }}
        >
          Messages
        </h2>

        {/* Tab Navigation */}
        <div className="flex mb-4">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-l-lg transition-colors ${
              activeTab === 'chats' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FaComments className="text-sm" />
            <span className="text-sm">Chats</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('discover');
              if (discoveredUsers.length === 0) {
                discoverUsers();
              }
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-r-lg transition-colors ${
              activeTab === 'discover' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <FaUsers className="text-sm" />
            <span className="text-sm">Discover</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <FaSearch
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm"
            style={{ color: currentTheme?.colors?.textMuted || '#9CA3AF' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'chats' ? "Search conversations..." : "Search users..."}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
            style={{
              backgroundColor: currentTheme?.colors?.inputBackground || '#374151',
              borderColor: currentTheme?.colors?.borderMuted || '#4B5563',
              color: currentTheme?.colors?.text || '#FFFFFF'
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'chats' ? (
          // Chat List
          filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center p-4">
              <FaComments className="text-3xl mb-2" style={{ color: currentTheme?.colors?.textMuted }} />
              <p style={{ color: currentTheme?.colors?.textMuted }}>
                No conversations yet
              </p>
              <p className="text-sm mt-1" style={{ color: currentTheme?.colors?.textMuted }}>
                Discover users to start chatting!
              </p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-center p-4 cursor-pointer transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  selectedChat?.id === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative flex-shrink-0 mr-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
                    {chat.otherUser.isBot ? (
                      <div
                        className="w-full h-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: currentTheme?.colors?.primary || '#8B5CF6' }}
                      >
                        <FaRobot className="text-lg" />
                      </div>
                    ) : chat.otherUser.avatar ? (
                      <img
                        src={chat.otherUser.avatar}
                        alt={chat.otherUser.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white bg-purple-600 font-medium">
                        {chat.otherUser.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {chat.otherUser.online && !chat.otherUser.isBot && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3
                      className="font-medium truncate"
                      style={{ color: currentTheme?.colors?.text || '#FFFFFF' }}
                    >
                      {chat.otherUser.isBot ? 'Zenny' : chat.otherUser.name}
                    </h3>
                    <span
                      className="text-xs"
                      style={{ color: currentTheme?.colors?.textMuted || '#9CA3AF' }}
                    >
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                  <p
                    className="text-sm truncate"
                    style={{ color: currentTheme?.colors?.textMuted || '#9CA3AF' }}
                  >
                    {chat.lastMessage || 'Start a conversation'}
                  </p>
                </div>
              </div>
            ))
          )
        ) : (
          // Discover Users
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium" style={{ color: currentTheme?.colors?.text }}>
                People to Message
              </h3>
              <button
                onClick={discoverUsers}
                className="text-sm text-purple-400 hover:text-purple-300"
                disabled={discoverLoading}
              >
                {discoverLoading ? <FaSpinner className="animate-spin" /> : 'Refresh'}
              </button>
            </div>

            {discoverLoading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin mr-2" style={{ color: currentTheme?.colors?.primary }} />
                <span style={{ color: currentTheme?.colors?.text }}>Finding people...</span>
              </div>
            ) : discoveredUsers.length === 0 ? (
              <div className="text-center py-8">
                <FaUsers className="text-3xl mb-2 mx-auto" style={{ color: currentTheme?.colors?.textMuted }} />
                <p style={{ color: currentTheme?.colors?.textMuted }}>
                  No users found
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {discoveredUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => handleStartChat(user)}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300 mr-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white bg-purple-600 font-medium text-sm">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate" style={{ color: currentTheme?.colors?.text }}>
                          {user.name}
                        </h4>
                        <div className="flex items-center gap-1">
                          {user.online && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                          <FaUserPlus className="text-purple-400 text-sm" />
                        </div>
                      </div>
                      {user.bio && (
                        <p className="text-xs truncate mt-1" style={{ color: currentTheme?.colors?.textMuted }}>
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDMSidebar;
