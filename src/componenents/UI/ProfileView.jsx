import React, { useRef, useState, useEffect } from "react";

const mockUser = {
  username: "your_username",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  bio: "Hey there! Welcome to my profile. 🚀",
  posts: [
    { type: "image", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80" },
    { type: "video", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { type: "image", url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80" },
  ],
  followers: 123,
  following: 456,
};

const ProfileView = ({ user }) => {
  const [profile, setProfile] = useState(user || mockUser);
  const fileInputRef = useRef();

  useEffect(() => {
    setProfile(user || mockUser);
  }, [user]);

  const handleAddPost = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const type = file.type.startsWith("video") ? "video" : "image";
    setProfile((prev) => ({
      ...prev,
      posts: [{ type, url }, ...prev.posts],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-black via-purple-900 to-black text-white p-6">
      <div className="w-full max-w-2xl bg-black bg-opacity-60 rounded-xl shadow-lg p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 mb-8">
          <img
            src={profile.avatar}
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-purple-600 shadow-lg"
          />
          <div className="flex-1 flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-2xl font-bold">{profile.username}</span>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
                onClick={() => alert("Edit Profile Coming Soon!")}
              >
                ✏️ Edit Profile
              </button>
              <button
                className="px-4 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 transition-all"
                onClick={() => fileInputRef.current.click()}
              >
                ➕ Add Post
              </button>
              <input
                type="file"
                accept="image/*,video/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleAddPost}
              />
            </div>
            <div className="flex gap-8 text-center mb-2">
              <div>
                <span className="font-bold">{profile.posts.length}</span>
                <div className="text-xs text-gray-400">Posts</div>
              </div>
              <div>
                <span className="font-bold">{profile.followers}</span>
                <div className="text-xs text-gray-400">Followers</div>
              </div>
              <div>
                <span className="font-bold">{profile.following}</span>
                <div className="text-xs text-gray-400">Following</div>
              </div>
            </div>
            <div className="text-gray-300 text-sm mt-2 text-center sm:text-left">{profile.bio}</div>
          </div>
        </div>
        {/* Posts Grid */}
        <div>
          <h3 className="text-lg font-semibold text-purple-300 mb-4">Posts</h3>
          {profile.posts.length === 0 ? (
            <div className="text-gray-400 text-center py-10">No posts yet.</div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {profile.posts.map((post, idx) =>
                post.type === "image" ? (
                  <img
                    key={idx}
                    src={post.url}
                    alt="post"
                    className="w-full h-36 object-cover rounded-lg"
                  />
                ) : (
                  <video
                    key={idx}
                    src={post.url}
                    controls
                    className="w-full h-36 object-cover rounded-lg bg-black"
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;