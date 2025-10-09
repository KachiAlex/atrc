import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const AnnouncementsPage = () => {
  const { isDarkMode } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [lastVisible, setLastVisible] = useState(null);
  const announcementsPerPage = 6;

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      let q;
      
      if (currentPage === 1) {
        // First page
        q = query(
          collection(db, 'announcements'),
          orderBy('createdAt', 'desc'),
          limit(announcementsPerPage)
        );
      } else {
        // Subsequent pages
        q = query(
          collection(db, 'announcements'),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(announcementsPerPage)
        );
      }

      const snapshot = await getDocs(q);
      const announcementsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAnnouncements(announcementsData);
      
      if (snapshot.docs.length > 0) {
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      }

      // Calculate total pages
      const totalAnnouncementsQuery = query(collection(db, 'announcements'));
      const totalSnapshot = await getDocs(totalAnnouncementsQuery);
      setTotalPages(Math.ceil(totalSnapshot.size / announcementsPerPage));

    } catch (error) {
      console.error('Error fetching announcements:', error);
      // Fallback to static data if Firestore fails
      setAnnouncements([
        {
          id: 1,
          title: 'Council Meeting Announcement',
          content: 'The monthly council meeting will be held on January 30th, 2024 at 10:00 AM. All traditional rulers are expected to attend.',
          author: 'Oba Adeyemi III',
          date: '2024-01-20',
          priority: 'high',
          createdAt: { seconds: Date.now() / 1000 }
        },
        {
          id: 2,
          title: 'Cultural Festival Update',
          content: 'The annual cultural festival has been rescheduled to March 15th, 2024. Please update your calendars accordingly.',
          author: 'Eze Nwosu',
          date: '2024-01-18',
          priority: 'medium',
          createdAt: { seconds: Date.now() / 1000 }
        },
        {
          id: 3,
          title: 'New Community Guidelines',
          content: 'Please review the updated community guidelines for traditional practices. These guidelines ensure proper protocol during ceremonies.',
          author: 'Emir Muhammad',
          date: '2024-01-15',
          priority: 'low',
          createdAt: { seconds: Date.now() / 1000 }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Announcements
              </h1>
              <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Important updates and communications from traditional rulers
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span className="mr-2">🏠</span>
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-6">
          {announcements.map((announcement, index) => (
            <div key={announcement.id} className={`transform transition-all duration-500 delay-${index * 100}`}>
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 announcement-card`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {announcement.title}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                        {announcement.priority} priority
                      </span>
                    </div>
                    
                    <p className={`text-base mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                      {announcement.content}
                    </p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="mr-2">👤</span>
                        <span>By {announcement.author}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="mr-2">📅</span>
                        <span>
                          {announcement.createdAt 
                            ? new Date(announcement.createdAt.seconds * 1000).toLocaleDateString()
                            : announcement.date
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } transition-colors`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`px-4 py-2 rounded-md ${
                  currentPage === index + 1
                    ? 'bg-primary-600 text-white'
                    : isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } transition-colors`}
              >
                {index + 1}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              } transition-colors`}
            >
              Next
            </button>
          </div>
        )}

        {/* Empty State */}
        {announcements.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📢</div>
            <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No Announcements Found
            </h3>
            <p className={`text-gray-500 mb-6`}>
              There are currently no announcements to display.
            </p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <span className="mr-2">🏠</span>
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPage;
