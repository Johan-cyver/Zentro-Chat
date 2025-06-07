import React from 'react';
import { FaGlobe, FaUsers, FaLock } from 'react-icons/fa';

const ProfileField = ({ label, value, field, isEditMode, onChange, defaultVisibility, displayUser, isViewingOwnProfile, updateVisibility, canViewField, type = 'text', options = [] }) => {
  // Safely access visibility with fallbacks
  const fieldVisibility = displayUser ? (displayUser[`${field}Visibility`] || defaultVisibility[field] || 'public') : 'public';

  const renderVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public':
        return <FaGlobe className="text-green-400" title="Public" />;
      case 'friends':
        return <FaUsers className="text-blue-400" title="Friends Only" />;
      case 'private':
        return <FaLock className="text-red-400" title="Private" />;
      default:
        return <FaGlobe className="text-green-400" title="Public" />;
    }
  };

  return (
    <div className="relative group">
      <div className="flex justify-between items-center mb-1">
        <label className="text-gray-400 text-sm">{label}</label>
        {isViewingOwnProfile && (
          <div className="flex items-center gap-2">
            {renderVisibilityIcon(fieldVisibility)}
            <select
              value={fieldVisibility}
              onChange={(e) => updateVisibility(field, e.target.value)}
              className="text-xs bg-gray-800 border border-gray-700 rounded p-1 text-gray-300"
            >
              <option value="public">Public</option>
              <option value="friends">Friends Only</option>
              <option value="private">Private</option>
            </select>
          </div>
        )}
      </div>

      {canViewField(field) ? (
        isEditMode ? (
          type === 'select' ? (
            <select
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              {options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          )
        ) : (
          <p className="text-white">{value || 'Not specified'}</p>
        )
      ) : (
        <p className="text-gray-400 italic">This information is private</p>
      )}
    </div>
  );
};

export default ProfileField;
