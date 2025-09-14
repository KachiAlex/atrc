import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createCustomAdmin } from '../utils/createDefaultAdmin';
import BookManagement from './BookManagement';
import CourseManagement from './CourseManagement';
import LiveMeetings from './LiveMeetings';

const AdminAccessPanel = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('verification');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRulers: 0,
    pendingVerifications: 0,
    totalAdmins: 0
  });

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      navigate('/app/dashboard');
    }
  }, [userRole, navigate]);

  // Fetch data from Firestore
  useEffect(() => {
    if (userRole === 'admin') {
      fetchDashboardData();
    }
  }, [userRole]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      // Calculate stats
      const activeRulers = usersData.filter(user => user.role === 'ruler').length;
      const pendingVerifications = usersData.filter(user => user.verificationStatus === 'pending').length;
      const totalAdmins = usersData.filter(user => user.role === 'admin').length;

      setStats({
        totalUsers: usersData.length,
        activeRulers,
        pendingVerifications,
        totalAdmins
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminForm.email || !newAdminForm.password || !newAdminForm.displayName) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const result = await createCustomAdmin(
        newAdminForm.email,
        newAdminForm.password,
        newAdminForm.displayName
      );

      if (result.success) {
        alert('Admin user created successfully!');
        setNewAdminForm({ email: '', password: '', displayName: '' });
        setShowCreateAdmin(false);
        fetchDashboardData(); // Refresh data
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      alert('Failed to create admin user');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { role: newRole });
      alert('User role updated successfully!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        alert('User deleted successfully!');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const StatCard = ({ title, value, icon, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-4xl text-primary-500">{icon}</div>
      </div>
    </div>
  );

  const TabButton = ({ value, children, isActive, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-600 text-white shadow-md'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this panel.</p>
          <button
            onClick={() => navigate('/app/dashboard')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col lg:flex-row">
      {/* Admin Sidebar */}
      <div className="w-full lg:w-64 bg-gray-100 shadow-lg lg:shadow-lg">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <span className="text-2xl">👑</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">ATRFC Admin</h2>
            </div>
          </div>
          
          <nav className="space-y-2 lg:space-y-2 flex flex-wrap lg:flex-col gap-2 lg:gap-0">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-sm lg:text-base ${
                activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">👥</span>
              <span className="font-medium hidden sm:inline">User Management</span>
              <span className="font-medium sm:hidden">Users</span>
            </button>
            
            <button
              onClick={() => setActiveTab('verification')}
              className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-sm lg:text-base ${
                activeTab === 'verification' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">🛡️</span>
              <span className="font-medium hidden sm:inline">Verification</span>
              <span className="font-medium sm:hidden">Verify</span>
            </button>
            
            <button
              onClick={() => setActiveTab('books')}
              className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-sm lg:text-base ${
                activeTab === 'books' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">📚</span>
              <span className="font-medium hidden sm:inline">Books</span>
              <span className="font-medium sm:hidden">Books</span>
            </button>
            
            <button
              onClick={() => setActiveTab('courses')}
              className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-sm lg:text-base ${
                activeTab === 'courses' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">🎓</span>
              <span className="font-medium hidden sm:inline">Courses</span>
              <span className="font-medium sm:hidden">Courses</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 lg:w-full flex items-center justify-center lg:justify-start space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 rounded-lg text-left transition-colors text-sm lg:text-base ${
                activeTab === 'analytics' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-lg">📊</span>
              <span className="font-medium hidden sm:inline">Analytics</span>
              <span className="font-medium sm:hidden">Stats</span>
            </button>
          </nav>
          
          <div className="mt-8 p-4 bg-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">Logged in as:</p>
            <p className="font-semibold text-gray-900">{currentUser?.email}</p>
            <p className="text-sm text-blue-600">Super Admin</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar */}
        <div className="bg-blue-900 text-white px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-lg">🏛️</span>
            <span className="font-semibold text-sm sm:text-base">ATRC Leadership Institute</span>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <span className="text-xs sm:text-sm hidden sm:inline">Web App</span>
            <span className="text-xs sm:text-sm hidden lg:inline">Font Size: A A A</span>
            <span className="text-lg">☀️</span>
            <button
              onClick={() => navigate('/app/dashboard')}
              className="bg-red-600 hover:bg-red-700 px-2 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 p-4 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
            <p className="text-gray-600">Manage throne verifications, documents, and overall ATRFC activity.</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Users</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl text-purple-500">👥</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Rulers</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeRulers}</p>
                </div>
                <div className="text-4xl text-yellow-500">👑</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Project Reports</h3>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="text-4xl text-yellow-500">📁</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Community Reports</h3>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
                <div className="text-4xl text-blue-500">📝</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-1 px-6">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'users' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('verification')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'verification' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Verification
                </button>
                <button
                  onClick={() => setActiveTab('projects')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'projects' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'community' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Community
                </button>
                <button
                  onClick={() => setActiveTab('books')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'books' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Books
                </button>
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'courses' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Courses
                </button>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'analytics' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading admin data...</p>
                </div>
              )}

              {/* Verification Cases */}
              {activeTab === 'verification' && !loading && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">User Verification Status</h3>
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">✅</div>
                    <p>No pending verifications.</p>
                  </div>
                </div>
              )}

              {/* System Overview */}
              {activeTab === 'overview' && !loading && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">System Overview</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-white rounded-md">
                        <span className="text-sm text-gray-600">New user registrations</span>
                        <span className="text-sm font-medium text-green-600">+5 this week</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-md">
                        <span className="text-sm text-gray-600">Verification requests</span>
                        <span className="text-sm font-medium text-blue-600">+3 pending</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-md">
                        <span className="text-sm text-gray-600">System uptime</span>
                        <span className="text-sm font-medium text-green-600">99.9%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Quick Actions</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => setActiveTab('users')}
                        className="w-full text-left p-3 bg-white rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">Manage Users</span>
                        <p className="text-sm text-gray-600">View and manage all system users</p>
                      </button>
                      <button
                        onClick={() => setActiveTab('verification')}
                        className="w-full text-left p-3 bg-white rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">Review Verifications</span>
                        <p className="text-sm text-gray-600">Approve pending user verifications</p>
                      </button>
                      <button
                        onClick={() => setShowCreateAdmin(true)}
                        className="w-full text-left p-3 bg-white rounded-md hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-gray-900">Create Admin</span>
                        <p className="text-sm text-gray-600">Add new system administrator</p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* User Management */}
            {activeTab === 'users' && !loading && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">User Management</h3>
                  <button
                    onClick={() => setShowCreateAdmin(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Create Admin
                  </button>
                </div>

                {/* Create Admin Form */}
                {showCreateAdmin && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Create New Admin User</h4>
                    <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="email"
                        placeholder="Email"
                        value={newAdminForm.email}
                        onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                        className="border rounded px-3 py-2"
                        required
                      />
                      <input
                        type="password"
                        placeholder="Password"
                        value={newAdminForm.password}
                        onChange={(e) => setNewAdminForm({...newAdminForm, password: e.target.value})}
                        className="border rounded px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Display Name"
                        value={newAdminForm.displayName}
                        onChange={(e) => setNewAdminForm({...newAdminForm, displayName: e.target.value})}
                        className="border rounded px-3 py-2"
                        required
                      />
                      <div className="md:col-span-3 flex gap-2">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                          Create Admin
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowCreateAdmin(false)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Users List */}
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.displayName || 'No Name'}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-100 text-red-800' :
                            user.role === 'ruler' ? 'bg-blue-100 text-blue-800' :
                            user.role === 'delegate' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <select
                          value={user.role}
                          onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="learner">Learner</option>
                          <option value="ruler">Ruler</option>
                          <option value="delegate">Delegate</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Verification Cases */}
            {activeTab === 'verification' && !loading && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">User Verification Status</h3>
                <div className="space-y-4">
                  {users.filter(user => user.verificationStatus === 'pending').map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.displayName || 'No Name'}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Pending Verification
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateUserRole(user.id, 'ruler')}
                          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                        >
                          <span className="mr-1">✓</span>
                          Approve
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                        >
                          <span className="mr-1">✗</span>
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {users.filter(user => user.verificationStatus === 'pending').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">✅</div>
                      <p>No pending verifications.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && !loading && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">System Security</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white rounded-md">
                        <span className="text-sm text-gray-600">Firebase Authentication</span>
                        <span className="text-sm font-medium text-green-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-md">
                        <span className="text-sm text-gray-600">Firestore Security Rules</span>
                        <span className="text-sm font-medium text-green-600">Enabled</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-white rounded-md">
                        <span className="text-sm text-gray-600">Admin Access Control</span>
                        <span className="text-sm font-medium text-green-600">Protected</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="font-medium text-gray-900 mb-4">Access Logs</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-white rounded-md">
                        <p className="text-sm text-gray-600">Last admin login: {new Date().toLocaleString()}</p>
                      </div>
                      <div className="p-3 bg-white rounded-md">
                        <p className="text-sm text-gray-600">Total admin sessions: {stats.totalAdmins}</p>
                      </div>
                      <div className="p-3 bg-white rounded-md">
                        <p className="text-sm text-gray-600">System status: Operational</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Book Management */}
            {activeTab === 'books' && !loading && (
              <div>
                <BookManagement />
              </div>
            )}

            {/* Course Management */}
            {activeTab === 'courses' && !loading && (
              <div>
                <CourseManagement />
              </div>
            )}

              {/* Live Meetings */}
              {activeTab === 'meetings' && !loading && (
                <div>
                  <LiveMeetings />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessPanel;
