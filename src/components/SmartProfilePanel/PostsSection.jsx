import React, { useState, useEffect } from 'react';
import { FaImage, FaVideo, FaGlobe, FaUsers, FaLock, FaHeart, FaComment, FaShare, FaTrash } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const PostsSection = () => {
  const { userProfile } = useUser();
  const [posts, setPosts] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    media: null,
    mediaType: null,
    privacy: 'public' // public, friends, private
  });

  // Load posts from localStorage
  useEffect(() => {
    const savedPosts = localStorage.getItem(`zentro_posts_${userProfile?.uid}`);
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    }
  }, [userProfile?.uid]);

  // Save posts to localStorage
  const savePosts = (updatedPosts) => {
    localStorage.setItem(`zentro_posts_${userProfile?.uid}`, JSON.stringify(updatedPosts));
    setPosts(updatedPosts);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
      setNewPost(prev => ({
        ...prev,
        media: e.target.result,
        mediaType
      }));
    };
    reader.readAsDataURL(file);
  };

  // Create new post
  const createPost = () => {
    if (!newPost.content.trim() && !newPost.media) return;

    const post = {
      id: Date.now(),
      content: newPost.content,
      media: newPost.media,
      mediaType: newPost.mediaType,
      privacy: newPost.privacy,
      author: {
        id: userProfile.uid,
        name: userProfile.displayName,
        avatar: userProfile.photoURL
      },
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: [],
      shares: 0
    };

    const updatedPosts = [post, ...posts];
    savePosts(updatedPosts);

    // Reset form
    setNewPost({
      content: '',
      media: null,
      mediaType: null,
      privacy: 'public'
    });
    setShowCreatePost(false);
  };

  // Delete post
  const deletePost = (postId) => {
    const updatedPosts = posts.filter(post => post.id !== postId);
    savePosts(updatedPosts);
  };

  // Like post
  const likePost = (postId) => {
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.likes + 1 }
        : post
    );
    savePosts(updatedPosts);
  };

  // Get privacy icon and text
  const getPrivacyInfo = (privacy) => {
    switch (privacy) {
      case 'public':
        return { icon: <FaGlobe />, text: 'Public', color: 'text-green-400' };
      case 'friends':
        return { icon: <FaUsers />, text: 'Friends Only', color: 'text-blue-400' };
      case 'private':
        return { icon: <FaLock />, text: 'Private', color: 'text-red-400' };
      default:
        return { icon: <FaGlobe />, text: 'Public', color: 'text-green-400' };
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Posts</h3>
        <button
          onClick={() => setShowCreatePost(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
        >
          Create Post
        </button>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-2xl w-full border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Create New Post</h3>
              <button
                onClick={() => setShowCreatePost(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {/* Post Content */}
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
              placeholder="What's on your mind?"
              className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              rows="4"
            />

            {/* Media Preview */}
            {newPost.media && (
              <div className="mb-4">
                {newPost.mediaType === 'image' ? (
                  <img
                    src={newPost.media}
                    alt="Preview"
                    className="max-w-full max-h-64 rounded-lg object-cover"
                  />
                ) : (
                  <video
                    src={newPost.media}
                    controls
                    className="max-w-full max-h-64 rounded-lg"
                  />
                )}
                <button
                  onClick={() => setNewPost(prev => ({ ...prev, media: null, mediaType: null }))}
                  className="mt-2 text-red-400 hover:text-red-300 text-sm"
                >
                  Remove media
                </button>
              </div>
            )}

            {/* Post Options */}
            <div className="flex items-center justify-between mb-4">
              {/* Media Upload */}
              <div className="flex gap-2">
                <label className="cursor-pointer p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                  <FaImage className="text-purple-400" />
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Privacy Settings */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Privacy:</span>
                <select
                  value={newPost.privacy}
                  onChange={(e) => setNewPost(prev => ({ ...prev, privacy: e.target.value }))}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="public">🌍 Public</option>
                  <option value="friends">👥 Friends Only</option>
                  <option value="private">🔒 Private</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCreatePost(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                disabled={!newPost.content.trim() && !newPost.media}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8">
            <FaImage className="text-4xl text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No posts yet</p>
            <p className="text-gray-500 text-sm">Share your first post with the world!</p>
          </div>
        ) : (
          posts.map(post => {
            const privacyInfo = getPrivacyInfo(post.privacy);
            return (
              <div key={post.id} className="bg-gray-800 rounded-lg p-4">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">
                          {post.author.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium">{post.author.name}</p>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-400">{formatTime(post.timestamp)}</span>
                        <span className={`flex items-center gap-1 ${privacyInfo.color}`}>
                          {privacyInfo.icon}
                          {privacyInfo.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePost(post.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </div>

                {/* Post Content */}
                {post.content && (
                  <p className="text-gray-300 mb-3">{post.content}</p>
                )}

                {/* Post Media */}
                {post.media && (
                  <div className="mb-3">
                    {post.mediaType === 'image' ? (
                      <img
                        src={post.media}
                        alt="Post media"
                        className="max-w-full rounded-lg object-cover"
                      />
                    ) : (
                      <video
                        src={post.media}
                        controls
                        className="max-w-full rounded-lg"
                      />
                    )}
                  </div>
                )}

                {/* Post Actions */}
                <div className="flex items-center gap-4 pt-3 border-t border-gray-700">
                  <button
                    onClick={() => likePost(post.id)}
                    className="flex items-center gap-1 text-gray-400 hover:text-pink-400 transition-colors"
                  >
                    <FaHeart />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                    <FaComment />
                    <span>{post.comments.length}</span>
                  </button>
                  <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors">
                    <FaShare />
                    <span>{post.shares}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PostsSection;
