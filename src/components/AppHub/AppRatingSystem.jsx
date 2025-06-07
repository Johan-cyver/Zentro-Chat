import React, { useState } from 'react';
import { FaStar, FaRegStar, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import { useUser } from '../../contexts/UserContext';
import professionalService from '../../services/professionalService';

const AppRatingSystem = ({ app, onAppUpdated }) => {
  const { userProfile } = useUser();
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingComment, setEditingComment] = useState(null);

  // Check if user has already rated this app
  const existingRating = app.ratings?.find(r => r.userId === userProfile?.uid);
  const userHasRated = !!existingRating;

  const handleRating = async (rating) => {
    if (!userProfile) {
      alert('Please log in to rate this app');
      return;
    }

    try {
      const updatedApp = { ...app };

      if (userHasRated) {
        // Update existing rating
        updatedApp.ratings = updatedApp.ratings.map(r =>
          r.userId === userProfile.uid
            ? { ...r, rating, updatedAt: new Date().toISOString() }
            : r
        );
      } else {
        // Add new rating
        const newRating = {
          userId: userProfile.uid,
          userName: userProfile.displayName || userProfile.email,
          rating,
          createdAt: new Date().toISOString()
        };
        updatedApp.ratings = [...(updatedApp.ratings || []), newRating];
      }

      // Recalculate average rating
      const totalRatings = updatedApp.ratings.length;
      const sumRatings = updatedApp.ratings.reduce((sum, r) => sum + r.rating, 0);
      updatedApp.averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;
      updatedApp.totalRatings = totalRatings;

      // Save to storage
      professionalService.saveApp(updatedApp);

      if (onAppUpdated) {
        onAppUpdated(updatedApp);
      }

      setUserRating(0);
      alert(userHasRated ? 'Rating updated!' : 'Rating submitted!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();

    if (!userProfile) {
      alert('Please log in to comment');
      return;
    }

    if (!comment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const updatedApp = { ...app };

      if (editingComment) {
        // Update existing comment
        updatedApp.comments = updatedApp.comments.map(c =>
          c.id === editingComment.id
            ? { ...c, text: comment.trim(), updatedAt: new Date().toISOString() }
            : c
        );
        setEditingComment(null);
      } else {
        // Add new comment
        const newComment = {
          id: Date.now().toString(),
          userId: userProfile.uid,
          userName: userProfile.displayName || userProfile.email,
          text: comment.trim(),
          createdAt: new Date().toISOString()
        };
        updatedApp.comments = [...(updatedApp.comments || []), newComment];
      }

      // Save to storage
      professionalService.saveApp(updatedApp);

      if (onAppUpdated) {
        onAppUpdated(updatedApp);
      }

      setComment('');
      setShowCommentForm(false);
      alert(editingComment ? 'Comment updated!' : 'Comment added!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const updatedApp = { ...app };
      updatedApp.comments = updatedApp.comments.filter(c => c.id !== commentId);

      // Save to storage
      professionalService.saveApp(updatedApp);

      if (onAppUpdated) {
        onAppUpdated(updatedApp);
      }

      alert('Comment deleted!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const startEditComment = (comment) => {
    setEditingComment(comment);
    setComment(comment.text);
    setShowCommentForm(true);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setComment('');
    setShowCommentForm(false);
  };

  const renderStars = (rating, interactive = false, size = 'text-lg') => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={interactive ? () => handleRating(star) : undefined}
            onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
            onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform ${size}`}
            disabled={!interactive}
          >
            {star <= (interactive ? (hoverRating || userRating) : rating) ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-gray-400" />
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Display */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Ratings & Reviews</h3>

        <div className="flex items-center space-x-4 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white">
              {app.averageRating > 0 ? app.averageRating : 'No ratings'}
            </div>
            {app.averageRating > 0 && (
              <>
                {renderStars(parseFloat(app.averageRating))}
                <div className="text-sm text-gray-400 mt-1">
                  ({app.totalRatings} rating{app.totalRatings !== 1 ? 's' : ''})
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Rating Section */}
        {userProfile && (
          <div className="border-t border-gray-700 pt-4">
            <h4 className="text-md font-medium text-white mb-3">
              {userHasRated ? 'Update your rating:' : 'Rate this app:'}
            </h4>
            {renderStars(existingRating?.rating || 0, true)}
            {userHasRated && (
              <p className="text-sm text-gray-400 mt-2">
                You rated this app {existingRating.rating} star{existingRating.rating !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">
            Comments ({app.comments?.length || 0})
          </h3>
          {userProfile && (
            <button
              onClick={() => setShowCommentForm(!showCommentForm)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
            >
              {showCommentForm ? 'Cancel' : 'Add Comment'}
            </button>
          )}
        </div>

        {/* Comment Form */}
        {showCommentForm && (
          <form onSubmit={handleComment} className="mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts about this app..."
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white resize-none"
              rows={3}
              required
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors"
              >
                {editingComment ? 'Update Comment' : 'Post Comment'}
              </button>
            </div>
          </form>
        )}

        {/* Comments List */}
        <div className="space-y-4">
          {app.comments?.length > 0 ? (
            app.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <FaUser className="text-gray-300 text-sm" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{comment.userName}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(comment.createdAt).toLocaleDateString()}
                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && ' (edited)'}
                      </div>
                    </div>
                  </div>

                  {userProfile?.uid === comment.userId && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditComment(comment)}
                        className="text-gray-400 hover:text-white text-sm"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-400 text-sm"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-300 mt-2">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">
              No comments yet. Be the first to share your thoughts!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppRatingSystem;
