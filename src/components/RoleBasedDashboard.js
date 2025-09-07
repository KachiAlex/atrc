import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TraditionalRulersDashboard from '../pages/TraditionalRulersDashboard';
import AdminDashboard from '../pages/AdminDashboard';

const RoleBasedDashboard = () => {
  const { userRole, loading } = useAuth();

  // Show loading while user role is being fetched
  if (loading || userRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'ruler':
    default:
      return <TraditionalRulersDashboard />;
  }
};

export default RoleBasedDashboard;
