import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import ChatRoom from './components/UI/ChatRoom';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import ZentriumLayout from './layouts/ZentriumLayout';
import ZentriumView from './components/AppHub/ZentriumView';

// Lazy load other page components (can remain lazy)
const ChatInterface = React.lazy(() => import('./components/Chat/ChatInterface'));
const GroupsView = React.lazy(() => import('./components/Groups/GroupsView'));
const BlogSection = React.lazy(() => import('./components/Blog/BlogSection'));
const UserProfile = React.lazy(() => import('./components/User/UserProfile'));
const Settings = React.lazy(() => import('./components/Settings/Settings'));
const DMView = React.lazy(() => import('./components/DM/DMView'));
const FriendRequests = React.lazy(() => import('./components/Friends/FriendRequests'));

// Fallback for lazy loading
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen w-full bg-gray-900">
    <p className="text-xl text-white">Loading Page...</p>
  </div>
);

// Placeholder component for testing the parameterized route
const PlaceholderAppDetail = () => {
  const { appId } = useParams();
  
  React.useEffect(() => {
    console.log('[PlaceholderAppDetail] Rendering for appId:', appId);
  }, [appId]);

  return (
    <div style={{ color: 'white', padding: '20px', background: '#111827', height: '100%' }}>
      <h1>App Detail Placeholder</h1>
      <p>App ID: {appId || 'Not Provided'}</p>
      <p>If you see this, the route /apphub/app/:appId is working within the ChatRoom layout!</p>
    </div>
  );
};

// Helper component for the test route to use useParams
const TestId = () => {
  const { id } = useParams();
  React.useEffect(() => {
    console.log('[TestId] Rendering for id:', id);
  }, [id]);
  return <>{id}</>;
};

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* ChatRoom now only for its specific child routes, not Zentrium */}
          <Route element={<ChatRoom />}> 
            <Route index element={<Navigate to="chat" replace />} /> 
            <Route path="chat" element={<ChatInterface />} />
            <Route path="messages" element={<DMView />} />
            <Route path="groups" element={<GroupsView />} />
            <Route path="blog" element={<BlogSection />} />
            <Route path="profile/:userId" element={<UserProfile />} />
            <Route path="profile" element={<UserProfile />} /> 
            <Route path="settings" element={<Settings />} />
            <Route path="friend-requests" element={<FriendRequests />} />
            <Route path="test/:id" element={<div>Reached test route! ID: <TestId /></div>} />
          </Route>

          {/* Zentrium routes directly under Router, using ZentriumLayout */}
          <Route path="/zentrium" element={<ZentriumLayout />}>
            <Route index element={<ZentriumView />} />
            <Route path="app/:appIdFromUrl" element={<ZentriumView />} />
          </Route>
          
          {/* General catch-all for completely unhandled paths */}
          <Route path="*" element={<Navigate to="/login" replace />} /> 
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App; 