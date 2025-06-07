import React, { useState, useEffect } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';

const GifPicker = ({ onGifSelect, onClose, theme }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [gifs, setGifs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [trendingGifs, setTrendingGifs] = useState([]);

  // Giphy API key - using public demo key for millions of GIFs
  const GIPHY_API_KEY = 'RcJA9uwzebyVHzMskJn5DlbcnrpKKAzc'; // Public demo key with access to full Giphy database

  // Load trending GIFs on mount
  useEffect(() => {
    loadTrendingGifs();
  }, []);

  const loadTrendingGifs = async () => {
    setLoading(true);
    try {
      // Use actual Giphy API for millions of trending GIFs
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=50&rating=g`
      );
      const data = await response.json();

      if (data.data) {
        const formattedGifs = data.data.map(gif => ({
          id: gif.id,
          url: gif.images.fixed_height.url,
          title: gif.title || 'GIF',
          webp: gif.images.fixed_height.webp,
          mp4: gif.images.fixed_height.mp4
        }));

        setTrendingGifs(formattedGifs);
        setGifs(formattedGifs);
      }
    } catch (error) {
      console.error('Error loading trending GIFs:', error);
      // Fallback to demo GIFs if API fails
      const fallbackGifs = [
        {
          id: '1',
          url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
          title: 'Happy Dance'
        },
        {
          id: '2',
          url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
          title: 'Thumbs Up'
        }
      ];
      setTrendingGifs(fallbackGifs);
      setGifs(fallbackGifs);
    } finally {
      setLoading(false);
    }
  };

  const searchGifs = async (query) => {
    if (!query.trim()) {
      setGifs(trendingGifs);
      return;
    }

    setLoading(true);
    try {
      // Use actual Giphy search API for millions of search results
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=50&rating=g`
      );
      const data = await response.json();

      if (data.data) {
        const formattedGifs = data.data.map(gif => ({
          id: gif.id,
          url: gif.images.fixed_height.url,
          title: gif.title || 'GIF',
          webp: gif.images.fixed_height.webp,
          mp4: gif.images.fixed_height.mp4
        }));

        setGifs(formattedGifs);
      } else {
        setGifs([]);
      }
    } catch (error) {
      console.error('Error searching GIFs:', error);
      // Fallback to filtering trending GIFs
      const filteredGifs = trendingGifs.filter(gif =>
        gif.title.toLowerCase().includes(query.toLowerCase())
      );
      setGifs(filteredGifs);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchGifs(query);
  };

  const handleGifClick = (gif) => {
    onGifSelect(gif);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden"
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
          <h3
            className="text-lg font-semibold"
            style={{ color: theme.colors.text }}
          >
            Choose a GIF
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaTimes />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <FaSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search for GIFs..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                backgroundColor: theme.colors.inputBackground,
                borderColor: theme.colors.borderMuted,
                color: theme.colors.text
              }}
            />
          </div>
        </div>

        {/* GIF Grid */}
        <div className="p-4 overflow-y-auto max-h-96">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {gifs.map((gif) => (
                <div
                  key={gif.id}
                  onClick={() => handleGifClick(gif)}
                  className="relative cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img
                    src={gif.url}
                    alt={gif.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors"></div>
                </div>
              ))}
            </div>
          )}

          {!loading && gifs.length === 0 && (
            <div className="text-center py-8">
              <p
                className="text-gray-500"
                style={{ color: theme.colors.textMuted }}
              >
                No GIFs found. Try a different search term.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t text-center"
          style={{ borderColor: theme.colors.borderMuted }}
        >
          <p
            className="text-xs text-gray-500"
            style={{ color: theme.colors.textMuted }}
          >
            Powered by GIPHY
          </p>
        </div>
      </div>
    </div>
  );
};

export default GifPicker;
