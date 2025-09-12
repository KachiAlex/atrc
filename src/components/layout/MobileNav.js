import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const MobileNav = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: '🏠' },
    { name: 'Community Report', href: '/app/community', icon: '📝' },
    { name: 'Digital Library', href: '/app/books', icon: '📚' },
    { name: 'Courses', href: '/app/courses', icon: '🎓' },
    { name: 'Live Meetings', href: '/app/meetings', icon: '📹' },
    { name: 'Events', href: '/app/events', icon: '📅' },
    { name: 'Announcements', href: '/app/announcements', icon: '📢' },
    { name: 'Reports', href: '/app/reports', icon: '📊' },
    { name: 'Profile', href: '/app/profile', icon: '👤' },
    { name: 'Settings', href: '/app/settings', icon: '⚙️' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg lg:hidden`}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-lg">👑</span>
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
            
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                aria-label="Toggle navigation menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          
          <div className={`fixed top-0 left-0 h-full w-80 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl transform transition-transform duration-300 ease-in-out`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-lg">👑</span>
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
                <button
                  onClick={() => setIsOpen(false)}
                  className={`p-2 rounded-md ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive(item.href)
                        ? `${isDarkMode ? 'bg-primary-900 text-primary-200' : 'bg-primary-100 text-primary-700'}`
                        : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* User Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm">👤</span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentUser?.displayName || 'User'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Traditional Ruler
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="ml-2 bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
