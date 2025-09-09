import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// Removed unused language hook

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('verification');
  const [pendingThrones] = useState([
    { id: 1, name: "Oba Adewale", throne: "Ife Kingdom", country: "Nigeria", status: "pending" },
    { id: 2, name: "Eze Chukwuma", throne: "Nnewi", country: "Nigeria", status: "pending" },
    { id: 3, name: "Emir Hassan", throne: "Kano Emirate", country: "Nigeria", status: "pending" },
    { id: 4, name: "Oba Olumide", throne: "Lagos Kingdom", country: "Nigeria", status: "pending" }
  ]);

  const [stats] = useState({
    pendingThrones: 12,
    documentsReviewed: 58,
    activeRulers: 134,
    newSubmissions: 8,
    courseCompletions: 72,
    reportsResolved: 15
  });

  const handleApproveThrone = (throneId) => {
    console.log('Approving throne:', throneId);
    // TODO: Implement approval logic
    alert(`Throne ${throneId} approved successfully!`);
  };

  const handleRejectThrone = (throneId) => {
    console.log('Rejecting throne:', throneId);
    // TODO: Implement rejection logic
    alert(`Throne ${throneId} rejected.`);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Uploading file:', file.name);
      // TODO: Implement file upload logic
      alert(`File ${file.name} uploaded successfully!`);
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
            icon="🛡️" 
            onClick={() => setActiveTab('verification')}
          >
            Verification Cases
          </SidebarButton>
          <SidebarButton 
            icon="📄" 
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </SidebarButton>
          <SidebarButton 
            icon="👥" 
            onClick={() => setActiveTab('rulers')}
          >
            Rulers & Delegates
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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard 
            title="Pending Thrones" 
            value={stats.pendingThrones} 
            icon="⏳" 
          />
          <StatCard 
            title="Documents Reviewed" 
            value={stats.documentsReviewed} 
            icon="📋" 
          />
          <StatCard 
            title="Active Rulers" 
            value={stats.activeRulers} 
            icon="👑" 
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <TabButton 
            value="verification" 
            isActive={activeTab === 'verification'} 
            onClick={setActiveTab}
          >
            Verification Cases
          </TabButton>
          <TabButton 
            value="documents" 
            isActive={activeTab === 'documents'} 
            onClick={setActiveTab}
          >
            Documents
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
          {/* Verification Cases */}
          {activeTab === 'verification' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pending Throne Verifications</h3>
              <div className="space-y-4">
                {pendingThrones.map((throne) => (
                  <div
                    key={throne.id}
                    className="flex items-center justify-between border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-lg">👑</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{throne.name}</p>
                          <p className="text-sm text-gray-500">
                            {throne.throne}, {throne.country}
                          </p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending Review
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproveThrone(throne.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
                      >
                        <span className="mr-1">✓</span>
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectThrone(throne.id)}
                        className="flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                      >
                        <span className="mr-1">✗</span>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Document Management</h3>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">📄</div>
                  <p className="text-gray-600 mb-4">Upload new documents for review</p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Recent Documents</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Recognition Certificate - Oba Adewale</li>
                      <li>• Council Letter - Eze Chukwuma</li>
                      <li>• Heritage Document - Emir Hassan</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Document Stats</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Total Documents: 58</li>
                      <li>• Pending Review: 12</li>
                      <li>• Approved: 46</li>
                    </ul>
                  </div>
                </div>
              </div>
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