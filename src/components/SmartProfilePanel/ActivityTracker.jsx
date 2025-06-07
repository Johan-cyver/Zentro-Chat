import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHistory, FaUser, FaBriefcase, FaHeart, FaComment, FaPlus, FaEdit, FaImage, FaVideo, FaBlog, FaClock, FaFilter } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

/**
 * ActivityTracker - Track and display user activity across the platform
 * 
 * Features:
 * - Recent activity feed
 * - Activity filtering
 * - Real-time updates
 * - Activity statistics
 */
const ActivityTracker = () => {
  const { userProfile } = useUser();
  const [activities, setActivities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock activity data - in real app, this would come from API
  useEffect(() => {
    const mockActivities = [
      {
        id: 1,
        type: 'profile_update',
        action: 'Updated profile picture',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        icon: FaUser,
        color: 'text-blue-400'
      },
      {
        id: 2,
        type: 'skill_add',
        action: 'Added skill: React.js',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        icon: FaBriefcase,
        color: 'text-purple-400'
      },
      {
        id: 3,
        type: 'post_like',
        action: 'Liked a photo',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        icon: FaHeart,
        color: 'text-pink-400'
      },
      {
        id: 4,
        type: 'comment',
        action: 'Commented on a post',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        icon: FaComment,
        color: 'text-cyan-400'
      },
      {
        id: 5,
        type: 'blog_post',
        action: 'Published a new blog post',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: FaBlog,
        color: 'text-green-400'
      },
      {
        id: 6,
        type: 'photo_upload',
        action: 'Uploaded a new photo',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        icon: FaImage,
        color: 'text-yellow-400'
      },
      {
        id: 7,
        type: 'experience_add',
        action: 'Added work experience',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        icon: FaBriefcase,
        color: 'text-purple-400'
      },
      {
        id: 8,
        type: 'video_upload',
        action: 'Uploaded a new video',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        icon: FaVideo,
        color: 'text-red-400'
      }
    ];

    setActivities(mockActivities);
  }, []);

  const activityTypes = [
    { value: 'all', label: 'All Activity', icon: FaHistory },
    { value: 'profile_update', label: 'Profile Updates', icon: FaUser },
    { value: 'skill_add', label: 'Skills', icon: FaBriefcase },
    { value: 'post_like', label: 'Likes', icon: FaHeart },
    { value: 'comment', label: 'Comments', icon: FaComment },
    { value: 'blog_post', label: 'Blog Posts', icon: FaBlog },
    { value: 'photo_upload', label: 'Photos', icon: FaImage },
    { value: 'video_upload', label: 'Videos', icon: FaVideo }
  ];

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  const displayedActivities = isExpanded 
    ? filteredActivities 
    : filteredActivities.slice(0, 5);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const getActivityStats = () => {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const todayCount = activities.filter(a => 
      a.timestamp.toDateString() === today.toDateString()
    ).length;
    
    const weekCount = activities.filter(a => 
      a.timestamp >= thisWeek
    ).length;

    return { todayCount, weekCount };
  };

  const stats = getActivityStats();

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FaHistory className="text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
        </div>
        
        {/* Activity Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <div className="text-white font-semibold">{stats.todayCount}</div>
            <div className="text-gray-400 text-xs">Today</div>
          </div>
          <div className="text-center">
            <div className="text-white font-semibold">{stats.weekCount}</div>
            <div className="text-gray-400 text-xs">This Week</div>
          </div>
        </div>
      </div>

      {/* Activity Filter */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FaFilter className="text-gray-400 text-sm" />
          <span className="text-gray-400 text-sm">Filter by type:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {activityTypes.map((type) => {
            const Icon = type.icon;
            const count = type.value === 'all' 
              ? activities.length 
              : activities.filter(a => a.type === type.value).length;
            
            return (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 text-xs ${
                  filter === type.value
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-600 hover:border-gray-500 text-gray-300'
                }`}
              >
                <Icon className="text-xs" />
                <span>{type.label}</span>
                {count > 0 && (
                  <span className="bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="space-y-3">
        <AnimatePresence>
          {displayedActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FaHistory className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity found for this filter</p>
            </div>
          ) : (
            displayedActivities.map((activity, index) => {
              const Icon = activity.icon;
              
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-all duration-200 group"
                >
                  {/* Activity Icon */}
                  <div className={`p-2 rounded-full bg-gray-600/50 ${activity.color}`}>
                    <Icon className="text-sm" />
                  </div>

                  {/* Activity Content */}
                  <div className="flex-1">
                    <p className="text-gray-300 text-sm">{activity.action}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <FaClock className="text-gray-500 text-xs" />
                      <span className="text-gray-500 text-xs">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>
                  </div>

                  {/* Activity Badge */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className={`px-2 py-1 rounded text-xs ${activity.color} bg-gray-600/30`}>
                      {activityTypes.find(t => t.value === activity.type)?.label || 'Activity'}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {/* Show More/Less Button */}
        {filteredActivities.length > 5 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full py-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors duration-200 border border-gray-600 rounded-lg hover:border-purple-500/50"
          >
            {isExpanded 
              ? `Show Less (${filteredActivities.length - 5} hidden)` 
              : `Show More (${filteredActivities.length - 5} more)`
            }
          </motion.button>
        )}
      </div>

      {/* Activity Summary */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium text-sm">Activity Summary</h4>
            <p className="text-gray-400 text-xs mt-1">
              You've been active {stats.weekCount} times this week
            </p>
          </div>
          <div className="text-right">
            <div className="text-purple-400 font-semibold text-lg">
              {Math.round((stats.weekCount / 7) * 10) / 10}
            </div>
            <div className="text-gray-400 text-xs">avg/day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityTracker;
