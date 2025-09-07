import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const Announcements = () => {
  const { isDarkMode } = useTheme();
  const [announcements] = useState([
    {
      id: 1,
      title: 'Council Meeting Announcement',
      content: 'The monthly council meeting will be held on January 30th, 2024 at 10:00 AM.',
      author: 'Oba Adeyemi III',
      date: '2024-01-20',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Cultural Festival Update',
      content: 'The annual cultural festival has been rescheduled to March 15th, 2024.',
      author: 'Eze Nwosu',
      date: '2024-01-18',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'New Community Guidelines',
      content: 'Please review the updated community guidelines for traditional practices.',
      author: 'Emir Muhammad',
      date: '2024-01-15',
      priority: 'low'
    }
  ]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Announcements
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Important communications and updates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Announcements
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {announcement.title}
                        </h3>
                        <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {announcement.content}
                        </p>
                        <div className="mt-3 flex items-center space-x-4">
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            By {announcement.author}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            {new Date(announcement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Create Announcement
                </button>
                <button className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors">
                  Send Notification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Announcements;
