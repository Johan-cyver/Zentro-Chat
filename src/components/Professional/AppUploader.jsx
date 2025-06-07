import React, { useState } from 'react';
import { FaUpload, FaTimes, FaCode, FaGlobe, FaDownload, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import professionalService from '../../services/professionalService';

const AppUploader = ({ onClose, onAppUploaded, editingApp = null }) => {
  const { userProfile } = useUser();
  const [formData, setFormData] = useState({
    title: editingApp?.title || '',
    description: editingApp?.description || '',
    category: editingApp?.category || 'productivity',
    downloadUrl: editingApp?.downloadUrl || '',
    demoUrl: editingApp?.demoUrl || '',
    githubUrl: editingApp?.githubUrl || '',
    features: editingApp?.features?.length ? editingApp.features : [''],
    tags: editingApp?.tags?.length ? editingApp.tags : [''],
    visibility: editingApp?.visibility || 'public',
    screenshots: editingApp?.screenshots || [],
    logo: editingApp?.logo || null
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const categories = [
    'productivity', 'games', 'utilities', 'social',
    'education', 'business', 'entertainment', 'other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleLogoUpload = (file) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file is too large. Maximum size is 2MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file for the logo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData(prev => ({
        ...prev,
        logo: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleScreenshotUpload = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 5MB.`);
        return false;
      }
      return file.type.startsWith('image/');
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          screenshots: [...prev.screenshots, e.target.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleScreenshotUpload(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userProfile || !userProfile.uid) {
      alert('User information is not available. Please ensure you are logged in.');
      setUploading(false);
      return;
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setUploading(true);
    try {
      const appData = {
        ...formData,
        id: editingApp?.id || undefined,
        name: formData.title,
        creatorName: userProfile.displayName || userProfile.email,
        features: formData.features.filter(f => f.trim()),
        tags: formData.tags.filter(t => t.trim()),
        ratings: editingApp?.ratings || [],
        averageRating: editingApp?.averageRating || 0,
        totalRatings: editingApp?.totalRatings || 0,
        downloads: editingApp?.downloads || 0,
        comments: editingApp?.comments || [],
      };

      const savedApp = await professionalService.saveApp(appData, userProfile.uid);

      if (onAppUploaded) {
        onAppUploaded(savedApp);
      }

      alert(editingApp ? 'App updated successfully!' : 'App uploaded successfully!');
      onClose();
    } catch (error) {
      console.error('Error uploading app (full error object in AppUploader):', error);
      alert(`Failed to upload app: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <FaCode className="text-purple-400" />
              <span>{editingApp ? 'Edit Your App' : 'Upload Your App'}</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                App Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="My Awesome App"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
              placeholder="Describe your app, its features, and what makes it special..."
              required
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              App Logo
            </label>
            <div className="flex items-center space-x-4">
              {formData.logo ? (
                <div className="relative">
                  <img
                    src={formData.logo}
                    alt="App Logo"
                    className="w-16 h-16 object-cover rounded-lg border border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo: null }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    <FaTimes />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 bg-gray-800 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                  <FaUpload className="text-gray-400" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files[0] && handleLogoUpload(e.target.files[0])}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors inline-block"
                >
                  Choose Logo
                </label>
                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 512x512px, max 2MB
                </p>
              </div>
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaDownload className="inline mr-1" />
                Download URL
              </label>
              <input
                type="url"
                name="downloadUrl"
                value={formData.downloadUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="https://example.com/download"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaGlobe className="inline mr-1" />
                Demo URL
              </label>
              <input
                type="url"
                name="demoUrl"
                value={formData.demoUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="https://demo.example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FaCode className="inline mr-1" />
                GitHub URL
              </label>
              <input
                type="url"
                name="githubUrl"
                value={formData.githubUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                placeholder="https://github.com/user/repo"
              />
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Key Features
            </label>
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => handleArrayChange('features', index, e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                  placeholder="Feature description"
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('features', index)}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('features')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add Feature
            </button>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map((tag, index) => (
                <div key={index} className="flex items-center space-x-1 bg-gray-700 rounded-full px-3 py-1">
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => handleArrayChange('tags', index, e.target.value)}
                    className="bg-transparent border-none outline-none text-white text-sm w-20"
                    placeholder="tag"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('tags', index)}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => addArrayItem('tags')}
              className="text-purple-400 hover:text-purple-300 text-sm"
            >
              + Add Tag
            </button>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Visibility
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === 'public'}
                  onChange={handleInputChange}
                  className="text-purple-500"
                />
                <FaEye className="text-green-400" />
                <span className="text-white">Public</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === 'private'}
                  onChange={handleInputChange}
                  className="text-purple-500"
                />
                <FaEyeSlash className="text-gray-400" />
                <span className="text-white">Private</span>
              </label>
            </div>
          </div>

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Screenshots
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragOver
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            >
              <FaUpload className="mx-auto text-4xl text-gray-400 mb-4" />
              <p className="text-gray-300 mb-2">Drop screenshots here or click to browse</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleScreenshotUpload(e.target.files)}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="cursor-pointer text-purple-400 hover:text-purple-300"
              >
                Choose Files
              </label>
            </div>

            {formData.screenshots.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {formData.screenshots.map((screenshot, index) => (
                  <div key={index} className="relative">
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        screenshots: prev.screenshots.filter((_, i) => i !== index)
                      }))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaUpload />
                  <span>{editingApp ? 'Update App' : 'Upload App'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppUploader;
