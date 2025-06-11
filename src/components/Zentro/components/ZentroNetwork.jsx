import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaBlog,
  FaPlus,
  FaHeart,
  FaComment,
  FaShare,
  FaEye,
  FaFire,
  FaChartLine,
  FaBookmark,
  FaMicrophone,
  FaVideo,
  FaImage,
  FaCode,
  FaLightbulb,
  FaRocket,
  FaUserSecret,
  FaGlobe,
  FaLock,
  FaUsers,
  FaSearch,
  FaFilter,
  FaClock,
  FaStar,
  FaTag,
  FaBrain,
  FaUser
} from 'react-icons/fa';

const ZentroNetwork = ({ user, theme, influenceXP, onInfluenceUpdate }) => {
  const [posts, setPosts] = useState([]);
  const [currentView, setCurrentView] = useState('feed'); // feed, trending, my-posts, create
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'blog', // blog, microblog, research, audio, video
    tags: [],
    visibility: 'public' // public, private, shadow-tagged
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    loadNetworkPosts();
  }, []);

  const loadNetworkPosts = () => {
    const mockPosts = [
      {
        id: 1,
        author: {
          name: 'Shadow Architect',
          username: 'shadow_arch',
          avatar: '/api/placeholder/40/40',
          rank: 'Elite',
          verified: true
        },
        title: 'The Future of AI-Driven Development',
        content: 'Exploring how artificial intelligence is revolutionizing the way we build applications. From code generation to automated testing, AI is becoming an indispensable tool for developers worldwide.',
        type: 'research',
        tags: ['AI', 'Development', 'Future Tech', 'Research'],
        visibility: 'public',
        timestamp: '2 hours ago',
        stats: {
          views: 1247,
          likes: 89,
          comments: 23,
          shares: 12,
          bookmarks: 45
        },
        trending: true,
        shadowTagged: false
      },
      {
        id: 2,
        author: {
          name: 'Cipher Master',
          username: 'cipher_x',
          avatar: '/api/placeholder/40/40',
          rank: 'Advanced',
          verified: true
        },
        title: 'Blockchain Security Protocols',
        content: 'Deep dive into advanced cryptographic techniques used in modern blockchain systems. Understanding the mathematical foundations that make decentralized systems secure.',
        type: 'blog',
        tags: ['Blockchain', 'Security', 'Cryptography'],
        visibility: 'public',
        timestamp: '5 hours ago',
        stats: {
          views: 892,
          likes: 67,
          comments: 18,
          shares: 8,
          bookmarks: 34
        },
        trending: false,
        shadowTagged: true
      },
      {
        id: 3,
        author: {
          name: 'UI Phantom',
          username: 'ui_phantom',
          avatar: '/api/placeholder/40/40',
          rank: 'Expert',
          verified: false
        },
        title: 'Micro-interaction design principles',
        content: 'Small details make big differences. Here\'s how to create engaging micro-interactions that delight users and improve overall experience.',
        type: 'microblog',
        tags: ['UI/UX', 'Design', 'Micro-interactions'],
        visibility: 'public',
        timestamp: '1 day ago',
        stats: {
          views: 456,
          likes: 34,
          comments: 9,
          shares: 5,
          bookmarks: 18
        },
        trending: false,
        shadowTagged: false
      }
    ];
    setPosts(mockPosts);
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return {
          bg: 'bg-white',
          card: 'bg-gray-50 border-gray-200',
          text: 'text-gray-900',
          accent: 'text-blue-600'
        };
      case 'corporate':
        return {
          bg: 'bg-blue-50',
          card: 'bg-white border-blue-200',
          text: 'text-blue-900',
          accent: 'text-blue-600'
        };
      default:
        return {
          bg: 'bg-gray-900',
          card: 'bg-gray-800 border-gray-700',
          text: 'text-white',
          accent: 'text-purple-400'
        };
    }
  };

  const themeClasses = getThemeClasses();

  const handleCreatePost = () => {
    const post = {
      id: Date.now(),
      author: {
        name: user?.displayName || 'Zentro User',
        username: user?.username || 'zentro_user',
        avatar: '/api/placeholder/40/40',
        rank: user?.zentroStats?.secretAlleyRank || 'Initiate',
        verified: true
      },
      ...newPost,
      timestamp: 'Just now',
      stats: {
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        bookmarks: 0
      },
      trending: false,
      shadowTagged: newPost.visibility === 'shadow-tagged'
    };

    setPosts([post, ...posts]);
    setNewPost({
      title: '',
      content: '',
      type: 'blog',
      tags: [],
      visibility: 'public'
    });
    setCurrentView('feed');

    // Award influence XP for posting
    onInfluenceUpdate(influenceXP + 10);
  };

  const handleLikePost = (postId) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, stats: { ...post.stats, likes: post.stats.likes + 1 } }
        : post
    ));
    onInfluenceUpdate(influenceXP + 2);
  };

  const PostCard = ({ post }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${themeClasses.card} border rounded-lg p-6 mb-6 ${
        post.shadowTagged ? 'border-red-500 bg-red-900/10' : ''
      }`}
    >
      {/* Post Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
            {post.author.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold">{post.author.name}</span>
              {post.author.verified && <FaStar className="text-yellow-400 text-sm" />}
              <span className={`text-xs px-2 py-1 rounded ${
                post.author.rank === 'Elite' ? 'bg-purple-600 text-white' :
                post.author.rank === 'Expert' ? 'bg-blue-600 text-white' :
                post.author.rank === 'Advanced' ? 'bg-green-600 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {post.author.rank}
              </span>
            </div>
            <div className="text-sm opacity-70">@{post.author.username} • {post.timestamp}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {post.trending && (
            <div className="flex items-center space-x-1 text-orange-400">
              <FaFire />
              <span className="text-xs">Trending</span>
            </div>
          )}
          {post.shadowTagged && (
            <div className="flex items-center space-x-1 text-red-400">
              <FaUserSecret />
              <span className="text-xs">Shadow</span>
            </div>
          )}
          <div className={`px-2 py-1 rounded text-xs ${
            post.type === 'research' ? 'bg-blue-600 text-white' :
            post.type === 'blog' ? 'bg-green-600 text-white' :
            post.type === 'microblog' ? 'bg-purple-600 text-white' :
            'bg-gray-600 text-white'
          }`}>
            {post.type}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">{post.title}</h3>
        <p className="leading-relaxed">{post.content}</p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {post.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm flex items-center space-x-1"
          >
            <FaTag className="text-xs" />
            <span>{tag}</span>
          </span>
        ))}
      </div>

      {/* Post Stats & Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-6 text-sm opacity-70">
          <div className="flex items-center space-x-1">
            <FaEye />
            <span>{post.stats.views}</span>
          </div>
          <div className="flex items-center space-x-1">
            <FaComment />
            <span>{post.stats.comments}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleLikePost(post.id)}
            className="flex items-center space-x-1 text-red-400 hover:text-red-300"
          >
            <FaHeart />
            <span>{post.stats.likes}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-1 text-blue-400 hover:text-blue-300"
          >
            <FaShare />
            <span>{post.stats.shares}</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="flex items-center space-x-1 text-yellow-400 hover:text-yellow-300"
          >
            <FaBookmark />
            <span>{post.stats.bookmarks}</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const CreatePostForm = () => (
    <div className={`${themeClasses.card} border rounded-lg p-6 mb-6`}>
      <h3 className="text-xl font-bold mb-4">Create New Post</h3>
      
      {/* Post Type Selection */}
      <div className="flex space-x-2 mb-4">
        {[
          { type: 'blog', icon: FaBlog, label: 'Blog Post' },
          { type: 'microblog', icon: FaLightbulb, label: 'Quick Thought' },
          { type: 'research', icon: FaRocket, label: 'Research' },
          { type: 'audio', icon: FaMicrophone, label: 'Audio' },
          { type: 'video', icon: FaVideo, label: 'Video' }
        ].map(({ type, icon: Icon, label }) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNewPost({ ...newPost, type })}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              newPost.type === type
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon />
            <span className="text-sm">{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Title Input */}
      <input
        type="text"
        placeholder="Post title..."
        value={newPost.title}
        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        className="w-full p-3 bg-gray-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Content Input */}
      <textarea
        placeholder="Share your thoughts, research, or insights..."
        value={newPost.content}
        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        className="w-full h-32 p-3 bg-gray-700 text-white rounded-lg mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Tags Input */}
      <input
        type="text"
        placeholder="Tags (comma separated)..."
        onChange={(e) => setNewPost({ 
          ...newPost, 
          tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
        })}
        className="w-full p-3 bg-gray-700 text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />

      {/* Visibility Settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-2">
          {[
            { value: 'public', icon: FaGlobe, label: 'Public' },
            { value: 'private', icon: FaLock, label: 'Private' },
            { value: 'shadow-tagged', icon: FaUserSecret, label: 'Shadow Tagged' }
          ].map(({ value, icon: Icon, label }) => (
            <motion.button
              key={value}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNewPost({ ...newPost, visibility: value })}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm ${
                newPost.visibility === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Icon />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCreatePost}
          disabled={!newPost.title || !newPost.content}
          className="bg-purple-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-bold"
        >
          Publish Post
        </motion.button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Network Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <FaBrain className="mr-3 text-purple-400" />
            Zentro Network
          </h1>
          <p className="text-lg opacity-70">Share ideas, research, and insights with the community</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className={`${themeClasses.card} border rounded-lg p-3`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{influenceXP}</div>
              <div className="text-sm opacity-70">Influence XP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'feed', label: 'Feed', icon: FaBlog },
          { key: 'trending', label: 'Trending', icon: FaFire },
          { key: 'my-posts', label: 'My Posts', icon: FaUser },
          { key: 'create', label: 'Create', icon: FaPlus }
        ].map(({ key, label, icon: Icon }) => (
          <motion.button
            key={key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentView(key)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              currentView === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Icon />
            <span>{label}</span>
          </motion.button>
        ))}
      </div>

      {/* Search & Filter */}
      {currentView !== 'create' && (
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Posts</option>
            <option value="blog">Blog Posts</option>
            <option value="research">Research</option>
            <option value="microblog">Quick Thoughts</option>
            <option value="shadow">Shadow Tagged</option>
          </select>
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'create' && <CreatePostForm />}
          
          {currentView !== 'create' && (
            <div>
              {posts
                .filter(post => {
                  if (selectedFilter === 'all') return true;
                  if (selectedFilter === 'shadow') return post.shadowTagged;
                  return post.type === selectedFilter;
                })
                .filter(post => 
                  searchQuery === '' || 
                  post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .filter(post => {
                  if (currentView === 'trending') return post.trending;
                  if (currentView === 'my-posts') return post.author.username === user?.username;
                  return true;
                })
                .map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ZentroNetwork;
