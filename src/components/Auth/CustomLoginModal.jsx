import React, { useState } from 'react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../firebase';
import { FaGoogle, FaEnvelope, FaLock, FaSpinner, FaTimes } from 'react-icons/fa';

const CustomLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onSuccess(userCredential.user);
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      // Create a Google provider instance
      const provider = new GoogleAuthProvider();

      // Get Google Auth URL
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.REACT_APP_FIREBASE_CLIENT_ID}&redirect_uri=${window.location.origin}/auth/callback&scope=email%20profile&response_type=token&state=google`;

      // Open a popup window
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2.5;

      const popup = window.open(
        authUrl,
        'googleAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      // Poll the popup to check for completion
      const checkPopup = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopup);
          setLoading(false);

          // Check if we have auth data in localStorage (would be set by the callback page)
          const authData = localStorage.getItem('googleAuthData');
          if (authData) {
            try {
              const { idToken, accessToken } = JSON.parse(authData);
              const credential = GoogleAuthProvider.credential(idToken, accessToken);
              signInWithCredential(auth, credential)
                .then(result => {
                  localStorage.removeItem('googleAuthData'); // Clean up
                  onSuccess(result.user);
                })
                .catch(error => {
                  setError(error.message);
                  setLoading(false);
                });
            } catch (e) {
              setError('Failed to process authentication data');
              setLoading(false);
            }
          }
        }
      }, 1000);
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-purple-500/30 rounded-xl p-6 max-w-md w-full shadow-lg animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Sign In</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 border border-gray-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <FaSpinner className="animate-spin mx-auto" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-700" />
          <span className="px-3 text-gray-400">OR</span>
          <hr className="flex-grow border-gray-700" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 flex items-center justify-center gap-2 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors duration-300 border border-gray-700 disabled:opacity-50"
        >
          <FaGoogle />
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default CustomLoginModal;
