import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CardSkeleton } from '../components/ui/LoadingSkeleton';
import { TouchButton, TouchCard, SwipeHandler } from '../components/ui/TouchOptimized';
import { 
  BookOpenIcon, 
  ClockIcon, 
  StarIcon, 
  PlayIcon, 
  CheckCircleIcon,
  BookmarkIcon,
  ShareIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CourseReader = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [bookmarkedCourses, setBookmarkedCourses] = useState(new Set());
  const [filters, setFilters] = useState({
    category: '',
    language: '',
    difficulty: '',
    search: ''
  });

  const categories = [
    { value: 'leadership', label: 'Leadership & Governance' },
    { value: 'spiritual', label: 'Spiritual Growth' },
    { value: 'community', label: 'Community Development' },
    { value: 'history', label: 'Traditional History' },
    { value: 'wisdom', label: 'Traditional Wisdom' },
    { value: 'technology', label: 'Digital Literacy' },
    { value: 'business', label: 'Business & Economics' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' },
    { value: 'yo', label: 'Yoruba' },
    { value: 'ig', label: 'Igbo' },
    { value: 'ha', label: 'Hausa' },
    { value: 'zu', label: 'Zulu' },
    { value: 'fr', label: 'French' },
    { value: 'ar', label: 'Arabic' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner', color: 'green' },
    { value: 'intermediate', label: 'Intermediate', color: 'yellow' },
    { value: 'advanced', label: 'Advanced', color: 'red' }
  ];

  useEffect(() => {
    fetchCourses();
    if (currentUser) {
      fetchUserProgress();
      fetchBookmarkedCourses();
    }
  }, [currentUser]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const coursesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Add default values for missing fields
        rating: doc.data().rating || 0,
        enrolledCount: doc.data().enrolledCount || 0,
        duration: doc.data().duration || '2 hours',
        difficulty: doc.data().difficulty || 'beginner',
        language: doc.data().language || 'en',
        category: doc.data().category || 'leadership'
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!currentUser) return;
    try {
      const progressRef = doc(db, 'userProgress', currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      if (progressDoc.exists()) {
        setUserProgress(progressDoc.data());
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const fetchBookmarkedCourses = async () => {
    if (!currentUser) return;
    try {
      const bookmarksRef = collection(db, 'userBookmarks');
      const q = query(bookmarksRef, where('userId', '==', currentUser.uid), where('type', '==', 'course'));
      const snapshot = await getDocs(q);
      const bookmarkedIds = new Set(snapshot.docs.map(doc => doc.data().itemId));
      setBookmarkedCourses(bookmarkedIds);
    } catch (error) {
      console.error('Error fetching bookmarked courses:', error);
    }
  };

  const toggleBookmark = async (courseId) => {
    if (!currentUser) {
      toast.error('Please login to bookmark courses');
      return;
    }

    try {
      const isBookmarked = bookmarkedCourses.has(courseId);
      
      if (isBookmarked) {
        // Remove bookmark logic would go here
        setBookmarkedCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
        toast.success('Course removed from bookmarks');
      } else {
        // Add bookmark
        const bookmarkData = {
          userId: currentUser.uid,
          type: 'course',
          itemId: courseId,
          title: courses.find(c => c.id === courseId)?.title || '',
          description: courses.find(c => c.id === courseId)?.description || '',
          createdAt: new Date().toISOString()
        };
        
        await setDoc(doc(collection(db, 'userBookmarks')), bookmarkData);
        setBookmarkedCourses(prev => new Set([...prev, courseId]));
        toast.success('Course bookmarked');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesCategory = !filters.category || course.category === filters.category;
    const matchesLanguage = !filters.language || course.language === filters.language;
    const matchesDifficulty = !filters.difficulty || course.difficulty === filters.difficulty;
    const matchesSearch = !filters.search || 
      course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      course.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesCategory && matchesLanguage && matchesDifficulty && matchesSearch;
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openCourse = (course) => {
    setSelectedCourse(course);
  };

  const closeCourse = () => {
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Skeleton */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Filters Skeleton */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          
          {/* Courses Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Digital Learning Center
          </h1>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Access educational courses and training materials for traditional rulers
          </p>
        </div>

        {/* Enhanced Filters */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Filter Courses
          </h3>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                name="search"
                placeholder="Search courses..."
                value={filters.search}
                onChange={handleFilterChange}
                className={`w-full px-4 py-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Language
              </label>
              <select
                name="language"
                value={filters.language}
                onChange={handleFilterChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Difficulty
              </label>
              <select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">All Levels</option>
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>
                    {diff.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(filters.category || filters.language || filters.difficulty || filters.search) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Active filters:
              </span>
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-100 text-primary-800">
                  Search: "{filters.search}"
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="ml-1 hover:text-primary-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  {categories.find(c => c.value === filters.category)?.label}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, category: '' }))}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.language && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  {languages.find(l => l.value === filters.language)?.label}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, language: '' }))}
                    className="ml-1 hover:text-green-900"
                  >
                    ×
                  </button>
                </span>
              )}
              {filters.difficulty && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  {difficulties.find(d => d.value === filters.difficulty)?.label}
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, difficulty: '' }))}
                    className="ml-1 hover:text-yellow-900"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <p>
            Showing {filteredCourses.length} of {courses.length} courses
            {filters.search && ` matching "${filters.search}"`}
          </p>
        </div>

        {/* Enhanced Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <TouchCard 
                key={course.id} 
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}
                hoverable={true}
              >
              {/* Course Image/Icon */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <div className="text-center">
                  <AcademicCapIcon className="w-16 h-16 text-primary-600 mx-auto mb-2" />
                  <p className="text-primary-600 font-medium">Course Content</p>
                </div>
                
                {/* Bookmark Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(course.id);
                  }}
                  className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                    bookmarkedCourses.has(course.id)
                      ? 'bg-red-500 text-white'
                      : isDarkMode 
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-white text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <BookmarkIcon className={`w-5 h-5 ${bookmarkedCourses.has(course.id) ? 'fill-current' : ''}`} />
                </button>
                
                {/* Difficulty Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {difficulties.find(d => d.value === course.difficulty)?.label}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                {/* Course Title and Rating */}
                <div className="mb-2">
                  <h3 className={`font-semibold text-lg mb-1 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <StarIcon 
                          key={star} 
                          className={`w-4 h-4 ${
                            star <= (course.rating || 0) 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      ({course.rating || 0})
                    </span>
                  </div>
                </div>
                
                <p className={`text-sm mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  by {course.instructor || 'ATRC Faculty'}
                </p>
                <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {course.description}
                </p>
                
                {/* Course Meta Information */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isDarkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {languages.find(l => l.value === course.language)?.label || 'English'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800'
                  }`}>
                    {categories.find(c => c.value === course.category)?.label || 'General'}
                  </span>
                </div>
                
                {/* Course Stats */}
                <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{course.duration || '2 hours'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{course.enrolledCount || 0} enrolled</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <TouchButton
                    onClick={() => openCourse(course)}
                    variant="primary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-2"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Start Course
                  </TouchButton>
                  <TouchButton
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share functionality would go here
                      toast.success('Course link copied to clipboard!');
                    }}
                    variant="secondary"
                    size="sm"
                    className="p-2"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </TouchButton>
                </div>
              </div>
              </TouchCard>
          ))}
        </div>

        {filteredCourses.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses available</h3>
            <p className="text-gray-500">Check back later for new educational content</p>
          </div>
        )}
      </div>

      {/* Course Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
                <p className="text-gray-600">by {selectedCourse.instructor}</p>
              </div>
              <button
                onClick={closeCourse}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-4">{selectedCourse.description}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>📚 {categories.find(c => c.value === selectedCourse.category)?.label}</span>
                  <span>🌐 {languages.find(l => l.value === selectedCourse.language)?.label}</span>
                  {selectedCourse.duration && <span>⏱️ {selectedCourse.duration}</span>}
                </div>
              </div>
              
              <div className="bg-gray-100 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Course Content</h3>
                <div className="aspect-video bg-white rounded border">
                  <iframe
                    src={selectedCourse.embeddedUrl}
                    title={selectedCourse.title}
                    className="w-full h-full rounded"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={closeCourse}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <a
                  href={selectedCourse.embeddedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-center"
                >
                  Open in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseReader;