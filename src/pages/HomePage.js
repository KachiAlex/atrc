import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

const HomePage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();

  const features = [
    {
      icon: '🏘️',
      title: t('features.community.title'),
      description: t('features.community.desc')
    },
    {
      icon: '⚖️',
      title: t('features.disputes.title'),
      description: t('features.disputes.desc')
    },
    {
      icon: '📅',
      title: t('features.events.title'),
      description: t('features.events.desc')
    },
    {
      icon: '📢',
      title: t('features.announcements.title'),
      description: t('features.announcements.desc')
    },
    {
      icon: '📊',
      title: t('features.analytics.title'),
      description: t('features.analytics.desc')
    },
    {
      icon: '👥',
      title: t('features.members.title'),
      description: t('features.members.desc')
    }
  ];

  const stats = [
    { number: '500+', label: t('stats.communities') },
    { number: '50+', label: t('stats.rulers') },
    { number: '1000+', label: t('stats.members') },
    { number: '24/7', label: t('stats.support') }
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
              <LanguageSelector />
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
                {t('nav.signIn')}
              </Link>
              <Link
                to="/register"
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                {t('nav.joinATRC')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="text-center">
                <h1 className={`text-4xl tracking-tight font-extrabold sm:text-5xl md:text-6xl ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <span className="block">{t('home.title')}</span>
                  <span className="block text-primary-600">{t('home.subtitle')}</span>
                </h1>
                
                <p className={`mt-6 text-base sm:text-lg sm:max-w-2xl sm:mx-auto md:text-xl ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {t('home.description')}
                </p>
                
                <div className="mt-8 sm:flex sm:justify-center">
                  <div className="rounded-md shadow">
                    <Link
                      to="/register"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      {t('home.joinCommunity')}
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
                      {t('home.signIn')}
                    </Link>
                  </div>
                </div>
              </div>
            </main>
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
              {t('features.title')}
            </h2>
            <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('features.subtitle')}
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
            {t('cta.title')}
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            {t('cta.subtitle')}
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-colors"
            >
              {t('cta.getStarted')}
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
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider`}>
                {t('footer.features')}
              </h4>
              <ul className="mt-4 space-y-2">
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('features.community.title')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('features.disputes.title')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('features.events.title')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('features.analytics.title')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider`}>
                {t('footer.support')}
              </h4>
              <ul className="mt-4 space-y-2">
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('footer.helpCenter')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('footer.contactUs')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('footer.privacyPolicy')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('footer.termsOfService')}</Link></li>
              </ul>
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t border-gray-200 text-center`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
