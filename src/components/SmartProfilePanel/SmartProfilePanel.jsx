import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaBriefcase, FaEye, FaChevronDown, FaLock, FaCalendarAlt } from 'react-icons/fa';
import PersonalView from './PersonalView';
import ProfessionalView from './ProfessionalView';
import { useUser } from '../../contexts/UserContext';
import { getProfessionalRestrictionMessage } from '../../utils/ageUtils';

// Subtle View Toggle Component (LinkedIn-style) with Age Restrictions
function ViewToggle({ currentView, onViewChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const { canAccessProfessionalView, getUserAge, isUnder21, userProfile } = useUser();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-800/60 hover:bg-gray-700/60 rounded-lg border border-gray-600/30 transition-all duration-200 text-sm"
        title="Switch view"
      >
        <FaEye className="text-gray-400 text-xs" />
        <span className="text-gray-300">
          {currentView === 'personal' ? 'Personal' : 'Professional'}
        </span>
        <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 w-48 bg-gray-800 border border-gray-600/30 rounded-lg shadow-lg z-50"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  onViewChange('personal');
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 flex items-center space-x-2 ${
                  currentView === 'personal'
                    ? 'bg-purple-600/20 text-purple-300'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <FaUser className="text-xs" />
                <span>Personal View</span>
              </button>

              {/* Professional View - Age Restricted */}
              {canAccessProfessionalView() ? (
                <button
                  onClick={() => {
                    onViewChange('professional');
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors duration-150 flex items-center space-x-2 ${
                    currentView === 'professional'
                      ? 'bg-purple-600/20 text-purple-300'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <FaBriefcase className="text-xs" />
                  <span>Professional View</span>
                </button>
              ) : (
                <div className="px-3 py-2 text-left text-sm text-gray-500 flex items-center space-x-2 cursor-not-allowed">
                  <FaLock className="text-xs" />
                  <div className="flex flex-col">
                    <span>Professional View</span>
                    <span className="text-xs text-gray-600">
                      {userProfile.birthDate
                        ? `Available at 21 (Age: ${getUserAge()})`
                        : 'Birth date required for access'
                      }
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * SmartProfilePanel - A futuristic, modular profile panel component
 *
 * Features:
 * - Subtle view toggle (LinkedIn-style) instead of prominent tabs
 * - Neon dark mode theme with glowing borders and transitions
 * - Fully responsive for desktop and mobile
 * - AI-powered features integrated in the blog editor
 * - Persistent view preference storage
 */
const SmartProfilePanel = () => {
  const { canAccessProfessionalView, userProfile } = useUser();
  const [activeTab, setActiveTab] = useState('personal'); // Always start with personal view

  // Check age restrictions and load saved preference
  useEffect(() => {
    const savedView = localStorage.getItem('zentro_profile_view') || 'personal';
    // Only allow professional view if user can access it
    if (savedView === 'professional' && canAccessProfessionalView()) {
      setActiveTab('professional');
    } else {
      setActiveTab('personal');
    }
  }, [canAccessProfessionalView, userProfile.age]);

  // Save view preference when it changes
  useEffect(() => {
    localStorage.setItem('zentro_profile_view', activeTab);
  }, [activeTab]);

  // Force redirect to personal view if user loses professional access
  useEffect(() => {
    if (activeTab === 'professional' && !canAccessProfessionalView()) {
      setActiveTab('personal');
    }
  }, [activeTab, canAccessProfessionalView]);

  // Handle view change with age restriction
  const handleViewChange = (newView) => {
    if (newView === 'professional' && !canAccessProfessionalView()) {
      // Don't allow switching to professional view if under 21
      return;
    }
    setActiveTab(newView);
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-gray-900 rounded-xl overflow-hidden shadow-2xl border border-purple-500/30">
      <div className="relative">
        {/* Glowing background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20 blur-xl"></div>

        {/* Main content */}
        <div className="relative z-10 p-6">
          {/* Header with title and subtle view toggle */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              Smart Profile
            </h1>

            {/* Subtle View Toggle */}
            <ViewToggle
              currentView={activeTab}
              onViewChange={handleViewChange}
            />
          </div>

          {/* Content with smooth transitions */}
          <div className="min-h-[600px]">
            <AnimatePresence mode="wait">
              {activeTab === 'personal' ? (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <PersonalView />
                </motion.div>
              ) : activeTab === 'professional' && canAccessProfessionalView() ? (
                <motion.div
                  key="professional"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <ProfessionalView />
                </motion.div>
              ) : (
                <motion.div
                  key="restricted"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center p-8 bg-gray-800/50 rounded-xl border border-gray-700">
                    <FaCalendarAlt className="text-4xl text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Professional View Restricted</h3>
                    <p className="text-gray-400 mb-4">
                      {getProfessionalRestrictionMessage(userProfile.birthDate) ||
                       'Please set your birth date in your profile to access professional features.'}
                    </p>
                    <button
                      onClick={() => setActiveTab('personal')}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                    >
                      Go to Personal View
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartProfilePanel;
