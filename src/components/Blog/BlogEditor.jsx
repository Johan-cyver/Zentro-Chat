import React, { useState, useRef } from 'react';
import OllamaAIToggle from '../AI/OllamaAIToggle';
import BlogResearchEngine from './BlogResearchEngine';
import { useUser } from '../../contexts/UserContext';

const BlogEditor = ({ onPostCreated }) => {
  const { userProfile } = useUser();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const contentRef = useRef(null);

  // Handle AI response insertion
  const handleAIResponse = (aiText) => {
    // Get current cursor position
    const cursorPosition = contentRef.current?.selectionStart || content.length;

    // Insert AI text at cursor position
    const newContent =
      content.substring(0, cursorPosition) +
      aiText +
      content.substring(cursorPosition);

    setContent(newContent);

    // Set message
    setMessage({
      text: 'AI suggestion inserted!',
      type: 'success'
    });

    // Clear message after 3 seconds
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  // Save draft
  const saveDraft = async () => {
    setIsSaving(true);

    try {
      // Prepare blog data (for future backend integration)
      // const blogData = {
      //   title,
      //   content,
      //   tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      //   isPublic
      // };

      // Mock saving to backend
      await new Promise(resolve => setTimeout(resolve, 1000));

      setMessage({
        text: 'Draft saved successfully!',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: `Error saving draft: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsSaving(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  // Publish blog
  const publishBlogPost = async () => {
    // Validate
    if (!title.trim()) {
      setMessage({
        text: 'Please add a title before publishing',
        type: 'error'
      });
      return;
    }

    if (!content.trim()) {
      setMessage({
        text: 'Please add content before publishing',
        type: 'error'
      });
      return;
    }

    setIsPublishing(true);

    try {
      // Create new blog post
      const newPost = {
        id: Date.now().toString(), // Ensure ID is string for consistency
        title: title.trim(),
        content: content.trim(),
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        visibility: isPublic ? 'public' : 'private',
        authorId: userProfile.uid || 'anonymous',
        authorName: userProfile.displayName || 'Anonymous User',
        authorPhotoURL: userProfile.photoURL || null,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        views: 0
      };

      // Debug logging for blog editor
      console.log('=== BLOG EDITOR POST CREATION ===');
      console.log('User Profile:', userProfile);
      console.log('User ID:', userProfile.uid);
      console.log('User ID Type:', typeof userProfile.uid);
      console.log('New Post:', newPost);
      console.log('Post Author ID:', newPost.authorId);
      console.log('Post Visibility:', newPost.visibility);
      console.log('================================');

      // Get existing posts from localStorage
      const existingPosts = JSON.parse(localStorage.getItem('zentro_blog_posts') || '[]');

      // Add new post
      const updatedPosts = [newPost, ...existingPosts];

      // Save to localStorage
      localStorage.setItem('zentro_blog_posts', JSON.stringify(updatedPosts));

      // Debug logging
      console.log('=== BLOG POST CREATED ===');
      console.log('New post:', newPost);
      console.log('All posts after save:', updatedPosts);
      console.log('localStorage content:', localStorage.getItem('zentro_blog_posts'));
      console.log('========================');

      // Dispatch custom events to notify other components
      window.dispatchEvent(new CustomEvent('blogPostCreated', { detail: newPost }));
      window.dispatchEvent(new CustomEvent('refreshBlogPosts', { detail: newPost }));

      // Force a storage event for cross-component updates
      window.dispatchEvent(new CustomEvent('storage', {
        detail: {
          key: 'zentro_blog_posts',
          newValue: JSON.stringify(updatedPosts)
        }
      }));

      setMessage({
        text: 'Blog published successfully!',
        type: 'success'
      });

      // Reset form after successful publish
      setTitle('');
      setContent('');
      setTags('');
      setIsPublic(false); // Reset to private by default

      // Notify parent component if callback exists
      if (onPostCreated) {
        onPostCreated(newPost);
      }
    } catch (error) {
      setMessage({
        text: `Error publishing blog: ${error.message}`,
        type: 'error'
      });
    } finally {
      setIsPublishing(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage({ text: '', type: '' });
      }, 3000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Editor */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter blog title..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white text-xl font-bold placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300 mb-6"
          />

          {/* Content */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your blog content here..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
            rows="15"
          />

          {/* Tags */}
          <div className="mt-6">
            <label className="block text-gray-400 mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="tech, ai, web development..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-300"
            />
          </div>

          {/* Privacy Toggle - Compact Version */}
          <div className="mt-6 flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">🔒 Privacy:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                <span className={`ml-3 font-medium ${isPublic ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isPublic ? '🌍 Public' : '🔒 Private'}
                </span>
              </label>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {isPublic
                  ? 'Visible to everyone'
                  : 'Only visible to you'
                }
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-between items-center">
            {/* Quick Privacy Toggle */}
            <button
              onClick={() => setIsPublic(!isPublic)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isPublic
                  ? 'bg-green-900/30 text-green-400 border border-green-500/30 hover:bg-green-900/50'
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-900/50'
              }`}
            >
              {isPublic ? '🌍 Public' : '🔒 Private'}
              <span className="text-xs opacity-75">Click to toggle</span>
            </button>

            {/* Main Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={saveDraft}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors duration-300 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={publishBlogPost}
                disabled={isPublishing}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50 flex items-center gap-2 ${
                  isPublic
                    ? 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700'
                    : 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700'
                }`}
              >
                {isPublishing ? 'Publishing...' : `Publish ${isPublic ? 'Publicly' : 'Privately'}`}
                {isPublic ? '🌍' : '🔒'}
              </button>
            </div>
          </div>

          {/* Status Message */}
          {message.text && (
            <div className={`mt-4 p-3 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-900/20 border border-green-800 text-green-400'
                : 'bg-red-900/20 border border-red-800 text-red-400'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar with AI Tools */}
      <div className="lg:col-span-1">
        {/* Research Engine */}
        <BlogResearchEngine
          onInsertContent={handleAIResponse}
        />

        {/* General AI Toggle */}
        <OllamaAIToggle
          label="Blog Assistant"
          options={["Writing Help", "Rewriting", "Blog Structure", "SEO Tips"]}
          placeholder="What would you like help with?"
          onAIResponse={handleAIResponse}
        />

        {/* Preview Section */}
        <div className="mt-6 bg-gray-900 border border-purple-500/30 rounded-xl p-4 shadow-lg">
          <h3 className="text-xl font-semibold text-purple-400 mb-4">Preview</h3>

          <div className="bg-gray-800/50 rounded-lg p-4">
            {/* Privacy Badge */}
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isPublic
                  ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                  : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
              }`}>
                {isPublic ? '🌍 Public' : '🔒 Private'}
              </span>
            </div>

            {title ? (
              <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
            ) : (
              <p className="text-gray-500 italic mb-2">No title yet</p>
            )}

            <div className="prose prose-invert max-w-none">
              {content ? (
                <p className="text-gray-300">{content.length > 150 ? content.substring(0, 150) + '...' : content}</p>
              ) : (
                <p className="text-gray-500 italic">No content yet</p>
              )}
            </div>

            {tags && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.split(',').map((tag, index) => (
                  tag.trim() && (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                    >
                      #{tag.trim()}
                    </span>
                  )
                ))}
              </div>
            )}

            {/* Privacy Info in Preview */}
            <div className="mt-4 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400">
                {isPublic
                  ? '👥 This post will be visible to everyone'
                  : '👤 This post will only be visible to you'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
