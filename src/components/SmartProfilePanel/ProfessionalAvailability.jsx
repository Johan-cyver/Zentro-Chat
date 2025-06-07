import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase, FaHandshake, FaNetworkWired, FaCalendarAlt, FaToggleOn, FaToggleOff, FaClock, FaMapMarkerAlt, FaDollarSign, FaLightbulb } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

/**
 * ProfessionalAvailability - Manage professional availability and networking preferences
 *
 * Features:
 * - Open to work toggle
 * - Freelance availability
 * - Networking preferences
 * - Availability calendar
 * - Work preferences
 */
const ProfessionalAvailability = () => {
  const { userProfile, updateAvailability, updateProfessionalProfile } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [preferences, setPreferences] = useState({
    workType: userProfile.professional?.workType || 'full-time',
    remote: userProfile.professional?.remote || 'hybrid',
    salaryRange: userProfile.professional?.salaryRange || '',
    location: userProfile.professional?.preferredLocation || '',
    startDate: userProfile.professional?.startDate || ''
  });

  const availability = userProfile.professional?.availability || {
    openToWork: false,
    freelance: false,
    networking: true,
    calendar: null
  };

  const handleToggle = (key) => {
    updateAvailability({ [key]: !availability[key] });
  };

  const handleSavePreferences = () => {
    updateProfessionalProfile(preferences);
    setIsEditing(false);
  };

  const workTypes = [
    { value: 'full-time', label: 'Full-time', icon: FaBriefcase },
    { value: 'part-time', label: 'Part-time', icon: FaClock },
    { value: 'contract', label: 'Contract', icon: FaHandshake },
    { value: 'internship', label: 'Internship', icon: FaLightbulb }
  ];

  const remoteOptions = [
    { value: 'remote', label: 'Remote Only' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site Only' }
  ];

  const salaryRanges = [
    '$30k - $50k',
    '$50k - $70k',
    '$70k - $100k',
    '$100k - $150k',
    '$150k+'
  ];

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Professional Availability</h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-3 py-1 text-sm bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors duration-200"
        >
          {isEditing ? 'Cancel' : 'Edit Preferences'}
        </button>
      </div>

      {/* Availability Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Open to Work */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaBriefcase className="text-green-400" />
              <span className="text-white font-medium">Open to Work</span>
            </div>
            <button
              onClick={() => handleToggle('openToWork')}
              className={`transition-colors duration-200 ${
                availability.openToWork ? 'text-green-400' : 'text-gray-500'
              }`}
            >
              {availability.openToWork ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            {availability.openToWork
              ? 'Visible to recruiters and hiring managers'
              : 'Not actively looking for opportunities'
            }
          </p>
        </div>

        {/* Freelance */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaHandshake className="text-blue-400" />
              <span className="text-white font-medium">Freelance</span>
            </div>
            <button
              onClick={() => handleToggle('freelance')}
              className={`transition-colors duration-200 ${
                availability.freelance ? 'text-blue-400' : 'text-gray-500'
              }`}
            >
              {availability.freelance ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            {availability.freelance
              ? 'Available for freelance projects'
              : 'Not taking freelance work'
            }
          </p>
        </div>

        {/* Networking */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FaNetworkWired className="text-purple-400" />
              <span className="text-white font-medium">Networking</span>
            </div>
            <button
              onClick={() => handleToggle('networking')}
              className={`transition-colors duration-200 ${
                availability.networking ? 'text-purple-400' : 'text-gray-500'
              }`}
            >
              {availability.networking ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            {availability.networking
              ? 'Open to professional connections'
              : 'Not actively networking'
            }
          </p>
        </div>
      </div>

      {/* Work Preferences */}
      {(availability.openToWork || availability.freelance) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-700 pt-6"
        >
          <h4 className="text-white font-medium mb-4">Work Preferences</h4>

          {isEditing ? (
            <div className="space-y-4">
              {/* Work Type */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Work Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {workTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setPreferences(prev => ({ ...prev, workType: type.value }))}
                        className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 text-sm ${
                          preferences.workType === type.value
                            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                            : 'border-gray-600 hover:border-gray-500 text-gray-300'
                        }`}
                      >
                        <Icon className="text-xs" />
                        <span>{type.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Remote Preference */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Remote Work</label>
                <div className="grid grid-cols-3 gap-2">
                  {remoteOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPreferences(prev => ({ ...prev, remote: option.value }))}
                      className={`p-2 rounded-lg border transition-all duration-200 text-sm ${
                        preferences.remote === option.value
                          ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Range */}
              <div>
                <label className="block text-gray-400 text-sm mb-2">Salary Range</label>
                <select
                  value={preferences.salaryRange}
                  onChange={(e) => setPreferences(prev => ({ ...prev, salaryRange: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                >
                  <option value="">Select range...</option>
                  {salaryRanges.map((range) => (
                    <option key={range} value={range}>{range}</option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Preferred Location</label>
                  <input
                    type="text"
                    value={preferences.location}
                    onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="City, State/Country"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Available Start Date</label>
                  <input
                    type="date"
                    value={preferences.startDate}
                    onChange={(e) => setPreferences(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="flex gap-2">
                <button
                  onClick={handleSavePreferences}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 text-sm"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Preferences Display */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-300">
                  <FaBriefcase className="text-purple-400 text-sm" />
                  <span className="text-sm">
                    {workTypes.find(t => t.value === preferences.workType)?.label || 'Not specified'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-300">
                  <FaMapMarkerAlt className="text-blue-400 text-sm" />
                  <span className="text-sm">
                    {remoteOptions.find(r => r.value === preferences.remote)?.label || 'Not specified'}
                  </span>
                </div>

                {preferences.salaryRange && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaDollarSign className="text-green-400 text-sm" />
                    <span className="text-sm">{preferences.salaryRange}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {preferences.location && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaMapMarkerAlt className="text-yellow-400 text-sm" />
                    <span className="text-sm">{preferences.location}</span>
                  </div>
                )}

                {preferences.startDate && (
                  <div className="flex items-center gap-2 text-gray-300">
                    <FaCalendarAlt className="text-pink-400 text-sm" />
                    <span className="text-sm">
                      Available from {new Date(preferences.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Professional Status */}
      <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
        <h4 className="text-white font-medium mb-2">Current Status</h4>
        <div className="flex flex-wrap gap-2">
          {availability.openToWork && (
            <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs border border-green-600/30">
              🟢 Open to Work
            </span>
          )}
          {availability.freelance && (
            <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs border border-blue-600/30">
              💼 Available for Freelance
            </span>
          )}
          {availability.networking && (
            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs border border-purple-600/30">
              🤝 Open to Networking
            </span>
          )}
          {!availability.openToWork && !availability.freelance && !availability.networking && (
            <span className="px-3 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs border border-gray-600/30">
              😴 Not Currently Available
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessionalAvailability;
