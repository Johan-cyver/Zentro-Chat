import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaSpinner } from 'react-icons/fa';

const MusicPlayer = ({ url, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackInfo, setTrackInfo] = useState({
    title: 'Unknown Track',
    artist: 'Unknown Artist',
    thumbnail: null
  });

  const audioRef = useRef(null);
  const prevVolume = useRef(volume);

  // Determine the type of URL (YouTube, Spotify, direct audio)
  const getUrlType = (url) => {
    if (!url) return 'unknown';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('spotify.com')) return 'spotify';
    if (url.match(/\.(mp3|wav|ogg)$/i)) return 'direct';
    return 'unknown';
  };

  const urlType = getUrlType(url);

  // Extract video/track ID from URL
  const getMediaId = () => {
    if (urlType === 'youtube') {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }
    if (urlType === 'spotify') {
      const regex = /track\/([a-zA-Z0-9]+)/;
      const match = url.match(regex);
      return match ? match[1] : null;
    }
    return null;
  };

  const mediaId = getMediaId();

  // Handle play/pause
  const togglePlay = async () => {
    if (audioRef.current) {
      try {
        if (isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        } else {
          // Use try-catch with await to handle play() promise rejection
          await audioRef.current.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error("Error toggling play state:", error);
        // Reset playing state if play was interrupted
        setIsPlaying(false);
        setError("Playback was interrupted. Please try again.");
      }
    }
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = prevVolume.current;
        setVolume(prevVolume.current);
      } else {
        prevVolume.current = volume;
        audioRef.current.volume = 0;
        setVolume(0);
      }
      setIsMuted(!isMuted);
    }
  };

  // Load track info
  useEffect(() => {
    const loadTrackInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        if (urlType === 'youtube' && mediaId) {
          // For a real implementation, you would use YouTube API
          // This is a placeholder for demonstration
          setTrackInfo({
            title: 'YouTube Track',
            artist: 'YouTube Artist',
            thumbnail: `https://img.youtube.com/vi/${mediaId}/0.jpg`
          });
        } else if (urlType === 'spotify' && mediaId) {
          // For a real implementation, you would use Spotify API
          // This is a placeholder for demonstration
          setTrackInfo({
            title: 'Spotify Track',
            artist: 'Spotify Artist',
            thumbnail: null
          });
        } else if (urlType === 'direct') {
          // For direct audio files, use the filename as title
          const filename = url.split('/').pop().split('.')[0];
          setTrackInfo({
            title: filename,
            artist: 'Unknown Artist',
            thumbnail: null
          });
        }
      } catch (err) {
        console.error('Error loading track info:', err);
        setError('Failed to load track information');
      } finally {
        setLoading(false);
      }
    };

    loadTrackInfo();
  }, [url, urlType, mediaId]);

  // Set up audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;

      const handleCanPlay = () => {
        setLoading(false);
      };

      const handleError = (e) => {
        console.error('Audio error:', e);
        setError('Failed to load audio');
        setLoading(false);
      };

      audioRef.current.addEventListener('canplay', handleCanPlay);
      audioRef.current.addEventListener('error', handleError);

      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('canplay', handleCanPlay);
          audioRef.current.removeEventListener('error', handleError);
        }
      };
    }
  }, [volume]);

  return (
    <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-4 shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-purple-400">Music Player</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-24">
          <FaSpinner className="animate-spin text-2xl text-purple-400" />
        </div>
      ) : error ? (
        <div className="text-red-400 text-center p-4">
          {error}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-4">
            {trackInfo.thumbnail ? (
              <img
                src={trackInfo.thumbnail}
                alt={trackInfo.title}
                className="w-16 h-16 object-cover rounded-md"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-800 rounded-md flex items-center justify-center">
                <span className="text-2xl">🎵</span>
              </div>
            )}

            <div>
              <h4 className="text-white font-medium">{trackInfo.title}</h4>
              <p className="text-gray-400 text-sm">{trackInfo.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="p-3 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={toggleMute}
                className="text-gray-300 hover:text-white"
              >
                {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={urlType === 'direct' ? url : null}
            className="hidden"
          />

          {/* Embed for YouTube or Spotify */}
          {urlType === 'youtube' && mediaId && (
            <div className="mt-4 aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${mediaId}?autoplay=0`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-md"
              ></iframe>
            </div>
          )}

          {urlType === 'spotify' && mediaId && (
            <div className="mt-4 h-80">
              <iframe
                src={`https://open.spotify.com/embed/track/${mediaId}`}
                width="100%"
                height="100%"
                frameBorder="0"
                allowtransparency="true"
                allow="encrypted-media"
                className="rounded-md"
              ></iframe>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MusicPlayer;
