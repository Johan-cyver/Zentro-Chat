import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTimes, FaSave, FaThumbsUp, FaCode, FaPalette, FaChartBar, FaUsers, FaCog, FaLightbulb } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

/**
 * SkillsEndorsements - Enhanced skills management with endorsement system
 * 
 * Features:
 * - Add/remove skills
 * - Skill endorsements from connections
 * - Visual skill levels
 * - Predefined skill categories
 */
const SkillsEndorsements = () => {
  const { userProfile, updateProfessionalProfile, addEndorsement } = useUser();
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Predefined skill categories
  const skillCategories = {
    'Technical': {
      icon: FaCode,
      color: 'text-blue-400',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL', 'MongoDB']
    },
    'Design': {
      icon: FaPalette,
      color: 'text-pink-400',
      skills: ['UI/UX Design', 'Figma', 'Adobe Creative Suite', 'Sketch', 'Prototyping', 'Wireframing']
    },
    'Analytics': {
      icon: FaChartBar,
      color: 'text-green-400',
      skills: ['Data Analysis', 'Excel', 'Tableau', 'Power BI', 'Google Analytics', 'SQL']
    },
    'Management': {
      icon: FaUsers,
      color: 'text-purple-400',
      skills: ['Project Management', 'Team Leadership', 'Agile', 'Scrum', 'Strategic Planning']
    },
    'Tools': {
      icon: FaCog,
      color: 'text-yellow-400',
      skills: ['Git', 'Docker', 'AWS', 'Jenkins', 'Jira', 'Slack', 'Notion']
    },
    'Soft Skills': {
      icon: FaLightbulb,
      color: 'text-orange-400',
      skills: ['Communication', 'Problem Solving', 'Critical Thinking', 'Creativity', 'Adaptability']
    }
  };

  const currentSkills = userProfile.professional?.skills || [];
  const endorsements = userProfile.professional?.endorsements || {};

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    const updatedSkills = [...currentSkills, newSkill.trim()];
    updateProfessionalProfile({ skills: updatedSkills });
    setNewSkill('');
    setIsAddingSkill(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = currentSkills.filter(skill => skill !== skillToRemove);
    updateProfessionalProfile({ skills: updatedSkills });
  };

  const handleQuickAddSkill = (skill) => {
    if (!currentSkills.includes(skill)) {
      const updatedSkills = [...currentSkills, skill];
      updateProfessionalProfile({ skills: updatedSkills });
    }
  };

  const handleEndorseSkill = (skill) => {
    // Simulate endorsement from current user (in real app, this would be from other users)
    addEndorsement(skill, {
      name: 'Demo User',
      avatar: 'https://i.pravatar.cc/40?img=1',
      date: new Date().toISOString()
    });
  };

  const getEndorsementCount = (skill) => {
    return endorsements[skill]?.length || 0;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Skills & Endorsements</h3>
        {!isAddingSkill && (
          <button
            onClick={() => setIsAddingSkill(true)}
            className="p-2 text-gray-400 hover:text-purple-400 transition-colors duration-200"
            title="Add skill"
          >
            <FaPlus className="text-sm" />
          </button>
        )}
      </div>

      {/* Current Skills */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Your Skills</h4>
        <div className="space-y-3">
          <AnimatePresence>
            {currentSkills.map((skill, index) => {
              const endorsementCount = getEndorsementCount(skill);
              
              return (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-medium">{skill}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEndorseSkill(skill)}
                          className="flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs hover:bg-blue-600/30 transition-colors duration-200"
                          title="Endorse skill"
                        >
                          <FaThumbsUp className="text-xs" />
                          <span>{endorsementCount}</span>
                        </button>
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400 transition-all duration-200"
                          title="Remove skill"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Endorsement Preview */}
                    {endorsementCount > 0 && (
                      <div className="mt-2 flex items-center gap-1">
                        <span className="text-xs text-gray-500">Endorsed by:</span>
                        <div className="flex -space-x-1">
                          {endorsements[skill]?.slice(0, 3).map((endorser, idx) => (
                            <img
                              key={idx}
                              src={endorser.avatar}
                              alt={endorser.name}
                              className="w-5 h-5 rounded-full border border-gray-600"
                              title={endorser.name}
                            />
                          ))}
                          {endorsementCount > 3 && (
                            <div className="w-5 h-5 rounded-full bg-gray-600 border border-gray-500 flex items-center justify-center">
                              <span className="text-xs text-gray-300">+{endorsementCount - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {currentSkills.length === 0 && !isAddingSkill && (
            <div className="text-center py-8 text-gray-500">
              <FaCode className="text-3xl mx-auto mb-2 opacity-50" />
              <p className="text-sm">No skills added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Skill */}
      <AnimatePresence>
        {isAddingSkill && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mb-6 space-y-3"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill..."
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                maxLength={50}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSkill();
                  }
                }}
                autoFocus
              />
              <button
                onClick={handleAddSkill}
                disabled={!newSkill.trim()}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-1"
              >
                <FaSave className="text-xs" />
                Add
              </button>
              <button
                onClick={() => {
                  setIsAddingSkill(false);
                  setNewSkill('');
                }}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-all duration-200 text-sm"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skill Categories */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Quick Add by Category</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          {Object.entries(skillCategories).map(([category, data]) => {
            const Icon = data.icon;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 text-sm ${
                  selectedCategory === category
                    ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                    : 'border-gray-600 hover:border-gray-500 text-gray-300'
                }`}
              >
                <Icon className={`text-xs ${data.color}`} />
                <span>{category}</span>
              </button>
            );
          })}
        </div>

        {/* Category Skills */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 p-3 bg-gray-700/30 rounded-lg">
                {skillCategories[selectedCategory].skills
                  .filter(skill => !currentSkills.includes(skill))
                  .map((skill) => (
                    <button
                      key={skill}
                      onClick={() => handleQuickAddSkill(skill)}
                      className="px-3 py-1 bg-gray-600 text-gray-300 rounded-full text-xs hover:bg-purple-600 hover:text-white transition-all duration-200"
                    >
                      {skill}
                    </button>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SkillsEndorsements;
