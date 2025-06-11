import React, { useState, useEffect } from 'react';
import { FaTrophy, FaGamepad, FaUsers, FaGraduationCap, FaStar, FaFire, FaChartLine } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import zentroIdService from '../../services/zentroIdService';

const ZentroIdCard = ({ userId, isOwnProfile = false }) => {
  const { userProfile } = useUser();
  const [zentroId, setZentroId] = useState(null);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    loadZentroId();
    return () => {
      // Cleanup listeners when component unmounts
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
      const unsubscribe = zentroIdService.subscribeToZentroId(targetUserId, (id) => {
        setZentroId(id);
        setLoading(false);
      });

      // Load activity timeline
      const timeline = await zentroIdService.getActivityTimeline(targetUserId, 10);
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

  const getLevelColor = (level) => {
    if (level >= 10) return 'text-purple-400';
    if (level >= 7) return 'text-blue-400';
    if (level >= 4) return 'text-green-400';
    return 'text-gray-400';
  };

  const getXpProgress = () => {
    if (!zentroId) return 0;
    const currentLevelXp = zentroId.level === 1 ? 0 : 
      zentroId.level === 2 ? 100 :
      zentroId.level === 3 ? 300 :
      zentroId.level === 4 ? 600 :
      zentroId.level === 5 ? 1000 : 1500;
    
    const nextLevelXp = zentroId.level === 1 ? 100 :
      zentroId.level === 2 ? 300 :
      zentroId.level === 3 ? 600 :
      zentroId.level === 4 ? 1000 :
      zentroId.level === 5 ? 1500 : 2100;
    
    const progress = ((zentroId.xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-8 bg-gray-700 rounded w-1/2 mb-4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-700 rounded w-full"></div>
          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!zentroId) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <FaStar className="text-4xl text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-300 mb-2">Zentro ID Not Found</h3>
        <p className="text-gray-500">This user hasn't activated their Zentro ID yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`text-2xl ${getLevelColor(zentroId.level)}`}>
            <FaStar />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Zentro ID</h3>
            <p className="text-gray-400 text-sm">Level {zentroId.level} Explorer</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getLevelColor(zentroId.level)}`}>
            {zentroId.level}
          </div>
          <div className="text-xs text-gray-500">{zentroId.xp} XP</div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress to Level {zentroId.level + 1}</span>
          <span>{Math.round(getXpProgress())}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${getXpProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Dynamic Bio */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Status</h4>
        <p className="text-white bg-gray-700 rounded-lg p-3 text-sm">
          {zentroId.dynamicBio}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <FaGamepad className="text-red-400 text-xl mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {zentroId.stats.battlesWon}
          </div>
          <div className="text-xs text-gray-400">Battles Won</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <FaUsers className="text-blue-400 text-xl mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {zentroId.stats.collabsCompleted}
          </div>
          <div className="text-xs text-gray-400">Collabs</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <FaGraduationCap className="text-green-400 text-xl mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {zentroId.stats.menteesCount}
          </div>
          <div className="text-xs text-gray-400">Mentees</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 text-center">
          <FaTrophy className="text-yellow-400 text-xl mx-auto mb-2" />
          <div className="text-lg font-bold text-white">
            {zentroId.stats.achievementsUnlocked}
          </div>
          <div className="text-xs text-gray-400">Achievements</div>
        </div>
      </div>

      {/* Squad Info */}
      {zentroId.currentSquad && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">Squad</h4>
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-semibold">{zentroId.currentSquad}</div>
                <div className="text-gray-400 text-sm">{zentroId.stats.squadRank}</div>
              </div>
              <FaUsers className="text-blue-400 text-xl" />
            </div>
          </div>
        </div>
      )}

      {/* Activity Timeline Toggle */}
      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={() => setShowTimeline(!showTimeline)}
          className="flex items-center justify-between w-full text-left"
        >
          <span className="text-sm font-semibold text-gray-300">Recent Activity</span>
          <FaChartLine className={`text-gray-400 transition-transform ${showTimeline ? 'rotate-180' : ''}`} />
        </button>
        
        {showTimeline && (
          <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
            {activityTimeline.length > 0 ? (
              activityTimeline.map((activity, index) => (
                <div key={activity.id || index} className="bg-gray-700 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white text-sm">{activity.action}</div>
                      <div className="text-gray-400 text-xs">{activity.details}</div>
                    </div>
                    <div className="text-right">
                      {activity.xpGained > 0 && (
                        <div className="text-green-400 text-xs font-semibold">
                          +{activity.xpGained} XP
                        </div>
                      )}
                      <div className="text-gray-500 text-xs">
                        {formatDate(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">
                <FaFire className="text-2xl mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activity</p>
                <p className="text-xs">Start battling or collaborating to see your journey!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Join Date */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          Zentro Explorer since {new Date(zentroId.joinDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default ZentroIdCard;
