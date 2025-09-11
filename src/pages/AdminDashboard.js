import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createCustomAdmin } from '../utils/createDefaultAdmin';
import BookManagement from './BookManagement';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('verification');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [projectReports, setProjectReports] = useState([]);
  const [communityReports, setCommunityReports] = useState([]);
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
    projectReports: 0,
    communityReports: 0
  });

  // Fetch data from Firestore
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch users
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      // Fetch project reports
      const projectReportsQuery = query(collection(db, 'projectReports'), orderBy('createdAt', 'desc'));
      const projectReportsSnapshot = await getDocs(projectReportsQuery);
      const projectReportsData = projectReportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjectReports(projectReportsData);

      // Fetch community reports
      const communityReportsQuery = query(collection(db, 'communityReports'), orderBy('createdAt', 'desc'));
      const communityReportsSnapshot = await getDocs(communityReportsQuery);
      const communityReportsData = communityReportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCommunityReports(communityReportsData);

      // Calculate stats
      const activeRulers = usersData.filter(user => user.role === 'ruler').length;
      const pendingVerifications = usersData.filter(user => user.verificationStatus === 'pending').length;

      setStats({
        totalUsers: usersData.length,
        activeRulers,
        pendingVerifications,
        projectReports: projectReportsData.length,
        communityReports: communityReportsData.length
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

  const TabButton = ({ value, children, isActive, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-primary-600 text-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );

  const StatCard = ({ title, value, icon }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );

  const SidebarButton = ({ icon, children, onClick }) => (
    <button
      onClick={onClick}
      className="w-full flex items-center px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      <span className="mr-3 text-lg">{icon}</span>
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md min-h-screen p-6">
        <div className="flex items-center mb-8">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
            <span className="text-lg">👑</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">ATRFC Admin</h2>
        </div>
        
        <nav className="space-y-2">
          <SidebarButton 
            icon="👥" 
            onClick={() => setActiveTab('users')}
          >
            User Management
          </SidebarButton>
          <SidebarButton 
            icon="🛡️" 
            onClick={() => setActiveTab('verification')}
          >
            Verification Cases
          </SidebarButton>
          {/* <SidebarButton 
            icon="📁" 
            onClick={() => setActiveTab('projects')}
          >
            Project Reports
          </SidebarButton>
          <SidebarButton 
            icon="📝" 
            onClick={() => setActiveTab('community')}
          >
            Community Reports
          </SidebarButton> */}
          <SidebarButton 
            icon="📚" 
            onClick={() => setActiveTab('books')}
          >
            Book Management
          </SidebarButton>
          <SidebarButton 
            icon="📊" 
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </SidebarButton>
        </nav>

        {/* Admin Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Logged in as:</p>
          <p className="font-medium text-gray-900">{currentUser?.email}</p>
          <p className="text-xs text-primary-600">Super Admin</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage throne verifications, documents, and overall ATRFC activity.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon="👥" 
          />
          <StatCard 
            title="Active Rulers" 
            value={stats.activeRulers} 
            icon="👑" 
          />
          <StatCard 
            title="Project Reports" 
            value={stats.projectReports} 
            icon="📁" 
          />
          <StatCard 
            title="Community Reports" 
            value={stats.communityReports} 
            icon="📝" 
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg overflow-x-auto">
          <TabButton 
            value="users" 
            isActive={activeTab === 'users'} 
            onClick={setActiveTab}
          >
            Users
          </TabButton>
          <TabButton 
            value="verification" 
            isActive={activeTab === 'verification'} 
            onClick={setActiveTab}
          >
            Verification
          </TabButton>
          <TabButton 
            value="projects" 
            isActive={activeTab === 'projects'} 
            onClick={setActiveTab}
          >
            Projects
          </TabButton>
          <TabButton 
            value="community" 
            isActive={activeTab === 'community'} 
            onClick={setActiveTab}
          >
            Community
          </TabButton>
          <TabButton 
            value="books" 
            isActive={activeTab === 'books'} 
            onClick={setActiveTab}
          >
            Books
          </TabButton>
          <TabButton 
            value="analytics" 
            isActive={activeTab === 'analytics'} 
            onClick={setActiveTab}
          >
            Analytics
          </TabButton>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-md">
          {loading && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          )}

          {/* User Management */}
          {activeTab === 'users' && !loading && (
            <div className="p-6">
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
                        <option value="ruler">Ruler</option>
                        <option value="delegate">Delegate</option>
                        <option value="learner">Learner</option>
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
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">User Verification Status</h3>
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
                    No pending verifications.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project Reports */}
          {/* {activeTab === 'projects' && !loading && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Project Reports</h3>
              <div className="space-y-4">
                {projectReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600">{report.community} • {report.timeline}</p>
                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                        {report.budget && (
                          <p className="text-sm text-green-600 font-medium">Budget: ${report.budget.toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'completed' ? 'bg-green-100 text-green-800' :
                          report.status === 'ongoing' ? 'bg-blue-100 text-blue-800' :
                          report.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                        {report.attachmentUrl && (
                          <a href={report.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm">
                            View Attachment
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {projectReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No project reports submitted yet.
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Community Reports */}
          {/* {activeTab === 'community' && !loading && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Reports</h3>
              <div className="space-y-4">
                {communityReports.map((report) => (
                  <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <p className="text-sm text-gray-600">{report.community} • {report.category}</p>
                        <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                        {report.priority && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                            report.priority === 'high' ? 'bg-red-100 text-red-800' :
                            report.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.priority} priority
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status}
                        </span>
                        {report.attachmentUrl && (
                          <a href={report.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm">
                            View Attachment
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {communityReports.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No community reports submitted yet.
                  </div>
                )}
              </div>
            </div>
          )} */}

          {/* Book Management */}
          {activeTab === 'books' && (
            <div className="p-0">
              <BookManagement />
            </div>
          )}

          {/* Analytics */}
          {activeTab === 'analytics' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Analytics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Key Metrics</h4>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-600">Active Thrones:</span>
                      <span className="font-medium">{stats.activeRulers}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">New Submissions (Month):</span>
                      <span className="font-medium">{stats.newSubmissions}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Course Completions:</span>
                      <span className="font-medium">{stats.courseCompletions}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-600">Reports Resolved:</span>
                      <span className="font-medium">{stats.reportsResolved}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Activity Overview</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-md">
                      <span className="text-sm text-gray-600">Verification Requests</span>
                      <span className="text-sm font-medium text-primary-600">+12 this week</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-md">
                      <span className="text-sm text-gray-600">Document Uploads</span>
                      <span className="text-sm font-medium text-green-600">+8 this week</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-md">
                      <span className="text-sm text-gray-600">User Registrations</span>
                      <span className="text-sm font-medium text-blue-600">+24 this week</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  📊 <strong>Note:</strong> Advanced analytics and charts will be available in future updates.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;