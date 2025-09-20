import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoImage from '../LogoImage';

const MobileNav = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLeadershipInstituteOpen, setIsLeadershipInstituteOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: '🏠' },
    { name: 'Community Report', href: '/app/community', icon: '📝' },
    { name: 'Live Meetings', href: '/app/meetings', icon: '📹' },
    { name: 'Events', href: '/app/events', icon: '📅' },
    { name: 'Announcements', href: '/app/announcements', icon: '📢' },
    { name: 'Reports', href: '/app/reports', icon: '📊' },
    { name: 'Profile', href: '/app/profile', icon: '👤' },
    { name: 'Settings', href: '/app/settings', icon: '⚙️' }
  ];

  const leadershipInstituteItems = [
    { name: 'Digital Library', href: '/app/books', icon: '📚' },
    { name: 'Courses', href: '/app/courses', icon: '🎓' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isLeadershipInstituteActive = () => {
    return leadershipInstituteItems.some(item => isActive(item.href));
  };

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Enhanced Mobile Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg lg:hidden sticky top-0 z-40`}>
        <div className="px-3 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <LogoImage type="traditional-rulers" size="small" />
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <h1 className={`text-lg font-semibold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ATRC
                </h1>
                <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Traditional Rulers
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg transition-colors touch-manipulation ${isDarkMode ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-gray-100 active:bg-gray-200'}`}
                aria-label="Toggle theme"
              >
                <span className="text-lg">{isDarkMode ? '☀️' : '🌙'}</span>
              </button>
              
              <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2.5 rounded-lg transition-colors touch-manipulation ${isDarkMode ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-gray-100 active:bg-gray-200'}`}
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
          
          <div className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl transform transition-transform duration-300 ease-in-out overflow-y-auto`}>
            <div className="p-4 sm:p-6">
              {/* Enhanced Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="flex-shrink-0">
                    <LogoImage type="traditional-rulers" size="medium" />
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
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
                  className={`p-2.5 rounded-lg transition-colors touch-manipulation ${isDarkMode ? 'hover:bg-gray-700 active:bg-gray-600' : 'hover:bg-gray-100 active:bg-gray-200'}`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Enhanced Navigation */}
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={handleLinkClick}
                    className={`group flex items-center px-3 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 touch-manipulation ${
                      isActive(item.href)
                        ? `${isDarkMode ? 'bg-primary-900 text-primary-200 shadow-lg' : 'bg-primary-100 text-primary-700 shadow-md'}`
                        : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'}`
                    }`}
                  >
                    <span className="mr-3 text-lg flex-shrink-0">{item.icon}</span>
                    <span className="truncate">{item.name}</span>
                    {isActive(item.href) && (
                      <div className={`ml-auto w-2 h-2 rounded-full ${isDarkMode ? 'bg-primary-400' : 'bg-primary-600'}`}></div>
                    )}
                  </Link>
                ))}

                {/* Leadership Institute Section */}
                <div className="mt-4">
                  <button
                    onClick={() => setIsLeadershipInstituteOpen(!isLeadershipInstituteOpen)}
                    className={`group flex items-center justify-between w-full px-3 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 touch-manipulation ${
                      isLeadershipInstituteActive()
                        ? `${isDarkMode ? 'bg-primary-900 text-primary-200 shadow-lg' : 'bg-primary-100 text-primary-700 shadow-md'}`
                        : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'}`
                    }`}
                  >
                    <div className="flex items-center">
                      <LogoImage type="leadership-institute" size="small" className="mr-3 flex-shrink-0" />
                      <span className="truncate">Leadership Institute</span>
                    </div>
                    <span className={`transform transition-transform duration-200 ${isLeadershipInstituteOpen ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  </button>

                  {/* Leadership Institute Submenu */}
                  <div className={`mt-1 space-y-1 transition-all duration-200 overflow-hidden ${
                    isLeadershipInstituteOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    {leadershipInstituteItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={handleLinkClick}
                        className={`group flex items-center pl-12 pr-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 touch-manipulation ${
                          isActive(item.href)
                            ? `${isDarkMode ? 'bg-primary-800 text-primary-100 shadow-md' : 'bg-primary-50 text-primary-600 shadow-sm'}`
                            : `${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white active:bg-gray-600' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700 active:bg-gray-100'}`
                        }`}
                      >
                        <span className="mr-3 text-base flex-shrink-0">{item.icon}</span>
                        <span className="truncate">{item.name}</span>
                        {isActive(item.href) && (
                          <div className={`ml-auto w-2 h-2 rounded-full ${isDarkMode ? 'bg-primary-400' : 'bg-primary-600'}`}></div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>

              {/* Enhanced User Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-xl p-4`}>
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                        <span className="text-lg">👤</span>
                      </div>
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {currentUser?.displayName || 'User'}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Traditional Ruler
                      </p>
                    </div>
                    <button
                      onClick={logout}
                      className="ml-2 bg-red-500 text-white px-3 py-2 rounded-lg text-xs hover:bg-red-600 active:bg-red-700 transition-colors touch-manipulation"
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
