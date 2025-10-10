import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';
import aiService from '../services/aiService';
import toast from 'react-hot-toast';

const AIAnalyticsInsights = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [dataSnapshot, setDataSnapshot] = useState(null);

  useEffect(() => {
    if (isOpen) {
      generateInsights();
    }
  }, [isOpen]);

  const generateInsights = async () => {
    setLoading(true);
    try {
      // Fetch data from Firebase
      const data = await fetchAnalyticsData();
      setDataSnapshot(data);

      // Generate AI insights
      const aiInsights = await analyzeDataWithAI(data);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      // Fetch communities
      const communitiesSnapshot = await getDocs(collection(db, 'communities'));
      const communities = communitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch disputes
      const disputesSnapshot = await getDocs(collection(db, 'disputes'));
      const disputes = disputesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const events = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch users (if admin)
      let users = [];
      if (userProfile?.role === 'admin' || userProfile?.role === 'ruler') {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }

      return { communities, disputes, events, users };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return { communities: [], disputes: [], events: [], users: [] };
    }
  };

  const analyzeDataWithAI = async (data) => {
    const insights = [];

    // Analyze disputes
    if (data.disputes.length > 0) {
      const disputeInsight = analyzeDisputes(data.disputes);
      insights.push(disputeInsight);
    }

    // Analyze communities
    if (data.communities.length > 0) {
      const communityInsight = analyzeCommunities(data.communities);
      insights.push(communityInsight);
    }

    // Analyze events
    if (data.events.length > 0) {
      const eventInsight = analyzeEvents(data.events);
      insights.push(eventInsight);
    }

    // Analyze user engagement
    if (data.users.length > 0) {
      const userInsight = analyzeUsers(data.users);
      insights.push(userInsight);
    }

    // Add predictive insights
    const predictiveInsights = generatePredictiveInsights(data);
    insights.push(...predictiveInsights);

    return insights;
  };

  const analyzeDisputes = (disputes) => {
    const total = disputes.length;
    const pending = disputes.filter(d => d.status === 'pending').length;
    const resolved = disputes.filter(d => d.status === 'resolved').length;
    const inProgress = disputes.filter(d => d.status === 'in_progress').length;

    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    const pendingRate = total > 0 ? ((pending / total) * 100).toFixed(1) : 0;

    let severity = 'info';
    let recommendation = 'Your dispute resolution is on track.';

    if (pendingRate > 40) {
      severity = 'warning';
      recommendation = `${pending} disputes are pending. Consider assigning mediators to expedite resolution.`;
    } else if (pendingRate > 60) {
      severity = 'critical';
      recommendation = `High backlog of ${pending} pending disputes! Immediate action needed.`;
    } else if (resolutionRate > 70) {
      severity = 'success';
      recommendation = `Excellent! ${resolutionRate}% resolution rate. Keep up the good work.`;
    }

    // Most common category
    const categories = {};
    disputes.forEach(d => {
      categories[d.category] = (categories[d.category] || 0) + 1;
    });
    const topCategory = Object.entries(categories).sort(([, a], [, b]) => b - a)[0];

    return {
      type: 'disputes',
      title: 'Dispute Resolution Analysis',
      severity,
      metrics: [
        { label: 'Total Disputes', value: total, trend: null },
        { label: 'Resolution Rate', value: `${resolutionRate}%`, trend: resolutionRate > 60 ? 'up' : 'down' },
        { label: 'Pending', value: pending, trend: pending > 5 ? 'up' : 'stable' },
        { label: 'In Progress', value: inProgress, trend: null }
      ],
      insights: [
        `${resolved} disputes successfully resolved`,
        topCategory ? `Most common: ${topCategory[0]} (${topCategory[1]} cases)` : 'No category data',
        recommendation
      ],
      actions: [
        { label: 'View Disputes', link: '/app/disputes' },
        { label: 'Assign Mediators', action: 'assignMediators' }
      ]
    };
  };

  const analyzeCommunities = (communities) => {
    const total = communities.length;
    const active = communities.filter(c => c.status === 'active').length;
    const totalMembers = communities.reduce((sum, c) => sum + (c.members || 0), 0);
    const avgMembers = total > 0 ? Math.round(totalMembers / total) : 0;

    const activeRate = total > 0 ? ((active / total) * 100).toFixed(1) : 0;

    let severity = 'info';
    let recommendation = 'Community management is stable.';

    if (activeRate < 50) {
      severity = 'warning';
      recommendation = `Only ${activeRate}% of communities are active. Consider engagement initiatives.`;
    } else if (activeRate > 80) {
      severity = 'success';
      recommendation = `Strong community engagement! ${activeRate}% communities are active.`;
    }

    return {
      type: 'communities',
      title: 'Community Health Report',
      severity,
      metrics: [
        { label: 'Total Communities', value: total, trend: 'stable' },
        { label: 'Active Rate', value: `${activeRate}%`, trend: activeRate > 70 ? 'up' : 'down' },
        { label: 'Total Members', value: totalMembers, trend: 'up' },
        { label: 'Avg per Community', value: avgMembers, trend: null }
      ],
      insights: [
        `${active} out of ${total} communities are active`,
        `${totalMembers} total community members`,
        recommendation
      ],
      actions: [
        { label: 'View Communities', link: '/app/community' },
        { label: 'Generate Report', action: 'generateReport' }
      ]
    };
  };

  const analyzeEvents = (events) => {
    const total = events.length;
    const now = new Date();
    const upcoming = events.filter(e => {
      const date = e.startDate?.toDate ? e.startDate.toDate() : new Date(e.startDate);
      return date > now;
    }).length;

    const past = total - upcoming;

    let severity = 'info';
    let recommendation = 'Event planning looks good.';

    if (upcoming === 0 && total > 0) {
      severity = 'warning';
      recommendation = 'No upcoming events scheduled. Consider planning cultural ceremonies.';
    } else if (upcoming > 5) {
      severity = 'success';
      recommendation = `Great! ${upcoming} events scheduled. Community engagement is high.`;
    }

    return {
      type: 'events',
      title: 'Event & Ceremony Insights',
      severity,
      metrics: [
        { label: 'Total Events', value: total, trend: 'stable' },
        { label: 'Upcoming', value: upcoming, trend: upcoming > 0 ? 'up' : 'down' },
        { label: 'Past Events', value: past, trend: null },
        { label: 'Avg per Month', value: Math.round(total / 3), trend: null }
      ],
      insights: [
        `${upcoming} upcoming ceremonies scheduled`,
        `${past} events successfully completed`,
        recommendation
      ],
      actions: [
        { label: 'View Calendar', link: '/app/events' },
        { label: 'Create Event', action: 'createEvent' }
      ]
    };
  };

  const analyzeUsers = (users) => {
    const total = users.length;
    const roles = {};
    users.forEach(u => {
      const role = u.role || 'member';
      roles[role] = (roles[role] || 0) + 1;
    });

    const activeUsers = users.filter(u => u.lastActive && 
      (new Date() - new Date(u.lastActive)) < 7 * 24 * 60 * 60 * 1000
    ).length;

    const engagementRate = total > 0 ? ((activeUsers / total) * 100).toFixed(1) : 0;

    let severity = 'info';
    let recommendation = 'User engagement is normal.';

    if (engagementRate < 30) {
      severity = 'warning';
      recommendation = `Low engagement: ${engagementRate}%. Consider outreach and training.`;
    } else if (engagementRate > 60) {
      severity = 'success';
      recommendation = `High engagement: ${engagementRate}%. Users are actively using the platform!`;
    }

    return {
      type: 'users',
      title: 'User Engagement Analysis',
      severity,
      metrics: [
        { label: 'Total Users', value: total, trend: 'up' },
        { label: 'Active (7 days)', value: activeUsers, trend: activeUsers > total / 2 ? 'up' : 'down' },
        { label: 'Engagement Rate', value: `${engagementRate}%`, trend: engagementRate > 50 ? 'up' : 'down' },
        { label: 'Rulers/Chiefs', value: (roles.ruler || 0) + (roles.chief || 0), trend: null }
      ],
      insights: [
        `${activeUsers} users active in past 7 days`,
        `User distribution: ${Object.entries(roles).map(([r, c]) => `${c} ${r}s`).join(', ')}`,
        recommendation
      ],
      actions: [
        { label: 'User Management', link: '/app/admin/panel' },
        { label: 'Engagement Report', action: 'engagementReport' }
      ]
    };
  };

  const generatePredictiveInsights = (data) => {
    const insights = [];

    // Predict dispute trends
    if (data.disputes.length >= 5) {
      const recentDisputes = data.disputes.slice(-5);
      const categories = {};
      recentDisputes.forEach(d => {
        categories[d.category] = (categories[d.category] || 0) + 1;
      });
      const trending = Object.entries(categories).sort(([, a], [, b]) => b - a)[0];

      if (trending && trending[1] >= 3) {
        insights.push({
          type: 'prediction',
          title: 'Dispute Trend Alert',
          severity: 'info',
          metrics: [],
          insights: [
            `Trend detected: ${trending[0]} disputes increasing`,
            `${trending[1]} out of last 5 disputes are ${trending[0]}-related`,
            'Consider proactive community dialogue on this topic'
          ],
          actions: [
            { label: 'View Analysis', link: '/app/reports' },
            { label: 'Community Forum', action: 'communityForum' }
          ]
        });
      }
    }

    // Predict growth opportunities
    if (data.communities.length > 0) {
      const totalMembers = data.communities.reduce((sum, c) => sum + (c.members || 0), 0);
      const avgGrowth = totalMembers / data.communities.length;

      if (avgGrowth > 50) {
        insights.push({
          type: 'opportunity',
          title: 'Growth Opportunity',
          severity: 'success',
          metrics: [],
          insights: [
            `Strong community growth detected`,
            `Average ${Math.round(avgGrowth)} members per community`,
            'Consider expanding educational programs and cultural events'
          ],
          actions: [
            { label: 'Plan Expansion', action: 'planExpansion' },
            { label: 'View Courses', link: '/app/courses' }
          ]
        });
      }
    }

    return insights;
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'success': return 'bg-green-100 border-green-500 text-green-800';
      default: return isDarkMode ? 'bg-blue-900 border-blue-600 text-blue-200' : 'bg-blue-100 border-blue-500 text-blue-800';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'success': return '✅';
      default: return '💡';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700 bg-gradient-to-r from-primary-600 to-primary-700' : 'border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
                🤖
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Analytics Insights</h2>
                <p className="text-white/80 text-sm">Intelligent analysis of your platform data</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Analyzing your data with AI...
                </p>
              </div>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center py-12">
              <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No insights available yet. Start using the platform to generate AI-powered analytics!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`border-l-4 rounded-lg p-6 ${getSeverityColor(insight.severity)} ${
                    isDarkMode ? 'bg-opacity-20' : ''
                  }`}
                >
                  {/* Insight Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getSeverityIcon(insight.severity)}</span>
                      <div>
                        <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {insight.title}
                        </h3>
                        <span className="text-xs font-medium uppercase">{insight.type}</span>
                      </div>
                    </div>
                  </div>

                  {/* Metrics */}
                  {insight.metrics.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {insight.metrics.map((metric, idx) => (
                        <div key={idx} className={`p-3 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {metric.label}
                            </span>
                            {metric.trend && <span>{getTrendIcon(metric.trend)}</span>}
                          </div>
                          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {metric.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Insights */}
                  <div className="mb-4">
                    <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                      Key Insights:
                    </h4>
                    <ul className="space-y-1">
                      {insight.insights.map((item, idx) => (
                        <li key={idx} className={`text-sm flex items-start ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          <span className="mr-2">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  {insight.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {insight.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (action.link) {
                              window.location.href = action.link;
                            } else if (action.action) {
                              toast.info(`Action: ${action.action}`);
                            }
                          }}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                            isDarkMode
                              ? 'bg-primary-600 hover:bg-primary-700 text-white'
                              : 'bg-primary-500 hover:bg-primary-600 text-white'
                          }`}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Powered by AI • Last updated: {new Date().toLocaleString()}
            </p>
            <button
              onClick={generateInsights}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : isDarkMode
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {loading ? 'Analyzing...' : 'Refresh Insights'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAnalyticsInsights;

