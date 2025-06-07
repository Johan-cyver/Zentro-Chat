import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/UserContext'; // Adjust this path if your UserContext is elsewhere

const PrivateRoute = () => {
  const { currentUser, loading } = useUser(); // Assuming your context provides a loading state
  const location = useLocation();

  if (loading) {
    // Optional: Show a loading spinner or a blank page while auth state is being determined
    // This prevents a flash of the login page if auth check is async
    return (
      <div className="flex justify-center items-center h-screen w-full bg-gray-900">
        <p className="text-xl text-white">Authenticating...</p>
      </div>
    );
  }

  if (!currentUser) {
    // Not logged in, redirect to login page
    // Preserve the intended location so user can be redirected back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in, render the child routes defined within this route in App.jsx
  return <Outlet />;
};

export default PrivateRoute; 