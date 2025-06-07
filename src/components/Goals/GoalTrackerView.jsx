import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle, FaRegCircle, FaBullseye, FaFire, FaStar } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import goalService from '../../services/goalService';
import AddGoalModal from './AddGoalModal'; // Uncommented and will be used

const GoalTrackerView = () => {
  const { userProfile } = useUser();
  const [goals, setGoals] = useState([]);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    if (userProfile?.uid) {
      setLoading(true);
      try {
        const userGoals = goalService.getAllGoals(userProfile.uid);
        setGoals(userGoals);
        setCurrentStreak(goalService.calculateCurrentStreak(userProfile.uid));
        setLongestStreak(goalService.calculateLongestStreak(userProfile.uid));
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setGoals([]);
        setCurrentStreak(0);
        setLongestStreak(0);
      } finally {
        setLoading(false);
      }
    } else {
      setGoals([]);
      setCurrentStreak(0);
      setLongestStreak(0);
      setLoading(false);
    }
  }, [userProfile?.uid]);

  const refreshStreaks = () => {
    if (userProfile?.uid) {
      setCurrentStreak(goalService.calculateCurrentStreak(userProfile.uid));
      setLongestStreak(goalService.calculateLongestStreak(userProfile.uid));
    }
  };

  const handleAddGoalClick = () => {
    setEditingGoal(null);
    setShowAddGoalModal(true);
  };

  const handleEditGoalClick = (goal) => {
    setEditingGoal(goal);
    setShowAddGoalModal(true);
  };

  const handleDeleteGoal = async (goalId) => {
    if (!userProfile?.uid) return;
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        goalService.deleteGoal(userProfile.uid, goalId);
        setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
      } catch (error) {
        console.error("Error deleting goal:", error);
      }
    }
  };
  
  const handleGoalSaved = (savedGoal) => {
    setGoals(prevGoals => {
      const existingIndex = prevGoals.findIndex(g => g.id === savedGoal.id);
      if (existingIndex !== -1) {
        const updatedGoals = [...prevGoals];
        updatedGoals[existingIndex] = savedGoal;
        return updatedGoals;
      } else {
        return [...prevGoals, savedGoal];
      }
    });
    setShowAddGoalModal(false);
    setEditingGoal(null);
    refreshStreaks();
  };

  const toggleGoalStatus = (goal, newStatus) => {
    if (!userProfile?.uid) return;
    
    let newProgress = goal.progress;
    if (newStatus === 'completed') {
      newProgress = 100;
    } else if (goal.status === 'completed' && newStatus === 'active') {
      newProgress = 0;
    }

    const updatedGoal = { 
      ...goal, 
      status: newStatus, 
      progress: newProgress, 
      updatedAt: new Date().toISOString() 
    };
    try {
      goalService.saveGoal(userProfile.uid, updatedGoal);
      setGoals(prevGoals => prevGoals.map(g => g.id === goal.id ? updatedGoal : g));
      refreshStreaks();
    } catch (error) {
      console.error("Error updating goal status:", error);
    }
  };

  const GoalStatusIcon = ({ status }) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500 text-xl" title="Completed" />;
      case 'on hold':
        return <FaTimesCircle className="text-red-500 text-xl" title="On Hold" />;
      case 'active':
      default:
        return <FaRegCircle className="text-yellow-500 text-xl" title="Active" />;
    }
  };


  if (loading) {
    return (
      <div className="p-6 bg-gray-950 text-gray-100 min-h-screen flex justify-center items-center">
        <p className="text-xl">Loading your goals...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-950 text-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="py-6 sm:py-8 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent flex items-center">
              <FaBullseye className="mr-3 text-green-400" /> My Goals
            </h1>
            <button
              onClick={handleAddGoalClick}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-green-500/30 text-sm sm:text-base font-semibold"
            >
              <FaPlus />
              <span>Add New Goal</span>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row justify-center sm:justify-start items-center gap-4 sm:gap-6 bg-gray-800/50 border border-gray-700/40 p-4 rounded-lg shadow-inner backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <FaFire className="text-orange-400 text-xl" />
              <span className="text-gray-300">Current Streak:</span>
              <span className="font-bold text-orange-400 text-lg">{currentStreak} Day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-600"></div>
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <FaStar className="text-yellow-400 text-xl" />
              <span className="text-gray-300">Longest Streak:</span>
              <span className="font-bold text-yellow-400 text-lg">{longestStreak} Day{longestStreak !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </header>

        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map(goal => (
              <div key={goal.id} className="bg-gray-800/70 border border-gray-700/60 rounded-xl p-5 shadow-lg hover:border-cyan-500/70 transition-all duration-300 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                  <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                    <div onClick={() => goal.status !== 'completed' ? toggleGoalStatus(goal, 'completed') : toggleGoalStatus(goal, 'active')} className="cursor-pointer">
                        <GoalStatusIcon status={goal.status} />
                    </div>
                    <h2 className={`text-lg font-semibold ${goal.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                      {goal.title}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2 self-start sm:self-center">
                    {goal.status !== 'completed' && goal.status !== 'on hold' && (
                       <button 
                        onClick={() => toggleGoalStatus(goal, 'on hold')}
                        className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-md transition-colors text-xs"
                        title="Put On Hold"
                      >
                        <FaTimesCircle size={16} />
                      </button>
                    )}
                     {goal.status === 'on hold' && (
                       <button 
                        onClick={() => toggleGoalStatus(goal, 'active')}
                        className="p-2 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded-md transition-colors text-xs"
                        title="Mark as Active"
                      >
                        <FaRegCircle size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleEditGoalClick(goal)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-md transition-colors text-xs"
                      title="Edit Goal"
                    >
                      <FaEdit size={16}/>
                    </button>
                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-red-500 hover:text-red-400 hover:bg-red-600/10 rounded-md transition-colors text-xs"
                      title="Delete Goal"
                    >
                      <FaTrash size={16}/>
                    </button>
                  </div>
                </div>
                {goal.description && (
                  <p className={`text-sm mb-2 ${goal.status === 'completed' ? 'text-gray-600' : 'text-gray-400'}`}>
                    {goal.description}
                  </p>
                )}
                
                {/* Progress Display */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                    <span>Progress</span>
                    <span className={`font-semibold ${goal.progress === 100 ? 'text-green-400' : 'text-cyan-400'}`}>{goal.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-300 ${goal.progress === 100 ? 'bg-green-500' : 'bg-cyan-500'}`}
                      style={{ width: `${goal.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex justify-between items-center">
                  <span>
                    Status: <span className="font-medium capitalize">{goal.status}</span>
                    {goal.dueDate && ` | Due: ${new Date(goal.dueDate).toLocaleDateString()}`}
                  </span>
                  <span>Last updated: {new Date(goal.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 bg-gray-800/40 rounded-xl border border-dashed border-gray-700/50">
            <FaBullseye className="text-6xl sm:text-7xl text-cyan-500 mb-6 mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-100 mb-3">No Goals Yet</h2>
            <p className="text-gray-400 mb-6 max-w-sm mx-auto text-sm sm:text-base">
              Ready to achieve great things? Add your first goal to get started!
            </p>
            <button
              onClick={handleAddGoalClick}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 text-white rounded-lg transition-all duration-300 shadow-md hover:shadow-green-500/30 text-sm sm:text-base font-semibold"
            >
              <FaPlus className="inline mr-2" />
              Set Your First Goal
            </button>
          </div>
        )}
      </div>

      {showAddGoalModal && (
        <AddGoalModal
          goal={editingGoal}
          onClose={() => {
            setShowAddGoalModal(false);
            setEditingGoal(null);
          }}
          onSave={handleGoalSaved}
          userId={userProfile?.uid}
        />
      )}
    </div>
  );
};

export default GoalTrackerView; 