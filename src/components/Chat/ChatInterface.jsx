import React from 'react';
import { Navigate } from 'react-router-dom';

const ChatInterface = () => {
  // Redirect to messages for now
  return <Navigate to="/messages" replace />;
};

export default ChatInterface;
