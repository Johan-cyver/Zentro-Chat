import React from 'react';

const EmojiPicker = ({ onSelect }) => {
  const commonEmojis = ['👍', '❤️', '😊', '😂', '🎉', '👏', '🔥', '✨', '🤔', '😍'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1">
      {commonEmojis.map((emoji, index) => (
        <button
          key={index}
          onClick={() => onSelect(emoji)}
          className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
        >
          <span className="text-xl">{emoji}</span>
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker; 