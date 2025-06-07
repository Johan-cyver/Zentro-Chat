import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaBook, FaTv, FaMusic, FaPlus, FaEdit, FaSave, FaTimes, FaTrash } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

/**
 * FavoritesSection - A component for users to manage their favorite things
 *
 * Features:
 * - Multiple categories (books, shows, music, people)
 * - Add/edit/remove favorites
 * - Smooth animations
 * - Persistent storage
 */
const FavoritesSection = ({ user = null, isViewingOwnProfile = true }) => {
  const { userProfile, updateFavorites } = useUser();
  const [editingCategory, setEditingCategory] = useState(null);
  const [newItem, setNewItem] = useState('');

  // Use the passed user prop if viewing someone else's profile, otherwise use current user
  const displayUser = user || userProfile;

  // Categories with emojis and labels
  const categories = [
    { key: 'books', label: '📚 Books', emoji: '📚', color: 'text-green-400' },
    { key: 'shows', label: '🎬 Shows & Movies', emoji: '🎬', color: 'text-blue-400' },
    { key: 'music', label: '🎵 Music', emoji: '🎵', color: 'text-purple-400' },
    { key: 'anime', label: '🎌 Anime', emoji: '🎌', color: 'text-pink-400' }
  ];

  const handleAddItem = (category) => {
    if (!isViewingOwnProfile || !newItem.trim()) return;

    const currentFavorites = displayUser.favorites?.[category] || [];
    const updatedFavorites = [...currentFavorites, newItem.trim()];

    updateFavorites(category, updatedFavorites);
    setNewItem('');
    setEditingCategory(null);
  };

  const handleRemoveItem = (category, index) => {
    if (!isViewingOwnProfile) return;

    const currentFavorites = displayUser.favorites?.[category] || [];
    const updatedFavorites = currentFavorites.filter((_, i) => i !== index);
    updateFavorites(category, updatedFavorites);
  };

  const handleCancel = () => {
    setNewItem('');
    setEditingCategory(null);
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center gap-2 mb-6">
        <FaHeart className="text-red-400" />
        <h3 className="text-lg font-semibold text-white">Favorites</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((category) => {
          const favorites = displayUser.favorites?.[category.key] || [];
          const isEditing = editingCategory === category.key;

          return (
            <div key={category.key} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.emoji}</span>
                  <h4 className="font-medium text-gray-300">{category.label}</h4>
                  <span className="text-xs text-gray-500">({favorites.length})</span>
                </div>

                {!isEditing && isViewingOwnProfile && (
                  <button
                    onClick={() => setEditingCategory(category.key)}
                    className="p-1 text-gray-400 hover:text-purple-400 transition-colors duration-200"
                    title={`Add ${category.label.toLowerCase()}`}
                  >
                    <FaPlus className="text-xs" />
                  </button>
                )}
              </div>

              {/* Favorites List - Tag Format */}
              <div className="min-h-[100px]">
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {favorites.map((item, index) => (
                      <motion.div
                        key={`${category.key}-${index}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="group relative"
                      >
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-700/50 border border-gray-600 ${category.color} hover:bg-gray-600/50 transition-all duration-200`}>
                          <span className="text-xs">{category.emoji}</span>
                          <span>{item}</span>
                          {isViewingOwnProfile && (
                            <button
                              onClick={() => handleRemoveItem(category.key, index)}
                              className="ml-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all duration-200"
                              title="Remove"
                            >
                              <FaTimes className="text-xs" />
                            </button>
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Add New Item Form */}
                <AnimatePresence>
                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-2"
                    >
                      <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={`Add a favorite ${category.label.toLowerCase().slice(0, -1)}...`}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                        maxLength={50}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddItem(category.key);
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAddItem(category.key)}
                          disabled={!newItem.trim()}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-1 px-3 rounded text-xs font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <FaSave className="text-xs" />
                          Add
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-3 py-1 border border-gray-600 text-gray-300 rounded text-xs hover:bg-gray-700 transition-all duration-200 flex items-center gap-1"
                        >
                          <FaTimes className="text-xs" />
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Empty State */}
                {favorites.length === 0 && !isEditing && (
                  <div className="text-center py-4 text-gray-500">
                    <span className="text-2xl opacity-50 block mb-2">{category.emoji}</span>
                    <p className="text-xs">No {category.label.toLowerCase()} added yet</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesSection;
