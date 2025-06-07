import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './componenents/LoginPage.jsx';
import SignUpPage from './componenents/SignUpPage';
import ChatRoom from './componenents/UI/ChatRoom';
import ProfilePanel from './componenents/UI/ProfilePanel';
import MusicPage from './components/Music/MusicPage';
import BlogSection from './components/Blog/BlogSection';
import TalentDirectory from './components/Recruitment/TalentDirectory';
import ZentroDirectory from './components/Professional/ZentroDirectory';
import Zentrium from './components/AppHub/Zentrium';
import GroupsView from './components/Groups/GroupsView';
import ZennyCoinsDemo from './components/ZennyCoins/ZennyCoinsDemo';
import { UserProvider } from './contexts/UserContext';
import { NotificationProvider } from './components/Notifications/CustomNotificationSystem';
import { ThemeProvider } from './contexts/ThemeContext';
import zennyCoinsInitializer from './utils/zennyCoinsInitializer';
import './styles/responsive.css';
import './styles/professional.css';

function App() {
  // Initialize Zenny Coins system on app startup
  useEffect(() => {
    zennyCoinsInitializer.initialize();
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <NotificationProvider>
          <Router>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/chat" element={<ChatRoom />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/blog" element={<ChatRoom />} />
            <Route path="/profile" element={<ProfilePanel />} />
            <Route path="/talent" element={<TalentDirectory />} />
            <Route path="/directory" element={<ZentroDirectory />} />
            <Route path="/zentrium" element={<Zentrium />} />
            <Route path="/groups" element={<GroupsView />} />
            <Route path="/zenny" element={<ZennyCoinsDemo />} />
          {/* Documentation route */}
          <Route path="/docs" element={
            <div className="min-h-screen bg-gray-900 text-white p-8">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6 text-purple-400">📚 Zentro Chat Documentation</h1>
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4 text-cyan-400">🤖 ZentroBot+ AI Companion System</h2>
                  <p className="text-gray-300 mb-4">
                    Your personal AI companion that adapts to your communication style and energy level.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-300 mb-2">🎭 Personas Available:</h3>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>😎 Chill Friend - Casual conversations</li>
                        <li>📚 Study Buddy - Research & productivity</li>
                        <li>✍️ Journal Coach - Reflection & growth</li>
                        <li>🚀 Hype Bot - Motivation & energy</li>
                        <li>🎨 Content Reviewer - Creative feedback</li>
                      </ul>
                    </div>
                    <div className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-cyan-300 mb-2">🌟 Vibe Matching:</h3>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>⚡ High Energy - Enthusiastic responses</li>
                        <li>😊 Medium Energy - Balanced conversations</li>
                        <li>😌 Low Energy - Calm, supportive tone</li>
                        <li>🎯 Adapts to your communication style</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-6">
                  <h2 className="text-2xl font-semibold mb-4 text-green-400">🚀 Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-purple-300 mb-2">💬 Smart Messaging</h3>
                      <p className="text-sm text-gray-300">Real-time DM system with persistent chat history</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-300 mb-2">📝 Blog System</h3>
                      <p className="text-sm text-gray-300">Create and share content with AI research assistance</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-300 mb-2">🎵 Music Player</h3>
                      <p className="text-sm text-gray-300">Integrated music streaming and discovery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } />
          </Routes>
        </Router>
      </NotificationProvider>
    </UserProvider>
  </ThemeProvider>
  );
}

export default App;
