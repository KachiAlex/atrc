import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import LogoImage from '../LogoImage';

const Sidebar = () => {
  const { currentUser, userRole } = useAuth();
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const [isLeadershipInstituteOpen, setIsLeadershipInstituteOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: '🏠' },
    { name: 'Community Report', href: '/app/community', icon: '📝' },
    // { name: 'Project Reports', href: '/app/projects', icon: '📁' },
    { name: 'Live Meetings', href: '/app/meetings', icon: '📹' },
    // { name: 'Disputes', href: '/app/disputes', icon: '⚖️' },
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

  // Auto-open Leadership Institute if any of its items are active
  React.useEffect(() => {
    if (isLeadershipInstituteActive()) {
      setIsLeadershipInstituteOpen(true);
    }
  }, [location.pathname]);

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} w-64 min-h-screen shadow-lg`}>
      <div className="p-6">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <div className="flex-shrink-0">
            <LogoImage type="traditional-rulers" size="small" />
          </div>
          <div className="ml-3">
            <h1 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              ATRC
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Traditional Rulers
            </p>
          </div>
        </Link>
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

          {/* Leadership Institute Section */}
          <div className="mt-4">
            <button
              onClick={() => setIsLeadershipInstituteOpen(!isLeadershipInstituteOpen)}
              className={`group flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                isLeadershipInstituteActive()
                  ? `${isDarkMode ? 'bg-primary-900 text-primary-200' : 'bg-primary-100 text-primary-700'}`
                  : `${isDarkMode ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`
              }`}
            >
              <div className="flex items-center">
                <LogoImage type="leadership-institute" size="small" className="mr-3" />
                <span>Leadership Institute</span>
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
                  className={`group flex items-center pl-12 pr-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive(item.href)
                      ? `${isDarkMode ? 'bg-primary-800 text-primary-100' : 'bg-primary-50 text-primary-600'}`
                      : `${isDarkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`
                  }`}
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
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
