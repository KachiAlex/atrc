import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ModernAuth from './pages/auth/ModernAuth';
import RoleBasedDashboard from './components/RoleBasedDashboard';
import CommunityReport from './pages/CommunityReport';
import DisputeResolution from './pages/DisputeResolution';
import EventManagement from './pages/EventManagement';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import ProjectReports from './pages/ProjectReports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import AdminSetup from './pages/AdminSetup';

import './index.css';

// Main App Layout Component
const AppLayout = ({ children }) => (
  <div className="flex h-screen">
    <Sidebar />
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  </div>
);

function App() {
  console.log('App component rendered');
  
  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/auth" element={<ModernAuth />} />
                  <Route path="/admin-setup" element={<AdminSetup />} />
              
              {/* Protected Routes - Simplified Structure */}
              <Route path="/app/dashboard" element={
                <ProtectedRoute>
                  <AppLayout>
                    <RoleBasedDashboard />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/community" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CommunityReport />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/disputes" element={
                <ProtectedRoute>
                  <AppLayout>
                    <DisputeResolution />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/events" element={
                <ProtectedRoute>
                  <AppLayout>
                    <EventManagement />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/announcements" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Announcements />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/reports" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Reports />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/projects" element={
                <ProtectedRoute>
                  <AppLayout>
                    <ProjectReports />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/profile" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/settings" element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Redirect /app to /app/dashboard */}
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;