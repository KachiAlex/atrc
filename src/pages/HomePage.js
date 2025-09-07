import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const HomePage = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  const features = [
    {
      icon: '🏘️',
      title: 'Community Management',
      description: 'Manage traditional communities and kingdoms with digital tools'
    },
    {
      icon: '⚖️',
      title: 'Dispute Resolution',
      description: 'Traditional dispute resolution system with mediation tools'
    },
    {
      icon: '📅',
      title: 'Event Management',
      description: 'Organize cultural events and traditional ceremonies'
    },
    {
      icon: '📢',
      title: 'Announcements',
      description: 'Communicate important updates to community members'
    },
    {
      icon: '📊',
      title: 'Analytics & Reports',
      description: 'Comprehensive reporting and community insights'
    },
    {
      icon: '👥',
      title: 'Member Management',
      description: 'Manage community members and traditional roles'
    }
  ];

  const stats = [
    { number: '500+', label: 'Traditional Communities' },
    { number: '50+', label: 'Active Rulers' },
    { number: '1000+', label: 'Community Members' },
    { number: '24/7', label: 'Support Available' }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg">👑</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  ATRC
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Traditional Rulers
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Join ATRC
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className={`text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className="block">African Traditional</span>
                  <span className="block text-primary-600">Rulers Council</span>
                </h1>
                <p className={`mt-3 text-base sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Empowering traditional rulers with modern digital tools for community governance, 
                  dispute resolution, and cultural preservation across Africa.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Join Our Community
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/login"
                      className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md ${
                        isDarkMode 
                          ? 'text-primary-400 bg-gray-800 hover:bg-gray-700 border-gray-600' 
                          : 'text-primary-700 bg-primary-100 hover:bg-primary-200'
                      } md:py-4 md:text-lg md:px-10 transition-colors`}
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className={`h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center ${
            isDarkMode ? 'bg-gray-800' : 'bg-primary-50'
          }`}>
            <div className="text-center">
              <div className="text-8xl mb-4">👑</div>
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Traditional Wisdom
              </h3>
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Modern Technology
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={`py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {stat.number}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              Digital Tools for Traditional Governance
            </h2>
            <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Modern technology solutions designed specifically for African traditional rulers and communities
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow`}>
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={`py-16 ${isDarkMode ? 'bg-primary-900' : 'bg-primary-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Join the Digital Revolution?
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Connect with traditional rulers across Africa and modernize your community governance
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t border-gray-200`}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-lg">👑</span>
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ATRC
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    African Traditional Rulers Council
                  </p>
                </div>
              </div>
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Empowering traditional rulers with modern digital tools for community governance, 
                dispute resolution, and cultural preservation.
              </p>
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider`}>
                Features
              </h4>
              <ul className="mt-4 space-y-2">
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Community Management</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Dispute Resolution</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Event Management</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider`}>
                Support
              </h4>
              <ul className="mt-4 space-y-2">
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Help Center</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Contact Us</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Privacy Policy</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t border-gray-200 text-center`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              © 2024 African Traditional Rulers Council. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
