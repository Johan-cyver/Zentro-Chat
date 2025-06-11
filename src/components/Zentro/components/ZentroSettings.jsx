import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaUser, FaShieldAlt, FaBell, FaPalette, FaLock } from 'react-icons/fa';

const ZentroSettings = ({ user, theme, onUserUpdate }) => {
  const [activeSection, setActiveSection] = useState('profile');

  const sections = [
    { key: 'profile', label: 'Profile', icon: FaUser },
    { key: 'privacy', label: 'Privacy', icon: FaShieldAlt },
    { key: 'notifications', label: 'Notifications', icon: FaBell },
    { key: 'appearance', label: 'Appearance', icon: FaPalette },
    { key: 'security', label: 'Security', icon: FaLock }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold flex items-center justify-center">
          <FaCog className="mr-3 text-gray-400" />
          Zentro Settings
        </h1>
        <p className="text-lg opacity-70">Customize your Zentro experience</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Settings</h3>
          <div className="space-y-2">
            {sections.map(section => {
              const SectionIcon = section.icon;
              return (
                <motion.button
                  key={section.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(section.key)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left ${
                    activeSection === section.key
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <SectionIcon />
                  <span>{section.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6">
          {activeSection === 'profile' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Profile Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Display Name</label>
                  <input
                    type="text"
                    defaultValue={user?.displayName}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Bio</label>
                  <textarea
                    defaultValue={user?.personal?.bio}
                    className="w-full h-32 p-3 bg-gray-700 text-white rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Location</label>
                  <input
                    type="text"
                    defaultValue={user?.personal?.location}
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Privacy Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">Profile Visibility</div>
                    <div className="text-sm text-gray-400">Who can see your profile</div>
                  </div>
                  <select className="px-4 py-2 bg-gray-700 text-white rounded-lg">
                    <option>Public</option>
                    <option>Zentro Users Only</option>
                    <option>Private</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">Secret Alley Rank Visibility</div>
                    <div className="text-sm text-gray-400">Show your Shadow rank to recruiters</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Notification Settings</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">Secret Alley Missions</div>
                    <div className="text-sm text-gray-400">New mission notifications</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold">Network Activity</div>
                    <div className="text-sm text-gray-400">Blog likes and comments</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Appearance Settings</h3>
              <div className="space-y-6">
                <div>
                  <div className="font-bold mb-3">Theme</div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-900 border-2 border-purple-500 rounded-lg p-4 text-center cursor-pointer">
                      <div className="w-full h-8 bg-gray-800 rounded mb-2"></div>
                      <div className="text-sm">Dark</div>
                    </div>
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer">
                      <div className="w-full h-8 bg-gray-200 rounded mb-2"></div>
                      <div className="text-sm text-gray-900">Light</div>
                    </div>
                    <div className="bg-blue-50 border-2 border-gray-300 rounded-lg p-4 text-center cursor-pointer">
                      <div className="w-full h-8 bg-blue-200 rounded mb-2"></div>
                      <div className="text-sm text-blue-900">Corporate</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div>
              <h3 className="text-2xl font-bold mb-6">Security Settings</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full p-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-700">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold"
            >
              Save Changes
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZentroSettings;
