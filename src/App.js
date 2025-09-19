import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import MobileNav from './components/layout/MobileNav';
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
import AdminAccessPanel from './pages/AdminAccessPanel';
import BookReader from './pages/BookReader';
import CourseReader from './pages/CourseReader';
import LiveMeetingsViewer from './pages/LiveMeetingsViewer';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import LogoTest from './components/LogoTest';
import LogoDebug from './components/LogoDebug';

import './index.css';

// Main App Layout Component
const AppLayout = ({ children }) => (
  <div className="flex h-screen">
    {/* Desktop Sidebar */}
    <div className="hidden lg:block">
      <Sidebar />
    </div>
    
    {/* Mobile Navigation */}
    <div className="lg:hidden">
      <MobileNav />
    </div>
    
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <Navbar />
      </div>
      
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
                  <Route path="/logo-test" element={<LogoTest />} />
                  <Route path="/logo-debug" element={<LogoDebug />} />
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
              
              <Route path="/app/books" element={
                <ProtectedRoute>
                  <AppLayout>
                    <BookReader />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/admin/panel" element={
                <ProtectedRoute>
                  <AdminAccessPanel />
                </ProtectedRoute>
              } />
              
              <Route path="/app/courses" element={
                <ProtectedRoute>
                  <AppLayout>
                    <CourseReader />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/app/meetings" element={
                <ProtectedRoute>
                  <AppLayout>
                    <LiveMeetingsViewer />
                  </AppLayout>
                </ProtectedRoute>
              } />
              
              {/* Redirect /app to /app/dashboard */}
              <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            
            {/* PWA Install Prompt */}
            <PWAInstallPrompt />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  style: {
                    background: '#10B981',
                  },
                },
                error: {
                  duration: 5000,
                  style: {
                    background: '#EF4444',
                  },
                },
              }}
            />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App;