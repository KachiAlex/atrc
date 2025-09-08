import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const SimpleDashboard = () => {
  const { currentUser, userRole } = useAuth();

  console.log('SimpleDashboard rendered - currentUser:', currentUser, 'userRole:', userRole);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Dashboard is Working!
          </h1>
          
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            <strong>Success!</strong> You have successfully logged in and reached the dashboard.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-blue-900 mb-2">User Information</h2>
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Role:</strong> {userRole}</p>
              <p><strong>User ID:</strong> {currentUser?.uid}</p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-purple-900 mb-2">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Manage Communities
                </button>
                <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Resolve Disputes
                </button>
                <button className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  Plan Events
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">Debug Information</h3>
            <pre className="text-sm text-yellow-700">
              {JSON.stringify({
                currentUser: currentUser ? {
                  email: currentUser.email,
                  uid: currentUser.uid,
                  displayName: currentUser.displayName
                } : null,
                userRole: userRole
              }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
