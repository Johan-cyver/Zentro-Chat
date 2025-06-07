import { useState, useEffect, useCallback } from 'react';
import zentroBotAI from '../services/geminiAI';

/**
 * useCompanionFeatures - Custom hook for ZentroBot companion features
 * 
 * Features:
 * - Persona management
 * - Achievement tracking
 * - Daily prompts
 * - User stats
 * - Memory system
 */
export const useCompanionFeatures = (userId, userProfile) => {
  const [currentPersona, setCurrentPersona] = useState('chill_friend');
  const [userStats, setUserStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [dailyPrompt, setDailyPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize companion features when user is available
  useEffect(() => {
    if (userId && !isInitialized) {
      initializeFeatures();
    }
  }, [userId, isInitialized]);

  // Update features when user profile changes
  useEffect(() => {
    if (userId && userProfile && isInitialized) {
      updateSuggestions();
      updateDailyPrompt();
    }
  }, [userProfile, isInitialized]);

  const initializeFeatures = useCallback(() => {
    if (!userId) return;

    try {
      // Load current persona
      const savedPersona = zentroBotAI.getPersona(userId);
      setCurrentPersona(savedPersona);

      // Load user stats
      const stats = zentroBotAI.getUserStats(userId);
      setUserStats(stats);

      // Load achievements
      const userAchievements = zentroBotAI.getUserAchievements(userId);
      setAchievements(userAchievements);

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing companion features:', error);
    }
  }, [userId]);

  const updateSuggestions = useCallback(() => {
    if (!userId || !userProfile) return;

    try {
      const newSuggestions = zentroBotAI.generateInterestBasedSuggestions(userId, userProfile);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error updating suggestions:', error);
    }
  }, [userId, userProfile]);

  const updateDailyPrompt = useCallback(() => {
    if (!userId) return;

    try {
      const prompt = zentroBotAI.generateDailyPrompt(userId, userProfile);
      setDailyPrompt(prompt);
    } catch (error) {
      console.error('Error updating daily prompt:', error);
    }
  }, [userId, userProfile]);

  const changePersona = useCallback((newPersonaId) => {
    if (!userId) return false;

    try {
      const success = zentroBotAI.setPersona(userId, newPersonaId);
      if (success) {
        setCurrentPersona(newPersonaId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error changing persona:', error);
      return false;
    }
  }, [userId]);

  const checkForAchievements = useCallback((message) => {
    if (!userId) return [];

    try {
      const newAchievements = zentroBotAI.checkAchievements(userId, message);
      if (newAchievements.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements]);
        
        // Update stats after new achievements
        const updatedStats = zentroBotAI.getUserStats(userId);
        setUserStats(updatedStats);
      }
      return newAchievements;
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }, [userId]);

  const refreshStats = useCallback(() => {
    if (!userId) return;

    try {
      const stats = zentroBotAI.getUserStats(userId);
      setUserStats(stats);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  }, [userId]);

  const getPersonaInfo = useCallback((personaId) => {
    return zentroBotAI.getPersonaInfo(personaId || currentPersona);
  }, [currentPersona]);

  const getAllPersonas = useCallback(() => {
    return zentroBotAI.getAllPersonas();
  }, []);

  const getMemoryContext = useCallback(() => {
    if (!userId) return null;

    try {
      const memory = zentroBotAI.userMemory.get(userId);
      return memory;
    } catch (error) {
      console.error('Error getting memory context:', error);
      return null;
    }
  }, [userId]);

  const refreshDailyPrompt = useCallback(() => {
    if (!userId) return;

    try {
      // Clear today's prompt to force regeneration
      zentroBotAI.dailyPrompts.delete(userId);
      const newPrompt = zentroBotAI.generateDailyPrompt(userId, userProfile);
      setDailyPrompt(newPrompt);
    } catch (error) {
      console.error('Error refreshing daily prompt:', error);
    }
  }, [userId, userProfile]);

  const getConversationStreak = useCallback(() => {
    if (!userId) return 0;

    try {
      return zentroBotAI.getConversationStreak(userId);
    } catch (error) {
      console.error('Error getting conversation streak:', error);
      return 0;
    }
  }, [userId]);

  const getLevelProgress = useCallback(() => {
    if (!userStats) return { current: 0, next: 100, percentage: 0 };

    const currentLevelXP = (userStats.level - 1) * 100;
    const nextLevelXP = userStats.level * 100;
    const currentXP = userStats.xp;
    const progressXP = currentXP - currentLevelXP;
    const neededXP = nextLevelXP - currentLevelXP;
    const percentage = (progressXP / neededXP) * 100;

    return {
      current: progressXP,
      next: neededXP,
      percentage: Math.min(percentage, 100)
    };
  }, [userStats]);

  const getRecentAchievements = useCallback((limit = 5) => {
    return achievements
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }, [achievements]);

  const getTrendingTopics = useCallback(() => {
    if (!userId) return [];

    try {
      const memory = zentroBotAI.userMemory.get(userId);
      return memory?.favoriteTopics || [];
    } catch (error) {
      console.error('Error getting trending topics:', error);
      return [];
    }
  }, [userId]);

  return {
    // State
    currentPersona,
    userStats,
    achievements,
    dailyPrompt,
    suggestions,
    isInitialized,

    // Actions
    changePersona,
    checkForAchievements,
    refreshStats,
    refreshDailyPrompt,

    // Getters
    getPersonaInfo,
    getAllPersonas,
    getMemoryContext,
    getConversationStreak,
    getLevelProgress,
    getRecentAchievements,
    getTrendingTopics,

    // Utilities
    updateSuggestions,
    updateDailyPrompt
  };
};

export default useCompanionFeatures;
