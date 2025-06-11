import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, provider, clearAuthState } from '../firebase';
import { FaGoogle, FaFacebook, FaGithub, FaUser, FaEnvelope, FaLock, FaSpinner, FaCalendarAlt, FaEye, FaEyeSlash, FaRocket, FaStar, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  // Clear any existing auth state when the signup page loads
  useEffect(() => {
    const clearExistingAuth = async () => {
      await clearAuthState();
    };

    clearExistingAuth();
  }, []);

  // Password strength checker
  useEffect(() => {
    const calculatePasswordStrength = (pwd) => {
      let strength = 0;
      if (pwd.length >= 8) strength += 25;
      if (/[a-z]/.test(pwd)) strength += 25;
      if (/[A-Z]/.test(pwd)) strength += 25;
      if (/[0-9]/.test(pwd)) strength += 25;
      return strength;
    };

    setPasswordStrength(calculatePasswordStrength(password));
  }, [password]);

  // Get password strength color and text
  const getPasswordStrengthInfo = () => {
    if (passwordStrength === 0) return { color: 'gray', text: '' };
    if (passwordStrength <= 25) return { color: 'red', text: 'Weak' };
    if (passwordStrength <= 50) return { color: 'yellow', text: 'Fair' };
    if (passwordStrength <= 75) return { color: 'blue', text: 'Good' };
    return { color: 'green', text: 'Strong' };
  };

  // Validation functions
  const validateStep1 = () => {
    if (!fullName.trim()) return 'Full name is required';
    if (!username.trim()) return 'Username is required';
    if (!email.trim()) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) return 'Please enter a valid email';
    return null;
  };

  const validateStep2 = () => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (password !== confirmPassword) return 'Passwords do not match';
    if (!birthDate) return 'Birth date is required';

    const age = calculateAge(birthDate);
    if (age < 13) return 'You must be at least 13 years old to join Zentro';
    if (age > 120) return 'Please enter a valid birth date';

    if (!agreedToTerms) return 'You must agree to the terms and conditions';
    return null;
  };

  // Handle next step
  const handleNextStep = () => {
    const error = validateStep1();
    if (error) {
      setError(error);
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  // Handle previous step
  const handlePrevStep = () => {
    setError('');
    setCurrentStep(1);
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validate all fields
    const step2Error = validateStep2();
    if (step2Error) {
      setError(step2Error);
      setLoading(false);
      return;
    }

    try {
      // First ensure we're starting with a clean state
      await clearAuthState();

      // Create the new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update the profile
      await updateProfile(userCredential.user, {
        displayName: username || fullName,
        photoURL: null, // Will be updated later when user uploads profile picture
      });

      // Store user info in localStorage for persistence
      localStorage.setItem('zentro_user_displayName', username || fullName);
      localStorage.setItem('zentro_user_email', email);
      localStorage.setItem('zentro_user_birthDate', birthDate);
      localStorage.setItem('zentro_user_age', calculateAge(birthDate).toString());

      // Navigate to chat
      navigate('/chat');
    } catch (error) {
      console.error('Signup error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle Google signup
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      // Clear any existing auth state first
      await clearAuthState();

      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Store user info in localStorage for persistence
      if (user) {
        localStorage.setItem('zentro_user_displayName', user.displayName || '');
        localStorage.setItem('zentro_user_email', user.email || '');
      }

      navigate('/chat');
    } catch (error) {
      console.error('Google signup error:', error);
      setError(getErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  // Handle GitHub signup
  const handleGithubSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      // For now, show a message that GitHub signup is coming soon
      setError('GitHub signup is coming soon! Please use Google or email/password for now.');
    } catch (error) {
      console.error('GitHub signup error:', error);
      setError('GitHub signup failed. Please try another method.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Facebook signup
  const handleFacebookSignUp = async () => {
    setLoading(true);
    setError('');

    try {
      // For now, show a message that Facebook signup is coming soon
      setError('Facebook signup is coming soon! Please use Google or email/password for now.');
    } catch (error) {
      console.error('Facebook signup error:', error);
      setError('Facebook signup failed. Please try another method.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Get user-friendly error messages
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/popup-closed-by-user':
        return 'Sign-up was cancelled.';
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
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
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
                  <span className="text-gray-400 text-sm">Join the Future</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-2xl lg:text-3xl font-semibold text-white">
                Create your digital identity
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Join millions of users in our next-generation social platform.
                Connect, create, and explore like never before.
              </p>

              <div className="grid grid-cols-1 gap-4 mt-6">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-purple-500/20">
                  <FaShieldAlt className="text-purple-400" />
                  <span className="text-sm text-gray-300">Privacy-first approach</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-cyan-500/20">
                  <FaRocket className="text-cyan-400" />
                  <span className="text-sm text-gray-300">Cutting-edge features</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Signup Form */}
          <motion.div
            className="w-full max-w-md mx-auto"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
              {/* Form Header */}
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Join Zentro</h3>
                <p className="text-gray-400">Create your account in 2 simple steps</p>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 mt-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep >= 1 ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    {currentStep > 1 ? <FaCheckCircle /> : '1'}
                  </div>
                  <div className={`w-8 h-1 rounded transition-all duration-300 ${
                    currentStep >= 2 ? 'bg-purple-600' : 'bg-white/10'
                  }`} />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    currentStep >= 2 ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-400'
                  }`}>
                    2
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {currentStep === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 1: Basic Information */}
                    <div className="space-y-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Basic Information</h4>

                      {/* Full Name */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Full Name</label>
                        <div className="relative group">
                          <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            type="text"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      {/* Username */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Username</label>
                        <div className="relative group">
                          <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Email Address</label>
                        <div className="relative group">
                          <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                            required
                          />
                        </div>
                      </div>

                      {/* Next Button */}
                      <motion.button
                        type="button"
                        onClick={handleNextStep}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative flex items-center justify-center space-x-2">
                          <span>Continue</span>
                          <FaRocket className="text-sm" />
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 2: Security & Verification */}
                    <form onSubmit={handleSignUp} className="space-y-6">
                      <h4 className="text-lg font-semibold text-white mb-4">Security & Verification</h4>

                      {/* Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Password</label>
                        <div className="relative group">
                          <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a strong password"
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

                        {/* Password Strength Indicator */}
                        {password && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-400">Password Strength</span>
                              <span className={`text-xs font-medium ${
                                getPasswordStrengthInfo().color === 'red' ? 'text-red-400' :
                                getPasswordStrengthInfo().color === 'yellow' ? 'text-yellow-400' :
                                getPasswordStrengthInfo().color === 'blue' ? 'text-blue-400' :
                                getPasswordStrengthInfo().color === 'green' ? 'text-green-400' : 'text-gray-400'
                              }`}>
                                {getPasswordStrengthInfo().text}
                              </span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  getPasswordStrengthInfo().color === 'red' ? 'bg-red-500' :
                                  getPasswordStrengthInfo().color === 'yellow' ? 'bg-yellow-500' :
                                  getPasswordStrengthInfo().color === 'blue' ? 'bg-blue-500' :
                                  getPasswordStrengthInfo().color === 'green' ? 'bg-green-500' : 'bg-gray-500'
                                }`}
                                style={{ width: `${passwordStrength}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Confirm Password</label>
                        <div className="relative group">
                          <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      {/* Birth Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Date of Birth</label>
                        <div className="relative group">
                          <FaCalendarAlt className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          You must be at least 13 years old to join Zentro
                          {birthDate && ` (You are ${calculateAge(birthDate)} years old)`}
                        </p>
                      </div>

                      {/* Terms Agreement */}
                      <div className="space-y-4">
                        <label className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-5 h-5 mt-0.5 rounded border-gray-600 bg-white/5 text-purple-500 focus:ring-purple-500/20"
                          />
                          <span className="text-sm text-gray-300 leading-relaxed">
                            I agree to the{' '}
                            <button type="button" className="text-purple-400 hover:text-purple-300 underline">
                              Terms of Service
                            </button>{' '}
                            and{' '}
                            <button type="button" className="text-purple-400 hover:text-purple-300 underline">
                              Privacy Policy
                            </button>
                          </span>
                        </label>
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

                      {/* Action Buttons */}
                      <div className="flex space-x-3">
                        <motion.button
                          type="button"
                          onClick={handlePrevStep}
                          className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-300"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Back
                        </motion.button>
                        <motion.button
                          type="submit"
                          disabled={loading}
                          className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 relative overflow-hidden group disabled:opacity-50"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="relative flex items-center justify-center space-x-2">
                            {loading ? (
                              <FaSpinner className="animate-spin" />
                            ) : (
                              <>
                                <span>Create Account</span>
                                <FaRocket className="text-sm" />
                              </>
                            )}
                          </span>
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* OR Divider - Only show on step 1 */}
              {currentStep === 1 && (
                <>
                  <div className="flex items-center my-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                    <span className="px-4 text-sm text-gray-400">OR</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>

                  {/* Social Login */}
                  <div className="space-y-3">
                    <motion.button
                      type="button"
                      onClick={handleGoogleSignUp}
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
                        onClick={handleGithubSignUp}
                        disabled={loading}
                        className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaGithub className="text-gray-300" />
                        <span>GitHub</span>
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={handleFacebookSignUp}
                        disabled={loading}
                        className="py-3 px-4 bg-white/5 border border-white/10 rounded-xl text-white font-medium hover:bg-white/10 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <FaFacebook className="text-blue-400" />
                        <span>Facebook</span>
                      </motion.button>
                    </div>
                  </div>
                </>
              )}

              {/* Login Link */}
              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
