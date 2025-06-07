import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaMusic, FaImage, FaVideo, FaComment, FaHeart, FaTrash, FaPlay, FaPause, FaSignOutAlt, FaLock, FaGlobe, FaUsers } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import { clearAuthState } from '../../firebase';
import BlogPostsView from './BlogPostsView';
import MusicPlayer from '../Music/MusicPlayer';
import MusicSearch from '../Music/MusicSearch';
import ProfileField from './ProfileField';
import TabButton from './TabButton';
import FriendsSection from './FriendsSection';
import MoodTracker from './MoodTracker';
import InterestsSection from './InterestsSection';
import FavoritesSection from './FavoritesSection';
import PostsSection from './PostsSection';

const PersonalView = ({ user = null }) => {
  const navigate = useNavigate();
  const { userProfile, updateProfile } = useUser();
  const [isEditMode, setIsEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('photos');
  
  // Profile visibility settings
  const defaultVisibility = {
    birthDate: 'friends',
    location: 'friends',
    music: 'public',
    relationshipStatus: 'friends'
  };

  // Initialize visibility settings for fields
  useEffect(() => {
    if (userProfile?.uid) {
      const updates = {};
      ['birthDate', 'location', 'music', 'relationshipStatus'].forEach(field => {
        if (!userProfile[`${field}Visibility`] && userProfile[field]) {
          updates[`${field}Visibility`] = defaultVisibility[field];
        }
      });
      
      if (Object.keys(updates).length > 0) {
        updateProfile(updates);
      }
    }
  }, [userProfile?.uid]);

  // Use the passed user prop if viewing someone else's profile, otherwise use current user
  const displayUser = user || userProfile;
  const isViewingOwnProfile = !user || (user.uid === userProfile.uid);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const profilePictureRef = useRef(null);
  const bannerImageRef = useRef(null);
  const audioRef = useRef(null);  // Sync profile fields with localStorage for persistence
  useEffect(() => {
    if (userProfile?.uid) {
      const storedProfile = localStorage.getItem(`zentro_user_profile_${userProfile.uid}`);
      if (storedProfile) {
        try {
          const parsedProfile = JSON.parse(storedProfile);
          const updates = {};
          
          // Check if music data needs updating, ensuring we don't lose metadata
          if (parsedProfile.music) {
            const currentTimestamp = userProfile.music?.timestamp || 0;
            const storedTimestamp = parsedProfile.music.timestamp || 0;
            
            if (!userProfile.music || storedTimestamp > currentTimestamp) {
              updates.music = {
                ...parsedProfile.music,
                url: parsedProfile.music.url || parsedProfile.music,
                displayName: parsedProfile.music.displayName || getTrackName(parsedProfile.music),
                timestamp: storedTimestamp
              };
            }
          }
          
          // Handle other fields
          const fields = ['birthDate', 'relationshipStatus', 'location'];
          const needsUpdate = fields.some(field => parsedProfile[field] !== userProfile[field]);
          
          if (needsUpdate) {
            const updates = {};
            fields.forEach(field => {
              if (parsedProfile[field] !== userProfile[field]) {
                updates[field] = parsedProfile[field] || userProfile[field];
              }
              if (!userProfile[`${field}Visibility`]) {
                updates[`${field}Visibility`] = defaultVisibility[field];
              }
            });
            updateProfile(updates);
          }
        } catch (error) {
          console.error('Error parsing stored profile:', error);
        }
      }
    }
  }, [userProfile?.uid]);
  // Cleanup audio on unmount or when music changes
  useEffect(() => {
    const cleanup = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
        setIsPlaying(false);
      }
    };

    // Clean up when music changes
    if (displayUser?.music?.url !== audioRef.current?.src) {
      cleanup();
    }

    // Clean up on unmount
    return cleanup;
  }, [displayUser?.music?.url]);
  // Handle profile data change with improved persistence
  const handleProfileChange = (field, value) => {
    // Create an update object
    const updateData = {
      [field]: value,
      // Always include visibility settings for fields that need them
      ...(field === 'birthDate' && { birthDateVisibility: userProfile?.birthDateVisibility || defaultVisibility.birthDate }),
      ...(field === 'location' && { locationVisibility: userProfile?.locationVisibility || defaultVisibility.location }),
      ...(field === 'music' && { musicVisibility: userProfile?.musicVisibility || defaultVisibility.music }),
      ...(field === 'relationshipStatus' && { relationshipStatusVisibility: userProfile?.relationshipStatusVisibility || defaultVisibility.relationshipStatus })
    };

    // Update local state and Firebase
    updateProfile(updateData);

    // Also save to localStorage for persistence
    if (userProfile?.uid) {
      try {
        const storedProfile = JSON.parse(localStorage.getItem(`zentro_user_profile_${userProfile.uid}`) || '{}');
        const updatedProfile = {
          ...storedProfile,
          ...updateData,
          timestamp: Date.now() // Add timestamp to track latest changes
        };
        localStorage.setItem(`zentro_user_profile_${userProfile.uid}`, JSON.stringify(updatedProfile));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
  };

  // Update field visibility
  const updateVisibility = (field, visibility) => {
    handleProfileChange(`${field}Visibility`, visibility);
  };

  // Check if a user can view a field
  const canViewField = (field) => {
    if (isViewingOwnProfile) return true;

    const visibility = displayUser[`${field}Visibility`] || defaultVisibility[field];
    switch (visibility) {
      case 'public':
        return true;
      case 'friends':
        return true; // TODO: Add friend check logic here
      case 'private':
        return false;
      default:
        return true;
    }
  };

  // Render a field's visibility indicator
  const renderVisibilityIcon = (field) => {
    const visibility = displayUser[`${field}Visibility`] || defaultVisibility[field];
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
  // Extract track name from URL or track object
  const getTrackName = (urlOrTrack) => {
    if (!urlOrTrack) return '';
    
    // If it's our metadata object with displayName
    if (typeof urlOrTrack === 'object' && urlOrTrack.displayName) {
      return urlOrTrack.displayName;
    }
    
    // If it's a track object from search with name and artist
    if (typeof urlOrTrack === 'object' && urlOrTrack.name) {
      return `${urlOrTrack.name} - ${urlOrTrack.artist || 'Unknown Artist'}`;
    }

    try {
      const url = new URL(urlOrTrack.toString());
      
      // For Spotify URLs
      if (url.hostname.includes('spotify.com')) {
        // Try to extract the track name from the query parameters
        const segments = decodeURIComponent(url.pathname).split('/');
        const lastSegment = segments[segments.length - 1];
        
        // If the URL has a title in the search params
        const titleFromParams = url.searchParams.get('title') || 
                              url.searchParams.get('track') || 
                              url.searchParams.get('name');
        if (titleFromParams) {
          return decodeURIComponent(titleFromParams).trim();
        }
        
        // If the URL has encoded track info in the path
        if (lastSegment.includes(' - ')) {
          return lastSegment.split(' - ')[0].trim() || 'Unknown Track';
        }
        
        // Clean up the track ID to be more readable
        const words = lastSegment
          .split('-')
          .map(word => {
            // Remove non-word characters and numbers
            word = word.replace(/[^a-zA-Z]/g, ' ').trim();
            // Capitalize first letter of each word
            return word.split(' ')
              .map(w => w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
              .join(' ');
          })
          .filter(word => word.length > 0);
        
        return words.length > 0 ? words.join(' ') : 'Unknown Track';
      }
      
      // For other URLs, try to get a clean filename
      const fileName = decodeURIComponent(url.pathname.split('/').pop());
      return fileName
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
        .replace(/[0-9]/g, '') // Remove numbers
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim() || 'Unknown Track';
    } catch {
      // If URL parsing fails, try to extract a readable name from the string
      const str = urlOrTrack.toString();
      return str
        .split(/[/\\]/).pop()
        .split('?')[0]
        .replace(/\.[^/.]+$/, '') // Remove file extension
        .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
        .replace(/[0-9]/g, '') // Remove numbers
        .split(' ')
        .filter(word => word.length > 0)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim() || 'Unknown Track';
    }
  };
  // State for music playback
  const [isPlaying, setIsPlaying] = useState(false);

  // Render music section with direct playback
  const renderMusicSection = () => {
    if (!canViewField('music')) {
      return <div className="text-gray-400">🎵 Music preference is private</div>;
    }

    const handlePlayClick = async () => {
      try {        // Clean up existing audio if the URL changed
        const currentUrl = displayUser.music?.url || displayUser.music;
        if (audioRef.current?.src !== currentUrl) {
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current.load();
          }
          audioRef.current = null;
        }// Create new audio instance if needed
        if (!audioRef.current) {
          // Get the URL from either the metadata object or direct URL string
          const audioUrl = displayUser.music?.url || displayUser.music;
          audioRef.current = new Audio(audioUrl);
          audioRef.current.onended = () => setIsPlaying(false);
          audioRef.current.onerror = (e) => {
            console.error('Audio playback error:', e);
            setIsPlaying(false);
            // Clear the errored audio instance
            audioRef.current = null;
          };
        }

        if (isPlaying) {
          await audioRef.current.pause();
          setIsPlaying(false);
        } else {
          try {
            // Reset audio position
            audioRef.current.currentTime = 0;
            // Some browsers require user interaction before playing
            const playPromise = audioRef.current.play();
            if (playPromise) {
              await playPromise;
              setIsPlaying(true);
            }
          } catch (playError) {
            console.error('Playback failed:', playError);
            setIsPlaying(false);
            // Clear the errored audio instance
            audioRef.current = null;
          }
        }
      } catch (error) {
        console.error('Audio setup error:', error);
        setIsPlaying(false);
        // Clean up on error
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }
    };

    return (      <div className="flex items-center gap-2">
        {displayUser?.music ? (
          <div className="flex items-center gap-2">
            <span className="text-white">{displayUser.music.displayName || getTrackName(displayUser.music)}</span>
            <button
              onClick={handlePlayClick}
              className={`p-2 ${isPlaying ? 'bg-purple-700' : 'bg-purple-600'} rounded-full hover:bg-purple-700 transition-colors`}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <FaPause className="text-white text-sm" />
              ) : (
                <FaPlay className="text-white text-sm" />
              )}
            </button>
          </div>
        ) : (
          <span className="text-gray-400">No music selected</span>
        )}
        {isViewingOwnProfile && (
          <button
            onClick={() => setShowMusicModal(true)}
            className="text-purple-400 hover:text-purple-300"
          >
            {displayUser?.music ? 'Change' : 'Add'}
          </button>
        )}
      </div>
    );
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await clearAuthState();
      // Clear all Zentro-related localStorage items
      localStorage.removeItem('zentro_user_displayName');
      localStorage.removeItem('zentro_user_email');
      localStorage.removeItem('zentro_user_age');
      localStorage.removeItem('zentro_user_birthDate');
      localStorage.removeItem('zentro_remember_email');
      localStorage.removeItem('zentro_remember_me');
      localStorage.removeItem('zentro_profile_view');

      // Clear user-specific data if we have a user ID
      if (userProfile?.uid) {
        localStorage.removeItem(`zentro_photos_${userProfile.uid}`);
        localStorage.removeItem(`zentro_videos_${userProfile.uid}`);
        localStorage.removeItem(`zentro_posts_${userProfile.uid}`);
        localStorage.removeItem(`zentro_bot_chat_${userProfile.uid}`);
      }

      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };



  // Media data - load from localStorage if available (user-specific)
  const [photos, setPhotos] = useState(() => {
    if (!userProfile?.uid) return [];
    const savedPhotos = localStorage.getItem(`zentro_photos_${userProfile.uid}`);
    return savedPhotos ? JSON.parse(savedPhotos) : [];
  });

  const [videos, setVideos] = useState(() => {
    if (!userProfile?.uid) return [];
    const savedVideos = localStorage.getItem(`zentro_videos_${userProfile.uid}`);
    return savedVideos ? JSON.parse(savedVideos) : [];
  });

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  // Add a message state to the selectedMedia for feedback
  const updateSelectedMediaWithMessage = (message) => {
    if (selectedMedia) {
      setSelectedMedia(prev => ({
        ...prev,
        message
      }));

      // Clear message after 3 seconds
      setTimeout(() => {
        setSelectedMedia(prev => prev ? {
          ...prev,
          message: null
        } : null);
      }, 3000);
    }
  };

  // Function to refresh the selected media with latest comments
  const refreshSelectedMedia = () => {
    if (selectedMedia) {
      const { type, data } = selectedMedia;
      const updatedData = type === 'photo'
        ? photos.find(photo => photo.id === data.id)
        : videos.find(video => video.id === data.id);

      if (updatedData) {
        setSelectedMedia({
          ...selectedMedia,
          data: updatedData
        });
      }
    }
  };

  // Toggle edit mode (only allow for own profile)
  const toggleEditMode = () => {
    if (isViewingOwnProfile) {
      setIsEditMode(!isEditMode);
    }
  };

  // Save profile changes
  const saveProfileChanges = () => {
    // Already saved via updateProfile
    setIsEditMode(false);
  };

  // Handle profile picture upload
  const handleProfilePictureUpload = () => {
    profilePictureRef.current.click();
  };

  // Handle banner image upload
  const handleBannerUpload = () => {
    bannerImageRef.current.click();
  };

  // Handle file selection
  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (type === 'profile') {
        updateProfile({ photoURL: e.target.result });
      } else if (type === 'banner') {
        updateProfile({ bannerURL: e.target.result });
      }
    };
    reader.readAsDataURL(file);
  };  // Handle music URL update with improved persistence
  const handleMusicUpdate = (urlOrTrack) => {
    // If it's a track object, use its URL
    const url = typeof urlOrTrack === 'object' ? urlOrTrack.url : urlOrTrack;
    
    // Create metadata for display
    const displayName = getTrackName(urlOrTrack);
    const metadata = {
      url,
      displayName,
      timestamp: Date.now(),
      version: 2, // Add version to track metadata format
      lastPlayed: null
    };

    const updates = {
      music: metadata,
      musicVisibility: userProfile?.musicVisibility || defaultVisibility.music
    };

    // Ensure we update both Firebase and localStorage
    updateProfile(updates);
    if (userProfile?.uid) {
      const key = `zentro_user_profile_${userProfile.uid}`;
      try {
        const stored = JSON.parse(localStorage.getItem(key) || '{}');
        localStorage.setItem(key, JSON.stringify({
          ...stored,
          ...updates,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error updating localStorage:', error);
      }
    }
    
    setShowMusicModal(false);
  };
  // Handle track selection from music search
  const handleSelectTrack = (track, action) => {
    if (action === 'play') {
      // Play the track
      setCurrentTrack(track);
      setShowMusicPlayer(true);
    } else if (action === 'add') {
      // Add to profile with metadata
      const metadata = {
        url: track.url,
        displayName: `${track.name} - ${track.artist || 'Unknown Artist'}`,
        timestamp: Date.now(),
        version: 2, // Keep metadata format consistent
        lastPlayed: null
      };
      
      const updates = {
        music: metadata,
        musicVisibility: userProfile?.musicVisibility || defaultVisibility.music
      };
      
      updateProfile(updates);
      
      // Ensure localStorage is updated
      if (userProfile?.uid) {
        const key = `zentro_user_profile_${userProfile.uid}`;
        try {
          const stored = JSON.parse(localStorage.getItem(key) || '{}');
          localStorage.setItem(key, JSON.stringify({
            ...stored,
            ...updates,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('Error updating localStorage:', error);
        }
      }
      
      setShowMusicModal(false);
    }
  };

  // Add a comment to media
  const addComment = (mediaType, mediaId) => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      author: userProfile.displayName,
      date: new Date().toISOString(),
      replies: [],
      parentId: replyingTo ? replyingTo.id : null
    };

    // Create a copy of the current state to work with
    let updatedMedia;

    if (mediaType === 'photo') {
      updatedMedia = photos.map(photo => {
        if (photo.id === mediaId) {
          if (replyingTo) {
            // Add reply to comment
            const updatedComments = photo.comments.map(comment => {
              if (comment.id === replyingTo.id) {
                return {
                  ...comment,
                  replies: [...comment.replies, newComment]
                };
              }
              return comment;
            });
            return { ...photo, comments: updatedComments };
          } else {
            // Add new comment
            return { ...photo, comments: [...photo.comments, newComment] };
          }
        }
        return photo;
      });

      // Update state immediately
      setPhotos(updatedMedia);

      // Here you would typically save to Firebase/database
      // For now, we'll use localStorage to persist comments between sessions (user-specific)
      if (userProfile?.uid) {
        localStorage.setItem(`zentro_photos_${userProfile.uid}`, JSON.stringify(updatedMedia));
      }

      // Update selected media if it's the current one
      if (selectedMedia && selectedMedia.data.id === mediaId) {
        const updatedMediaItem = updatedMedia.find(item => item.id === mediaId);
        if (updatedMediaItem) {
          setSelectedMedia({
            ...selectedMedia,
            data: updatedMediaItem
          });
        }
      }

    } else if (mediaType === 'video') {
      updatedMedia = videos.map(video => {
        if (video.id === mediaId) {
          if (replyingTo) {
            // Add reply to comment
            const updatedComments = video.comments.map(comment => {
              if (comment.id === replyingTo.id) {
                return {
                  ...comment,
                  replies: [...comment.replies, newComment]
                };
              }
              return comment;
            });
            return { ...video, comments: updatedComments };
          } else {
            // Add new comment
            return { ...video, comments: [...video.comments, newComment] };
          }
        }
        return video;
      });

      // Update state immediately
      setVideos(updatedMedia);

      // Persist to localStorage (user-specific)
      if (userProfile?.uid) {
        localStorage.setItem(`zentro_videos_${userProfile.uid}`, JSON.stringify(updatedMedia));
      }

      // Update selected media if it's the current one
      if (selectedMedia && selectedMedia.data.id === mediaId) {
        const updatedMediaItem = updatedMedia.find(item => item.id === mediaId);
        if (updatedMediaItem) {
          setSelectedMedia({
            ...selectedMedia,
            data: updatedMediaItem
          });
        }
      }
    }

    // Show a temporary success message
    updateSelectedMediaWithMessage({
      text: 'Comment added successfully!',
      type: 'success'
    });

    setCommentText('');
    setReplyingTo(null);
  };

  // Delete a comment
  const deleteComment = (mediaType, mediaId, commentId, parentId = null) => {
    let updatedMedia;

    if (mediaType === 'photo') {
      updatedMedia = photos.map(photo => {
        if (photo.id === mediaId) {
          if (parentId) {
            // Delete reply
            const updatedComments = photo.comments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies.filter(reply => reply.id !== commentId)
                };
              }
              return comment;
            });
            return { ...photo, comments: updatedComments };
          } else {
            // Delete comment
            return { ...photo, comments: photo.comments.filter(comment => comment.id !== commentId) };
          }
        }
        return photo;
      });

      // Update state immediately
      setPhotos(updatedMedia);

      // Persist to localStorage (user-specific)
      if (userProfile?.uid) {
        localStorage.setItem(`zentro_photos_${userProfile.uid}`, JSON.stringify(updatedMedia));
      }

      // Refresh the selected media if it's the one being commented on
      if (selectedMedia && selectedMedia.data.id === mediaId) {
        const updatedMediaItem = updatedMedia.find(item => item.id === mediaId);
        if (updatedMediaItem) {
          setSelectedMedia({
            ...selectedMedia,
            data: updatedMediaItem
          });
        }
      }

    } else if (mediaType === 'video') {
      updatedMedia = videos.map(video => {
        if (video.id === mediaId) {
          if (parentId) {
            // Delete reply
            const updatedComments = video.comments.map(comment => {
              if (comment.id === parentId) {
                return {
                  ...comment,
                  replies: comment.replies.filter(reply => reply.id !== commentId)
                };
              }
              return comment;
            });
            return { ...video, comments: updatedComments };
          } else {
            // Delete comment
            return { ...video, comments: video.comments.filter(comment => comment.id !== commentId) };
          }
        }
        return video;
      });

      // Update state immediately
      setVideos(updatedMedia);

      // Persist to localStorage (user-specific)
      if (userProfile?.uid) {
        localStorage.setItem(`zentro_videos_${userProfile.uid}`, JSON.stringify(updatedMedia));
      }

      // Refresh the selected media if it's the one being commented on
      if (selectedMedia && selectedMedia.data.id === mediaId) {
        const updatedMediaItem = updatedMedia.find(item => item.id === mediaId);
        if (updatedMediaItem) {
          setSelectedMedia({
            ...selectedMedia,
            data: updatedMediaItem
          });
        }
      }
    }

    // Show a temporary success message
    updateSelectedMediaWithMessage({
      text: 'Comment deleted successfully!',
      type: 'success'
    });
  };

  return (
    <div className="space-y-8">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={profilePictureRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'profile')}
      />
      <input
        type="file"
        ref={bannerImageRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFileSelect(e, 'banner')}
      />

      {/* Profile Header with Banner */}
      <div className="bg-gray-900 border border-purple-500/30 rounded-xl shadow-lg relative overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-48 w-full">
          {displayUser?.bannerURL ? (
            <img
              src={displayUser.bannerURL}
              alt="Profile Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-900 to-blue-900"></div>
          )}

          {/* Banner Edit Button - only show for own profile */}
          {isEditMode && isViewingOwnProfile && (
            <button
              onClick={handleBannerUpload}
              className="absolute bottom-4 right-4 bg-gray-900/80 text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <FaCamera className="h-5 w-5" />
            </button>
          )}

          {/* Glowing effect */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-70"></div>
        </div>

        <div className="p-6 relative">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="relative w-32 h-32 mx-auto md:mx-0 -mt-16 md:-mt-16 z-10">
              {displayUser?.photoURL ? (
                <img
                  src={displayUser.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full border-4 border-gray-900 shadow-[0_0_15px_rgba(147,51,234,0.3)]"
                />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-gray-900 shadow-[0_0_15px_rgba(147,51,234,0.3)] bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {displayUser?.displayName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
              )}
              {isEditMode && isViewingOwnProfile && (
                <button
                  onClick={handleProfilePictureUpload}
                  className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                >
                  <FaCamera className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4 mt-4 md:mt-0">
              {isEditMode && isViewingOwnProfile ? (
                <input
                  type="text"
                  value={displayUser?.displayName || ''}
                  onChange={(e) => handleProfileChange('displayName', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white text-xl font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="Your Name"
                />
              ) : (
                <h2 className="text-2xl font-bold text-white">{displayUser?.displayName || 'Unknown User'}</h2>
              )}

              {isEditMode && isViewingOwnProfile ? (
                <textarea
                  value={displayUser?.bio || ''}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  rows="3"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-300">{displayUser?.bio || 'No bio available'}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                <ProfileField
                  label="Birthday"
                  value={displayUser?.birthDate || ''}
                  field="birthDate"
                  isEditMode={isEditMode && isViewingOwnProfile}
                  onChange={handleProfileChange}
                  type="date"
                  defaultVisibility={defaultVisibility}
                  displayUser={displayUser}
                  isViewingOwnProfile={isViewingOwnProfile}
                  updateVisibility={updateVisibility}
                  canViewField={canViewField}
                />
                <ProfileField
                  label="Relationship"
                  value={displayUser?.relationshipStatus || 'Single'}
                  field="relationshipStatus"
                  isEditMode={isEditMode && isViewingOwnProfile}
                  onChange={handleProfileChange}
                  type="select"
                  options={['Single', 'In a relationship', 'Married', 'It\'s complicated']}
                  defaultVisibility={defaultVisibility}
                  displayUser={displayUser}
                  isViewingOwnProfile={isViewingOwnProfile}
                  updateVisibility={updateVisibility}
                  canViewField={canViewField}
                />
                <ProfileField
                  label="Location"
                  value={displayUser?.location || ''}
                  field="location"
                  isEditMode={isEditMode && isViewingOwnProfile}
                  onChange={handleProfileChange}
                  defaultVisibility={defaultVisibility}
                  displayUser={displayUser}
                  isViewingOwnProfile={isViewingOwnProfile}
                  updateVisibility={updateVisibility}
                  canViewField={canViewField}
                />
              </div>

              {/* Music Player */}
              <div className="flex items-center gap-2">
                <FaMusic className="text-purple-400" />
                {renderMusicSection()}
              </div>

              {/* Friends Section */}
              <FriendsSection />
            </div>

            {/* Profile Actions - only show for own profile */}
            {isViewingOwnProfile && (
              <div className="flex items-center gap-3">
                {isEditMode ? (
                  <button
                    onClick={saveProfileChanges}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={toggleEditMode}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white font-medium transition-colors duration-300"
                  >
                    Edit Profile
                  </button>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors duration-300 flex items-center gap-2"
                  title="Logout"
                >
                  <FaSignOutAlt className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Music URL Modal */}
      {showMusicModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-4xl w-full border border-purple-500/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">Add Your Theme Music</h3>
              <button
                onClick={() => setShowMusicModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Manual URL Input */}
              <div>
                <h4 className="text-lg font-semibold text-purple-400 mb-4">Enter URL</h4>
                <p className="text-gray-300 mb-4">Enter a Spotify, SoundCloud, or YouTube URL:</p>
                <input
                  type="text"
                  defaultValue={displayUser?.music || ''}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white mb-4 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="https://open.spotify.com/track/..."
                  id="musicUrlInput"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => handleMusicUpdate(document.getElementById('musicUrlInput').value)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    Save URL
                  </button>
                </div>
              </div>

              {/* Music Search */}
              <div>
                <h4 className="text-lg font-semibold text-purple-400 mb-4">Search Music</h4>
                <div className="h-[calc(100%-2rem)]">
                  <MusicSearch onSelectTrack={handleSelectTrack} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Music Player Modal */}
      {showMusicPlayer && currentTrack && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-purple-500/30">
            <MusicPlayer
              url={currentTrack.url}
              onClose={() => setShowMusicPlayer(false)}
            />
          </div>
        </div>
      )}

      {/* Personal Enhancement Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mood Tracker */}
        <MoodTracker user={user} isViewingOwnProfile={isViewingOwnProfile} />

        {/* Interests Section */}
        <InterestsSection user={user} isViewingOwnProfile={isViewingOwnProfile} />
      </div>

      {/* Favorites Section */}
      <FavoritesSection user={user} isViewingOwnProfile={isViewingOwnProfile} />

      {/* Posts Section - only show for own profile */}
      {isViewingOwnProfile && <PostsSection />}

      {/* Media Tabs */}
      <div className="bg-gray-900 border border-purple-500/30 rounded-xl shadow-lg overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-800">
          <TabButton
            active={activeTab === 'photos'}
            onClick={() => setActiveTab('photos')}
            label="Photos"
          />
          <TabButton
            active={activeTab === 'videos'}
            onClick={() => setActiveTab('videos')}
            label="Videos"
          />
          {isViewingOwnProfile && (
            <TabButton
              active={activeTab === 'blog'}
              onClick={() => setActiveTab('blog')}
              label="My Blog Posts"
            />
          )}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'photos' && (
            <div>
              {/* Add Photo Button - only show for own profile */}
              {isViewingOwnProfile && (
                <div className="flex justify-end mb-4">
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2">
                    <FaImage className="h-4 w-4" />
                    Add Photo
                  </button>
                </div>
              )}

              {/* Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map(photo => (
                  <div
                    key={photo.id}
                    className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300 shadow-lg group"
                  >
                    <div
                      className="aspect-square bg-gray-700 relative cursor-pointer"
                      onClick={() => setSelectedMedia({ type: 'photo', data: photo })}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-1">{photo.caption}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{photo.date}</span>
                        <div className="flex items-center gap-2">
                          <button className="text-pink-400 hover:text-pink-300 transition-colors">
                            <FaHeart />
                          </button>
                          <span className="text-gray-300">{photo.likes}</span>
                          <button
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            onClick={() => setSelectedMedia({ type: 'photo', data: photo })}
                          >
                            <FaComment />
                          </button>
                          <span className="text-gray-300">{photo.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div>
              {/* Add Video Button - only show for own profile */}
              {isViewingOwnProfile && (
                <div className="flex justify-end mb-4">
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center gap-2">
                    <FaVideo className="h-4 w-4" />
                    Add Video
                  </button>
                </div>
              )}

              {/* Videos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {videos.map(video => (
                  <div
                    key={video.id}
                    className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500/30 transition-all duration-300 shadow-lg"
                  >
                    <div className="aspect-video bg-gray-700 relative">
                      <video
                        src={video.url}
                        poster={video.thumbnail}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-medium mb-1">{video.caption}</h3>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">{video.date}</span>
                        <div className="flex items-center gap-2">
                          <button className="text-pink-400 hover:text-pink-300 transition-colors">
                            <FaHeart />
                          </button>
                          <span className="text-gray-300">{video.likes}</span>
                          <button
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                            onClick={() => setSelectedMedia({ type: 'video', data: video })}
                          >
                            <FaComment />
                          </button>
                          <span className="text-gray-300">{video.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'blog' && isViewingOwnProfile && (
            <BlogPostsView />
          )}
        </div>
      </div>

      {/* Media Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-purple-500/30 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{selectedMedia.data.caption}</h3>
              <button
                onClick={() => setSelectedMedia(null)}
                className="text-gray-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            {/* Media Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-4">
                {selectedMedia.type === 'photo' ? (
                  <img
                    src={selectedMedia.data.url}
                    alt={selectedMedia.data.caption}
                    className="max-w-full max-h-[50vh] mx-auto rounded-lg"
                  />
                ) : (
                  <video
                    src={selectedMedia.data.url}
                    controls
                    className="max-w-full max-h-[50vh] mx-auto rounded-lg"
                  />
                )}

                {/* Comments Section */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Comments</h4>

                  {/* Status Message */}
                  {selectedMedia.message && (
                    <div className={`mb-4 p-3 rounded-lg ${
                      selectedMedia.message.type === 'success'
                        ? 'bg-green-900/20 border border-green-800 text-green-400'
                        : 'bg-red-900/20 border border-red-800 text-red-400'
                    }`}>
                      {selectedMedia.message.text}
                    </div>
                  )}

                  {/* Comment List */}
                  <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2">
                    {selectedMedia.data.comments.length === 0 ? (
                      <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                    ) : (
                      selectedMedia.data.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                          <div className="flex justify-between">
                            <span className="font-medium text-white">{comment.author}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setReplyingTo(comment)}
                                className="text-blue-400 hover:text-blue-300 text-sm"
                              >
                                Reply
                              </button>
                              <button
                                onClick={() => deleteComment(selectedMedia.type, selectedMedia.data.id, comment.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                <FaTrash className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-300 mt-1">{comment.text}</p>

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-6 mt-2 space-y-2">
                              {comment.replies.map(reply => (
                                <div key={reply.id} className="bg-gray-700 rounded-lg p-2">
                                  <div className="flex justify-between">
                                    <span className="font-medium text-white">{reply.author}</span>
                                    <button
                                      onClick={() => deleteComment(selectedMedia.type, selectedMedia.data.id, reply.id, comment.id)}
                                      className="text-red-400 hover:text-red-300 text-sm"
                                    >
                                      <FaTrash className="h-3 w-3" />
                                    </button>
                                  </div>
                                  <p className="text-gray-300 mt-1">{reply.text}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment Form */}
                  <div className="mt-4">
                    {replyingTo && (
                      <div className="bg-blue-900/20 p-2 rounded-lg mb-2 flex justify-between items-center">
                        <span className="text-sm text-blue-400">
                          Replying to {replyingTo.author}
                        </span>
                        <button
                          onClick={() => setReplyingTo(null)}
                          className="text-gray-400 hover:text-white text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      />
                      <button
                        onClick={() => addComment(selectedMedia.type, selectedMedia.data.id)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                      >
                        {replyingTo ? 'Reply' : 'Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalView;
