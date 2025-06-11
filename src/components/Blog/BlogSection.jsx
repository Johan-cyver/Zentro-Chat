import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FaEdit, FaGlobe, FaLock, FaUser, FaCalendarAlt, FaHeart, FaRegHeart,
  FaComment, FaTrash, FaArrowLeft, FaRocket, FaBolt, FaFire, FaStar,
  FaEye, FaShare, FaBookmark, FaLightbulb, FaBrain, FaAtom, FaPalette
} from 'react-icons/fa';
import BlogEditor from './BlogEditor';
import { useUser } from '../../contexts/UserContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getTheme } from '../../styles/themes';

const BlogSection = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [activeView, setActiveView] = useState('public'); // 'public' or 'private'
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [showComments, setShowComments] = useState({});
  const { userProfile } = useUser();
  const { currentTheme, changeTheme } = useTheme();
  const navigate = useNavigate();

  // Load blog posts from localStorage
  useEffect(() => {
    loadBlogPosts();
  }, [userProfile.uid, activeView]);

  // Also reload when component mounts or when new posts are created
  useEffect(() => {
    const handleStorageChange = () => {
      loadBlogPosts();
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom events when posts are created
    window.addEventListener('blogPostCreated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('blogPostCreated', handleStorageChange);
    };
  }, []);

  const loadBlogPosts = () => {
    setLoading(true);

    try {
      const savedPosts = localStorage.getItem('zentro_blog_posts');
      let posts = savedPosts ? JSON.parse(savedPosts) : [];

      // Filter posts based on active view and privacy rules
      if (activeView === 'public') {
        // Show only public posts from all users
        posts = posts.filter(post => post.visibility === 'public');
      } else if (activeView === 'private') {
        // Show only the current user's posts (both public and private)
        // Private posts should NEVER be visible to others, only to the owner
        posts = posts.filter(post =>
          post.authorId === userProfile.uid
        );
      }

      // Sort by date (newest first)
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setBlogPosts(posts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle like on a post
  const toggleLike = (postId) => {
    const updatedPosts = blogPosts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(userProfile.uid);
        let updatedLikes;

        if (isLiked) {
          // Unlike
          updatedLikes = post.likes.filter(id => id !== userProfile.uid);
        } else {
          // Like
          updatedLikes = [...post.likes, userProfile.uid];
        }

        return {
          ...post,
          likes: updatedLikes
        };
      }
      return post;
    });

    setBlogPosts(updatedPosts);

    // Update localStorage
    const allPosts = JSON.parse(localStorage.getItem('zentro_blog_posts') || '[]');
    const updatedAllPosts = allPosts.map(post => {
      if (post.id === postId) {
        const updatedPost = updatedPosts.find(p => p.id === postId);
        return updatedPost;
      }
      return post;
    });

    localStorage.setItem('zentro_blog_posts', JSON.stringify(updatedAllPosts));
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle post creation
  const handlePostCreated = (newPost) => {
    setShowEditor(false);
    // Reload posts to show the new one
    loadBlogPosts();
  };

  // Delete a blog post
  const deletePost = (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      // Get existing posts from localStorage
      const existingPosts = JSON.parse(localStorage.getItem('zentro_blog_posts') || '[]');

      // Find the post to check ownership
      const postToDelete = existingPosts.find(post => post.id === postId);

      if (!postToDelete) {
        alert('Post not found!');
        return;
      }

      // Check if user owns the post
      if (postToDelete.authorId !== userProfile.uid) {
        alert('You can only delete your own posts!');
        return;
      }

      // Remove the post
      const updatedPosts = existingPosts.filter(post => post.id !== postId);

      // Save back to localStorage
      localStorage.setItem('zentro_blog_posts', JSON.stringify(updatedPosts));

      console.log('Post deleted:', postId);

      // Dispatch events to notify other components
      window.dispatchEvent(new CustomEvent('blogPostDeleted', { detail: { postId } }));
      window.dispatchEvent(new CustomEvent('refreshBlogPosts'));

      // Reload posts
      loadBlogPosts();

    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Add comment to a blog post
  const addComment = (postId) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now().toString(),
      text: commentText.trim(),
      author: userProfile.displayName || 'Anonymous',
      authorId: userProfile.uid,
      authorPhotoURL: userProfile.photoURL,
      date: new Date().toISOString(),
      replies: [],
      parentId: replyingTo ? replyingTo.id : null
    };

    try {
      // Get existing posts from localStorage
      const existingPosts = JSON.parse(localStorage.getItem('zentro_blog_posts') || '[]');

      // Update the specific post with the new comment
      const updatedPosts = existingPosts.map(post => {
        if (post.id === postId) {
          if (replyingTo) {
            // Add reply to existing comment
            const updatedComments = post.comments.map(comment => {
              if (comment.id === replyingTo.id) {
                return {
                  ...comment,
                  replies: [...comment.replies, newComment]
                };
              }
              return comment;
            });
            return { ...post, comments: updatedComments };
          } else {
            // Add new comment
            return { ...post, comments: [...(post.comments || []), newComment] };
          }
        }
        return post;
      });

      // Save back to localStorage
      localStorage.setItem('zentro_blog_posts', JSON.stringify(updatedPosts));

      // Clear comment form
      setCommentText('');
      setReplyingTo(null);

      // Reload posts to show new comment
      loadBlogPosts();

      console.log('Comment added to post:', postId);

    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  // Delete a comment
  const deleteComment = (postId, commentId, parentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      // Get existing posts from localStorage
      const existingPosts = JSON.parse(localStorage.getItem('zentro_blog_posts') || '[]');

      // Update the specific post by removing the comment
      const updatedPosts = existingPosts.map(post => {
        if (post.id === postId) {
          if (parentId) {
            // Delete reply
            const updatedComments = post.comments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies.filter(reply => reply.id !== commentId)
                };
              }
              return comment;
            });
            return { ...post, comments: updatedComments };
          } else {
            // Delete main comment
            return { ...post, comments: post.comments.filter(comment => comment.id !== commentId) };
          }
        }
        return post;
      });

      // Save back to localStorage
      localStorage.setItem('zentro_blog_posts', JSON.stringify(updatedPosts));

      // Reload posts to show updated comments
      loadBlogPosts();

      console.log('Comment deleted from post:', postId);

    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  // Toggle comments visibility for a post
  const toggleComments = (postId) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  // Render blog post
  const renderBlogPost = (post) => {
    const isExpanded = expandedPost === post.id;
    const isLiked = post.likes.includes(userProfile.uid);

    return (
      <motion.div
        key={post.id}
        whileHover={{ scale: 1.01, y: -2 }}
        className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl overflow-hidden border border-purple-500/20 hover:border-purple-500/40 transition-all duration-500 shadow-2xl hover:shadow-purple-500/10"
      >
        {/* Post Header */}
        <div className="p-6 border-b border-gray-700/30 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="relative"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 p-0.5">
                <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center">
                  {post.authorPhotoURL ? (
                    <img
                      src={post.authorPhotoURL}
                      alt={post.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <FaUser className="text-gray-400" />
                  )}
                </div>
              </div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"
              />
            </motion.div>
            <div>
              <h3 className="font-bold text-white text-lg">{post.authorName}</h3>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <FaCalendarAlt className="h-3 w-3" />
                  {formatDate(post.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  {post.visibility === 'public' ? (
                    <FaGlobe className="h-3 w-3 text-green-400" />
                  ) : (
                    <FaLock className="h-3 w-3 text-yellow-400" />
                  )}
                  {post.visibility === 'public' ? 'Global' : 'Vault'}
                </span>
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="px-2 py-1 bg-purple-500/20 rounded-full text-xs text-purple-300 border border-purple-500/30"
                >
                  Innovation
                </motion.span>
              </div>
            </div>
          </div>

          {/* Post Actions - Only show for post owner */}
          {post.authorId === userProfile.uid && (
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => deletePost(post.id)}
                className="p-3 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-all duration-200"
                title="Delete post"
              >
                <FaTrash className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="p-6">
          <motion.h2
            className="text-2xl font-bold text-white mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
          >
            {post.title}
          </motion.h2>

          <div className="text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed text-lg">
            {isExpanded ? post.content : post.content.length > 300 ? `${post.content.substring(0, 300)}...` : post.content}
          </div>

          {post.content.length > 300 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setExpandedPost(isExpanded ? null : post.id)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-6 px-4 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all"
            >
              {isExpanded ? 'Collapse' : 'Expand Idea'}
            </motion.button>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {post.tags.map((tag, index) => (
                <motion.span
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-sm text-purple-300 rounded-full border border-purple-500/30 hover:border-purple-500/50 transition-all"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleLike(post.id)}
                className="flex items-center gap-2 hover:text-pink-400 transition-all duration-300 group"
              >
                <motion.div
                  animate={isLiked ? { scale: [1, 1.3, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  {isLiked ? <FaHeart className="text-pink-500 text-lg" /> : <FaRegHeart className="text-gray-400 text-lg group-hover:text-pink-400" />}
                </motion.div>
                <span className="font-medium">{post.likes.length}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-2 hover:text-blue-400 transition-all duration-300 group"
              >
                <FaComment className="text-gray-400 text-lg group-hover:text-blue-400" />
                <span className="font-medium">{post.comments ? post.comments.length : 0}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 hover:text-green-400 transition-all duration-300 group"
              >
                <FaShare className="text-gray-400 text-lg group-hover:text-green-400" />
                <span className="font-medium">Share</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                className="flex items-center gap-2 hover:text-yellow-400 transition-all duration-300 group"
              >
                <FaBookmark className="text-gray-400 text-lg group-hover:text-yellow-400" />
              </motion.button>
            </div>

            <div className="flex items-center gap-2 text-gray-500">
              <FaEye className="text-sm" />
              <span className="text-sm">{Math.floor(Math.random() * 500) + 50}</span>
            </div>
          </div>

          {/* Comments Section */}
          {showComments[post.id] && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              {/* Comments List */}
              <div className="space-y-3 mb-4">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map(comment => (
                    <div key={comment.id} className="bg-gray-700 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center">
                            {comment.authorPhotoURL ? (
                              <img
                                src={comment.authorPhotoURL}
                                alt={comment.author}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <FaUser className="text-gray-400 text-xs" />
                            )}
                          </div>
                          <span className="text-white text-sm font-medium">{comment.author}</span>
                          <span className="text-gray-400 text-xs">{formatDate(comment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setReplyingTo(comment)}
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            Reply
                          </button>
                          {comment.authorId === userProfile.uid && (
                            <button
                              onClick={() => deleteComment(post.id, comment.id)}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              <FaTrash className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.text}</p>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 space-y-2">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="bg-gray-600 rounded-lg p-2">
                              <div className="flex justify-between items-start mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-gray-500 flex items-center justify-center">
                                    {reply.authorPhotoURL ? (
                                      <img
                                        src={reply.authorPhotoURL}
                                        alt={reply.author}
                                        className="w-full h-full rounded-full object-cover"
                                      />
                                    ) : (
                                      <FaUser className="text-gray-400 text-xs" />
                                    )}
                                  </div>
                                  <span className="text-white text-xs font-medium">{reply.author}</span>
                                  <span className="text-gray-400 text-xs">{formatDate(reply.date)}</span>
                                </div>
                                {reply.authorId === userProfile.uid && (
                                  <button
                                    onClick={() => deleteComment(post.id, reply.id, comment.id)}
                                    className="text-red-400 hover:text-red-300 text-xs"
                                  >
                                    <FaTrash className="h-2 w-2" />
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-300 text-xs">{reply.text}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No comments yet. Be the first to comment!</p>
                )}
              </div>

              {/* Add Comment Form */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={replyingTo ? `Reply to ${replyingTo.author}...` : "Add a comment..."}
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addComment(post.id);
                    }
                  }}
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-sm"
                >
                  {replyingTo ? 'Reply' : 'Comment'}
                </button>
                {replyingTo && (
                  <button
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white font-medium transition-all duration-300 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto p-6 relative z-10">
        {/* Revolutionary Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <motion.div
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4 bg-[length:200%_100%]"
          >
            ZENTRO NETWORK
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-300 mb-6"
          >
            Where Revolutionary Ideas Meet Infinite Possibilities
          </motion.p>

          {/* Stats Bar */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center gap-8 mb-8"
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{blogPosts.length}</div>
              <div className="text-sm text-gray-400">Ideas Shared</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-400">∞</div>
              <div className="text-sm text-gray-400">Possibilities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">24/7</div>
              <div className="text-sm text-gray-400">Innovation</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation Hub */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-12"
        >
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView('public')}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 ${
                activeView === 'public'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/25'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
              }`}
            >
              <FaGlobe className="text-lg" />
              Global Feed
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveView('private')}
              className={`px-6 py-3 rounded-2xl font-bold transition-all duration-300 flex items-center gap-3 ${
                activeView === 'private'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl shadow-purple-500/25'
                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
              }`}
            >
              <FaLock className="text-lg" />
              My Vault
            </motion.button>

            {/* Theme Switcher */}
            <div className="flex items-center gap-2">
              <FaPalette className="text-gray-400" />
              <select
                value={currentTheme?.id || 'corporate'}
                onChange={(e) => {
                  const selectedTheme = getTheme(e.target.value);
                  if (selectedTheme && changeTheme) {
                    changeTheme(selectedTheme);
                  }
                }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="corporate">Corporate</option>
                <option value="neonPurple">Neon Purple</option>
                <option value="cyberpunk">Cyberpunk</option>
                <option value="matrix">Matrix</option>
                <option value="clean">Clean</option>
                <option value="minimal">Minimal</option>
                <option value="warm">Warm</option>
                <option value="darkBlue">Dark Blue</option>
                <option value="neonGreen">Neon Green</option>
                <option value="neonRed">Neon Red</option>
                <option value="ocean">Ocean</option>
              </select>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEditor(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-3 group"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FaRocket className="text-xl" />
            </motion.div>
            Launch Idea
            <FaBolt className="text-lg group-hover:text-yellow-300 transition-colors" />
          </motion.button>
        </motion.div>

        {/* Editor Modal */}
        <AnimatePresence>
          {showEditor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Launch Your Idea
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowEditor(false)}
                    className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    <FaArrowLeft className="text-white" />
                  </motion.button>
                </div>
                <BlogEditor onPostCreated={handlePostCreated} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content Area */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 xl:grid-cols-4 gap-8"
        >
          {/* Innovation Sidebar */}
          <div className="xl:col-span-1">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-3xl p-6 border border-purple-500/20 shadow-2xl sticky top-6"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <FaBrain className="text-2xl text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Innovation Hub</h3>
                <p className="text-gray-400 text-sm">Transform thoughts into reality</p>
              </div>

              {/* Quick Actions */}
              <div className="space-y-3 mb-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditor(true)}
                  className="w-full p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl text-white font-bold flex items-center gap-3 hover:shadow-lg transition-all"
                >
                  <FaLightbulb className="text-lg" />
                  Spark Idea
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="w-full p-3 bg-gray-700/50 rounded-xl text-gray-300 font-medium flex items-center gap-3 hover:bg-gray-600/50 transition-all"
                >
                  <FaAtom className="text-lg text-blue-400" />
                  Research Mode
                </motion.button>
              </div>

              {/* Network Stats */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Active Minds</span>
                    <motion.span
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-purple-400 font-bold"
                    >
                      {Math.floor(Math.random() * 1000) + 500}
                    </motion.span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Ideas Today</span>
                    <span className="text-blue-400 font-bold">{blogPosts.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Main Feed */}
          <div className="xl:col-span-3">
            <motion.div
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-xl rounded-3xl border border-purple-500/20 shadow-2xl overflow-hidden"
            >
              {/* Feed Header */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      {activeView === 'public' ? <FaGlobe className="text-green-400" /> : <FaLock className="text-yellow-400" />}
                    </motion.div>
                    {activeView === 'public' ? 'Global Innovation Feed' : 'Personal Vault'}
                  </h2>

                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 bg-green-400 rounded-full"
                    />
                    <span className="text-green-400 text-sm font-medium">Live</span>
                  </div>
                </div>
              </div>

              {/* Feed Content */}
              <div className="p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full mb-4"
                    />
                    <p className="text-gray-400">Loading revolutionary ideas...</p>
                  </div>
                ) : blogPosts.length === 0 ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center py-16"
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                    >
                      <FaRocket className="text-3xl text-white" />
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {activeView === 'public' ? 'The Future Awaits' : 'Your Innovation Journey Begins'}
                    </h3>
                    <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                      {activeView === 'public'
                        ? 'Be the pioneer who launches the first revolutionary idea into the Zentro Network!'
                        : 'Transform your thoughts into digital reality. Every great innovation starts with a single idea.'
                      }
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowEditor(true)}
                      className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
                    >
                      <FaFire className="text-xl" />
                      Ignite Innovation
                      <FaStar className="text-xl" />
                    </motion.button>
                  </motion.div>
                ) : (
                  <div className="space-y-6">
                    <AnimatePresence>
                      {blogPosts.map((post, index) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 50 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -50 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          {renderBlogPost(post)}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BlogSection;
