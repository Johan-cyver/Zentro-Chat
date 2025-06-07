import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaPlay, FaPause, FaPlus, FaHeart, FaRegHeart, FaMusic, FaArrowLeft } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import MusicPlayer from './MusicPlayer';
import MusicSearch from './MusicSearch';

const MusicPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useUser();
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  // Load saved data from localStorage (user-specific)
  useEffect(() => {
    if (!userProfile?.uid) return;

    const savedFavorites = localStorage.getItem(`zentro_music_favorites_${userProfile.uid}`);
    const savedRecent = localStorage.getItem(`zentro_music_recent_${userProfile.uid}`);
    const savedPlaylists = localStorage.getItem(`zentro_music_playlists_${userProfile.uid}`);

    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }

    if (savedRecent) {
      setRecentlyPlayed(JSON.parse(savedRecent));
    }

    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    } else {
      // Create default playlist if none exists
      setPlaylists([
        {
          id: 'default',
          name: 'My Playlist',
          tracks: [
            {
              id: '1',
              title: 'Blinding Lights',
              artist: 'The Weeknd',
              thumbnail: 'https://i.scdn.co/image/ab67616d0000b273a048415db06a5b6fa7ec4e1a',
              url: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b'
            },
            {
              id: '2',
              title: 'Starboy',
              artist: 'The Weeknd',
              thumbnail: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452',
              url: 'https://open.spotify.com/track/7MXVkk9YMctZqd1Srtv4MB'
            }
          ]
        }
      ]);
    }
  }, [userProfile?.uid]);

  // Save data to localStorage when it changes (user-specific)
  useEffect(() => {
    if (!userProfile?.uid) return;

    if (favorites.length > 0) {
      localStorage.setItem(`zentro_music_favorites_${userProfile.uid}`, JSON.stringify(favorites));
    }

    if (recentlyPlayed.length > 0) {
      localStorage.setItem(`zentro_music_recent_${userProfile.uid}`, JSON.stringify(recentlyPlayed));
    }

    if (playlists.length > 0) {
      localStorage.setItem(`zentro_music_playlists_${userProfile.uid}`, JSON.stringify(playlists));
    }
  }, [favorites, recentlyPlayed, playlists, userProfile?.uid]);

  // Handle track selection
  const handleSelectTrack = (track, action) => {
    if (action === 'play') {
      setCurrentTrack(track);
      setIsPlaying(true);

      // Add to recently played if not already there
      if (!recentlyPlayed.some(t => t.id === track.id)) {
        setRecentlyPlayed(prev => [track, ...prev].slice(0, 10));
      }
    } else if (action === 'add') {
      // Add to default playlist
      if (playlists.length > 0) {
        const updatedPlaylists = [...playlists];
        const defaultPlaylist = updatedPlaylists[0];

        if (!defaultPlaylist.tracks.some(t => t.id === track.id)) {
          defaultPlaylist.tracks.push(track);
          setPlaylists(updatedPlaylists);
        }
      }
    }
  };

  // Toggle favorite status
  const toggleFavorite = (track) => {
    if (favorites.some(t => t.id === track.id)) {
      setFavorites(favorites.filter(t => t.id !== track.id));
    } else {
      setFavorites([...favorites, track]);
    }
  };

  // Render track item
  const TrackItem = ({ track, showPlaylist = false }) => {
    const isFavorite = favorites.some(t => t.id === track.id);

    return (
      <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3 hover:bg-gray-700 transition-colors">
        {track.thumbnail ? (
          <img
            src={track.thumbnail}
            alt={track.title}
            className="w-12 h-12 object-cover rounded-md"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center">
            <FaMusic className="text-gray-400" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate">{track.title}</h4>
          <p className="text-gray-400 text-sm truncate">{track.artist}</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleSelectTrack(track, 'play')}
            className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
            title="Play"
          >
            {currentTrack && currentTrack.id === track.id && isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            onClick={() => toggleFavorite(track)}
            className={`p-2 rounded-full ${isFavorite ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-600 hover:bg-gray-500'} text-white`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>

          {showPlaylist && (
            <button
              onClick={() => handleSelectTrack(track, 'add')}
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              title="Add to playlist"
            >
              <FaPlus />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/chat')}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-gray-300 hover:text-white"
            >
              <FaArrowLeft />
              <span>Back to Chat</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Zentro Music</h1>
          </div>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2"
          >
            <FaSearch />
            <span>Search Music</span>
          </button>
        </div>

      {showSearch && (
        <div className="mb-8">
          <MusicSearch onSelectTrack={handleSelectTrack} />
        </div>
      )}

      {currentTrack && (
        <div className="mb-8">
          <MusicPlayer
            url={currentTrack.url}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        </div>
      )}

      {/* Recently Played */}
      {recentlyPlayed.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">Recently Played</h2>
          <div className="space-y-3">
            {recentlyPlayed.slice(0, 5).map(track => (
              <TrackItem key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}

      {/* Favorites */}
      {favorites.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">Favorites</h2>
          <div className="space-y-3">
            {favorites.map(track => (
              <TrackItem key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}

      {/* Playlists */}
      {playlists.map(playlist => (
        <div key={playlist.id} className="mb-8">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">{playlist.name}</h2>
          <div className="space-y-3">
            {playlist.tracks.length > 0 ? (
              playlist.tracks.map(track => (
                <TrackItem key={track.id} track={track} />
              ))
            ) : (
              <p className="text-gray-400">No tracks in this playlist yet.</p>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default MusicPage;
