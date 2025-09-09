import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ATRCLogo from '../ATRCLogo';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <ATRCLogo size="small" />
            <div className="ml-3">
              <h1 className="text-xl font-bold atrc-gradient-text">ATRC</h1>
              <p className="text-xs text-gray-500">Leadership Institute</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            {currentUser ? (
              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            ) : (
              <span className="text-gray-600">Welcome to ATRC</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
