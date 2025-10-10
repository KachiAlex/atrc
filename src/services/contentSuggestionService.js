import { db } from '../firebase/config';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import aiService from './aiService';

/**
 * Content Suggestion Service
 * AI-powered content recommendations based on user behavior and context
 */

class ContentSuggestionService {
  constructor() {
    this.userActivity = [];
    this.suggestionCache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Track user activity
   */
  trackActivity(activity) {
    this.userActivity.push({
      ...activity,
      timestamp: new Date()
    });

    // Keep only last 50 activities
    if (this.userActivity.length > 50) {
      this.userActivity = this.userActivity.slice(-50);
    }
  }

  /**
   * Get personalized suggestions based on user context
   */
  async getSuggestions(context = {}) {
    const cacheKey = `${context.currentPage}_${context.userRole}`;
    
    // Check cache
    const cached = this.suggestionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.suggestions;
    }

    const suggestions = await this.generateSuggestions(context);
    
    // Cache suggestions
    this.suggestionCache.set(cacheKey, {
      suggestions,
      timestamp: Date.now()
    });

    return suggestions;
  }

  /**
   * Generate suggestions based on context and AI analysis
   */
  async generateSuggestions(context) {
    const suggestions = [];

    // Page-specific suggestions
    const pageSuggestions = await this.getPageSpecificSuggestions(context);
    suggestions.push(...pageSuggestions);

    // Role-based suggestions
    const roleSuggestions = await this.getRoleBasedSuggestions(context);
    suggestions.push(...roleSuggestions);

    // Activity-based suggestions
    const activitySuggestions = this.getActivityBasedSuggestions(context);
    suggestions.push(...activitySuggestions);

    // Educational content suggestions
    const educationalSuggestions = await this.getEducationalSuggestions(context);
    suggestions.push(...educationalSuggestions);

    // Return top 6 unique suggestions
    return this.rankAndFilterSuggestions(suggestions).slice(0, 6);
  }

