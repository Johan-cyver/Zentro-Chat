import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlus, FaSearch, FaHashtag } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import zentroBotAI from '../../services/geminiAI';

/**
 * InterestBasedRooms - Component for auto-generated interest-based chat rooms
 * 
 * Features:
 * - Auto-suggest rooms based on user interests
 * - Popular rooms discovery
 * - Room creation based on interests
 * - Real-time room activity indicators
 */
const InterestBasedRooms = ({ theme, onJoinRoom }) => {
  const { userProfile } = useUser();
  const [suggestedRooms, setSuggestedRooms] = useState([]);
  const [popularRooms, setPopularRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRooms();
  }, [userProfile]);

  const loadRooms = () => {
    setIsLoading(true);
    
    // Generate suggested rooms based on user interests
    const suggestions = generateSuggestedRooms();
    setSuggestedRooms(suggestions);
    
    // Load popular rooms
    const popular = getPopularRooms();
    setPopularRooms(popular);
    
    setIsLoading(false);
  };

  const generateSuggestedRooms = () => {
    if (!userProfile?.interests) return [];
    
    return userProfile.interests.map(interest => ({
      id: `interest_${interest.toLowerCase()}`,
      name: `${interest} Community`,
      description: `Connect with fellow ${interest.toLowerCase()} enthusiasts`,
      icon: zentroBotAI.getInterestIcon(interest),
      memberCount: Math.floor(Math.random() * 500) + 50,
      isActive: Math.random() > 0.3,
      category: 'interest',
      tags: [interest.toLowerCase()]
    }));
  };

  const getPopularRooms = () => {
    const rooms = [
      {
        id: 'general_chat',
        name: 'General Chat',
        description: 'Open discussion for everyone',
        icon: '💬',
        memberCount: 1247,
        isActive: true,
        category: 'general',
        tags: ['general', 'chat']
      },
      {
        id: 'tech_talk',
        name: 'Tech Talk',
        description: 'Latest in technology and programming',
        icon: '💻',
        memberCount: 892,
        isActive: true,
        category: 'technology',
        tags: ['tech', 'programming', 'coding']
      },
      {
        id: 'creative_corner',
        name: 'Creative Corner',
        description: 'Share your art, music, and creative projects',
        icon: '🎨',
        memberCount: 634,
        isActive: true,
        category: 'creative',
        tags: ['art', 'music', 'creative']
      },
      {
        id: 'study_group',
        name: 'Study Group',
        description: 'Collaborative learning and study sessions',
        icon: '📚',
        memberCount: 456,
        isActive: false,
        category: 'education',
        tags: ['study', 'learning', 'education']
      },
      {
        id: 'gaming_lounge',
        name: 'Gaming Lounge',
        description: 'Discuss games, find teammates, share achievements',
        icon: '🎮',
        memberCount: 789,
        isActive: true,
        category: 'gaming',
        tags: ['gaming', 'games', 'esports']
      }
    ];

    return rooms;
  };

  const filteredRooms = [...suggestedRooms, ...popularRooms].filter(room =>
    room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.tags.some(tag => tag.includes(searchTerm.toLowerCase()))
  );

  const handleJoinRoom = (room) => {
    if (onJoinRoom) {
      onJoinRoom(room);
    }
  };

  const getRoomCategoryColor = (category) => {
    const colors = {
      'interest': 'from-purple-400 to-purple-600',
      'general': 'from-blue-400 to-blue-600',
      'technology': 'from-green-400 to-green-600',
      'creative': 'from-pink-400 to-pink-600',
      'education': 'from-yellow-400 to-yellow-600',
      'gaming': 'from-red-400 to-red-600'
    };
    return colors[category] || 'from-gray-400 to-gray-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: theme.colors.text }}
          >
            Interest-Based Rooms
          </h2>
          <p
            className="text-sm"
            style={{ color: theme.colors.textMuted }}
          >
            Find communities that match your interests
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <FaSearch
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
          style={{ color: theme.colors.textMuted }}
        />
        <input
          type="text"
          placeholder="Search rooms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500"
          style={{
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.borderMuted,
            color: theme.colors.text
          }}
        />
      </div>

      {/* Suggested Rooms */}
      {suggestedRooms.length > 0 && (
        <div>
          <h3
            className="text-lg font-semibold mb-4 flex items-center space-x-2"
            style={{ color: theme.colors.text }}
          >
            <span>✨</span>
            <span>Suggested for You</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedRooms.slice(0, 6).map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                theme={theme}
                onJoin={handleJoinRoom}
                categoryColor={getRoomCategoryColor(room.category)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Rooms */}
      <div>
        <h3
          className="text-lg font-semibold mb-4 flex items-center space-x-2"
          style={{ color: theme.colors.text }}
        >
          <span>🔥</span>
          <span>Popular Rooms</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                theme={theme}
                onJoin={handleJoinRoom}
                categoryColor={getRoomCategoryColor(room.category)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Room Card Component
const RoomCard = ({ room, theme, onJoin, categoryColor }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className="p-4 rounded-xl border cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: theme.colors.surfaceVariant,
        borderColor: theme.colors.borderMuted
      }}
      onClick={() => onJoin(room)}
    >
      <div className="flex items-start space-x-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-xl bg-gradient-to-br ${categoryColor}`}
        >
          {room.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4
              className="font-semibold truncate"
              style={{ color: theme.colors.text }}
            >
              {room.name}
            </h4>
            {room.isActive && (
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            )}
          </div>
          <p
            className="text-sm mb-2 line-clamp-2"
            style={{ color: theme.colors.textMuted }}
          >
            {room.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <FaUsers className="text-xs" style={{ color: theme.colors.textMuted }} />
              <span
                className="text-xs"
                style={{ color: theme.colors.textMuted }}
              >
                {room.memberCount.toLocaleString()}
              </span>
            </div>
            <div className="flex space-x-1">
              {room.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 rounded-full text-xs flex items-center space-x-1"
                  style={{
                    backgroundColor: theme.colors.primaryMuted,
                    color: theme.colors.primary
                  }}
                >
                  <FaHashtag className="text-xs" />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default InterestBasedRooms;
