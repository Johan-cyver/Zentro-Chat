import React, { useState, useEffect } from 'react';
import { FaSearch, FaSpinner, FaPlay, FaPlus, FaFilter } from 'react-icons/fa';

const MusicSearch = ({ onSelectTrack }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeGenre, setActiveGenre] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Available genres from our mock data
  const genres = ['All', 'Pop', 'Hip Hop', 'Electronic', 'Rock', 'Classical'];

  // Mock search function - in a real app, this would call a music API
  const searchMusic = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Expanded mock data with more genres and artists
      const mockResults = [
        // Pop
        {
          id: '1',
          title: 'Blinding Lights',
          artist: 'The Weeknd',
          genre: 'Pop',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a048415db06a5b6fa7ec4e1a',
          url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b'
        },
        {
          id: '2',
          title: 'Starboy',
          artist: 'The Weeknd',
          genre: 'Pop',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452',
          url: 'https://open.spotify.com/track/7MXVkk9YMctZqd1Srtv4MB'
        },
        {
          id: '3',
          title: 'Save Your Tears',
          artist: 'The Weeknd',
          genre: 'Pop',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a048415db06a5b6fa7ec4e1a',
          url: 'https://open.spotify.com/track/5QO79kh1waicV47BqGRL3g'
        },
        {
          id: '4',
          title: 'Shape of You',
          artist: 'Ed Sheeran',
          genre: 'Pop',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
          url: 'https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3'
        },
        {
          id: '5',
          title: 'Uptown Funk',
          artist: 'Mark Ronson ft. Bruno Mars',
          genre: 'Pop',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273e11e5b62e04e2f6f4a46e975',
          url: 'https://open.spotify.com/track/32OlwWuMpZ6b0aN2RZOeMS'
        },
        // Hip Hop
        {
          id: '6',
          title: 'SICKO MODE',
          artist: 'Travis Scott',
          genre: 'Hip Hop',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273072e9faef2ef7b6db63834a3',
          url: 'https://open.spotify.com/track/2xLMifQCjDGFmkHkpNLD9h'
        },
        {
          id: '7',
          title: 'HUMBLE.',
          artist: 'Kendrick Lamar',
          genre: 'Hip Hop',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273b5f7e3d6b9d6ce7f0e8ea4f2',
          url: 'https://open.spotify.com/track/7KXjTSCq5nL1LoYtL7XAwS'
        },
        // Electronic
        {
          id: '8',
          title: 'Strobe',
          artist: 'deadmau5',
          genre: 'Electronic',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a7a0d1a39f9f851a3a1b7a9a',
          url: 'https://open.spotify.com/track/1uY4O332HuqLIcSSJlg4NX'
        },
        {
          id: '9',
          title: 'Levels',
          artist: 'Avicii',
          genre: 'Electronic',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273f05e5ac32fdd79d100315a20',
          url: 'https://open.spotify.com/track/5UqCQaDshqbIk3pkhy4Pjg'
        },
        // Rock
        {
          id: '10',
          title: 'Bohemian Rhapsody',
          artist: 'Queen',
          genre: 'Rock',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273c8a11e48c91a982d086afc69',
          url: 'https://open.spotify.com/track/7tFiyTwD0nx5a1eklYtX2J'
        },
        {
          id: '11',
          title: 'Sweet Child O\' Mine',
          artist: 'Guns N\' Roses',
          genre: 'Rock',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273bdba586eb69c503f7ff7d7e4',
          url: 'https://open.spotify.com/track/7o2CTH4ctstm8TNelqjb51'
        },
        // Classical
        {
          id: '12',
          title: 'Moonlight Sonata',
          artist: 'Ludwig van Beethoven',
          genre: 'Classical',
          thumbnail: 'https://i.scdn.co/image/ab67616d0000b273cb4ec52c48a6b071ed2ab6bc',
          url: 'https://open.spotify.com/track/3CWxKOOI4TCdKt0JJJ87DN'
        }
      ];

      // Filter results based on search query (title, artist, or genre)
      let filteredResults = mockResults.filter(
        track =>
          track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (track.genre && track.genre.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      // Apply genre filter if not "All"
      if (activeGenre !== 'All') {
        filteredResults = filteredResults.filter(track =>
          track.genre && track.genre === activeGenre
        );
      }

      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Error searching music:', err);
      setError('Failed to search for music');
    } finally {
      setLoading(false);
    }
  };

  // Handle search when query or genre changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchMusic(query);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, activeGenre]);

  // Handle search form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    searchMusic(query);
  };

  // Handle genre selection
  const handleGenreSelect = (genre) => {
    setActiveGenre(genre);
    // Re-run search with new genre filter
    searchMusic(query);
  };

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-4 shadow-lg">
      <h3 className="text-xl font-semibold text-purple-400 mb-4">Find Music</h3>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for songs, artists, genres..."
            className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400"
            title="Show filters"
          >
            <FaFilter />
          </button>
        </div>
      </form>

      {/* Genre Filters */}
      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => handleGenreSelect(genre)}
              className={`px-3 py-1 rounded-full text-sm ${
                activeGenre === genre
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <FaSpinner className="animate-spin text-2xl text-purple-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center p-4">
          {error}
        </div>
      ) : searchResults.length === 0 ? (
        <div className="text-gray-400 text-center p-4">
          {query ? 'No results found' : 'Search for music to see results'}
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
          {searchResults.map(track => (
            <div
              key={track.id}
              className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors"
            >
              {track.thumbnail ? (
                <img
                  src={track.thumbnail}
                  alt={track.title}
                  className="w-12 h-12 object-cover rounded-md"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
                  <span className="text-xl">🎵</span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{track.title}</h4>
                <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                {track.genre && (
                  <span className="inline-block px-2 py-0.5 bg-gray-700 text-xs text-purple-300 rounded-full mt-1">
                    {track.genre}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onSelectTrack(track, 'play')}
                  className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                  title="Play"
                >
                  <FaPlay />
                </button>
                <button
                  onClick={() => onSelectTrack(track, 'add')}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                  title="Add to profile"
                >
                  <FaPlus />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MusicSearch;
