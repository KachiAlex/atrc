import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import BookManagement from './BookManagement';
import CourseManagement from './CourseManagement';

const AdminAccessPanel = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('verification');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Redirect if not admin
  useEffect(() => {
    if (userRole && userRole !== 'admin') {
      navigate('/app/dashboard');
    }
  }, [userRole, navigate]);

  // Fetch data from Firestore
  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    }
  }, [userRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(usersQuery);
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async (userId, isVerified) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isVerified: isVerified,
        verifiedAt: isVerified ? new Date() : null,
        verifiedBy: isVerified ? currentUser.uid : null
      });
      
      fetchUsers(); // Refresh user data
      console.log(`User ${isVerified ? 'verified' : 'unverified'} successfully`);
    } catch (error) {
      console.error('Error updating user verification:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        alert('User deleted successfully!');
        fetchUsers(); // Refresh data
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-2 text-lg text-gray-600">Manage users, content, and system settings</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('verification')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verification'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              User Verification
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'books'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Digital Library
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Courses
            </button>
          </nav>
        </div>

        {/* Verification Tab */}
        {activeTab === 'verification' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">⏳</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Pending Verification</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {users.filter(user => !user.isVerified && user.role !== 'admin').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">✅</div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Verified Users</p>
                    <p className="text-2xl font-bold text-green-900">
                      {users.filter(user => user.isVerified === true && user.role !== 'admin').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">👥</div>
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Non-Admin Users</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {users.filter(user => user.role !== 'admin').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Simplified User List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h4 className="text-lg font-medium text-gray-900">Users Requiring Verification</h4>
              </div>
              <div className="divide-y divide-gray-200">
                {users.filter(user => user.role !== 'admin').map((user) => (
                  <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white">👑</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.displayName || 'No Name Provided'}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.role === 'ruler' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'delegate' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {user.role}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {user.isVerified ? '✅ Verified' : '⏳ Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserDetails(true);
                          }}
                          className="flex items-center px-3 py-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <span className="mr-1">👁️</span>
                          <span className="text-sm">View</span>
                        </button>
                        
                        {user.isVerified ? (
                          <button
                            onClick={() => handleVerifyUser(user.id, false)}
                            className="flex items-center px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
                          >
                            <span className="mr-1">⏸️</span>
                            Unverify
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyUser(user.id, true)}
                            className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                          >
                            <span className="mr-1">✅</span>
                            Verify
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {users.filter(user => user.role !== 'admin').length === 0 && (
                  <div className="px-6 py-8 text-center">
                    <div className="text-gray-400 text-4xl mb-2">👥</div>
                    <p className="text-gray-500">No users to verify</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Books Tab */}
        {activeTab === 'books' && (
          <BookManagement />
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <CourseManagement />
        )}

        {/* User Details Modal */}
        {showUserDetails && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
                <button
                  onClick={() => setShowUserDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="p-6">
                {/* User Header */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-2xl text-white">👑</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900">
                      {selectedUser.displayName || 'No Name Provided'}
                    </h4>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.role === 'ruler' ? 'bg-blue-100 text-blue-800' :
                        selectedUser.role === 'delegate' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedUser.role}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedUser.isVerified ? '✅ Verified' : '⏳ Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">🏛️</span>
                      Throne Information
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Throne Name:</span>
                        <p className="text-gray-900">{selectedUser.throneName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Title:</span>
                        <p className="text-gray-900">{selectedUser.title || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Community:</span>
                        <p className="text-gray-900">{selectedUser.community || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Country:</span>
                        <p className="text-gray-900">{selectedUser.country || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">📞</span>
                      Contact Information
                    </h5>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{selectedUser.email}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Phone:</span>
                        <p className="text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Joined:</span>
                        <p className="text-gray-900">
                          {selectedUser.createdAt ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString() : 'Unknown'}
                        </p>
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
                    {selectedUser.documents && selectedUser.documents.length > 0 ? (
                      selectedUser.documents.map((doc, index) => (
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

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  {selectedUser.isVerified ? (
                    <button
                      onClick={() => {
                        handleVerifyUser(selectedUser.id, false);
                        setShowUserDetails(false);
                      }}
                      className="flex items-center px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
                    >
                      <span className="mr-2">⏸️</span>
                      Unverify User
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleVerifyUser(selectedUser.id, true);
                        setShowUserDetails(false);
                      }}
                      className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                    >
                      <span className="mr-2">✅</span>
                      Verify User
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleDeleteUser(selectedUser.id);
                      setShowUserDetails(false);
                    }}
                    className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  >
                    <span className="mr-2">🗑️</span>
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAccessPanel;
