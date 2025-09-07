import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DisputeResolution = () => {
  const { isDarkMode } = useTheme();
  const [disputes] = useState([
    {
      id: 1,
      title: 'Land Boundary Dispute',
      complainant: 'Chief Adebayo',
      respondent: 'Chief Okafor',
      status: 'pending',
      priority: 'high',
      date: '2024-01-15',
      assignedRuler: 'Oba Adeyemi III'
    },
    {
      id: 2,
      title: 'Traditional Title Dispute',
      complainant: 'Elder Nwosu',
      respondent: 'Elder Okonkwo',
      status: 'in_progress',
      priority: 'medium',
      date: '2024-01-10',
      assignedRuler: 'Eze Nwosu'
    },
    {
      id: 3,
      title: 'Cultural Practice Dispute',
      complainant: 'Chief Muhammad',
      respondent: 'Elder Ibrahim',
      status: 'resolved',
      priority: 'low',
      date: '2024-01-05',
      assignedRuler: 'Emir Muhammad'
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dispute Resolution
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage traditional dispute resolution processes
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Disputes List */}
          <div className="lg:col-span-3">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Active Disputes
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {disputes.map((dispute) => (
                  <div key={dispute.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {dispute.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                            {dispute.status.replace('_', ' ')}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                            {dispute.priority}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Complainant: {dispute.complainant}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Respondent: {dispute.respondent}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Assigned to: {dispute.assignedRuler}
                            </p>
                          </div>
                        </div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                          Filed on: {new Date(dispute.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700">
                          View Details
                        </button>
                        <button className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700">
                          Update Status
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  File New Dispute
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Schedule Mediation
                </button>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Assign Mediator
                </button>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dispute Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pending:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {disputes.filter(d => d.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    In Progress:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {disputes.filter(d => d.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Resolved:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {disputes.filter(d => d.status === 'resolved').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputeResolution;
