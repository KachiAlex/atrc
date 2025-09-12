import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Sidebar = () => {
  const { currentUser, userRole } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: '🏠' },
    { name: 'Admin Panel', href: '/app/admin/panel', icon: '🛡️' },
    { name: 'Community Report', href: '/app/community', icon: '📝' },
    // { name: 'Project Reports', href: '/app/projects', icon: '📁' },
    { name: 'Digital Library', href: '/app/books', icon: '📚' },
    { name: 'Courses', href: '/app/courses', icon: '🎓' },
    { name: 'Live Meetings', href: '/app/meetings', icon: '📹' },
    // { name: 'Disputes', href: '/app/disputes', icon: '⚖️' },
    { name: 'Events', href: '/app/events', icon: '📅' },
    { name: 'Announcements', href: '/app/announcements', icon: '📢' },
    { name: 'Reports', href: '/app/reports', icon: '📊' },
    { name: 'Profile', href: '/app/profile', icon: '👤' },
    { name: 'Settings', href: '/app/settings', icon: '⚙️' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} w-64 min-h-screen shadow-lg`}>
      <div className="p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-lg">👑</span>
            </div>
          </div>
          <div className="ml-3">
            <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ATRC
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Traditional Rulers
            </p>
          </div>
        </div>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive(item.href)
                  ? `${isDarkMode ? 'bg-primary-900 text-primary-200' : 'bg-primary-100 text-primary-700'}`
                  : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 w-64 p-4">
        <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm">👤</span>
              </div>
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentUser?.displayName || 'User'}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Traditional Ruler
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
