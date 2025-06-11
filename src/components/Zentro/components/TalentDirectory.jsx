import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCompass, FaUsers, FaStar, FaCode, FaSearch, FaFilter } from 'react-icons/fa';

const TalentDirectory = ({ user, theme, zentroScore }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const mockProfiles = [
    {
      id: 1,
      name: 'Shadow Architect',
      username: 'shadow_arch',
      title: 'Full-Stack Developer',
      skills: ['React', 'Node.js', 'AI/ML'],
      zentroScore: 9.2,
      rank: 'Elite',
      verified: true,
      available: true
    },
    {
      id: 2,
      name: 'Cipher Master',
      username: 'cipher_x',
      title: 'Security Engineer',
      skills: ['Cybersecurity', 'Blockchain', 'Cryptography'],
      zentroScore: 8.8,
      rank: 'Expert',
      verified: true,
      available: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <FaCompass className="mr-3 text-purple-400" />
          Talent Directory
        </h1>
        <p className="text-lg opacity-70">Discover and connect with verified professionals</p>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, skills, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
          className="px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Professionals</option>
          <option value="available">Available</option>
          <option value="elite">Elite Rank</option>
          <option value="verified">Verified Only</option>
        </select>
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProfiles.map(profile => (
          <motion.div
            key={profile.id}
            whileHover={{ scale: 1.02 }}
            className="bg-gray-800 border border-gray-700 rounded-lg p-6"
          >
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
                {profile.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold">{profile.name}</h3>
              <p className="text-gray-400">@{profile.username}</p>
              <p className="text-purple-400">{profile.title}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Zentro Score:</span>
                <span className="text-yellow-400 font-bold">{profile.zentroScore}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Rank:</span>
                <span className={`px-2 py-1 rounded text-sm ${
                  profile.rank === 'Elite' ? 'bg-purple-600 text-white' :
                  profile.rank === 'Expert' ? 'bg-blue-600 text-white' :
                  'bg-green-600 text-white'
                }`}>
                  {profile.rank}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className={profile.available ? 'text-green-400' : 'text-red-400'}>
                  {profile.available ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-sm font-bold mb-2">Skills:</div>
              <div className="flex flex-wrap gap-1">
                {profile.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg font-bold"
            >
              View Profile
            </motion.button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TalentDirectory;
