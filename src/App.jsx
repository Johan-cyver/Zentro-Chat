import React, { Suspense, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import ChatRoom from './componenents/UI/ChatRoom';
import LoginPage from './componenents/LoginPage';
import SignupPage from './componenents/SignUpPage';
import ZentriumLayout from './layouts/ZentriumLayout';
import ZentriumView from './components/AppHub/ZentriumView';

// Import new components for missing routes
import ZentroEconomy from './components/Economy/ZentroEconomy';
import ZentroAchievements from './components/Achievements/ZentroAchievements';
import ZentroQuests from './components/Quests/ZentroQuests';

// Import core community features
import ZentroDirectory from './components/Professional/ZentroDirectory';
import ZentroDashboard from './components/Dashboard/ZentroDashboard';
import AppSidebar from './components/UI/AppSidebar';
import SettingsPanel from './components/Settings/SettingsPanel';
import SecretAlley from './components/Community/SecretAlley';

// Zentro Ecosystem components integrated into existing sidebar

// Import contexts
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { NotificationProvider } from './components/Notifications/CustomNotificationSystem';

// Import ZentroVerse Nexus Premium Cards CSS
import './styles/zentroverse-nexus-cards.css';

// Import Zenny Coins initializer
import zennyCoinsInitializer from './utils/zennyCoinsInitializer';

// Lazy load other page components
const ChatInterface = React.lazy(() => import('./components/Chat/ChatInterface'));
const GroupsView = React.lazy(() => import('./components/Groups/GroupsView'));
const BlogSection = React.lazy(() => import('./components/Blog/BlogSection'));
const UserProfile = React.lazy(() => import('./components/User/UserProfile'));
const Settings = React.lazy(() => import('./components/Settings/SettingsPanel'));
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

// Authentication wrapper component
function AuthenticatedApp() {
  const { currentUser, loading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Permanently visible

  // Show loading screen while checking authentication
  if (loading) {
    return <PageLoader />;
  }

  // If user is not authenticated, show login/signup routes only
  if (!currentUser) {
    return (
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }

  // User is authenticated, show the full app
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            {/* App Sidebar */}
            <AppSidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

            {/* Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-4 left-4 z-40 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 lg:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="fixed top-4 left-4 z-40 p-2 bg-gray-800/80 backdrop-blur-sm text-white rounded-lg shadow-lg hover:bg-gray-700/80 transition-all hidden lg:block"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Suspense fallback={<PageLoader />}>
              <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route path="/" element={<Navigate to="/messages" replace />} />
          <Route path="/login" element={<Navigate to="/blog" replace />} />
          
          {/* ChatRoom now only for its specific child routes, not Zentrium */}
          <Route element={<ChatRoom />}>
            <Route index element={<Navigate to="chat" replace />} />
            <Route path="chat" element={<ChatInterface />} />
            <Route path="groups" element={<GroupsView />} />
            <Route path="profile/:userId" element={<UserProfile />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="friend-requests" element={<FriendRequests />} />
            <Route path="test/:id" element={<div>Reached test route! ID: <TestId /></div>} />
          </Route>

          {/* Messages with AppSidebar */}
          <Route path="/messages" element={<div className="ml-20"><DMView /></div>} />

            {/* Community Hub - Secret Alley (Fullscreen Underground Experience) */}
            <Route path="/secret-alley" element={<SecretAlley />} />

            {/* Zentro features integrated into existing sidebar navigation */}

            {/* Core Community Features */}
            <Route path="/zentrium" element={<div className="ml-20"><ZentriumLayout /></div>}>
              <Route index element={<ZentriumView />} />
              <Route path="app/:appIdFromUrl" element={<ZentriumView />} />
            </Route>
            <Route path="/directory" element={<div className="ml-20"><ZentroDirectory /></div>} />
            <Route path="/blog" element={<div className="ml-20"><BlogSection /></div>} />

            {/* New feature routes */}
            <Route path="/economy" element={<div className="ml-20"><ZentroEconomy /></div>} />
            <Route path="/achievements" element={<div className="ml-20"><ZentroAchievements /></div>} />
            <Route path="/quests" element={<div className="ml-20"><ZentroQuests /></div>} />
            <Route path="/dashboard" element={<div className="ml-20"><ZentroDashboard /></div>} />
            <Route path="/settings" element={
              <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black flex items-center justify-center ml-20">
                <SettingsPanel isOpen={true} onClose={() => window.history.back()} />
              </div>
            } />

            {/* General catch-all for completely unhandled paths */}
            <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Router>
  );
}

// Main App component with providers
function App() {
  // Initialize Zenny Coins system on app startup
  useEffect(() => {
    zennyCoinsInitializer.initialize();
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <AuthenticatedApp />
        </NotificationProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App; 