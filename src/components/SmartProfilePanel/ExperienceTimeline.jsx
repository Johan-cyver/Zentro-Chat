import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBriefcase, FaGraduationCap, FaPlus, FaEdit, FaSave, FaTimes, FaTrash, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

/**
 * ExperienceTimeline - Professional experience and education timeline
 * 
 * Features:
 * - Work experience entries
 * - Education history
 * - Timeline visualization
 * - Add/edit/remove functionality
 */
const ExperienceTimeline = () => {
  const { userProfile, updateExperience, updateEducation } = useUser();
  const [activeTab, setActiveTab] = useState('experience');
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  });

  const experience = userProfile.professional?.experience || [];
  const education = userProfile.professional?.education || [];

  const resetForm = () => {
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    });
    setIsAdding(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!formData.title || !formData.company || !formData.startDate) return;

    const newEntry = {
      ...formData,
      id: editingIndex !== null ? (activeTab === 'experience' ? experience[editingIndex].id : education[editingIndex].id) : Date.now()
    };

    if (activeTab === 'experience') {
      const updatedExperience = editingIndex !== null 
        ? experience.map((exp, idx) => idx === editingIndex ? newEntry : exp)
        : [...experience, newEntry];
      updateExperience(updatedExperience);
    } else {
      const updatedEducation = editingIndex !== null
        ? education.map((edu, idx) => idx === editingIndex ? newEntry : edu)
        : [...education, newEntry];
      updateEducation(updatedEducation);
    }

    resetForm();
  };

  const handleEdit = (index) => {
    const item = activeTab === 'experience' ? experience[index] : education[index];
    setFormData(item);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleDelete = (index) => {
    if (activeTab === 'experience') {
      const updatedExperience = experience.filter((_, idx) => idx !== index);
      updateExperience(updatedExperience);
    } else {
      const updatedEducation = education.filter((_, idx) => idx !== index);
      updateEducation(updatedEducation);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
  };

  const currentData = activeTab === 'experience' ? experience : education;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Professional Timeline</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
            title={`Add ${activeTab}`}
          >
            <FaPlus className="text-sm" />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6 bg-gray-700/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('experience')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 text-sm font-medium ${
            activeTab === 'experience'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FaBriefcase className="text-xs" />
          Experience
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 text-sm font-medium ${
            activeTab === 'education'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FaGraduationCap className="text-xs" />
          Education
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="mb-6 p-4 bg-gray-700/50 rounded-lg border border-gray-600"
          >
            <h4 className="text-white font-medium mb-4">
              {editingIndex !== null ? 'Edit' : 'Add'} {activeTab === 'experience' ? 'Experience' : 'Education'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder={activeTab === 'experience' ? 'Job Title' : 'Degree/Program'}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />
              <input
                type="text"
                placeholder={activeTab === 'experience' ? 'Company' : 'Institution'}
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="month"
                  placeholder="Start Date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                />
                <input
                  type="month"
                  placeholder="End Date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={formData.current}
                  className="flex-1 bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 text-gray-300 text-sm">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) => setFormData(prev => ({ ...prev, current: e.target.checked, endDate: e.target.checked ? '' : prev.endDate }))}
                  className="rounded border-gray-600 bg-gray-800 text-purple-600 focus:ring-purple-500"
                />
                {activeTab === 'experience' ? 'Currently working here' : 'Currently studying here'}
              </label>
            </div>

            <textarea
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows="3"
              className="w-full mt-4 bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                disabled={!formData.title || !formData.company || !formData.startDate}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
              >
                <FaSave className="text-xs" />
                {editingIndex !== null ? 'Update' : 'Add'}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm flex items-center gap-2"
              >
                <FaTimes className="text-xs" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline */}
      <div className="space-y-4">
        <AnimatePresence>
          {currentData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {activeTab === 'experience' ? <FaBriefcase className="text-3xl mx-auto mb-2 opacity-50" /> : <FaGraduationCap className="text-3xl mx-auto mb-2 opacity-50" />}
              <p className="text-sm">No {activeTab} added yet</p>
            </div>
          ) : (
            currentData.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="relative pl-8 pb-6 group"
              >
                {/* Timeline Line */}
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-600"></div>
                
                {/* Timeline Dot */}
                <div className={`absolute left-1 top-2 w-4 h-4 rounded-full border-2 ${
                  activeTab === 'experience' ? 'bg-blue-600 border-blue-400' : 'bg-green-600 border-green-400'
                }`}></div>

                {/* Content */}
                <div className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-semibold">{item.title}</h4>
                      <p className="text-purple-400 font-medium">{item.company}</p>
                      
                      <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
                        <div className="flex items-center gap-1">
                          <FaCalendarAlt className="text-xs" />
                          <span>
                            {formatDate(item.startDate)} - {item.current ? 'Present' : formatDate(item.endDate)}
                          </span>
                        </div>
                        {item.location && (
                          <div className="flex items-center gap-1">
                            <FaMapMarkerAlt className="text-xs" />
                            <span>{item.location}</span>
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-gray-300 text-sm mt-3">{item.description}</p>
                      )}
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEdit(index)}
                        className="p-2 text-gray-400 hover:text-blue-400 transition-colors duration-200"
                        title="Edit"
                      >
                        <FaEdit className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
                        title="Delete"
                      >
                        <FaTrash className="text-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExperienceTimeline;
