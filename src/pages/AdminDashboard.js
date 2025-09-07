import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    totalRulers: 0,
    totalCommunities: 0,
    systemDisputes: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    // Simulate loading stats - in real app, this would fetch from Firestore
    const loadStats = () => {
      setStats({
        totalRulers: 156,
        totalCommunities: 89,
        systemDisputes: 23,
        pendingApprovals: 12
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
            {t('dashboard.adminWelcome')} {currentUser?.displayName || 'Admin'}!
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('dashboard.adminSubtitle')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={t('dashboard.totalRulers')}
            value={stats.totalRulers}
            icon="👑"
            color="bg-purple-100"
          />
          <StatCard
            title={t('dashboard.totalCommunities')}
            value={stats.totalCommunities}
            icon="🏘️"
            color="bg-blue-100"
          />
          <StatCard
            title={t('dashboard.systemDisputes')}
            value={stats.systemDisputes}
            icon="⚖️"
            color="bg-red-100"
          />
          <StatCard
            title={t('dashboard.pendingApprovals')}
            value={stats.pendingApprovals}
            icon="⏳"
            color="bg-yellow-100"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.adminActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title={t('dashboard.manageRulers')}
              description={t('dashboard.manageRulersDesc')}
              icon="👑"
              onClick={() => {/* Navigate to rulers management */}}
            />
            <QuickAction
              title={t('dashboard.manageCommunities')}
              description={t('dashboard.manageCommunitiesDesc')}
              icon="🏘️"
              onClick={() => {/* Navigate to communities */}}
            />
            <QuickAction
              title={t('dashboard.systemDisputes')}
              description={t('dashboard.systemDisputesDesc')}
              icon="⚖️"
              onClick={() => {/* Navigate to system disputes */}}
            />
            <QuickAction
              title={t('dashboard.userManagement')}
              description={t('dashboard.userManagementDesc')}
              icon="👥"
              onClick={() => {/* Navigate to user management */}}
            />
            <QuickAction
              title={t('dashboard.systemSettings')}
              description={t('dashboard.systemSettingsDesc')}
              icon="⚙️"
              onClick={() => {/* Navigate to settings */}}
            />
            <QuickAction
              title={t('dashboard.analytics')}
              description={t('dashboard.analyticsDesc')}
              icon="📊"
              onClick={() => {/* Navigate to analytics */}}
            />
          </div>
        </div>

        {/* System Alerts */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.systemAlerts')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 border-l-4 border-red-500 bg-red-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.highPriorityDispute')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.requiresImmediate')}</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-yellow-500 bg-yellow-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">⏳</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.pendingRulerApproval')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.awaitingReview')}</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.systemMaintenance')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.scheduledTonight')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent System Activity */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('dashboard.recentSystemActivity')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center p-4 border-l-4 border-green-500 bg-green-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.newRulerApproved')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.oneHourAgo')}</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-blue-500 bg-blue-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">🏘️</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.newCommunityRegistered')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.twoHoursAgo')}</p>
              </div>
            </div>
            <div className="flex items-center p-4 border-l-4 border-purple-500 bg-purple-50">
              <div className="flex-shrink-0">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">
                  {t('dashboard.bulkUserImport')}
                </p>
                <p className="text-sm text-gray-600">{t('dashboard.completedSuccessfully')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
