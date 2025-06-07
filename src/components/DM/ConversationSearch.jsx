import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserPlus, FaComments, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';

const ConversationSearch = ({ onSelectUser, onClose, currentTheme }) => {
  const { userProfile } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search'); // 'search', 'requests'
  const [chatRequests, setChatRequests] = useState([]);

  useEffect(() => {
    loadChatRequests();
  }, [userProfile]);

  const loadChatRequests = () => {
    try {
      const requests = JSON.parse(localStorage.getItem(`zentro_chat_requests_${userProfile?.uid}`) || '[]');
      setChatRequests(requests);
    } catch (error) {
      console.error('Error loading chat requests:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim() || !userProfile?.uid) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Search in Firebase users collection
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('displayName', '>=', query),
        where('displayName', '<=', query + '\uf8ff'),
        orderBy('displayName'),
        limit(10)
      );

      const snapshot = await getDocs(q);
      const users = [];

      snapshot.forEach((doc) => {
        const userData = doc.data();
        if (doc.id !== userProfile.uid) {
          users.push({
            id: doc.id,
            name: userData.displayName || 'Unknown User',
            avatar: userData.photoURL,
            email: userData.email,
            bio: userData.bio || '',
            online: userData.online || false,
            lastSeen: userData.lastSeen
          });
        }
      });

      setSearchResults(users);
    } catch (error) {
      console.error('Error searching users:', error);
      // Fallback to mock data for demo
      const mockUsers = [
        {
          id: 'user1',
          name: 'Alex Johnson',
          avatar: null,
          bio: 'Software Developer',
          online: true
        },
        {
          id: 'user2',
          name: 'Sarah Chen',
          avatar: null,
          bio: 'UI/UX Designer',
          online: false
        }
      ].filter(user => user.name.toLowerCase().includes(query.toLowerCase()));

      setSearchResults(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const sendChatRequest = (user) => {
    try {
      // Add to recipient's chat requests
      const recipientRequests = JSON.parse(localStorage.getItem(`zentro_chat_requests_${user.id}`) || '[]');
      const newRequest = {
        id: Date.now().toString(),
        from: {
          id: userProfile.uid,
          name: userProfile.displayName,
          avatar: userProfile.photoURL
        },
        to: user,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      recipientRequests.push(newRequest);
      localStorage.setItem(`zentro_chat_requests_${user.id}`, JSON.stringify(recipientRequests));

      // Add to sender's sent requests
      const sentRequests = JSON.parse(localStorage.getItem(`zentro_sent_requests_${userProfile.uid}`) || '[]');
      sentRequests.push(newRequest);
      localStorage.setItem(`zentro_sent_requests_${userProfile.uid}`, JSON.stringify(sentRequests));

      alert(`Chat request sent to ${user.name}!`);

      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== user.id));
    } catch (error) {
      console.error('Error sending chat request:', error);
    }
  };

  const acceptChatRequest = (request) => {
    try {
      // Remove from requests
      const updatedRequests = chatRequests.filter(r => r.id !== request.id);
      setChatRequests(updatedRequests);
      localStorage.setItem(`zentro_chat_requests_${userProfile.uid}`, JSON.stringify(updatedRequests));

      // Start chat with the user
      onSelectUser(request.from);
      onClose();
    } catch (error) {
      console.error('Error accepting chat request:', error);
    }
  };

  const rejectChatRequest = (request) => {
    try {
      const updatedRequests = chatRequests.filter(r => r.id !== request.id);
      setChatRequests(updatedRequests);
      localStorage.setItem(`zentro_chat_requests_${userProfile.uid}`, JSON.stringify(updatedRequests));
    } catch (error) {
      console.error('Error rejecting chat request:', error);
    }
  };

  const UserCard = ({ user, showRequestButton = true }) => (
    <div className="flex items-center p-4 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-lg">
      <div className="relative flex-shrink-0 mr-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white bg-gray-500 font-medium">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {user.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate" style={{ color: currentTheme?.colors?.text }}>
          {user.name}
        </h3>
        {user.bio && (
          <p className="text-sm truncate" style={{ color: currentTheme?.colors?.textMuted }}>
            {user.bio}
          </p>
        )}
      </div>

      {showRequestButton && (
        <button
          onClick={() => sendChatRequest(user)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <FaUserPlus className="text-sm" />
          <span>Request</span>
        </button>
      )}
    </div>
  );

  const RequestCard = ({ request }) => (
    <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-300 mr-3">
        {request.from.avatar ? (
          <img src={request.from.avatar} alt={request.from.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white bg-gray-500 font-medium">
            {request.from.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium" style={{ color: currentTheme?.colors?.text }}>
          {request.from.name}
        </h3>
        <p className="text-sm" style={{ color: currentTheme?.colors?.textMuted }}>
          Wants to start a conversation
        </p>
        <div className="flex items-center space-x-1 text-xs mt-1" style={{ color: currentTheme?.colors?.textMuted }}>
          <FaClock />
          <span>{new Date(request.timestamp).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => acceptChatRequest(request)}
          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          title="Accept"
        >
          <FaCheck />
        </button>
        <button
          onClick={() => rejectChatRequest(request)}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          title="Reject"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Find People & Requests</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'search'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FaSearch />
            <span>Search Users</span>
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center space-x-2 px-6 py-3 font-medium transition-colors ${
              activeTab === 'requests'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-900/20'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FaComments />
            <span>Chat Requests</span>
            {chatRequests.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {chatRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'search' ? (
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for people to chat with..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Search Results */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-gray-400 mt-2">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map(user => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No users found matching "{searchQuery}"</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaSearch className="text-4xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Search for people to start new conversations</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {chatRequests.length > 0 ? (
                chatRequests.map(request => (
                  <RequestCard key={request.id} request={request} />
                ))
              ) : (
                <div className="text-center py-8">
                  <FaComments className="text-4xl text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No chat requests</p>
                  <p className="text-sm text-gray-500 mt-2">
                    When someone wants to chat with you, their requests will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationSearch;
