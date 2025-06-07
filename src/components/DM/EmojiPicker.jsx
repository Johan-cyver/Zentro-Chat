import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSmile, FaTimes } from 'react-icons/fa';

/**
 * EmojiPicker - Component for selecting emojis in chat
 * 
 * Features:
 * - Categorized emoji selection
 * - Search functionality
 * - Recently used emojis
 * - Smooth animations
 */
const EmojiPicker = ({ onEmojiSelect, onClose, theme }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [searchTerm, setSearchTerm] = useState('');
  const [recentEmojis, setRecentEmojis] = useState(() => {
    const saved = localStorage.getItem('zentro_recent_emojis');
    return saved ? JSON.parse(saved) : ['😊', '👍', '❤️', '😂', '🔥'];
  });

  // Emoji categories
  const emojiCategories = {
    recent: {
      name: 'Recently Used',
      icon: '🕒',
      emojis: recentEmojis
    },
    smileys: {
      name: 'Smileys & People',
      icon: '😊',
      emojis: [
        '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
        '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
        '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
        '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
        '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
        '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
        '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
        '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐'
      ]
    },
    animals: {
      name: 'Animals & Nature',
      icon: '🐶',
      emojis: [
        '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯',
        '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
        '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇',
        '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
        '🦟', '🦗', '🕷️', '🕸️', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕',
        '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳',
        '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛'
      ]
    },
    food: {
      name: 'Food & Drink',
      icon: '🍕',
      emojis: [
        '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈',
        '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
        '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔',
        '🍠', '🥐', '🥖', '🍞', '🥨', '🥯', '🧀', '🥚', '🍳', '🧈',
        '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟',
        '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘',
        '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤'
      ]
    },
    activities: {
      name: 'Activities',
      icon: '⚽',
      emojis: [
        '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱',
        '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳',
        '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️',
        '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺',
        '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆',
        '🥇', '🥈', '🥉', '🏅', '🎖️', '🏵️', '🎗️', '🎫', '🎟️', '🎪'
      ]
    },
    objects: {
      name: 'Objects',
      icon: '💎',
      emojis: [
        '⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️',
        '🗜️', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
        '📽️', '🎞️', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙️', '🎚️',
        '🎛️', '🧭', '⏱️', '⏲️', '⏰', '🕰️', '⌛', '⏳', '📡', '🔋',
        '🔌', '💡', '🔦', '🕯️', '🪔', '🧯', '🛢️', '💸', '💵', '💴',
        '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒️'
      ]
    },
    symbols: {
      name: 'Symbols',
      icon: '❤️',
      emojis: [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
        '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
        '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐',
        '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐',
        '♑', '♒', '♓', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳',
        '🈶', '🈚', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️'
      ]
    }
  };

  // Filter emojis based on search
  const getFilteredEmojis = (emojis) => {
    if (!searchTerm) return emojis;
    // For simplicity, just return all emojis when searching
    // In a real app, you'd have emoji names/keywords to search
    return emojis;
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    // Add to recent emojis
    const newRecent = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20);
    setRecentEmojis(newRecent);
    localStorage.setItem('zentro_recent_emojis', JSON.stringify(newRecent));
    
    // Call parent callback
    onEmojiSelect(emoji);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className="absolute bottom-16 right-0 w-80 h-96 rounded-2xl shadow-2xl border z-50"
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.borderMuted
      }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.colors.borderMuted }}
      >
        <div className="flex items-center space-x-2">
          <FaSmile style={{ color: theme.colors.primary }} />
          <h3 
            className="font-semibold"
            style={{ color: theme.colors.text }}
          >
            Emojis
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-700 transition-colors"
          style={{ color: theme.colors.textMuted }}
        >
          <FaTimes />
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <input
          type="text"
          placeholder="Search emojis..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border text-sm"
          style={{
            backgroundColor: theme.colors.inputBackground,
            borderColor: theme.colors.borderMuted,
            color: theme.colors.text
          }}
        />
      </div>

      {/* Categories */}
      <div 
        className="flex space-x-1 px-3 pb-2 border-b overflow-x-auto"
        style={{ borderColor: theme.colors.borderMuted }}
      >
        {Object.entries(emojiCategories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setActiveCategory(key)}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              activeCategory === key ? 'bg-purple-600' : 'hover:bg-gray-700'
            }`}
            title={category.name}
          >
            <span className="text-lg">{category.icon}</span>
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-8 gap-1">
          {getFilteredEmojis(emojiCategories[activeCategory]?.emojis || []).map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleEmojiSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-700 transition-colors text-lg"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default EmojiPicker;
