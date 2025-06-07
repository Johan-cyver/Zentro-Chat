import React, { useState } from 'react';
import { FaArrowLeft, FaEdit } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import BlogView from './BlogView';
import BlogEditor from './BlogEditor';

const BlogPage = () => {
  const [showEditor, setShowEditor] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/apphub')}
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-white">Zentro Network</h1>
        </div>

        <button
          onClick={() => setShowEditor(!showEditor)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
        >
          <FaEdit />
          <span>{showEditor ? 'View Posts' : 'Create Post'}</span>
        </button>
      </div>

      {showEditor ? (
        <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
          <BlogEditor onPostCreated={() => setShowEditor(false)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
              <BlogView />
            </div>
          </div>

          <div>
            <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-white mb-4">My Posts</h2>
              <BlogView userOnly={true} />
            </div>

            <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-white mb-4">About Blog</h2>
              <p className="text-gray-300">
                Share your thoughts, ideas, and experiences with the Zentro community.
                Create public posts for everyone to see or private posts just for yourself.
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                  <span className="text-gray-300">Public posts are visible to everyone</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <span className="text-gray-300">Private posts are only visible to you</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
