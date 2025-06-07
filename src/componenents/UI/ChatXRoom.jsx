import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Picker from "emoji-picker-react";
import { GiphyFetch } from "@giphy/js-fetch-api";
import { FiSend, FiSettings } from "react-icons/fi";
import { FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import ProfileContentDropdown from "../../components/UI/ProfileContentDropdown";
import ContentViewModal from "../../components/UI/ContentViewModal";
import { clearAuthState } from "../../firebase";

const gf = new GiphyFetch("RcJA9uwzebyVHzMskJn5DlbcnrpKKAzc");

function GifSection({ gifSearch, gf, onGifClick }) {
  const [loading, setLoading] = React.useState(true);
  const [gifs, setGifs] = React.useState([]);
  const [noResults, setNoResults] = React.useState(false);
  const [offset, setOffset] = React.useState(0);
  const [hasMore, setHasMore] = React.useState(true);
  const containerRef = React.useRef(null);

  // Fetch GIFs
  const fetchGifs = React.useCallback(
    async (reset = false) => {
      setLoading(true);
      const limit = 10;
      const res = gifSearch
        ? await gf.search(gifSearch, { limit, offset: reset ? 0 : offset })
        : await gf.trending({ limit, offset: 0 });
      if (reset) {
        setGifs(res.data);
      } else {
        setGifs(prev => [...prev, ...res.data]);
      }
      setNoResults(res.data.length === 0 && (reset || gifs.length === 0));
      setHasMore(res.pagination.total_count > (reset ? 0 : offset) + res.data.length);
      setLoading(false);
      if (reset) setOffset(limit);
      else setOffset(prev => prev + limit);
    },
    [gifSearch, gf, offset, gifs.length]
  );

  // Initial/trending or search
  React.useEffect(() => {
    fetchGifs(true);
    // eslint-disable-next-line
  }, [gifSearch, gf]);

  // Infinite scroll for search
  const handleScroll = (e) => {
    if (
      gifSearch &&
      hasMore &&
      !loading &&
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 100
    ) {
      fetchGifs();
    }
  };

  return (
    <div
      className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto"
      ref={containerRef}
      onScroll={handleScroll}
      style={{ minHeight: 220 }}
    >
      {gifs.map(gif => (
        <img
          key={gif.id}
          src={gif.images.fixed_height.url}
          alt={gif.title}
          className="rounded-lg cursor-pointer hover:scale-105 hover:ring-2 hover:ring-purple-400 transition-transform duration-150"
          onClick={e => onGifClick(gif, e)}
          style={{ width: "100%", height: "150px", objectFit: "cover" }}
        />
      ))}
      {loading && (
        <div className="col-span-2 flex justify-center items-center h-20">
          <ImSpinner2 className="animate-spin text-3xl text-purple-400" />
        </div>
      )}
      {noResults && !loading && (
        <div className="col-span-2 text-center text-gray-400 py-10">No GIFs found.</div>
      )}
    </div>
  );
}

const ChatXRoom = ({ players, setCurrentView }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [gifSearch, setGifSearch] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const textareaRef = useRef(null);

  // Handle logout
  const handleLogout = async () => {
    try {
      await clearAuthState();
      // Clear all Zentro-related localStorage items
      localStorage.removeItem('zentro_user_displayName');
      localStorage.removeItem('zentro_user_email');
      localStorage.removeItem('zentro_user_age');
      localStorage.removeItem('zentro_remember_email');
      localStorage.removeItem('zentro_remember_me');
      localStorage.removeItem('zentro_profile_view');

      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([
        ...messages,
        { sender: "You", text: inputMessage, avatar: userProfileImage },
      ]);
      setInputMessage("");
      if (textareaRef.current) textareaRef.current.style.height = "44px";
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setInputMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "44px";
        textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
      }
    }, 0);
  };

  // Prevent redirect to Giphy on GIF click
  const handleGifClick = (gif, e) => {
    if (e) e.preventDefault();
    setMessages([
      ...messages,
      { sender: "You", text: gif.images.fixed_height.url, avatar: userProfileImage },
    ]);
    setShowGifPicker(false);
    setGifSearch("");
  };

  // Avatar rendering
  const getAvatar = (sender, avatarUrl) =>
    sender === "You"
      ? userProfileImage ? (
          <img
            src={userProfileImage}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-purple-600 shadow"
          />
        ) : (
          <FaUserCircle className="w-8 h-8 text-purple-400 bg-black rounded-full shadow" />
        )
      : avatarUrl ? (
          <img
            src={avatarUrl}
            alt="profile"
            className="w-8 h-8 rounded-full object-cover border-2 border-gray-700 shadow"
          />
        ) : (
          <FaUserCircle className="w-8 h-8 text-gray-400 bg-black rounded-full shadow" />
        );

  // Handle profile image upload
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUserProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
    setShowProfile(false);
  };

  // Settings dropdown
  const handleSettingsClick = () => setShowSettings((v) => !v);
  const handleLeaveRoom = () => setCurrentView("chat");

  // Handle content selection from dropdown
  const handleContentSelect = ({ content, type }) => {
    setSelectedContent({ content, type });
    setShowContentModal(true);
    setShowProfileDropdown(false);
  };

  // Close content modal
  const handleCloseContentModal = () => {
    setShowContentModal(false);
    setSelectedContent(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      {/* Static Header */}
      <div className="fixed top-0 left-0 right-0 z-20 bg-purple-800 p-4 flex items-center justify-between shadow-md">
        <h1 className="text-2xl font-bold">ChatX Room</h1>
        <div className="flex items-center gap-2 relative">
          <button
            className="text-3xl text-white hover:text-purple-300 transition"
            onClick={() => setShowProfile((v) => !v)}
            title="Set Profile Picture"
          >
            {userProfileImage ? (
              <img
                src={userProfileImage}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <FaUserCircle />
            )}
          </button>
          <button
            className="text-2xl text-white hover:text-purple-300 transition"
            onClick={handleSettingsClick}
            title="Settings"
          >
            <FiSettings />
          </button>
          {/* Settings Dropdown */}
          {showSettings && (
            <div className="absolute right-0 top-12 bg-gray-900 rounded-lg shadow-lg py-2 w-40 z-50 border border-purple-500/20">
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-white flex items-center gap-2 transition-colors"
                onClick={() => {
                  setShowSettings(false);
                  handleLeaveRoom();
                }}
              >
                <span>🚪</span>
                Leave Room
              </button>
              <div className="border-t border-gray-700 my-1"></div>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-800 text-sm text-red-400 flex items-center gap-2 transition-colors"
                onClick={() => {
                  setShowSettings(false);
                  handleLogout();
                }}
              >
                <FaSignOutAlt className="text-xs" />
                Logout
              </button>
            </div>
          )}
        </div>
        {/* Profile Image Upload Modal */}
        {showProfile && (
          <div className="absolute top-20 right-8 bg-gray-900 p-4 rounded-xl shadow-lg z-50 flex flex-col items-center">
            <label className="mb-2 text-sm">Upload Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="mb-2"
            />
            <button
              className="text-xs text-gray-400 hover:text-white"
              onClick={() => setShowProfile(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Content (with top margin for fixed header) */}
      <div className="flex-1 flex flex-col justify-between mt-20">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto px-0 py-6 flex flex-col gap-4">
          {messages.length > 0 ? (
            messages.map((message, index) => {
              const isUser = message.sender === "You";
              return (
                <div
                  key={index}
                  className={`flex items-end gap-2 px-4 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && getAvatar(message.sender, message.avatar)}
                  <div
                    className={`
                      ${isUser ? "bg-purple-600 text-white" : "bg-gray-800 text-white"}
                      rounded-2xl px-4 py-2 shadow-md
                      ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}
                      max-w-[70%] break-words
                    `}
                  >
                    <div className="text-xs font-semibold mb-1 opacity-70">{message.sender}</div>
                    {(() => {
                      // Enhanced GIF detection
                      const isGifUrl = (url) => {
                        if (!url || typeof url !== 'string') return false;
                        return url.includes('giphy.com') || url.includes('tenor.com') || url.match(/\.(gif|webp)(\?|$)/i);
                      };

                      if (message.text && isGifUrl(message.text)) {
                        return (
                          <div className="space-y-2">
                            <img
                              src={message.text}
                              alt="GIF"
                              className="rounded-xl max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ maxHeight: '200px', maxWidth: '250px' }}
                              onClick={() => window.open(message.text, '_blank')}
                              onError={(e) => {
                                // Fallback to text if image fails to load
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <span
                              className="whitespace-pre-line text-blue-300 underline cursor-pointer"
                              style={{ display: 'none' }}
                              onClick={() => window.open(message.text, '_blank')}
                            >
                              {message.text}
                            </span>
                          </div>
                        );
                      }

                      return <span className="whitespace-pre-line">{message.text}</span>;
                    })()}
                  </div>
                  {isUser && getAvatar(message.sender, message.avatar)}
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-400">No messages yet. Start the conversation!</p>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-[#23272a] p-4 flex items-center gap-2 relative rounded-b-2xl shadow-lg">
          <button
            className="text-2xl text-purple-400 hover:text-purple-300 transition mr-1"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            😊
          </button>
          <button
            className="text-2xl text-purple-400 hover:text-purple-300 transition mr-1"
            onClick={() => setShowGifPicker(!showGifPicker)}
          >
            🎥
          </button>
          <button
            className="text-2xl text-purple-400 hover:text-purple-300 transition mr-1"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            title="View Profile Content"
          >
            👤
          </button>
          <textarea
            ref={textareaRef}
            className="flex-1 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-black resize-none max-h-40 min-h-[44px] overflow-y-auto bg-white"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            rows={1}
            style={{ height: "44px" }}
          />
          <button
            className="bg-purple-600 px-4 py-2 rounded-xl hover:bg-purple-700 transition flex items-center justify-center ml-2"
            onClick={handleSendMessage}
          >
            <FiSend className="text-white text-xl" />
          </button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
            <div className="absolute bottom-16 left-4 z-10">
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          {/* GIF Picker with Search, Clear, Close, Hover, Large GIFs */}
          {showGifPicker && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black rounded-xl p-4 z-10 w-[400px] shadow-lg flex flex-col">
              <div className="flex items-center mb-3 gap-2">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 rounded bg-gray-800 text-white focus:outline-none"
                  placeholder="Search GIFs"
                  value={gifSearch}
                  onChange={e => setGifSearch(e.target.value)}
                />
                {gifSearch && (
                  <button
                    className="text-gray-400 hover:text-white text-xl px-2"
                    onClick={() => setGifSearch("")}
                    title="Clear"
                  >✕</button>
                )}
                <button
                  className="text-gray-400 hover:text-white text-base px-2"
                  onClick={() => setShowGifPicker(false)}
                  title="Close"
                >Close</button>
              </div>
              <GifSection
                gifSearch={gifSearch}
                gf={gf}
                onGifClick={handleGifClick}
              />
            </div>
          )}

          {/* Profile Content Dropdown */}
          {showProfileDropdown && (
            <ProfileContentDropdown
              onContentSelect={handleContentSelect}
              onClose={() => setShowProfileDropdown(false)}
            />
          )}
        </div>
      </div>

      {/* Content View Modal */}
      {showContentModal && selectedContent && (
        <ContentViewModal
          content={selectedContent.content}
          type={selectedContent.type}
          onClose={handleCloseContentModal}
        />
      )}
    </div>
  );
};

export default ChatXRoom;