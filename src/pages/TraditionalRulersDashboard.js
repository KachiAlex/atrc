import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const TraditionalRulersDashboard = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    myCommunities: 0,
    activeDisputes: 0,
    upcomingEvents: 0,
    totalMembers: 0
  });

  useEffect(() => {
    // Simulate loading stats - in real app, this would fetch from Firestore
    const loadStats = () => {
      setStats({
        myCommunities: 3,
        activeDisputes: 2,
        upcomingEvents: 4,
        totalMembers: 45
      });
    };

    loadStats();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon, onClick }) => (
    <button
      onClick={onClick}
      className={`${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} rounded-lg shadow-md p-6 text-left transition-colors duration-200 w-full`}
    >
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-primary-100">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.welcome')} {currentUser?.displayName || 'User'}!
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('dashboard.rulerSubtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('dashboard.myCommunities')}
            value={stats.myCommunities}
            icon="🏘️"
            color="bg-blue-100"
          />
          <StatCard
            title={t('dashboard.activeDisputes')}
            value={stats.activeDisputes}
            icon="⚖️"
            color="bg-yellow-100"
          />
          <StatCard
            title={t('dashboard.upcomingEvents')}
            value={stats.upcomingEvents}
            icon="📅"
            color="bg-green-100"
          />
          <StatCard
            title={t('dashboard.totalMembers')}
            value={stats.totalMembers}
            icon="👥"
            color="bg-purple-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title={t('dashboard.manageCommunities')}
              description={t('dashboard.manageCommunitiesDesc')}
              icon="🏘️"
              onClick={() => navigate('/app/community')}
            />
            <QuickAction
              title={t('dashboard.resolveDisputes')}
              description={t('dashboard.resolveDisputesDesc')}
              icon="⚖️"
              onClick={() => navigate('/app/disputes')}
            />
            <QuickAction
              title={t('dashboard.planEvents')}
              description={t('dashboard.planEventsDesc')}
              icon="📅"
              onClick={() => navigate('/app/events')}
            />
            <QuickAction
              title={t('dashboard.sendAnnouncements')}
              description={t('dashboard.sendAnnouncementsDesc')}
              icon="📢"
              onClick={() => navigate('/app/announcements')}
            />
            <QuickAction
              title={t('dashboard.viewReports')}
              description={t('dashboard.viewReportsDesc')}
              icon="📊"
              onClick={() => navigate('/app/reports')}
            />
            <QuickAction
              title={t('dashboard.manageProfile')}
              description={t('dashboard.manageProfileDesc')}
              icon="👤"
              onClick={() => navigate('/app/profile')}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.recentActivity')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 border-l-4 border-primary-500 bg-primary-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚖️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.newDisputeActivity')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.twoHoursAgo')}</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-green-500 bg-green-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.culturalFestivalActivity')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.oneDayAgo')}</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.newMembersActivity')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.threeDaysAgo')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraditionalRulersDashboard;
