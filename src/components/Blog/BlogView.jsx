import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaLock, FaGlobe, FaUser, FaCalendarAlt } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const BlogView = ({ userOnly = false }) => {
  const { userProfile } = useUser();
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Load blog posts from localStorage
  useEffect(() => {
    const loadBlogPosts = () => {
      setLoading(true);
      
      try {
        const savedPosts = localStorage.getItem('zentro_blog_posts');
        let posts = savedPosts ? JSON.parse(savedPosts) : [];
        
        // Filter posts based on userOnly flag
        if (userOnly) {
          // Show only the current user's posts
          posts = posts.filter(post => post.authorId === userProfile.uid);
        } else {
          // Show all public posts and the user's private posts
          posts = posts.filter(post => 
            post.visibility === 'public' || 
            (post.visibility === 'private' && post.authorId === userProfile.uid)
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
    
    loadBlogPosts();
  }, [userProfile.uid, userOnly]);
  
  // Filter posts
  const getFilteredPosts = () => {
    if (activeFilter === 'all') {
      return blogPosts;
    } else if (activeFilter === 'public') {
      return blogPosts.filter(post => post.visibility === 'public');
    } else if (activeFilter === 'private') {
      return blogPosts.filter(post => post.visibility === 'private');
    }
    return blogPosts;
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">
          {userOnly ? 'My Blog Posts' : 'Blog Feed'}
        </h2>
        
        {/* Filters */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter('public')}
            className={`px-3 py-1 rounded-full text-sm ${
              activeFilter === 'public'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Public
          </button>
          {userOnly && (
            <button
              onClick={() => setActiveFilter('private')}
              className={`px-3 py-1 rounded-full text-sm ${
                activeFilter === 'private'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Private
            </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : getFilteredPosts().length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-6 text-center">
          <p className="text-gray-400">No blog posts found.</p>
          {userOnly && (
            <button
              onClick={() => window.location.href = '/profile'}
              className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
            >
              Create a Post
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {getFilteredPosts().map(post => (
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
              </div>
              
              {/* Post Content */}
              <div className="p-4">
                <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>
                <div className="text-gray-300 mb-4 whitespace-pre-wrap">
                  {post.content}
                </div>
                
                {/* Post Actions */}
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-6">
                    <button
                      onClick={() => toggleLike(post.id)}
                      className="flex items-center gap-1 text-gray-400 hover:text-pink-400 transition-colors"
                    >
                      {post.likes.includes(userProfile.uid) ? (
                        <FaHeart className="text-pink-500" />
                      ) : (
                        <FaRegHeart />
                      )}
                      <span>{post.likes.length}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                      <FaComment />
                      <span>{post.comments.length}</span>
                    </button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-green-400 transition-colors">
                      <FaShare />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogView;
