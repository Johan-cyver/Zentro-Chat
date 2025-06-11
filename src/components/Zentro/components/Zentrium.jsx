import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaStore, FaRocket, FaDownload, FaStar, FaCode, FaSearch } from 'react-icons/fa';

const Zentrium = ({ user, theme, userLevel }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const mockApps = [
    {
      id: 1,
      name: 'Shadow Terminal Pro',
      developer: 'Shadow Architect',
      description: 'Advanced terminal interface with AI assistance',
      category: 'Developer Tools',
      rating: 4.8,
      downloads: 1247,
      price: 'Free',
      featured: true,
      builtInSecretAlley: true
    },
    {
      id: 2,
      name: 'Cipher Vault',
      developer: 'Cipher Master',
      description: 'Secure password manager with blockchain encryption',
      category: 'Security',
      rating: 4.9,
      downloads: 892,
      price: '$9.99',
      featured: false,
      builtInSecretAlley: true
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <FaStore className="mr-3 text-cyan-400" />
          Zentrium Marketplace
        </h1>
        <p className="text-lg opacity-70">Apps built by the community, for the community</p>
      </div>

      {/* Categories */}
      <div className="flex space-x-2 mb-8 overflow-x-auto">
        {['all', 'featured', 'developer-tools', 'security', 'ai', 'blockchain'].map(category => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </motion.button>
        ))}
      </div>

      {/* App Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockApps.map(app => (
          <motion.div
            key={app.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl font-bold text-white">
                {app.name.charAt(0)}
              </div>
              {app.featured && (
                <span className="bg-yellow-600 text-white px-2 py-1 rounded text-xs font-bold">
                  Featured
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold mb-2">{app.name}</h3>
            <p className="text-gray-400 text-sm mb-2">by {app.developer}</p>
            <p className="text-gray-300 mb-4">{app.description}</p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span>Category:</span>
                <span className="text-cyan-400">{app.category}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Rating:</span>
                <div className="flex items-center space-x-1">
                  <FaStar className="text-yellow-400" />
                  <span>{app.rating}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Downloads:</span>
                <span>{app.downloads.toLocaleString()}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Price:</span>
                <span className="font-bold text-green-400">{app.price}</span>
              </div>
            </div>

            {app.builtInSecretAlley && (
              <div className="bg-red-900/20 border border-red-500 rounded p-2 mb-4">
                <p className="text-red-400 text-xs">🕳️ Built in Secret Alley</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-cyan-600 text-white py-2 rounded-lg font-bold flex items-center justify-center space-x-2"
            >
              <FaDownload />
              <span>{app.price === 'Free' ? 'Install' : 'Purchase'}</span>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Upload Section */}
      {userLevel >= 5 && (
        <div className="mt-12 bg-gray-800 border border-purple-500 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-purple-400 mb-4">Ready to Deploy?</h3>
          <p className="text-gray-300 mb-6">
            You've unlocked Zentrium upload access! Deploy your Secret Alley projects to the marketplace.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold flex items-center space-x-2 mx-auto"
          >
            <FaRocket />
            <span>Deploy New App</span>
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Zentrium;
