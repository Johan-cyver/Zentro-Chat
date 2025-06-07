import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaGlobe, FaLock, FaUser, FaCalendarAlt, FaHeart, FaRegHeart, FaComment, FaTrash, FaArrowLeft } from 'react-icons/fa';
import BlogEditor from './BlogEditor';
import { useUser } from '../../contexts/UserContext';

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
      <div key={post.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
        {/* Post Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
              {post.authorPhotoURL ? (
                <img
                  src={post.authorPhotoURL}
                  alt={post.authorName}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <FaUser className="text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-white">{post.authorName}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
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
                  {post.visibility === 'public' ? 'Public' : 'Private'}
                </span>
              </div>
            </div>
          </div>

          {/* Post Actions - Only show for post owner */}
          {post.authorId === userProfile.uid && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => deletePost(post.id)}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all duration-200"
                title="Delete post"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Post Content */}
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
          <div className="text-gray-300 mb-4 whitespace-pre-wrap">
            {isExpanded ? post.content : post.content.length > 300 ? `${post.content.substring(0, 300)}...` : post.content}
          </div>

          {post.content.length > 300 && (
            <button
              onClick={() => setExpandedPost(isExpanded ? null : post.id)}
              className="text-purple-400 hover:text-purple-300 text-sm mb-4"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Actions */}
          <div className="flex items-center gap-4 text-gray-400">
            <button
              onClick={() => toggleLike(post.id)}
              className="flex items-center gap-1 hover:text-purple-400 transition-colors"
            >
              {isLiked ? <FaHeart className="text-pink-500" /> : <FaRegHeart />}
              <span>{post.likes.length}</span>
            </button>
            <button
              onClick={() => toggleComments(post.id)}
              className="flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <FaComment />
              <span>{post.comments ? post.comments.length : 0}</span>
            </button>
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
      </div>
    );
  };

  return (
    <div className="h-full bg-black text-white p-6 flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
            Zentro Network
          </h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEditor(!showEditor)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
            >
              <FaEdit />
              <span>{showEditor ? 'View Posts' : 'Create Post'}</span>
            </button>
          </div>
        </div>

        {showEditor ? (
          <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
            <BlogEditor onPostCreated={handlePostCreated} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg sticky top-6">
                <h2 className="text-xl font-bold text-white mb-6">Blog Views</h2>

                <div className="space-y-3">
                  <button
                    onClick={() => setActiveView('public')}
                    className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeView === 'public'
                        ? 'bg-purple-900/50 border border-purple-500 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <FaGlobe className={activeView === 'public' ? 'text-green-400' : 'text-gray-400'} />
                    <span>Public Feed</span>
                  </button>

                  <button
                    onClick={() => setActiveView('private')}
                    className={`w-full flex items-center gap-2 p-3 rounded-lg transition-colors ${
                      activeView === 'private'
                        ? 'bg-purple-900/50 border border-purple-500 text-white'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                  >
                    <FaLock className={activeView === 'private' ? 'text-yellow-400' : 'text-gray-400'} />
                    <span>My Posts</span>
                  </button>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4">About Blog</h3>
                  <p className="text-gray-300 text-sm">
                    Share your thoughts, ideas, and experiences with the Zentro community.
                    Create public posts for everyone to see or private posts just for yourself.
                  </p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-gray-300 text-sm">Public posts are visible to everyone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-gray-300 text-sm">Private posts are only visible to you</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={() => setShowEditor(true)}
                      className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <span>Create New Post</span>
                    </button>
                    <p className="text-gray-400 text-xs mt-2 text-center">
                      Use our integrated research engine to find information without leaving the app!
                    </p>
                  </div>


                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-2xl font-bold text-white mb-6">
                  {activeView === 'public' ? 'Public Blog Feed' : 'My Blog Posts'}
                </h2>

                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                  </div>
                ) : blogPosts.length === 0 ? (
                  <div className="bg-gray-800 rounded-xl p-8 text-center flex flex-col justify-center items-center h-full">
                    <FaGlobe className="text-5xl text-gray-500 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {activeView === 'public'
                        ? 'No Public Posts Yet'
                        : 'No Personal Posts Yet'}
                    </h3>
                    <p className="text-gray-400 mb-6">
                      {activeView === 'public'
                        ? 'Be the first to share something with the Zentro Network!'
                        : 'Looks like you haven\'t created any posts. Why not start now?'}
                    </p>
                    {activeView === 'private' && (
                      <button
                        onClick={() => setShowEditor(true)}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                      >
                        Create Your First Post
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {blogPosts.map(post => renderBlogPost(post))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogSection;
