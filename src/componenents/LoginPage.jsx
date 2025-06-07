import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../firebase';
import { FaRocket, FaGoogle, FaGithub, FaFacebook, FaEnvelope, FaLock, FaSpinner, FaEye, FaEyeSlash, FaStar, FaShieldAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('zentro_remember_email');
    const savedRemember = localStorage.getItem('zentro_remember_me') === 'true';

    if (savedEmail && savedRemember) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Handle email/password login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('zentro_remember_email', email);
        localStorage.setItem('zentro_remember_me', 'true');
      } else {
        localStorage.removeItem('zentro_remember_email');
        localStorage.removeItem('zentro_remember_me');
      }

      // Store user info
      localStorage.setItem('zentro_user_displayName', userCredential.user.displayName || '');
      localStorage.setItem('zentro_user_email', userCredential.user.email || '');

      navigate('/chat');
    } catch (error) {
      console.error('Login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store user info
      localStorage.setItem('zentro_user_displayName', user.displayName || '');
      localStorage.setItem('zentro_user_email', user.email || '');

      navigate('/chat');
    } catch (error) {
      console.error('Google login error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'No account found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-600/20 to-cyan-400/20 blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-100, 50, -100],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-cyan-400/15 to-purple-600/15 blur-3xl"
          animate={{
            x: [100, -100, 100],
            y: [100, -50, 100],
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ bottom: '10%', right: '10%' }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">

          {/* Left Side - Branding */}
          <motion.div
            className="text-center lg:text-left space-y-8"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <motion.div
                className="text-6xl"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                🚀
              </motion.div>
              <div>
                <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                  Zentro
                </h1>
                <div className="flex items-center space-x-2 mt-2">
                  <FaStar className="text-yellow-400 text-sm" />
                  <span className="text-gray-400 text-sm">Next-Gen Social Platform</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-white">
                Welcome back to the future
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Connect, chat, and explore in our immersive digital universe.
                Your journey continues here.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-500/20">
                  <FaShieldAlt className="text-purple-400" />
                  <span className="text-sm text-gray-300">Secure & Private</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/20">
                  <FaRocket className="text-cyan-400" />
                  <span className="text-sm text-gray-300">Lightning Fast</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Welcome Back</h3>
                <p className="text-gray-400">Sign in to continue your journey</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-6">
                {/* Email Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email or Username</label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type="text"
                      placeholder="Enter your email or username"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-white/5 text-purple-500 focus:ring-purple-500/20"
                    />
                    <span className="text-sm text-gray-300">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Sign In Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center space-x-2">
                    {loading ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <span>Sign In</span>
                        <FaRocket className="text-sm" />
                      </>
                    )}
                  </span>
                </motion.button>
              </form>

              {/* OR Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <span className="px-4 text-sm text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-3 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaGoogle className="text-red-400 group-hover:text-red-300" />
                  <span>Continue with Google</span>
                </motion.button>

                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    type="button"
                    className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaGithub className="text-gray-300" />
                    <span>GitHub</span>
                  </motion.button>
                  <motion.button
                    type="button"
                    className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaFacebook className="text-blue-400" />
                    <span>Facebook</span>
                  </motion.button>
                </div>
              </div>

              {/* Sign Up Link */}
              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <p className="text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Create one
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
