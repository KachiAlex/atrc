import React from 'react';

const VerificationDemo = () => {
  // Sample verification data to demonstrate the enhanced flow
  const sampleUsers = [
    {
      id: '1',
      displayName: 'HRM Oba Adewale Ogunwusi',
      email: 'oba.adewale@ife-kingdom.ng',
      verificationStatus: 'pending',
      createdAt: { seconds: Date.now() / 1000 - 86400 * 3 }, // 3 days ago
      throneName: 'Ife Kingdom',
      title: 'Ooni of Ife',
      kingdom: 'Ife Kingdom',
      state: 'Osun State',
      country: 'Nigeria',
      phoneNumber: '+234-803-123-4567',
      role: 'learner',
      documents: [
        {
          name: 'Certificate of Recognition',
          type: 'Government Document',
          url: 'https://example.com/certificate.pdf'
        },
        {
          name: 'Throne Documentation',
          type: 'Traditional Document',
          url: 'https://example.com/throne-doc.pdf'
        },
        {
          name: 'Community Endorsement',
          type: 'Endorsement Letter',
          url: 'https://example.com/endorsement.pdf'
        }
      ],
      additionalInfo: 'Traditional ruler with over 20 years of experience in community leadership and conflict resolution. Committed to preserving cultural heritage while promoting modern development.'
    },
    {
      id: '2',
      displayName: 'HRH Emir Muhammad Sanusi II',
      email: 'emir.sanusi@kano-emirate.ng',
      verificationStatus: 'pending',
      createdAt: { seconds: Date.now() / 1000 - 86400 * 5 }, // 5 days ago
      throneName: 'Kano Emirate',
      title: 'Emir of Kano',
      kingdom: 'Kano Emirate',
      state: 'Kano State',
      country: 'Nigeria',
      phoneNumber: '+234-802-987-6543',
      role: 'learner',
      documents: [
        {
          name: 'Emirate Certificate',
          type: 'Government Document',
          url: 'https://example.com/emirate-cert.pdf'
        },
        {
          name: 'Traditional Authority Letter',
          type: 'Traditional Document',
          url: 'https://example.com/authority-letter.pdf'
        }
      ],
      additionalInfo: 'Former Central Bank Governor with extensive experience in economic policy and traditional governance. Focused on education and economic development in Northern Nigeria.'
    },
    {
      id: '3',
      displayName: 'HRM Oba Rilwan Akiolu',
      email: 'oba.akiolu@lagos-kingdom.ng',
      verificationStatus: 'pending',
      createdAt: { seconds: Date.now() / 1000 - 86400 * 2 }, // 2 days ago
      throneName: 'Lagos Kingdom',
      title: 'Oba of Lagos',
      kingdom: 'Lagos Kingdom',
      state: 'Lagos State',
      country: 'Nigeria',
      phoneNumber: '+234-801-555-0123',
      role: 'learner',
      documents: [
        {
          name: 'Lagos Traditional Ruler Certificate',
          type: 'Government Document',
          url: 'https://example.com/lagos-cert.pdf'
        },
        {
          name: 'Community Leadership Record',
          type: 'Historical Document',
          url: 'https://example.com/leadership-record.pdf'
        },
        {
          name: 'ATRC Membership Application',
          type: 'Application Form',
          url: 'https://example.com/atrc-application.pdf'
        }
      ],
      additionalInfo: 'Long-serving traditional ruler with deep knowledge of Lagos history and culture. Actively involved in community development and youth empowerment programs.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Verification Flow Demo</h1>
          <p className="text-gray-600">This demonstrates the improved verification system with detailed user information, documents, and comprehensive actions.</p>
        </div>

        {/* Verification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">⏳</div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Pending Verification</p>
                <p className="text-2xl font-bold text-yellow-900">{sampleUsers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">✅</div>
              <div>
                <p className="text-sm font-medium text-green-800">Verified Rulers</p>
                <p className="text-2xl font-bold text-green-900">0</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-2xl mr-3">❌</div>
              <div>
                <p className="text-sm font-medium text-red-800">Rejected</p>
                <p className="text-2xl font-bold text-red-900">0</p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Cases */}
        <div className="space-y-6">
          {sampleUsers.map((user) => (
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
                      {user.displayName}
                    </h4>
                    <p className="text-sm text-gray-500 mb-1">{user.email}</p>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        ⏳ Pending Verification
                      </span>
                      <span className="text-xs text-gray-500">
                        Applied: {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
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
                      <p className="text-gray-900">{user.throneName}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Title:</span>
                      <p className="text-gray-900">{user.title}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Kingdom/Community:</span>
                      <p className="text-gray-900">{user.kingdom}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">State/Region:</span>
                      <p className="text-gray-900">{user.state}</p>
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
                        {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Phone Number:</span>
                      <p className="text-gray-900">{user.phoneNumber}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Current Role:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.role}
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
                  {user.documents.map((doc, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-blue-600 mr-2">📄</span>
                          <div>
                            <p className="text-sm font-medium text-blue-900">{doc.name}</p>
                            <p className="text-xs text-blue-700">{doc.type}</p>
                          </div>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-6">
                <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Additional Information
                </h5>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{user.additionalInfo}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button className="flex items-center px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
                  <span className="mr-2">✅</span>
                  Approve & Verify
                </button>
                <button className="flex items-center px-6 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors">
                  <span className="mr-2">❌</span>
                  Reject
                </button>
                <button className="flex items-center px-6 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors">
                  <span className="mr-2">📝</span>
                  Request More Info
                </button>
                <button className="flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                  <span className="mr-2">👁️</span>
                  View Full Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VerificationDemo;
