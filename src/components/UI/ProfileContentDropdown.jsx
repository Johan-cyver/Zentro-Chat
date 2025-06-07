import React, { useState, useEffect } from 'react';
import { FaImage, FaVideo, FaEdit, FaCode, FaEye, FaComment, FaHeart, FaCalendarAlt } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const ProfileContentDropdown = ({ onContentSelect, onClose }) => {
  const { userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('photos');
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [products, setProducts] = useState([]);

  // Load content from localStorage (user-specific)
  useEffect(() => {
    if (!userProfile?.uid) return;

    // Load photos
    const savedPhotos = localStorage.getItem(`zentro_photos_${userProfile.uid}`);
    if (savedPhotos) {
      setPhotos(JSON.parse(savedPhotos));
    }

    // Load videos
    const savedVideos = localStorage.getItem(`zentro_videos_${userProfile.uid}`);
    if (savedVideos) {
      setVideos(JSON.parse(savedVideos));
    }

    // Load blog posts
    const savedPosts = localStorage.getItem('zentro_blog_posts');
    if (savedPosts) {
      const allPosts = JSON.parse(savedPosts);
      const userPosts = allPosts.filter(post => post.authorId === userProfile.uid);
      setBlogPosts(userPosts);
    }

    // Load professional products (mock data for now)
    setProducts([
      {
        id: 1,
        name: 'DevFlow',
        description: 'A developer productivity tool that streamlines workflow and increases efficiency.',
        thumbnail: null,
        techStack: ['React', 'Node.js', 'MongoDB'],
        stats: { users: '5,000+', mrr: '$12,000' }
      },
      {
        id: 2,
        name: 'DesignMate',
        description: 'AI-powered design assistant for creating beautiful UI components.',
        thumbnail: null,
        techStack: ['Vue.js', 'Python', 'TensorFlow'],
        stats: { users: '3,200+', mrr: '$8,500' }
      }
    ]);
  }, [userProfile.uid]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleContentClick = (content, type) => {
    onContentSelect({ content, type });
    onClose();
  };

  const renderPhotos = () => (
    <div className="grid grid-cols-2 gap-3">
      {photos.length === 0 ? (
        <div className="col-span-2 text-center text-gray-400 py-8">
          <FaImage className="mx-auto text-3xl mb-2" />
          <p>No photos available</p>
        </div>
      ) : (
        photos.map(photo => (
          <div
            key={photo.id}
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-purple-500/50"
            onClick={() => handleContentClick(photo, 'photo')}
          >
            <img
              src={photo.url}
              alt={photo.caption}
              className="w-full h-24 object-cover"
            />
            <div className="p-2">
              <p className="text-white text-xs font-medium truncate">{photo.caption}</p>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FaHeart className="h-2 w-2" />
                  {photo.likes}
                </span>
                <span className="flex items-center gap-1">
                  <FaComment className="h-2 w-2" />
                  {photo.comments?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderVideos = () => (
    <div className="grid grid-cols-2 gap-3">
      {videos.length === 0 ? (
        <div className="col-span-2 text-center text-gray-400 py-8">
          <FaVideo className="mx-auto text-3xl mb-2" />
          <p>No videos available</p>
        </div>
      ) : (
        videos.map(video => (
          <div
            key={video.id}
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-purple-500/50"
            onClick={() => handleContentClick(video, 'video')}
          >
            <div className="relative">
              <video
                src={video.url}
                className="w-full h-24 object-cover"
                muted
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <FaVideo className="text-white text-xl" />
              </div>
            </div>
            <div className="p-2">
              <p className="text-white text-xs font-medium truncate">{video.caption}</p>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <FaHeart className="h-2 w-2" />
                  {video.likes}
                </span>
                <span className="flex items-center gap-1">
                  <FaComment className="h-2 w-2" />
                  {video.comments?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderBlogPosts = () => (
    <div className="space-y-3">
      {blogPosts.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <FaEdit className="mx-auto text-3xl mb-2" />
          <p>No blog posts available</p>
        </div>
      ) : (
        blogPosts.map(post => (
          <div
            key={post.id}
            className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-purple-500/50"
            onClick={() => handleContentClick(post, 'blog')}
          >
            <h4 className="text-white font-medium text-sm truncate">{post.title}</h4>
            <p className="text-gray-400 text-xs mt-1 line-clamp-2">
              {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
            </p>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <FaCalendarAlt className="h-2 w-2" />
                {formatDate(post.createdAt)}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FaHeart className="h-2 w-2" />
                  {post.likes?.length || 0}
                </span>
                <span className="flex items-center gap-1">
                  <FaComment className="h-2 w-2" />
                  {post.comments?.length || 0}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-3">
      {products.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <FaCode className="mx-auto text-3xl mb-2" />
          <p>No products available</p>
        </div>
      ) : (
        products.map(product => (
          <div
            key={product.id}
            className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-all duration-300 border border-gray-700 hover:border-purple-500/50"
            onClick={() => handleContentClick(product, 'product')}
          >
            <div className="flex gap-3">
              <img
                src={product.thumbnail}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="text-white font-medium text-sm">{product.name}</h4>
                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{product.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {product.techStack.slice(0, 2).map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                      {tech}
                    </span>
                  ))}
                  {product.techStack.length > 2 && (
                    <span className="text-gray-400 text-xs">+{product.techStack.length - 2}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="absolute bottom-16 right-4 bg-gray-900 rounded-xl border border-purple-500/30 shadow-2xl z-20 w-80 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Profile Content</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          <TabButton
            active={activeTab === 'photos'}
            onClick={() => setActiveTab('photos')}
            icon={<FaImage />}
            label="Photos"
            count={photos.length}
          />
          <TabButton
            active={activeTab === 'videos'}
            onClick={() => setActiveTab('videos')}
            icon={<FaVideo />}
            label="Videos"
            count={videos.length}
          />
          <TabButton
            active={activeTab === 'blogs'}
            onClick={() => setActiveTab('blogs')}
            icon={<FaEdit />}
            label="Blogs"
            count={blogPosts.length}
          />
          <TabButton
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            icon={<FaCode />}
            label="Products"
            count={products.length}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-64">
        {activeTab === 'photos' && renderPhotos()}
        {activeTab === 'videos' && renderVideos()}
        {activeTab === 'blogs' && renderBlogPosts()}
        {activeTab === 'products' && renderProducts()}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-300 ${
      active
        ? 'bg-purple-600 text-white'
        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
    }`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
    <span className="text-xs opacity-70">({count})</span>
  </button>
);

export default ProfileContentDropdown;
