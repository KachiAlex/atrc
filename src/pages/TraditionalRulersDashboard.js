import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import BookReader from './BookReader';
import ProgressTracker from '../components/education/ProgressTracker';
import BookmarkManager from '../components/education/BookmarkManager';
import LearningPaths from '../components/education/LearningPaths';
import QuizSystem from '../components/education/QuizSystem';
import DiscussionForum from '../components/education/DiscussionForum';
import LiveQA from '../components/education/LiveQA';

const TraditionalRulersDashboard = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();

  console.log('TraditionalRulersDashboard - Component rendered');
  const [activeTab, setActiveTab] = useState('profile');
  const [status] = useState("Verified");
  const [stats, setStats] = useState({
    myCommunities: 3,
    activeDisputes: 2,
    upcomingEvents: 4,
    totalMembers: 45,
    documentsPublished: 7
  });

  const statusColor = status === "Verified" ? "bg-green-500" : status === "Pending" ? "bg-yellow-500" : "bg-red-500";

  const tabs = [
    { id: 'profile', label: 'Throne Profile', icon: '👤' },
    { id: 'verification', label: 'Verification', icon: '✅' },
    { id: 'projects', label: 'Projects', icon: '🏗️' },
    { id: 'community', label: 'Community', icon: '👥' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'learning', label: 'Learning Center', icon: '📚' },
    { id: 'library', label: 'Digital Library', icon: '📖' }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Welcome, {currentUser?.displayName || 'Traditional Ruler'}
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your throne profile, documents, events, and training.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md p-6`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Verification Status
            </h3>
            <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-medium ${statusColor}`}>
              {status}
            </span>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md p-6`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Events Created
            </h3>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.upcomingEvents}
            </p>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-md p-6`}>
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Documents Published
            </h3>
            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {stats.documentsPublished}
            </p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md mb-6`}>
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                  activeTab === tab.id
                    ? `${isDarkMode ? 'text-primary-400 border-b-2 border-primary-400' : 'text-primary-600 border-b-2 border-primary-600'}`
                    : `${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Throne Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Throne Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Ife Kingdom"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ruler Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.displayName || "HRM Oba Adewale"}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Country
                  </label>
                  <input
                    type="text"
                    defaultValue="Nigeria"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Verification Status
              </h3>
              <div className="space-y-6">
                {/* Current Status */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Current Verification Status
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your throne and authority have been verified by the ATRC administration.
                  </p>
                </div>

                {/* Verification Requirements */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Verification Requirements
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3">✅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Official throne documentation
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3">✅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Government recognition certificate
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3">✅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Community endorsement letters
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3">✅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        ATRC membership application
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification History */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Verification History
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Initial verification completed
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        March 15, 2024
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Annual verification due
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        March 15, 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Community Development Projects
                </h3>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200">
                  Create New Project
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Projects */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      School Renovation
                    </h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Renovating the local primary school to improve learning conditions.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progress</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦2.5M / ₦3.2M</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Water Well Project
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Planning
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Installing a new water well to provide clean water to the community.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progress</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦800K / ₦3.2M</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Health Center
                    </h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Built a new health center to serve the community's medical needs.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progress</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦5.2M / ₦5.2M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Community Management
                </h3>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200">
                  Add Member
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Community Stats */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Community Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalMembers}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Members
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.myCommunities}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Communities
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.activeDisputes}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Active Disputes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.upcomingEvents}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Upcoming Events
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Members */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recent Members
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          A
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Adebayo Johnson
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Elder
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          F
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Fatima Ibrahim
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Member
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-yellow-600">Pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          O
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Olumide Okafor
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Chief
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Activities */}
              <div className={`mt-6 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Community Activities
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        New member Adebayo Johnson joined the community
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      2 hours ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Community meeting scheduled for next week
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      1 day ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Dispute resolution session completed
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      3 days ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dashboard Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Key Metrics */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Community Members
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalMembers}
                      </p>
                    </div>
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="mt-2">
                    <span className="text-green-600 text-sm">+12%</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      from last month
                    </span>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Active Projects
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        3
                      </p>
                    </div>
                    <div className="text-2xl">🏗️</div>
                  </div>
                  <div className="mt-2">
                    <span className="text-blue-600 text-sm">+1</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      new this month
                    </span>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Events This Month
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.upcomingEvents}
                      </p>
                    </div>
                    <div className="text-2xl">📅</div>
                  </div>
                  <div className="mt-2">
                    <span className="text-purple-600 text-sm">+2</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      scheduled
                    </span>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Documents Published
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.documentsPublished}
                      </p>
                    </div>
                    <div className="text-2xl">📄</div>
                  </div>
                  <div className="mt-2">
                    <span className="text-green-600 text-sm">+3</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      this quarter
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Community Growth Chart */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Community Growth
                  </h4>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '60%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Jan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '70%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Feb</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '80%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mar</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '90%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Apr</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '100%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>May</span>
                    </div>
                  </div>
                </div>

                {/* Project Status Chart */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Project Status Distribution
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completed</span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>In Progress</span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Planning</span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Upload Official Documents
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Document
                  </label>
                  <input
                    type="file"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200">
                  Upload Document
                </button>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Create Event
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event location"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200">
                  Save Event
                </button>
              </div>
            </div>
          )}

          {/* Learning Center Tab */}
          {activeTab === 'learning' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Learning Center
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                  <div className="text-3xl mb-3">📚</div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Christ-Shaped Leadership 101
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Learn to lead with wisdom and integrity based on biblical principles.
                  </p>
                  <button 
                    onClick={() => navigate('/app/courses')}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  >
                    View Course
                  </button>
                </div>
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                  <div className="text-3xl mb-3">⚖️</div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Customary Law and Governance
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Understanding traditional governance systems and customary law.
                  </p>
                  <button 
                    onClick={() => navigate('/app/courses')}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  >
                    View Course
                  </button>
                </div>
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                  <div className="text-3xl mb-3">🤝</div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Conflict Resolution for Rulers
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Master the art of traditional dispute resolution and mediation.
                  </p>
                  <button 
                    onClick={() => navigate('/app/courses')}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  >
                    View Course
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div>
              <ProgressTracker />
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div>
              <BookmarkManager />
            </div>
          )}

          {/* Learning Paths Tab */}
          {activeTab === 'paths' && (
            <div>
              <LearningPaths />
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div>
              <QuizSystem />
            </div>
          )}

          {/* Discussion Forum Tab */}
          {activeTab === 'forum' && (
            <div>
              <DiscussionForum />
            </div>
          )}

          {/* Digital Library Tab */}
          {activeTab === 'library' && (
            <div>
              <BookReader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraditionalRulersDashboard;