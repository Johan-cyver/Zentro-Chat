import React, { useState, useRef } from 'react';
import { FaImage, FaVideo, FaFile, FaTimes, FaPaperPlane, FaCamera } from 'react-icons/fa';

const MediaUploader = ({ onSendMedia, onClose, theme }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [caption, setCaption] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 50MB.`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        await onSendMedia(file, caption);
      }
      setSelectedFiles([]);
      setCaption('');
      onClose();
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to send media. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) return <FaImage className="text-green-500" />;
    if (file.type.startsWith('video/')) return <FaVideo className="text-blue-500" />;
    return <FaFile className="text-gray-500" />;
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="w-full h-full object-cover rounded"
        />
      );
    }
    if (file.type.startsWith('video/')) {
      return (
        <video
          src={URL.createObjectURL(file)}
          className="w-full h-full object-cover rounded"
          muted
        />
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
        {getFileIcon(file)}
      </div>
    );
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        style={{ backgroundColor: theme?.colors?.surface }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
          style={{ borderColor: theme?.colors?.borderMuted }}
        >
          <h3 
            className="text-lg font-semibold"
            style={{ color: theme?.colors?.text }}
          >
            Share Media
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-2">
              <FaCamera 
                className="mx-auto text-4xl text-gray-400"
                style={{ color: theme?.colors?.textMuted }}
              />
              <p 
                className="text-lg font-medium"
                style={{ color: theme?.colors?.text }}
              >
                Drop files here or click to browse
              </p>
              <p 
                className="text-sm"
                style={{ color: theme?.colors?.textMuted }}
              >
                Supports images, videos, and documents (max 50MB each)
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <FaImage />
              <span>Photos</span>
            </button>
            <button
              onClick={() => {
                fileInputRef.current.accept = 'video/*';
                fileInputRef.current.click();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <FaVideo />
              <span>Videos</span>
            </button>
            <button
              onClick={() => {
                fileInputRef.current.accept = '*/*';
                fileInputRef.current.click();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaFile />
              <span>Files</span>
            </button>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 
                className="font-medium"
                style={{ color: theme?.colors?.text }}
              >
                Selected Files ({selectedFiles.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square">
                      {getFilePreview(file)}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => removeFile(index)}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                      <p className="text-xs truncate">{file.name}</p>
                      <p className="text-xs text-gray-300">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caption Input */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <label 
                className="block text-sm font-medium"
                style={{ color: theme?.colors?.text }}
              >
                Caption (optional)
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                style={{
                  backgroundColor: theme?.colors?.inputBackground,
                  borderColor: theme?.colors?.borderMuted,
                  color: theme?.colors?.text
                }}
                rows={3}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedFiles.length > 0 && (
          <div 
            className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700"
            style={{ borderColor: theme?.colors?.borderMuted }}
          >
            <p 
              className="text-sm"
              style={{ color: theme?.colors?.textMuted }}
            >
              {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
            </p>
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ backgroundColor: theme?.colors?.primary }}
              >
                <FaPaperPlane />
                <span>{uploading ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>
    </div>
  );
};

export default MediaUploader;
