import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const EventManagement = () => {
  const { isDarkMode } = useTheme();
  const [events] = useState([
    {
      id: 1,
      title: 'Annual Cultural Festival',
      date: '2024-03-15',
      location: 'Lagos State',
      organizer: 'Oba Adeyemi III',
      type: 'cultural',
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Traditional Marriage Ceremony',
      date: '2024-02-20',
      location: 'Anambra State',
      organizer: 'Eze Nwosu',
      type: 'ceremony',
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Council Meeting',
      date: '2024-01-25',
      location: 'Abuja',
      organizer: 'ATRC Council',
      type: 'meeting',
      status: 'completed'
    }
  ]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'cultural': return 'bg-purple-100 text-purple-800';
      case 'ceremony': return 'bg-pink-100 text-pink-800';
      case 'meeting': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Event Management
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Organize and manage cultural events and ceremonies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Events List */}
          <div className="lg:col-span-3">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Cultural Events & Ceremonies
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {events.map((event) => (
                  <div key={event.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {event.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              📅 Date: {new Date(event.date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              📍 Location: {event.location}
                            </p>
                          </div>
                          <div>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              👤 Organizer: {event.organizer}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700">
                          View Details
                        </button>
                        <button className="bg-gray-600 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-700">
                          Edit Event
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
                  Create New Event
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Schedule Ceremony
                </button>
                <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Plan Meeting
                </button>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Event Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upcoming:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {events.filter(e => e.status === 'upcoming').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Completed:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {events.filter(e => e.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    This Month:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    2
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

export default EventManagement;