  /**
   * Get page-specific suggestions
   */
  async getPageSpecificSuggestions(context) {
    const suggestions = [];

    switch (context.currentPage) {
      case '/app/dashboard':
        suggestions.push(
          { type: 'action', title: 'View Community Reports', description: 'See latest community statistics', icon: '📊', link: '/app/community', priority: 8 },
          { type: 'action', title: 'Check Pending Disputes', description: 'Review disputes needing attention', icon: '⚖️', link: '/app/disputes', priority: 9 },
          { type: 'action', title: 'Upcoming Events', description: 'See scheduled ceremonies', icon: '📅', link: '/app/events', priority: 7 }
        );
        break;

      case '/app/community':
        suggestions.push(
          { type: 'action', title: 'Create New Community', description: 'Add a traditional community', icon: '➕', action: 'createCommunity', priority: 9 },
          { type: 'action', title: 'View Members', description: 'See all community members', icon: '👥', action: 'viewMembers', priority: 8 },
          { type: 'action', title: 'Generate Report', description: 'Download community statistics', icon: '📄', action: 'generateReport', priority: 7 }
        );
        break;

      case '/app/disputes':
        suggestions.push(
          { type: 'action', title: 'File New Dispute', description: 'Submit a dispute for resolution', icon: '⚖️', action: 'fileDi spute', priority: 9 },
          { type: 'action', title: 'Upload Evidence', description: 'Add supporting documents', icon: '📎', action: 'uploadEvidence', priority: 8 },
          { type: 'guide', title: 'Dispute Resolution Guide', description: 'Learn traditional mediation', icon: '📖', link: '/app/books?category=governance', priority: 6 }
        );
        break;

      case '/app/events':
        suggestions.push(
          { type: 'action', title: 'Create Event', description: 'Organize a cultural ceremony', icon: '🎉', action: 'createEvent', priority: 9 },
          { type: 'action', title: 'View Calendar', description: 'See all scheduled events', icon: '📅', action: 'viewCalendar', priority: 7 },
          { type: 'guide', title: 'Event Planning Guide', description: 'Best practices for ceremonies', icon: '📚', link: '/app/courses?category=events', priority: 6 }
        );
        break;

      case '/app/books':
        try {
          const booksRef = collection(db, 'books');
          const q = query(booksRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'), limit(3));
          const snapshot = await getDocs(q);
          
          snapshot.docs.forEach(doc => {
            const book = doc.data();
            suggestions.push({
              type: 'content',
              title: book.title,
              description: book.description || 'Recommended reading',
              icon: '📖',
              link: `/app/books?id=${doc.id}`,
              priority: 7
            });
          });
        } catch (error) {
          console.error('Error fetching book suggestions:', error);
        }
        break;

      case '/app/courses':
        try {
          const coursesRef = collection(db, 'courses');
          const q = query(coursesRef, where('isPublished', '==', true), orderBy('enrolledCount', 'desc'), limit(3));
          const snapshot = await getDocs(q);
          
          snapshot.docs.forEach(doc => {
            const course = doc.data();
            suggestions.push({
              type: 'content',
              title: course.title,
              description: `${course.enrolledCount || 0} enrolled`,
              icon: '🎓',
              link: `/app/courses?id=${doc.id}`,
              priority: 7
            });
          });
        } catch (error) {
          console.error('Error fetching course suggestions:', error);
        }
        break;

      case '/app/reports':
        suggestions.push(
          { type: 'action', title: 'Download Overview Report', description: 'Get comprehensive statistics', icon: '📊', action: 'downloadReport', priority: 8 },
          { type: 'insight', title: 'View Dispute Trends', description: 'Analyze resolution patterns', icon: '📈', action: 'viewTrends', priority: 7 },
          { type: 'insight', title: 'Community Growth', description: 'Track membership trends', icon: '📉', action: 'viewGrowth', priority: 6 }
        );
        break;
    }

    return suggestions;
  }

  /**
   * Get role-based suggestions
   */
  async getRoleBasedSuggestions(context) {
    const suggestions = [];

    switch (context.userRole) {
      case 'admin':
        suggestions.push(
          { type: 'admin', title: 'User Management', description: 'Manage user roles and permissions', icon: '👤', link: '/app/admin/panel', priority: 8 },
          { type: 'admin', title: 'System Analytics', description: 'View platform-wide statistics', icon: '📊', link: '/app/reports', priority: 7 },
          { type: 'admin', title: 'Create Announcement', description: 'Share important updates', icon: '📢', link: '/app/announcements', priority: 6 }
        );
        break;

      case 'ruler':
      case 'chief':
        suggestions.push(
          { type: 'leadership', title: 'Review Pending Disputes', description: 'Mediate community conflicts', icon: '⚖️', link: '/app/disputes?filter=pending', priority: 9 },
          { type: 'leadership', title: 'Community Overview', description: 'Monitor your community', icon: '🏘️', link: '/app/community', priority: 8 },
          { type: 'leadership', title: 'Leadership Resources', description: 'Traditional governance guides', icon: '📚', link: '/app/books?category=leadership', priority: 6 }
        );
        break;

      case 'elder':
        suggestions.push(
          { type: 'wisdom', title: 'Mediation Resources', description: 'Traditional conflict resolution', icon: '🕊️', link: '/app/books?category=mediation', priority: 8 },
          { type: 'wisdom', title: 'Cultural Knowledge', description: 'Preserve traditional wisdom', icon: '📜', link: '/app/courses?category=culture', priority: 7 },
          { type: 'action', title: 'Share Your Experience', description: 'Mentor community members', icon: '🤝', link: '/app/profile', priority: 6 }
        );
        break;

      case 'member':
        suggestions.push(
          { type: 'learning', title: 'Getting Started Guide', description: 'Learn platform basics', icon: '🚀', link: '/app/courses?beginner=true', priority: 9 },
          { type: 'learning', title: 'Community Events', description: 'Participate in ceremonies', icon: '🎭', link: '/app/events', priority: 7 },
          { type: 'learning', title: 'Educational Library', description: 'Explore books and courses', icon: '📚', link: '/app/books', priority: 6 }
        );
        break;
    }

    return suggestions;
  }

  /**
   * Get activity-based suggestions
   */
  getActivityBasedSuggestions(context) {
    const suggestions = [];
    const recentPages = this.getRecentPages();

    // If user has been viewing disputes a lot
    if (recentPages.filter(p => p.includes('disputes')).length >= 3) {
      suggestions.push({
        type: 'insight',
        title: 'Dispute Resolution Tips',
        description: 'Based on your recent activity',
        icon: '💡',
        link: '/app/courses?category=dispute-resolution',
        priority: 8
      });
    }

    // If user hasn't checked reports recently
    if (!recentPages.some(p => p.includes('reports'))) {
      suggestions.push({
        type: 'reminder',
        title: 'Check Your Reports',
        description: 'New analytics available',
        icon: '📊',
        link: '/app/reports',
        priority: 7
      });
    }

    // If user is active in community management
    if (recentPages.filter(p => p.includes('community')).length >= 2) {
      suggestions.push({
        type: 'insight',
        title: 'Community Growth Strategies',
        description: 'Recommended for active managers',
        icon: '🌱',
        link: '/app/courses?category=community-growth',
        priority: 7
      });
    }

    return suggestions;
  }

  /**
   * Get educational content suggestions
   */
  async getEducationalSuggestions(context) {
    const suggestions = [];

    try {
      // Suggest popular books
      const booksRef = collection(db, 'books');
      const booksQuery = query(booksRef, where('isPublished', '==', true), limit(2));
      const booksSnapshot = await getDocs(booksQuery);

      booksSnapshot.docs.forEach(doc => {
        const book = doc.data();
        suggestions.push({
          type: 'education',
          title: `Read: ${book.title}`,
          description: book.description?.substring(0, 50) + '...' || 'Recommended book',
          icon: '📖',
          link: `/app/books?id=${doc.id}`,
          priority: 5
        });
      });

      // Suggest relevant courses
      const coursesRef = collection(db, 'courses');
      const coursesQuery = query(coursesRef, where('isPublished', '==', true), limit(2));
      const coursesSnapshot = await getDocs(coursesQuery);

      coursesSnapshot.docs.forEach(doc => {
        const course = doc.data();
        suggestions.push({
          type: 'education',
          title: `Course: ${course.title}`,
          description: `${course.duration || 'Self-paced'} • ${course.difficulty || 'All levels'}`,
          icon: '🎓',
          link: `/app/courses?id=${doc.id}`,
          priority: 5
        });
      });
    } catch (error) {
      console.error('Error fetching educational suggestions:', error);
    }

    return suggestions;
  }

  /**
   * Rank and filter suggestions by priority
   */
  rankAndFilterSuggestions(suggestions) {
    // Remove duplicates by title
    const unique = suggestions.filter((s, index, self) =>
      index === self.findIndex(t => t.title === s.title)
    );

    // Sort by priority (higher first)
    return unique.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  /**
   * Get recent pages from activity
   */
  getRecentPages() {
    return this.userActivity
      .filter(a => a.type === 'pageView')
      .map(a => a.page)
      .slice(-10);
  }

  /**
   * Get AI-powered insights from activity patterns
   */
  async getAIInsights(context) {
    const recentActivity = this.userActivity.slice(-20);
    const activitySummary = this.summarizeActivity(recentActivity);

    // Use AI to generate insights
    try {
      const prompt = `Analyze this user activity and provide 3 brief, actionable insights:
      
      User Role: ${context.userRole}
      Current Page: ${context.currentPage}
      Recent Activity: ${activitySummary}
      
      Provide insights as a JSON array of objects with: title, description, actionLink`;

      const aiResponse = await aiService.sendMessage(prompt, context);
      
      // Try to parse AI response as JSON
      try {
        const insights = JSON.parse(aiResponse);
        return Array.isArray(insights) ? insights : [];
      } catch {
        // If not JSON, create simple insights
        return this.createDefaultInsights(context);
      }
    } catch (error) {
      console.error('Error getting AI insights:', error);
      return this.createDefaultInsights(context);
    }
  }

  /**
   * Summarize activity for AI analysis
   */
  summarizeActivity(activities) {
    const pageVisits = {};
    const actions = [];

    activities.forEach(activity => {
      if (activity.type === 'pageView') {
        pageVisits[activity.page] = (pageVisits[activity.page] || 0) + 1;
      } else if (activity.type === 'action') {
        actions.push(activity.action);
      }
    });

    return JSON.stringify({
      mostVisitedPages: Object.entries(pageVisits)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([page]) => page),
      recentActions: actions.slice(-5)
    });
  }

  /**
   * Create default insights when AI is unavailable
   */
  createDefaultInsights(context) {
    const insights = [
      {
        title: 'Platform Engagement',
        description: 'You\'re actively using the platform. Great job!',
        actionLink: '/app/dashboard'
      },
      {
        title: 'Explore Features',
        description: 'Discover more tools to enhance your work',
        actionLink: '/app/reports'
      },
      {
        title: 'Learn & Grow',
        description: 'Check out educational content',
        actionLink: '/app/courses'
      }
    ];

    return insights;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.suggestionCache.clear();
  }

  /**
   * Reset activity tracking
   */
  resetActivity() {
    this.userActivity = [];
  }
}

// Export singleton instance
const contentSuggestionService = new ContentSuggestionService();
export default contentSuggestionService;

