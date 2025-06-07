import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaFolderOpen, FaCertificate, FaPlus, FaEdit, FaSave, FaTimes, FaTrash, FaExternalLinkAlt, FaImage, FaFileAlt, FaCode, FaGlobe } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

/**
 * PortfolioCertifications - Portfolio projects and certifications management
 * 
 * Features:
 * - Portfolio project uploads
 * - Certification management
 * - File type support
 * - External links
 */
const PortfolioCertifications = () => {
  const { userProfile, updatePortfolio, updateCertifications } = useUser();
  const [activeTab, setActiveTab] = useState('portfolio');
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    image: '',
    type: 'project',
    technologies: [],
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: ''
  });

  const portfolio = userProfile.professional?.portfolio || [];
  const certifications = userProfile.professional?.certifications || [];

  const projectTypes = [
    { value: 'web', label: 'Web App', icon: FaGlobe, color: 'text-blue-400' },
    { value: 'mobile', label: 'Mobile App', icon: FaCode, color: 'text-green-400' },
    { value: 'design', label: 'Design', icon: FaImage, color: 'text-pink-400' },
    { value: 'document', label: 'Document', icon: FaFileAlt, color: 'text-yellow-400' }
  ];

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      image: '',
      type: 'project',
      technologies: [],
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: ''
    });
    setIsAdding(false);
    setEditingIndex(null);
  };

  const handleSave = () => {
    if (!formData.title) return;

    const newEntry = {
      ...formData,
      id: editingIndex !== null ? 
        (activeTab === 'portfolio' ? portfolio[editingIndex].id : certifications[editingIndex].id) : 
        Date.now()
    };

    if (activeTab === 'portfolio') {
      const updatedPortfolio = editingIndex !== null 
        ? portfolio.map((item, idx) => idx === editingIndex ? newEntry : item)
        : [...portfolio, newEntry];
      updatePortfolio(updatedPortfolio);
    } else {
      const updatedCertifications = editingIndex !== null
        ? certifications.map((cert, idx) => idx === editingIndex ? newEntry : cert)
        : [...certifications, newEntry];
      updateCertifications(updatedCertifications);
    }

    resetForm();
  };

  const handleEdit = (index) => {
    const item = activeTab === 'portfolio' ? portfolio[index] : certifications[index];
    setFormData(item);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleDelete = (index) => {
    if (activeTab === 'portfolio') {
      const updatedPortfolio = portfolio.filter((_, idx) => idx !== index);
      updatePortfolio(updatedPortfolio);
    } else {
      const updatedCertifications = certifications.filter((_, idx) => idx !== index);
      updateCertifications(updatedCertifications);
    }
  };

  const handleTechnologyAdd = (tech) => {
    if (tech && !formData.technologies.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, tech]
      }));
    }
  };

  const handleTechnologyRemove = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }));
  };

  const getProjectTypeIcon = (type) => {
    const projectType = projectTypes.find(pt => pt.value === type);
    return projectType ? projectType.icon : FaFolderOpen;
  };

  const getProjectTypeColor = (type) => {
    const projectType = projectTypes.find(pt => pt.value === type);
    return projectType ? projectType.color : 'text-gray-400';
  };

  const currentData = activeTab === 'portfolio' ? portfolio : certifications;

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Portfolio & Certifications</h3>
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
          onClick={() => setActiveTab('portfolio')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 text-sm font-medium ${
            activeTab === 'portfolio'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FaFolderOpen className="text-xs" />
          Portfolio
        </button>
        <button
          onClick={() => setActiveTab('certifications')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all duration-200 text-sm font-medium ${
            activeTab === 'certifications'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <FaCertificate className="text-xs" />
          Certifications
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
              {editingIndex !== null ? 'Edit' : 'Add'} {activeTab === 'portfolio' ? 'Portfolio Item' : 'Certification'}
            </h4>
            
            <div className="space-y-4">
              <input
                type="text"
                placeholder={activeTab === 'portfolio' ? 'Project Title' : 'Certification Name'}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows="3"
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="url"
                  placeholder={activeTab === 'portfolio' ? 'Project URL' : 'Credential URL'}
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                />
                <input
                  type="url"
                  placeholder="Image/Screenshot URL"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                />
              </div>

              {activeTab === 'portfolio' ? (
                <>
                  {/* Project Type */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Project Type</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {projectTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                            className={`flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 text-sm ${
                              formData.type === type.value
                                ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                : 'border-gray-600 hover:border-gray-500 text-gray-300'
                            }`}
                          >
                            <Icon className={`text-xs ${type.color}`} />
                            <span>{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Technologies */}
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Technologies Used</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="flex items-center gap-1 px-2 py-1 bg-purple-600/20 text-purple-300 rounded text-xs"
                        >
                          {tech}
                          <button
                            type="button"
                            onClick={() => handleTechnologyRemove(tech)}
                            className="hover:text-red-400"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add technology (press Enter)"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTechnologyAdd(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* Certification Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Issuing Organization"
                      value={formData.issuer}
                      onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Credential ID"
                      value={formData.credentialId}
                      onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                    />
                    <input
                      type="month"
                      placeholder="Issue Date"
                      value={formData.issueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                    />
                    <input
                      type="month"
                      placeholder="Expiry Date (optional)"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="bg-gray-800 border border-gray-600 rounded-lg p-2 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={handleSave}
                disabled={!formData.title}
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

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {currentData.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {activeTab === 'portfolio' ? <FaFolderOpen className="text-3xl mx-auto mb-2 opacity-50" /> : <FaCertificate className="text-3xl mx-auto mb-2 opacity-50" />}
              <p className="text-sm">No {activeTab} added yet</p>
            </div>
          ) : (
            currentData.map((item, index) => {
              const Icon = activeTab === 'portfolio' ? getProjectTypeIcon(item.type) : FaCertificate;
              const iconColor = activeTab === 'portfolio' ? getProjectTypeColor(item.type) : 'text-yellow-400';
              
              return (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-all duration-200 group"
                >
                  {/* Image */}
                  {item.image && (
                    <div className="aspect-video bg-gray-600 rounded-lg mb-3 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`text-sm ${iconColor}`} />
                        <h4 className="text-white font-semibold">{item.title}</h4>
                      </div>

                      {activeTab === 'certifications' && item.issuer && (
                        <p className="text-purple-400 text-sm mb-2">{item.issuer}</p>
                      )}

                      {item.description && (
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">{item.description}</p>
                      )}

                      {activeTab === 'portfolio' && item.technologies && item.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {item.technologies.slice(0, 3).map((tech, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                          {item.technologies.length > 3 && (
                            <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                              +{item.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          <FaExternalLinkAlt className="text-xs" />
                          View {activeTab === 'portfolio' ? 'Project' : 'Credential'}
                        </a>
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
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PortfolioCertifications;
