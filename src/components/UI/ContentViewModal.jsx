import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaTrash, FaReply, FaCalendarAlt, FaGlobe, FaLock, FaEye, FaCode } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';

const ContentViewModal = ({ content, type, onClose }) => {
  const { userProfile } = useUser();
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [contentData, setContentData] = useState(content);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setContentData(content);
    // Check if user has liked this content
    if (content.likes) {
      setIsLiked(Array.isArray(content.likes) ? content.likes.includes(userProfile.uid) : false);
    }
  }, [content, userProfile.uid]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLike = () => {
    let updatedLikes;
    if (Array.isArray(contentData.likes)) {
      if (isLiked) {
        updatedLikes = contentData.likes.filter(id => id !== userProfile.uid);
      } else {
        updatedLikes = [...contentData.likes, userProfile.uid];
      }
    } else {
      updatedLikes = isLiked ? [] : [userProfile.uid];
    }

    const updatedContent = { ...contentData, likes: updatedLikes };
    setContentData(updatedContent);
    setIsLiked(!isLiked);

    // Update localStorage based on content type
    updateContentInStorage(updatedContent);
  };

  const updateContentInStorage = (updatedContent) => {
    try {
      if (type === 'photo') {
        const photos = JSON.parse(localStorage.getItem('zentro_photos') || '[]');
        const updatedPhotos = photos.map(photo => 
          photo.id === updatedContent.id ? updatedContent : photo
        );
        localStorage.setItem('zentro_photos', JSON.stringify(updatedPhotos));
      } else if (type === 'video') {
        const videos = JSON.parse(localStorage.getItem('zentro_videos') || '[]');
        const updatedVideos = videos.map(video => 
          video.id === updatedContent.id ? updatedContent : video
        );
        localStorage.setItem('zentro_videos', JSON.stringify(updatedVideos));
      } else if (type === 'blog') {
        const posts = JSON.parse(localStorage.getItem('zentro_blog_posts') || '[]');
        const updatedPosts = posts.map(post => 
          post.id === updatedContent.id ? updatedContent : post
        );
        localStorage.setItem('zentro_blog_posts', JSON.stringify(updatedPosts));
      }
    } catch (error) {
      console.error('Error updating content in storage:', error);
    }
  };

  const addComment = () => {
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      author: userProfile.displayName || 'Anonymous',
      authorId: userProfile.uid,
      date: new Date().toISOString(),
      replies: [],
      parentId: replyingTo ? replyingTo.id : null
    };

    let updatedComments;
    if (replyingTo) {
      // Add as reply
      updatedComments = (contentData.comments || []).map(comment => {
        if (comment.id === replyingTo.id) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment]
          };
        }
        return comment;
      });
    } else {
      // Add as new comment
      updatedComments = [...(contentData.comments || []), newComment];
    }

    const updatedContent = { ...contentData, comments: updatedComments };
    setContentData(updatedContent);
    updateContentInStorage(updatedContent);

    setCommentText('');
    setReplyingTo(null);
  };

  const deleteComment = (commentId, parentId = null) => {
    let updatedComments;
    
    if (parentId) {
      // Delete reply
      updatedComments = (contentData.comments || []).map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply.id !== commentId)
          };
        }
        return comment;
      });
    } else {
      // Delete main comment
      updatedComments = (contentData.comments || []).filter(comment => comment.id !== commentId);
    }

    const updatedContent = { ...contentData, comments: updatedComments };
    setContentData(updatedContent);
    updateContentInStorage(updatedContent);
  };

  const renderContent = () => {
    switch (type) {
      case 'photo':
        return (
          <img
            src={contentData.url}
            alt={contentData.caption}
            className="max-w-full max-h-[50vh] mx-auto rounded-lg"
          />
        );
      case 'video':
        return (
          <video
            src={contentData.url}
            controls
            className="max-w-full max-h-[50vh] mx-auto rounded-lg"
          />
        );
      case 'blog':
        return (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-2xl font-bold text-white mb-4">{contentData.title}</h2>
            <div className="text-gray-300 whitespace-pre-wrap">{contentData.content}</div>
            {contentData.tags && contentData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {contentData.tags.map((tag, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      case 'product':
        return (
          <div className="space-y-4">
            <div className="flex gap-4">
              <img
                src={contentData.thumbnail}
                alt={contentData.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">{contentData.name}</h2>
                <p className="text-gray-300 mb-4">{contentData.description}</p>
                <div className="flex flex-wrap gap-2">
                  {contentData.techStack?.map((tech, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-700 text-xs text-gray-300 rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {contentData.stats && (
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Users:</span>
                  <span className="text-green-400 ml-1">{contentData.stats.users}</span>
                </div>
                <div>
                  <span className="text-gray-400">MRR:</span>
                  <span className="text-green-400 ml-1">{contentData.stats.mrr}</span>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return <div className="text-gray-400">Content not available</div>;
    }
  };

  const renderMetadata = () => {
    return (
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          {contentData.date && (
            <span className="flex items-center gap-1">
              <FaCalendarAlt className="h-3 w-3" />
              {formatDate(contentData.date || contentData.createdAt)}
            </span>
          )}
          {contentData.visibility && (
            <span className="flex items-center gap-1">
              {contentData.visibility === 'public' ? (
                <FaGlobe className="h-3 w-3 text-green-400" />
              ) : (
                <FaLock className="h-3 w-3 text-yellow-400" />
              )}
              {contentData.visibility}
            </span>
          )}
          {contentData.views !== undefined && (
            <span className="flex items-center gap-1">
              <FaEye className="h-3 w-3" />
              {contentData.views} views
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-purple-400 transition-colors"
          >
            {isLiked ? <FaHeart className="text-pink-500" /> : <FaRegHeart />}
            <span>{Array.isArray(contentData.likes) ? contentData.likes.length : 0}</span>
          </button>
          <div className="flex items-center gap-1">
            <FaComment />
            <span>{contentData.comments ? contentData.comments.length : 0}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl border border-purple-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {type === 'photo' && contentData.caption}
            {type === 'video' && contentData.caption}
            {type === 'blog' && contentData.title}
            {type === 'product' && contentData.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
            {renderMetadata()}

            {/* Comments Section */}
            <div className="mt-8">
              <h4 className="text-lg font-semibold text-white mb-4">Comments</h4>

              {/* Comment List */}
              <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 mb-4">
                {(!contentData.comments || contentData.comments.length === 0) ? (
                  <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                ) : (
                  contentData.comments.map(comment => (
                    <div key={comment.id} className="bg-gray-800 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white">{comment.author}</span>
                            <span className="text-xs text-gray-500">{formatDate(comment.date)}</span>
                          </div>
                          <p className="text-gray-300">{comment.text}</p>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => setReplyingTo(comment)}
                            className="text-blue-400 hover:text-blue-300 text-sm"
                          >
                            <FaReply className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => deleteComment(comment.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            <FaTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="ml-4 mt-3 space-y-2">
                          {comment.replies.map(reply => (
                            <div key={reply.id} className="bg-gray-700 rounded-lg p-2">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-white text-sm">{reply.author}</span>
                                    <span className="text-xs text-gray-500">{formatDate(reply.date)}</span>
                                  </div>
                                  <p className="text-gray-300 text-sm">{reply.text}</p>
                                </div>
                                <button
                                  onClick={() => deleteComment(reply.id, comment.id)}
                                  className="text-red-400 hover:text-red-300 text-sm ml-2"
                                >
                                  <FaTrash className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Add Comment */}
              <div className="space-y-2">
                {replyingTo && (
                  <div className="bg-gray-800 p-2 rounded-lg text-sm">
                    <span className="text-gray-400">Replying to </span>
                    <span className="text-purple-400">{replyingTo.author}</span>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="ml-2 text-gray-500 hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && addComment()}
                  />
                  <button
                    onClick={addComment}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                  >
                    {replyingTo ? 'Reply' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentViewModal;
