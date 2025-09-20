import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
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
  const [projects, setProjects] = useState([]);
  const [communityReports, setCommunityReports] = useState([]);
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    password: '',
    displayName: ''
  });
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    title: '',
    description: '',
    community: '',
    budget: '',
    timeline: '',
    status: 'planning'
  });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRulers: 0,
    pendingVerifications: 0,
    totalAdmins: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalCommunityReports: 0
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

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isVerified: isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? currentUser.uid : null
      });
      
      // Refresh user data
      fetchDashboardData();
      
      console.log(`User ${isVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      // Fetch projects
      const projectsQuery = query(collection(db, 'projectReports'), orderBy('createdAt', 'desc'));
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projectsData);

      // Fetch community reports
      const communityQuery = query(collection(db, 'communityReports'), orderBy('createdAt', 'desc'));
      const communitySnapshot = await getDocs(communityQuery);
      const communityData = communitySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommunityReports(communityData);

      // Calculate stats
      const activeRulers = usersData.filter(user => user.role === 'ruler').length;
      const pendingVerifications = usersData.filter(user => user.verificationStatus === 'pending').length;
      const totalAdmins = usersData.filter(user => user.role === 'admin').length;
      const activeProjects = projectsData.filter(project => project.status === 'ongoing' || project.status === 'active').length;
      const completedProjects = projectsData.filter(project => project.status === 'completed').length;

      setStats({
        totalUsers: usersData.length,
        activeRulers,
        pendingVerifications,
        totalAdmins,
        totalProjects: projectsData.length,
        activeProjects,
        completedProjects,
        totalCommunityReports: communityData.length
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
      const updateData = { 
        role: newRole,
        updatedAt: new Date(),
        updatedBy: currentUser?.email
      };
      
      // Auto-verify admin users
      if (newRole === 'admin') {
        updateData.isVerified = true;
        updateData.verifiedAt = new Date();
        updateData.verifiedBy = 'system';
      }
      
      await updateDoc(userRef, updateData);
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


  const handleRequestMoreInfo = async (userId) => {
    const additionalInfo = prompt('What additional information do you need from this user?');
    if (additionalInfo) {
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { 
          verificationStatus: 'pending',
          requestedInfo: additionalInfo,
          requestedAt: new Date(),
          requestedBy: currentUser?.email
        });
        alert('Information request sent to user successfully!');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error requesting more info:', error);
        alert('Failed to send information request');
      }
    }
  };

  const handleViewFullProfile = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      // Create a detailed profile view
      const profileWindow = window.open('', '_blank', 'width=800,height=600');
      profileWindow.document.write(`
        <html>
          <head>
            <title>User Profile - ${user.displayName || 'Unknown'}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
              .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              .header { border-bottom: 2px solid #e5e5e5; padding-bottom: 20px; margin-bottom: 20px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; color: #666; }
              .value { margin-bottom: 10px; }
              .documents { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
              .document { background: #f0f8ff; padding: 10px; border-radius: 4px; border: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>👑 ${user.displayName || 'No Name Provided'}</h1>
                <p>Email: ${user.email}</p>
                <p>Status: <span style="color: ${user.verificationStatus === 'pending' ? 'orange' : user.verificationStatus === 'verified' ? 'green' : 'red'}">${user.verificationStatus}</span></p>
              </div>
              
              <div class="section">
                <h3>🏛️ Throne Information</h3>
                <div class="value"><span class="label">Throne Name:</span> ${user.throneName || 'Not provided'}</div>
                <div class="value"><span class="label">Title:</span> ${user.title || 'Not provided'}</div>
                <div class="value"><span class="label">Kingdom/Community:</span> ${user.kingdom || 'Not provided'}</div>
                <div class="value"><span class="label">State/Region:</span> ${user.state || 'Not provided'}</div>
                <div class="value"><span class="label">Country:</span> ${user.country || 'Not provided'}</div>
              </div>
              
              <div class="section">
                <h3>📋 Contact Information</h3>
                <div class="value"><span class="label">Phone Number:</span> ${user.phoneNumber || 'Not provided'}</div>
                <div class="value"><span class="label">Address:</span> ${user.address || 'Not provided'}</div>
              </div>
              
              <div class="section">
                <h3>📄 Submitted Documents</h3>
                ${user.documents && user.documents.length > 0 ? 
                  `<div class="documents">
                    ${user.documents.map(doc => `
                      <div class="document">
                        <strong>${doc.name || 'Document'}</strong><br>
                        Type: ${doc.type || 'Unknown'}<br>
                        ${doc.url ? `<a href="${doc.url}" target="_blank">View Document</a>` : 'No URL provided'}
                      </div>
                    `).join('')}
                  </div>` : 
                  '<p>No documents submitted</p>'
                }
              </div>
              
              ${user.additionalInfo ? `
                <div class="section">
                  <h3>ℹ️ Additional Information</h3>
                  <p>${user.additionalInfo}</p>
                </div>
              ` : ''}
              
              <div class="section">
                <h3>📊 Verification History</h3>
                <div class="value"><span class="label">Application Date:</span> ${user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleString() : 'Unknown'}</div>
                ${user.verifiedAt ? `<div class="value"><span class="label">Verified At:</span> ${new Date(user.verifiedAt.seconds * 1000).toLocaleString()}</div>` : ''}
                ${user.rejectedAt ? `<div class="value"><span class="label">Rejected At:</span> ${new Date(user.rejectedAt.seconds * 1000).toLocaleString()}</div>` : ''}
                ${user.requestedInfo ? `<div class="value"><span class="label">Requested Info:</span> ${user.requestedInfo}</div>` : ''}
              </div>
            </div>
          </body>
        </html>
      `);
      profileWindow.document.close();
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectForm.title || !newProjectForm.description || !newProjectForm.community) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'projectReports'), {
        ...newProjectForm,
        budget: parseFloat(newProjectForm.budget) || 0,
        createdBy: currentUser?.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      alert('Project created successfully!');
      setNewProjectForm({
        title: '',
        description: '',
        community: '',
        budget: '',
        timeline: '',
        status: 'planning'
      });
      setShowCreateProject(false);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    }
  };

  const handleUpdateProjectStatus = async (projectId, newStatus) => {
    try {
      const projectRef = doc(db, 'projectReports', projectId);
      await updateDoc(projectRef, { 
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: currentUser?.email
      });
      alert('Project status updated successfully!');
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteDoc(doc(db, 'projectReports', projectId));
        alert('Project deleted successfully!');
        fetchDashboardData(); // Refresh data
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project');
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
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Projects</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
                <div className="text-4xl text-yellow-500">📁</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Community Reports</h3>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalCommunityReports}</p>
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
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin' ? 'bg-red-100 text-red-800' :
                              user.role === 'ruler' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'delegate' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                            {user.role === 'admin' ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                ✅ Auto-Verified
                              </span>
                            ) : (
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                              </span>
                            )}
                          </div>
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
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">User Verification Status</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('users')}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View All Users
                    </button>
                  </div>
                </div>

                {/* Verification Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">⏳</div>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Pending Verification</p>
                        <p className="text-2xl font-bold text-yellow-900">
                          {users.filter(user => !user.isVerified && user.role !== 'admin').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">✅</div>
                      <div>
                        <p className="text-sm font-medium text-green-800">Verified Rulers</p>
                        <p className="text-2xl font-bold text-green-900">
                          {users.filter(user => user.isVerified === true && user.role === 'ruler').length}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">❌</div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Rejected</p>
                        <p className="text-2xl font-bold text-red-900">
                          {users.filter(user => user.isVerified === false && user.isActive === false).length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {users.filter(user => user.role !== 'admin').map((user) => (
                    <div
                      key={user.id}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow bg-white"
                    >
                      {/* User Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-2xl text-white">👑</span>
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-gray-900">
                              {user.displayName || 'No Name Provided'}
                            </h4>
                            <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                user.isVerified 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {user.isVerified ? '✅ Verified' : '⏳ Pending Verification'}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                user.role === 'ruler' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                              <span className="text-xs text-gray-500">
                                Joined: {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Throne Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">🏛️</span>
                            Throne Information
                          </h5>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Throne Name:</span>
                              <p className="text-gray-900">{user.throneName || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Title:</span>
                              <p className="text-gray-900">{user.title || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Kingdom/Community:</span>
                              <p className="text-gray-900">{user.kingdom || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">State/Region:</span>
                              <p className="text-gray-900">{user.state || 'Not provided'}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">📋</span>
                            Verification Details
                          </h5>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-600">Application Date:</span>
                              <p className="text-gray-900">
                                {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Phone Number:</span>
                              <p className="text-gray-900">{user.phoneNumber || 'Not provided'}</p>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600">Current Role:</span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === 'ruler' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role || 'learner'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Documents Section */}
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <span className="mr-2">📄</span>
                          Submitted Documents
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {user.documents && user.documents.length > 0 ? (
                            user.documents.map((doc, index) => (
                              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <span className="text-blue-600 mr-2">📄</span>
                                    <div>
                                      <p className="text-sm font-medium text-blue-900">{doc.name || `Document ${index + 1}`}</p>
                                      <p className="text-xs text-blue-700">{doc.type || 'Unknown type'}</p>
                                    </div>
                                  </div>
                                  {doc.url && (
                                    <a
                                      href={doc.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                      View
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                              <div className="flex items-center">
                                <span className="text-yellow-600 mr-2">⚠️</span>
                                <p className="text-yellow-800">No documents submitted</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Additional Information */}
                      {user.additionalInfo && (
                        <div className="mb-6">
                          <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <span className="mr-2">ℹ️</span>
                            Additional Information
                          </h5>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700">{user.additionalInfo}</p>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                        {user.isVerified ? (
                          <button
                            onClick={() => handleVerifyUser(user.id, false)}
                            className="flex items-center px-6 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
                          >
                            <span className="mr-2">⏸️</span>
                            Unverify User
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyUser(user.id, true)}
                            className="flex items-center px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                          >
                            <span className="mr-2">✅</span>
                            Verify User
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="flex items-center px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                        >
                          <span className="mr-2">🗑️</span>
                          Delete User
                        </button>
                        <button
                          onClick={() => handleRequestMoreInfo(user.id)}
                          className="flex items-center px-6 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
                        >
                          <span className="mr-2">📝</span>
                          Request More Info
                        </button>
                        <button
                          onClick={() => handleViewFullProfile(user.id)}
                          className="flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          <span className="mr-2">👁️</span>
                          View Full Profile
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {users.filter(user => user.verificationStatus === 'pending').length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-6xl mb-4">✅</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                      <p>No pending verifications at this time.</p>
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

            {/* Projects Management */}
            {activeTab === 'projects' && !loading && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Project Management</h3>
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Create Project
                  </button>
                </div>

                {/* Create Project Form */}
                {showCreateProject && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-lg font-medium mb-4">Create New Project</h4>
                    <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Project Title"
                        value={newProjectForm.title}
                        onChange={(e) => setNewProjectForm({...newProjectForm, title: e.target.value})}
                        className="border rounded px-3 py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Community"
                        value={newProjectForm.community}
                        onChange={(e) => setNewProjectForm({...newProjectForm, community: e.target.value})}
                        className="border rounded px-3 py-2"
                        required
                      />
                      <textarea
                        placeholder="Project Description"
                        value={newProjectForm.description}
                        onChange={(e) => setNewProjectForm({...newProjectForm, description: e.target.value})}
                        className="border rounded px-3 py-2 md:col-span-2"
                        rows="3"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Budget (₦)"
                        value={newProjectForm.budget}
                        onChange={(e) => setNewProjectForm({...newProjectForm, budget: e.target.value})}
                        className="border rounded px-3 py-2"
                      />
                      <input
                        type="text"
                        placeholder="Timeline"
                        value={newProjectForm.timeline}
                        onChange={(e) => setNewProjectForm({...newProjectForm, timeline: e.target.value})}
                        className="border rounded px-3 py-2"
                      />
                      <select
                        value={newProjectForm.status}
                        onChange={(e) => setNewProjectForm({...newProjectForm, status: e.target.value})}
                        className="border rounded px-3 py-2"
                      >
                        <option value="planning">Planning</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                      <div className="md:col-span-2 flex gap-2">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                          Create Project
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setShowCreateProject(false)}
                          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Projects List */}
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h4>
                          <p className="text-gray-600 mb-3">{project.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Community:</span>
                              <p className="text-gray-600">{project.community}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Budget:</span>
                              <p className="text-gray-600">₦{project.budget?.toLocaleString() || 'Not specified'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Timeline:</span>
                              <p className="text-gray-600">{project.timeline || 'Not specified'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            project.status === 'completed' ? 'bg-green-100 text-green-800' :
                            project.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                            project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {project.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Created: {project.createdAt ? new Date(project.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                        <select
                          value={project.status}
                          onChange={(e) => handleUpdateProjectStatus(project.id, e.target.value)}
                          className="border rounded px-3 py-1 text-sm"
                        >
                          <option value="planning">Planning</option>
                          <option value="ongoing">Ongoing</option>
                          <option value="completed">Completed</option>
                          <option value="on_hold">On Hold</option>
                        </select>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-300 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {projects.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-6xl mb-4">📁</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Yet</h3>
                      <p>Create your first project to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Community Management */}
            {activeTab === 'community' && !loading && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Community Reports</h3>
                  <div className="text-sm text-gray-600">
                    Total Reports: {stats.totalCommunityReports}
                  </div>
                </div>

                <div className="space-y-4">
                  {communityReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-gray-900 mb-2">{report.title}</h4>
                          <p className="text-gray-600 mb-3">{report.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Community:</span>
                              <p className="text-gray-600">{report.community}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Category:</span>
                              <p className="text-gray-600">{report.category}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Priority:</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                report.priority === 'high' ? 'bg-red-100 text-red-800' :
                                report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {report.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            Submitted: {report.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                          </span>
                        </div>
                      </div>
                      
                      {report.attachmentUrl && (
                        <div className="pt-4 border-t border-gray-200">
                          <a
                            href={report.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            📎 View Attachment
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {communityReports.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Community Reports</h3>
                      <p>Community reports will appear here when submitted.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Dashboard */}
            {activeTab === 'analytics' && !loading && (
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Platform Analytics</h3>
                
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total Users</p>
                        <p className="text-3xl font-bold">{stats.totalUsers}</p>
                      </div>
                      <div className="text-3xl">👥</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Verified Rulers</p>
                        <p className="text-3xl font-bold">{stats.activeRulers}</p>
                      </div>
                      <div className="text-3xl">👑</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">Active Projects</p>
                        <p className="text-3xl font-bold">{stats.activeProjects}</p>
                      </div>
                      <div className="text-3xl">📁</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Community Reports</p>
                        <p className="text-3xl font-bold">{stats.totalCommunityReports}</p>
                      </div>
                      <div className="text-3xl">📝</div>
                    </div>
                  </div>
                </div>

                {/* Charts and Detailed Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Growth Chart */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h4>
                    <div className="h-64 flex items-end justify-between space-x-2">
                      <div className="flex flex-col items-center">
                        <div className="w-8 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
                        <span className="text-xs mt-2 text-gray-500">Jan</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 bg-blue-500 rounded-t" style={{height: '70%'}}></div>
                        <span className="text-xs mt-2 text-gray-500">Feb</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 bg-blue-500 rounded-t" style={{height: '80%'}}></div>
                        <span className="text-xs mt-2 text-gray-500">Mar</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 bg-blue-500 rounded-t" style={{height: '90%'}}></div>
                        <span className="text-xs mt-2 text-gray-500">Apr</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="w-8 bg-blue-500 rounded-t" style={{height: '100%'}}></div>
                        <span className="text-xs mt-2 text-gray-500">May</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Status Distribution */}
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Status</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                          <span className="text-gray-600">Completed</span>
                        </div>
                        <span className="font-semibold text-gray-900">{stats.completedProjects}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                          <span className="text-gray-600">Active</span>
                        </div>
                        <span className="font-semibold text-gray-900">{stats.activeProjects}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                          <span className="text-gray-600">Planning</span>
                        </div>
                        <span className="font-semibold text-gray-900">{stats.totalProjects - stats.activeProjects - stats.completedProjects}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-600">New user registrations</span>
                      <span className="text-sm font-medium text-green-600">+{Math.floor(Math.random() * 10) + 1} this week</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-600">Verification requests</span>
                      <span className="text-sm font-medium text-blue-600">+{stats.pendingVerifications} pending</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-600">Project submissions</span>
                      <span className="text-sm font-medium text-yellow-600">+{Math.floor(Math.random() * 5) + 1} this month</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <span className="text-sm text-gray-600">System uptime</span>
                      <span className="text-sm font-medium text-green-600">99.9%</span>
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
