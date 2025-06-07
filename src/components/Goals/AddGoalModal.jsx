import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import goalService from '../../services/goalService';

const AddGoalModal = ({ goal: existingGoal, onClose, onSave, userId }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState('active');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (existingGoal) {
      setTitle(existingGoal.title || '');
      setDescription(existingGoal.description || '');
      setDueDate(existingGoal.dueDate ? new Date(existingGoal.dueDate).toISOString().split('T')[0] : '');
      setStatus(existingGoal.status || 'active');
      setProgress(existingGoal.progress !== undefined ? existingGoal.progress : 0);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
      setStatus('active');
      setProgress(0);
    }
    setErrorMessage('');
  }, [existingGoal]);

  useEffect(() => {
    if (status === 'completed' && progress < 100) {
      setProgress(100);
    } else if (progress === 100 && status !== 'completed') {
      setStatus('completed');
    }
  }, [status, progress]);

  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value, 10);
    setProgress(newProgress);
    if (newProgress === 100) {
      setStatus('completed');
    } else if (newProgress < 100 && status === 'completed') {
      setStatus('active');
    }
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    if (newStatus === 'completed') {
      setProgress(100);
    } else if (newStatus !== 'completed' && progress === 100) {
      setProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMessage('Goal title is required.');
      return;
    }
    if (!userId) {
      setErrorMessage('User not identified. Cannot save goal.');
      return;
    }
    setErrorMessage('');

    const finalProgress = status === 'completed' ? 100 : progress;

    const goalData = {
      id: existingGoal?.id,
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || null,
      status,
      progress: finalProgress,
    };

    try {
      const savedGoal = goalService.saveGoal(userId, goalData);
      onSave(savedGoal);
    } catch (error) {
      console.error("Error saving goal:", error);
      setErrorMessage("Failed to save goal. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div 
        className="bg-gray-900/95 backdrop-blur-lg rounded-xl max-w-lg w-full border border-gray-700/50 shadow-2xl shadow-green-500/10 p-6" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold text-gray-100">
            {existingGoal ? 'Edit Goal' : 'Add New Goal'}
          </h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full">
            <FaTimes size={18}/>
          </button>
        </div>
        
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-md text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="goalTitle" className="block text-sm font-medium text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
            <input 
              type="text"
              id="goalTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-800/70 border border-gray-700/60 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              placeholder="e.g., Learn React for 30 days"
            />
          </div>
          <div>
            <label htmlFor="goalDescription" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
            <textarea 
              id="goalDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 bg-gray-800/70 border border-gray-700/60 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              placeholder="Specific steps, motivations, resources..."
            />
          </div>
          <div>
            <label htmlFor="goalProgress" className="block text-sm font-medium text-gray-300 mb-1">
              Progress: <span className="font-semibold text-green-400">{progress}%</span>
            </label>
            <input 
              type="range"
              id="goalProgress"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="goalDueDate" className="block text-sm font-medium text-gray-300 mb-1">Due Date (Optional)</label>
              <input 
                type="date"
                id="goalDueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-800/70 border border-gray-700/60 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors h-[46px]"
              />
            </div>
            <div>
              <label htmlFor="goalStatus" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
              <select 
                id="goalStatus"
                value={status}
                onChange={handleStatusChange}
                className="w-full px-3 py-2.5 bg-gray-800/70 border border-gray-700/60 rounded-lg text-gray-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors h-[46px]"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on hold">On Hold</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-md transition-colors font-medium shadow-md hover:shadow-green-500/30"
            >
              {existingGoal ? 'Save Changes' : 'Add Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal; 