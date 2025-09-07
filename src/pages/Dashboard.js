import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const [stats, setStats] = useState({
    totalCommunities: 0,
    activeDisputes: 0,
    upcomingEvents: 0,
    totalMembers: 0
  });

  useEffect(() => {
    // Simulate loading stats - in real app, this would fetch from Firestore
    const loadStats = () => {
      setStats({
        totalCommunities: 12,
        activeDisputes: 8,
        upcomingEvents: 5,
        totalMembers: 156
      });
    };

    loadStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon, onClick }) => (
    <button
      onClick={onClick}
      className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 text-left transition-colors duration-200 w-full`}
    >
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-100">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome back, {currentUser?.displayName || 'User'}!
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            African Traditional Rulers Council Dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Communities"
            value={stats.totalCommunities}
            icon="🏘️"
            color="bg-blue-100"
          />
          <StatCard
            title="Active Disputes"
            value={stats.activeDisputes}
            icon="⚖️"
            color="bg-yellow-100"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon="📅"
            color="bg-green-100"
          />
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            icon="👥"
            color="bg-purple-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title="Manage Communities"
              description="Add, edit, or view traditional communities"
              icon="🏘️"
              onClick={() => {/* Navigate to communities */}}
            />
            <QuickAction
              title="Resolve Disputes"
              description="Handle traditional dispute resolution"
              icon="⚖️"
              onClick={() => {/* Navigate to disputes */}}
            />
            <QuickAction
              title="Plan Events"
              description="Organize cultural events and ceremonies"
              icon="📅"
              onClick={() => {/* Navigate to events */}}
            />
            <QuickAction
              title="Send Announcements"
              description="Communicate with community members"
              icon="📢"
              onClick={() => {/* Navigate to announcements */}}
            />
            <QuickAction
              title="View Reports"
              description="Access analytics and reports"
              icon="📊"
              onClick={() => {/* Navigate to reports */}}
            />
            <QuickAction
              title="Manage Profile"
              description="Update your profile information"
              icon="👤"
              onClick={() => {/* Navigate to profile */}}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 border-l-4 border-primary-500 bg-primary-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚖️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  New dispute filed by Chief Adebayo
                </p>
                <p className="text-sm text-gray-600">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-green-500 bg-green-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  Cultural festival scheduled for next month
                </p>
                <p className="text-sm text-gray-600">1 day ago</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  5 new members joined the community
                </p>
                <p className="text-sm text-gray-600">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
