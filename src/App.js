import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import CommunityManagement from './pages/CommunityManagement';
import DisputeResolution from './pages/DisputeResolution';
import EventManagement from './pages/EventManagement';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';

import './index.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <div className="flex h-screen">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto">
                      <Routes>
                        <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="/app/dashboard" element={<Dashboard />} />
                        <Route path="/app/community" element={<CommunityManagement />} />
                        <Route path="/app/disputes" element={<DisputeResolution />} />
                        <Route path="/app/events" element={<EventManagement />} />
                        <Route path="/app/announcements" element={<Announcements />} />
                        <Route path="/app/reports" element={<Reports />} />
                        <Route path="/app/profile" element={<Profile />} />
                        <Route path="/app/settings" element={<Settings />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            } />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
