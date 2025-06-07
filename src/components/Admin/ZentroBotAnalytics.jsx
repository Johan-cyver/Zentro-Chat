import React, { useState, useEffect } from 'react';
import { FaRobot, FaUsers, FaChartLine, FaBrain, FaSearch, FaRefresh } from 'react-icons/fa';
import zentroCustomAI from '../../services/customAI';

const ZentroBotAnalytics = ({ theme }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    loadAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = () => {
    try {
      const data = zentroCustomAI.getAnalytics();
      setAnalytics(data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  const refreshAnalytics = () => {
    setLoading(true);
    loadAnalytics();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaRobot className="text-4xl text-purple-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400">Loading Zentro Bot Analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaRobot className="text-2xl text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold text-white">Zentro Bot Analytics</h2>
            <p className="text-gray-400">Real-time AI interaction insights</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <button
            onClick={refreshAnalytics}
            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            title="Refresh Analytics"
          >
            <FaRefresh className="text-white" />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Interactions</p>
              <p className="text-2xl font-bold text-white">{analytics.overview.totalInteractions}</p>
            </div>
            <FaChartLine className="text-purple-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Daily Active Users</p>
              <p className="text-2xl font-bold text-white">{analytics.overview.dailyActiveUsers}</p>
            </div>
            <FaUsers className="text-blue-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">{analytics.overview.totalUsers}</p>
            </div>
            <FaUsers className="text-green-500 text-2xl" />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-yellow-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Interactions/User</p>
              <p className="text-2xl font-bold text-white">
                {analytics.overview.averageInteractionsPerUser.toFixed(1)}
              </p>
            </div>
            <FaBrain className="text-yellow-500 text-2xl" />
          </div>
        </div>
      </div>

      {/* Popular Queries */}
      <div className="bg-gray-800 rounded-xl p-6 border border-purple-500/30">
        <div className="flex items-center space-x-2 mb-4">
          <FaSearch className="text-purple-500" />
          <h3 className="text-xl font-bold text-white">Popular Queries</h3>
        </div>
        <div className="space-y-3">
          {analytics.popularQueries.slice(0, 10).map(([query, count], index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-300 truncate flex-1 mr-4">
                {query.length > 50 ? `${query.substring(0, 50)}...` : query}
              </span>
              <div className="flex items-center space-x-2">
                <div 
                  className="bg-purple-600 h-2 rounded"
                  style={{ 
                    width: `${Math.max(20, (count / Math.max(...analytics.popularQueries.map(([,c]) => c))) * 100)}px` 
                  }}
                />
                <span className="text-purple-400 font-medium min-w-[30px] text-right">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Usage & Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Usage */}
        <div className="bg-gray-800 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center space-x-2 mb-4">
            <FaChartLine className="text-blue-500" />
            <h3 className="text-xl font-bold text-white">Feature Usage</h3>
          </div>
          <div className="space-y-3">
            {analytics.featureUsage.map(([feature, count], index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-gray-300 capitalize">{feature.replace('_', ' ')}</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="bg-blue-600 h-2 rounded"
                    style={{ 
                      width: `${Math.max(20, (count / Math.max(...analytics.featureUsage.map(([,c]) => c))) * 80)}px` 
                    }}
                  />
                  <span className="text-blue-400 font-medium min-w-[30px] text-right">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Progress */}
        <div className="bg-gray-800 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center space-x-2 mb-4">
            <FaBrain className="text-green-500" />
            <h3 className="text-xl font-bold text-white">Learning Progress</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Topics Learned</span>
              <span className="text-green-400 font-bold">{analytics.learningProgress.topicsLearned}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Keywords Tracked</span>
              <span className="text-green-400 font-bold">{analytics.learningProgress.keywordsTracked}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">User Profiles</span>
              <span className="text-green-400 font-bold">{analytics.learningProgress.usersWithProfiles}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interactions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-yellow-500/30">
        <div className="flex items-center space-x-2 mb-4">
          <FaRobot className="text-yellow-500" />
          <h3 className="text-xl font-bold text-white">Recent Interactions</h3>
        </div>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {analytics.recentInteractions.map((interaction, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm text-gray-400">
                    User: {interaction.userId?.substring(0, 8)}...
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(interaction.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    interaction.type === 'zentro_query' ? 'bg-purple-600' :
                    interaction.type === 'search_query' ? 'bg-blue-600' :
                    'bg-gray-600'
                  }`}>
                    {interaction.type}
                  </span>
                </div>
                <p className="text-gray-300 text-sm truncate">
                  {interaction.message.length > 100 
                    ? `${interaction.message.substring(0, 100)}...` 
                    : interaction.message
                  }
                </p>
              </div>
              <div className="text-right">
                <div className={`w-3 h-3 rounded-full ${
                  interaction.sentiment === 'positive' ? 'bg-green-500' :
                  interaction.sentiment === 'negative' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} title={`Sentiment: ${interaction.sentiment}`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-sm">
        <p>🤖 Zentro Bot is continuously learning and improving from user interactions</p>
        <p>All data is stored locally and respects user privacy</p>
      </div>
    </div>
  );
};

export default ZentroBotAnalytics;
