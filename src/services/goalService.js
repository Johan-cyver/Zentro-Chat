/**
 * Goal Service - Manages user goals and activity for streaks
 */

class GoalService {
  constructor() {
    this.baseStorageKey = 'zentro_user_goals'; // Base key, will be user-specific
    this.activityLogKeyBase = 'zentro_user_goal_activity_log';
  }

  _getUserGoalsKey(userId) {
    if (!userId) {
      console.error('GoalService: userId is required to get storage key for goals.');
      return null;
    }
    return `${this.baseStorageKey}_${userId}`;
  }

  _getUserActivityLogKey(userId) {
    if (!userId) {
      console.error('GoalService: userId is required to get storage key for activity log.');
      return null;
    }
    return `${this.activityLogKeyBase}_${userId}`;
  }

  // Get all goals for a user
  getAllGoals(userId) {
    const storageKey = this._getUserGoalsKey(userId);
    if (!storageKey) return [];
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading goals for user:', userId, error);
      return [];
    }
  }

  // Get a specific goal by ID for a user
  getGoalById(userId, goalId) {
    const goals = this.getAllGoals(userId);
    return goals.find(goal => goal.id === goalId);
  }

  // Log activity for the current day
  _logActivity(userId) {
    const activityKey = this._getUserActivityLogKey(userId);
    if (!activityKey) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {
      let activityLog = JSON.parse(localStorage.getItem(activityKey) || '[]');
      if (!activityLog.includes(today)) {
        activityLog.push(today);
        // Optional: Keep the log sorted or prune very old entries if it gets too large
        activityLog.sort((a,b) => new Date(b) - new Date(a)); // Keep it sorted, newest first
        localStorage.setItem(activityKey, JSON.stringify(activityLog));
      }
    } catch (error) {
      console.error('Error logging goal activity for user:', userId, error);
    }
  }

  // Create or update a goal for a user
  saveGoal(userId, goalData) {
    const storageKey = this._getUserGoalsKey(userId);
    if (!storageKey) throw new Error('User ID is required to save a goal.');
    
    let previousProgress = null;
    if (goalData.id) {
        const existingGoal = this.getGoalById(userId, goalData.id);
        if (existingGoal) {
            previousProgress = existingGoal.progress;
        }
    }

    try {
      const goals = this.getAllGoals(userId);
      const now = new Date().toISOString();
      let newGoal;

      if (goalData.id) { // Update existing goal
        const existingIndex = goals.findIndex(goal => goal.id === goalData.id);
        if (existingIndex !== -1) {
          newGoal = { 
            ...goals[existingIndex], 
            ...goalData, 
            updatedAt: now 
          };
          goals[existingIndex] = newGoal;
        } else {
          // If ID provided but not found, treat as new (or throw error, for now, treat as new with given ID)
          newGoal = {
            status: 'active',
            ...goalData, // User might provide an ID they want to use
            createdAt: goalData.createdAt || now,
            updatedAt: now,
          };
          goals.push(newGoal);
        }
      } else { // Create new goal
        newGoal = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          status: 'active', // Default status
          progress: 0, // Default progress
          ...goalData,
          createdAt: now,
          updatedAt: now,
        };
        goals.push(newGoal);
      }

      localStorage.setItem(storageKey, JSON.stringify(goals));

      // Log activity if progress was made or goal completed
      const hasProgressed = previousProgress !== null && newGoal.progress > previousProgress;
      const isNewlyCreatedWithProgressOrCompleted = previousProgress === null && (newGoal.progress > 0 || newGoal.status === 'completed');
      if (newGoal.status === 'completed' || hasProgressed || isNewlyCreatedWithProgressOrCompleted) {
        this._logActivity(userId);
      }

      return newGoal;
    } catch (error) {
      console.error('Error saving goal for user:', userId, error);
      throw error;
    }
  }

  // Delete a goal for a user
  deleteGoal(userId, goalId) {
    const storageKey = this._getUserGoalsKey(userId);
    if (!storageKey) return false;

    try {
      let goals = this.getAllGoals(userId);
      const initialLength = goals.length;
      goals = goals.filter(goal => goal.id !== goalId);
      
      if (goals.length < initialLength) {
        localStorage.setItem(storageKey, JSON.stringify(goals));
        return true;
      } 
      return false; // Goal not found
    } catch (error) {
      console.error('Error deleting goal for user:', userId, error);
      return false;
    }
  }

  // Get user's goal activity log
  getGoalActivityLog(userId) {
    const activityKey = this._getUserActivityLogKey(userId);
    if (!activityKey) return [];
    try {
      const stored = localStorage.getItem(activityKey);
      return stored ? JSON.parse(stored) : []; // Dates are stored as YYYY-MM-DD strings
    } catch (error) {
      console.error('Error loading goal activity log for user:', userId, error);
      return [];
    }
  }

  // Calculate current streak
  calculateCurrentStreak(userId) {
    const activityLog = this.getGoalActivityLog(userId);
    if (!activityLog.length) return 0;

    // Ensure dates are Date objects and sorted descending
    const sortedDates = activityLog.map(dateStr => new Date(dateStr)).sort((a, b) => b - a);
    
    let currentStreak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Check if today is in the log
    const todayInLog = sortedDates.find(d => d.getTime() === today.getTime());
    if (todayInLog) {
        currentStreak = 1;
    } else {
        // If today is not in log, check if yesterday was the start of a streak
        let yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        const yesterdayInLog = sortedDates.find(d => d.getTime() === yesterday.getTime());
        if (yesterdayInLog) {
            currentStreak = 1;
            today = yesterday; // Start checking from yesterday
        } else {
            return 0; // No activity today or yesterday
        }
    }
    
    for (let i = 1; i < sortedDates.length; i++) {
        let expectedPreviousDay = new Date(today);
        expectedPreviousDay.setDate(today.getDate() - i); // what day we expect for streak
        
        const actualPreviousDayInLog = sortedDates.find(d => d.getTime() === expectedPreviousDay.getTime());

        if (actualPreviousDayInLog) {
            currentStreak++;
        } else {
            break; // Streak broken
        }
    }
    return currentStreak;
  }

  // Calculate longest streak
  calculateLongestStreak(userId) {
    const activityLog = this.getGoalActivityLog(userId);
    if (!activityLog.length) return 0;

    const sortedDates = activityLog.map(dateStr => new Date(dateStr)).sort((a, b) => a - b); // Ascending for easier iteration
    
    if (sortedDates.length === 0) return 0;

    let longestStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < sortedDates.length; i++) {
        if (i === 0) {
            currentStreak = 1;
        } else {
            const diffTime = Math.abs(sortedDates[i] - sortedDates[i-1]);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak++;
            } else {
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 1; // Reset for new potential streak
            }
        }
    }
    longestStreak = Math.max(longestStreak, currentStreak); // Final check for the last streak
    return longestStreak;
  }
}

// Create and export singleton instance
const goalService = new GoalService();
export default goalService; 