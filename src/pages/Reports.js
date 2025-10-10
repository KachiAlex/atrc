import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const Reports = () => {
  const { isDarkMode } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    communities: [],
    disputes: [],
    events: [],
    users: [],
    books: [],
    courses: []
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [selectedReportType, setSelectedReportType] = useState('overview');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  const fetchAllData = async () => {
    if (!currentUser) return;
    setLoading(true);

    try {
      // Fetch communities
      const communitiesSnapshot = await getDocs(collection(db, 'communities'));
      const communities = communitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch disputes
      const disputesSnapshot = await getDocs(collection(db, 'disputes'));
      const disputes = disputesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch users (if admin)
      let users = [];
      if (userProfile?.role === 'admin' || userProfile?.role === 'ruler') {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      // Fetch books
      const booksSnapshot = await getDocs(query(collection(db, 'books'), where('isPublished', '==', true)));
      const books = booksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch courses
      const coursesSnapshot = await getDocs(query(collection(db, 'courses'), where('isPublished', '==', true)));
      const courses = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setReportData({ communities, disputes, events, users, books, courses });
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Analytics calculations
  const getDisputesByStatus = () => {
    const statusCount = reportData.disputes.reduce((acc, dispute) => {
      acc[dispute.status] = (acc[dispute.status] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(statusCount).map(([status, count]) => ({
      name: status.replace('_', ' ').toUpperCase(),
      value: count
    }));
  };

  const getEventsByMonth = () => {
    const monthlyEvents = {};
    reportData.events.forEach(event => {
      if (event.startDate) {
        const date = event.startDate.toDate ? event.startDate.toDate() : new Date(event.startDate);
        const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyEvents[month] = (monthlyEvents[month] || 0) + 1;
      }
    });

    return Object.entries(monthlyEvents)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => new Date(a.month) - new Date(b.month));
  };

  const getUsersByRole = () => {
    const roleCount = reportData.users.reduce((acc, user) => {
      const role = user.role || 'member';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(roleCount).map(([role, count]) => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: count
    }));
  };

  const getCommunityStats = () => {
    return reportData.communities.map(community => ({
      name: community.name,
      members: community.members || 0,
      active: community.status === 'active' ? 1 : 0
    }));
  };

  const getDisputesByCategory = () => {
    const categoryCount = reportData.disputes.reduce((acc, dispute) => {
      acc[dispute.category] = (acc[dispute.category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCount).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      count
    }));
  };

  const downloadReport = (type) => {
    let reportContent = {};
    const timestamp = new Date().toISOString().split('T')[0];

    switch (type) {
      case 'overview':
        reportContent = {
          generatedAt: new Date().toLocaleString(),
          summary: {
            totalCommunities: reportData.communities.length,
            activeCommunities: reportData.communities.filter(c => c.status === 'active').length,
            totalDisputes: reportData.disputes.length,
            pendingDisputes: reportData.disputes.filter(d => d.status === 'pending').length,
            resolvedDisputes: reportData.disputes.filter(d => d.status === 'resolved').length,
            totalEvents: reportData.events.length,
            totalUsers: reportData.users.length,
            totalBooks: reportData.books.length,
            totalCourses: reportData.courses.length
          },
          communities: reportData.communities,
          disputes: reportData.disputes,
          events: reportData.events
        };
        break;
      case 'communities':
        reportContent = {
          generatedAt: new Date().toLocaleString(),
          communities: reportData.communities,
          statistics: {
            total: reportData.communities.length,
            active: reportData.communities.filter(c => c.status === 'active').length,
            totalMembers: reportData.communities.reduce((sum, c) => sum + (c.members || 0), 0)
          }
        };
        break;
      case 'disputes':
        reportContent = {
          generatedAt: new Date().toLocaleString(),
          disputes: reportData.disputes,
          statistics: {
            total: reportData.disputes.length,
            byStatus: getDisputesByStatus(),
            byCategory: getDisputesByCategory()
          }
        };
        break;
      case 'events':
        reportContent = {
          generatedAt: new Date().toLocaleString(),
          events: reportData.events,
          statistics: {
            total: reportData.events.length,
            upcoming: reportData.events.filter(e => {
              const date = e.startDate?.toDate ? e.startDate.toDate() : new Date(e.startDate);
              return date > new Date();
            }).length
          }
        };
        break;
      default:
        reportContent = { error: 'Invalid report type' };
    }

    // Create downloadable JSON file
    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-report-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`${type} report downloaded successfully!`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Reports & Analytics
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive insights and analytics for your organization
          </p>
        </div>

        {/* Report Type Selector */}
        <div className="mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setSelectedReportType('overview')}
                className={`px-4 py-2 rounded-md ${
                  selectedReportType === 'overview'
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setSelectedReportType('communities')}
                className={`px-4 py-2 rounded-md ${
                  selectedReportType === 'communities'
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Communities
              </button>
              <button
                onClick={() => setSelectedReportType('disputes')}
                className={`px-4 py-2 rounded-md ${
                  selectedReportType === 'disputes'
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Disputes
              </button>
              <button
                onClick={() => setSelectedReportType('events')}
                className={`px-4 py-2 rounded-md ${
                  selectedReportType === 'events'
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => downloadReport(selectedReportType)}
                className="ml-auto px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                Download Report
              </button>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Communities
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reportData.communities.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {reportData.communities.filter(c => c.status === 'active').length} active
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Disputes
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reportData.disputes.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {reportData.disputes.filter(d => d.status === 'resolved').length} resolved
                </p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Events
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reportData.events.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {reportData.events.filter(e => {
                    const date = e.startDate?.toDate ? e.startDate.toDate() : new Date(e.startDate);
                    return date > new Date();
                  }).length} upcoming
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Educational Content
                </p>
                <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {reportData.books.length + reportData.courses.length}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {reportData.books.length} books, {reportData.courses.length} courses
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Dispute Status Chart */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Disputes by Status
            </h3>
            {getDisputesByStatus().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getDisputesByStatus()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getDisputesByStatus().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No data available</p>
            )}
          </div>

          {/* Disputes by Category */}
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Disputes by Category
            </h3>
            {getDisputesByCategory().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getDisputesByCategory()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                  <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No data available</p>
            )}
          </div>

          {/* Community Statistics */}
          {reportData.communities.length > 0 && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Community Members
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getCommunityStats().slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                  <YAxis stroke={isDarkMode ? '#9CA3AF' : '#4B5563'} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1F2937' : '#FFFFFF', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="members" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Users by Role */}
          {reportData.users.length > 0 && (
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Users by Role
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getUsersByRole()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getUsersByRole().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Report Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => downloadReport('overview')}
            className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 text-left transition-colors`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📊 Overview Report
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Comprehensive overview of all activities
            </p>
            <span className="text-primary-600 text-sm font-medium">Download Report →</span>
          </button>

          <button
            onClick={() => downloadReport('communities')}
            className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 text-left transition-colors`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              👥 Community Report
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Detailed community analysis and statistics
            </p>
            <span className="text-primary-600 text-sm font-medium">Download Report →</span>
          </button>

          <button
            onClick={() => downloadReport('disputes')}
            className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 text-left transition-colors`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ⚖️ Dispute Analytics
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Analysis of dispute resolution patterns
            </p>
            <span className="text-primary-600 text-sm font-medium">Download Report →</span>
          </button>

          <button
            onClick={() => downloadReport('events')}
            className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 text-left transition-colors`}
          >
            <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              📅 Event Statistics
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Cultural events and ceremonies data
            </p>
            <span className="text-primary-600 text-sm font-medium">Download Report →</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
