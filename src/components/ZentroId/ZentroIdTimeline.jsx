import React, { useState, useEffect } from 'react';
import { 
  FaTrophy, 
  FaGamepad, 
  FaUsers, 
  FaGraduationCap, 
  FaStar, 
  FaFire, 
  FaChartLine,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaDna,
  FaCrown,
  FaShare,
  FaRobot
} from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import zentroIdService from '../../services/zentroIdService';

const ZentroIdTimeline = ({ userId, isOwnProfile = false }) => {
  const { userProfile } = useUser();
  const [zentroId, setZentroId] = useState(null);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    loadZentroId();
    return () => {
      if (userId || userProfile?.uid) {
        zentroIdService.cleanup(userId || userProfile?.uid);
      }
    };
  }, [userId]);

  const loadZentroId = async () => {
    try {
      setLoading(true);
      const targetUserId = userId || userProfile?.uid;
      
      if (!targetUserId) {
        console.warn('No user ID provided for Zentro ID');
        return;
      }

      // Subscribe to real-time updates
      zentroIdService.subscribeToZentroId(targetUserId, (id) => {
        setZentroId(id);
        setLoading(false);
      });

      // Load activity timeline
      const timeline = await zentroIdService.getActivityTimeline(targetUserId, 20);
      setActivityTimeline(timeline);

      // Initialize if not found and it's the current user
      let id = await zentroIdService.getZentroId(targetUserId);
      if (!id && isOwnProfile && userProfile) {
        id = await zentroIdService.initializeZentroId(targetUserId, userProfile);
      }
      
    } catch (error) {
      console.error('Error loading Zentro ID:', error);
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!isOwnProfile || !zentroId) return;
    
    const newStatus = zentroId.status === 'active' ? 'stealth' : 'active';
    await zentroIdService.updateStatus(userProfile.uid, newStatus);
  };

  const handleMoodChange = async (mood) => {
    if (!isOwnProfile || !zentroId) return;
    
    await zentroIdService.updateMood(userProfile.uid, mood);
  };

  const handleDiscoveryToggle = async () => {
    if (!isOwnProfile || !zentroId) return;
    
    await zentroIdService.toggleDiscoveryMode(userProfile.uid);
  };

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'focused': return 'bg-blue-500';
      case 'chill': return 'bg-green-500';
      case 'grinding': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <FaEye className="text-green-400" />;
      case 'stealth': return <FaEyeSlash className="text-gray-400" />;
      case 'busy': return <FaFire className="text-red-400" />;
      default: return <FaEye className="text-green-400" />;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-2/3"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!zentroId) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 text-center border border-gray-700">
        <FaStar className="text-4xl text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Zentro ID Not Found</h3>
        <p className="text-gray-500">This user hasn't activated their Zentro ID yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header with Avatar and Status */}
      <div className="relative p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {zentroId.displayName?.charAt(0) || 'Z'}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-gray-800 flex items-center justify-center ${getMoodColor(zentroId.mood)}`}>
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-white">{zentroId.displayName}</h2>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  zentroId.level >= 10 ? 'bg-purple-500 text-white' :
                  zentroId.level >= 5 ? 'bg-blue-500 text-white' :
                  'bg-green-500 text-white'
                }`}>
                  Level {zentroId.level}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300">{zentroId.xp} XP</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isOwnProfile && (
              <>
                <button
                  onClick={handleStatusToggle}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  title={`Status: ${zentroId.status}`}
                >
                  {getStatusIcon(zentroId.status)}
                </button>
                
                <button
                  onClick={handleDiscoveryToggle}
                  className={`p-2 rounded-lg transition-colors ${
                    zentroId.discoveryMode 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  title={`Discovery Mode: ${zentroId.discoveryMode ? 'ON' : 'OFF'}`}
                >
                  <FaShare className="text-white" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Bio */}
        <div className="bg-black/20 rounded-lg p-3 mb-4">
          <p className="text-white text-sm leading-relaxed">
            {zentroId.dynamicBio || "Ready to explore Zentro!"}
          </p>
        </div>

        {/* Mood Selector for Own Profile */}
        {isOwnProfile && (
          <div className="flex space-x-2">
            {['focused', 'chill', 'grinding'].map((mood) => (
              <button
                key={mood}
                onClick={() => handleMoodChange(mood)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  zentroId.mood === mood
                    ? `${getMoodColor(mood)} text-white`
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Animated Stats Bar */}
      <div className="px-6 py-4 bg-gray-800/50">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-red-400">{zentroId.stats.battlesWon}</div>
            <div className="text-xs text-gray-400">Battles</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">{zentroId.stats.collabsCompleted}</div>
            <div className="text-xs text-gray-400">Collabs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{zentroId.stats.menteesCount}</div>
            <div className="text-xs text-gray-400">Mentees</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{zentroId.stats.achievementsUnlocked}</div>
            <div className="text-xs text-gray-400">Achievements</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <div className="flex">
          {['timeline', 'achievements', 'squad', 'skillDNA'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 px-4 text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab === 'timeline' && <FaChartLine className="inline mr-2" />}
              {tab === 'achievements' && <FaTrophy className="inline mr-2" />}
              {tab === 'squad' && <FaShieldAlt className="inline mr-2" />}
              {tab === 'skillDNA' && <FaDna className="inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Activity Timeline</h3>
              <FaRobot className="text-blue-400" title="AI-Generated Timeline" />
            </div>
            
            {activityTimeline.length > 0 ? (
              <div className="space-y-3">
                {activityTimeline.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start space-x-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="text-white text-sm">{activity.action}</div>
                      <div className="text-gray-400 text-xs">{activity.details}</div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-500 text-xs">{formatTimeAgo(activity.createdAt)}</span>
                        {activity.xpGained > 0 && (
                          <span className="text-green-400 text-xs font-semibold">+{activity.xpGained} XP</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <FaFire className="text-3xl mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Start your Zentro journey!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="text-center text-gray-500 py-8">
            <FaTrophy className="text-3xl mx-auto mb-3 opacity-50" />
            <p className="text-sm">Achievements coming soon!</p>
          </div>
        )}

        {activeTab === 'squad' && (
          <div className="text-center text-gray-500 py-8">
            <FaShieldAlt className="text-3xl mx-auto mb-3 opacity-50" />
            <p className="text-sm">Squad info coming soon!</p>
          </div>
        )}

        {activeTab === 'skillDNA' && (
          <div className="text-center text-gray-500 py-8">
            <FaDna className="text-3xl mx-auto mb-3 opacity-50" />
            <p className="text-sm">Skill DNA visualization coming soon!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ZentroIdTimeline;
