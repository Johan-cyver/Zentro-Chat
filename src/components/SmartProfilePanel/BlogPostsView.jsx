import React, { useState, useEffect } from 'react';
import { FaEdit, FaGlobe, FaLock, FaCalendarAlt, FaHeart, FaRegHeart, FaComment, FaEye, FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaUser } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const BlogPostsView = () => {
  const { userProfile } = useUser();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'public', 'private'
  const [showLikesFor, setShowLikesFor] = useState(null);
  const [showCommentsFor, setShowCommentsFor] = useState(null);

  // Load user's blog posts
  useEffect(() => {
    loadUserBlogPosts();
  }, [userProfile.uid, filter]);

  // Listen for new blog posts and storage changes
  useEffect(() => {
    const handleBlogPostCreated = () => {
      console.log('BlogPostsView: Blog post created event received');
      loadUserBlogPosts();
    };

    const handleStorageChange = () => {
      console.log('BlogPostsView: Storage change detected');
      loadUserBlogPosts();
    };

    window.addEventListener('blogPostCreated', handleBlogPostCreated);
    window.addEventListener('storage', handleStorageChange);

    // Also listen for a custom refresh event
    window.addEventListener('refreshBlogPosts', handleBlogPostCreated);

    return () => {
      window.removeEventListener('blogPostCreated', handleBlogPostCreated);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refreshBlogPosts', handleBlogPostCreated);
    };
  }, []);

  const loadUserBlogPosts = () => {
    setLoading(true);
    try {
      const savedPosts = localStorage.getItem('zentro_blog_posts');
      let posts = savedPosts ? JSON.parse(savedPosts) : [];

      console.log('=== SMART PROFILE BLOG POSTS DEBUG ===');
      console.log('Raw posts from localStorage:', posts);
      console.log('Current user ID:', userProfile.uid);
      console.log('Filter:', filter);

      // Filter to show only current user's posts
      posts = posts.filter(post => post.authorId === userProfile.uid);
      console.log('Posts after user filter:', posts);

      // Apply visibility filter
      if (filter === 'public') {
        posts = posts.filter(post => post.visibility === 'public');
        console.log('Posts after public filter:', posts);
      } else if (filter === 'private') {
        posts = posts.filter(post => post.visibility === 'private');
        console.log('Posts after private filter:', posts);
      }

      // Sort by date (newest first)
      posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      console.log('Final posts for Smart Profile:', posts);
      console.log('======================================');

      setBlogPosts(posts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
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

  // Toggle like on a post
  const toggleLike = (postId) => {
    const updatedPosts = blogPosts.map(post => {
      if (post.id === postId) {
        const isLiked = post.likes.includes(userProfile.uid);
        let updatedLikes;

        if (isLiked) {
          updatedLikes = post.likes.filter(id => id !== userProfile.uid);
        } else {
          updatedLikes = [...post.likes, userProfile.uid];
        }

        return { ...post, likes: updatedLikes };
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

  // Get user details for likes (mock function - in real app would fetch from user database)
  const getUserDetails = (userId) => {
    // For now, return mock data or current user if it's them
    if (userId === userProfile.uid) {
      return {
        id: userId,
        name: userProfile.displayName || 'You',
        photoURL: userProfile.photoURL
      };
    }

    // Mock other users - in real app, you'd fetch from user database
    return {
      id: userId,
      name: `User ${userId.slice(-4)}`,
      photoURL: null
    };
  };

  // Toggle likes details view
  const toggleLikesView = (postId) => {
    setShowLikesFor(showLikesFor === postId ? null : postId);
    setShowCommentsFor(null); // Close comments if open
  };

  // Toggle comments details view
  const toggleCommentsView = (postId) => {
    setShowCommentsFor(showCommentsFor === postId ? null : postId);
    setShowLikesFor(null); // Close likes if open
  };

  // Delete a blog post
  const deletePost = (postId) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      // Get existing posts from localStorage
      const existingPosts = JSON.parse(localStorage.getItem('zentro_blog_posts') || '[]');

      // Remove the post
      const updatedPosts = existingPosts.filter(post => post.id !== postId);

      // Save back to localStorage
      localStorage.setItem('zentro_blog_posts', JSON.stringify(updatedPosts));

      console.log('Post deleted from Smart Profile:', postId);

      // Dispatch events to notify other components
      window.dispatchEvent(new CustomEvent('blogPostDeleted', { detail: { postId } }));
      window.dispatchEvent(new CustomEvent('refreshBlogPosts'));

      // Reload posts
      loadUserBlogPosts();

    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaEdit className="text-purple-400" />
          My Blog Posts
        </h3>

        <div className="flex items-center gap-3">
          {/* Create Post Button */}
          <button
            onClick={() => {
              // Navigate to blog section
              // First dispatch event to switch to blog view
              window.dispatchEvent(new CustomEvent('switchToBlogView'));

              // Then show a message
              alert('Switching to Blog section to create a new post!');
            }}
            className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
            title="Create new blog post"
          >
            <FaPlus className="h-3 w-3" />
            <span>New Post</span>
          </button>

          {/* Filter buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All ({blogPosts.length})
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'public'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === 'private'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Private
            </button>
          </div>
        </div>
      </div>

      {/* Blog posts */}
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700">
          <FaEdit className="mx-auto text-4xl text-gray-500 mb-4" />
          <p className="text-gray-400 mb-4">
            {filter === 'all'
              ? "You haven't created any blog posts yet."
              : `No ${filter} blog posts found.`
            }
          </p>
          <p className="text-sm text-gray-500">
            Go to the Blog section to create your first post!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {blogPosts.map(post => {
            const isExpanded = expandedPost === post.id;
            const isLiked = post.likes.includes(userProfile.uid);

            return (
              <div key={post.id} className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500/30 transition-all duration-300 shadow-lg">
                {/* Post Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <div className="flex items-center gap-3">
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

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <FaEye className="h-3 w-3" />
                      {post.views || 0} views
                    </span>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-all duration-200"
                      title="Delete post"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Post Content */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-white mb-2">{post.title}</h3>
                  <div className="text-gray-300 mb-4 whitespace-pre-wrap">
                    {isExpanded ? post.content : post.content.length > 200 ? `${post.content.substring(0, 200)}...` : post.content}
                  </div>

                  {post.content.length > 200 && (
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
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="flex items-center gap-4 text-gray-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                      >
                        {isLiked ? <FaHeart className="text-pink-500" /> : <FaRegHeart />}
                      </button>
                      <button
                        onClick={() => toggleLikesView(post.id)}
                        className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                      >
                        <span>{post.likes.length}</span>
                        {post.likes.length > 0 && (
                          <span className="text-xs">
                            {showLikesFor === post.id ? <FaChevronUp /> : <FaChevronDown />}
                          </span>
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => toggleCommentsView(post.id)}
                      className="flex items-center gap-1 hover:text-purple-400 transition-colors"
                    >
                      <FaComment />
                      <span>{post.comments ? post.comments.length : 0}</span>
                      {post.comments && post.comments.length > 0 && (
                        <span className="text-xs">
                          {showCommentsFor === post.id ? <FaChevronUp /> : <FaChevronDown />}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Likes Details */}
                  {showLikesFor === post.id && post.likes.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                        <FaHeart className="text-pink-500" />
                        Liked by {post.likes.length} {post.likes.length === 1 ? 'person' : 'people'}
                      </h4>
                      <div className="space-y-2">
                        {post.likes.map(userId => {
                          const user = getUserDetails(userId);
                          return (
                            <div key={userId} className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                                {user.photoURL ? (
                                  <img src={user.photoURL} alt={user.name} className="w-6 h-6 rounded-full" />
                                ) : (
                                  <FaUser className="text-xs text-white" />
                                )}
                              </div>
                              <span className="text-sm text-gray-300">{user.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Comments Details */}
                  {showCommentsFor === post.id && post.comments && post.comments.length > 0 && (
                    <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                        <FaComment className="text-blue-400" />
                        {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                      </h4>
                      <div className="space-y-3">
                        {post.comments.map(comment => {
                          const user = getUserDetails(comment.authorId);
                          return (
                            <div key={comment.id} className="flex gap-2">
                              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                                {user.photoURL ? (
                                  <img src={user.photoURL} alt={user.name} className="w-6 h-6 rounded-full" />
                                ) : (
                                  <FaUser className="text-xs text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium text-gray-300">{user.name}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-400">{comment.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BlogPostsView;
