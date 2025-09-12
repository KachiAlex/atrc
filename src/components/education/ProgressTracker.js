import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { BookOpenIcon, ClockIcon, CheckCircleIcon, TrophyIcon } from '@heroicons/react/24/outline';

const ProgressTracker = () => {
  const { currentUser } = useAuth();
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (currentUser) {
      fetchProgress();
      fetchCourses();
    }
  }, [currentUser]);

  const fetchProgress = async () => {
    try {
      const progressRef = doc(db, 'userProgress', currentUser.uid);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        setProgress(progressDoc.data());
      }
    } catch (error) {
      console.error('Error fetching progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const coursesSnapshot = await getDocs(coursesRef);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const updateProgress = async (courseId, lessonId, completed = true) => {
    try {
      const progressRef = doc(db, 'userProgress', currentUser.uid);
      const progressData = {
        ...progress,
        [courseId]: {
          ...progress[courseId],
          lessons: {
            ...progress[courseId]?.lessons,
            [lessonId]: {
              completed,
              completedAt: completed ? new Date().toISOString() : null
            }
          },
          lastAccessed: new Date().toISOString()
        }
      };

      await setDoc(progressRef, progressData, { merge: true });
      setProgress(progressData);
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getCourseProgress = (courseId) => {
    const courseProgress = progress[courseId];
    if (!courseProgress || !courseProgress.lessons) return 0;
    
    const completedLessons = Object.values(courseProgress.lessons).filter(lesson => lesson.completed).length;
    const totalLessons = courses.find(c => c.id === courseId)?.lessons?.length || 0;
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const getOverallProgress = () => {
    if (courses.length === 0) return 0;
    
    const totalProgress = courses.reduce((sum, course) => {
      return sum + getCourseProgress(course.id);
    }, 0);
    
    return Math.round(totalProgress / courses.length);
  };

  const getCompletedCourses = () => {
    return courses.filter(course => getCourseProgress(course.id) === 100);
  };

  const getInProgressCourses = () => {
    return courses.filter(course => {
      const progress = getCourseProgress(course.id);
      return progress > 0 && progress < 100;
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Learning Progress</h2>
            <p className="text-primary-100">Track your educational journey</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{getOverallProgress()}%</div>
            <div className="text-primary-100">Overall Progress</div>
          </div>
        </div>
        
        <div className="mt-4 bg-primary-500 rounded-full h-3">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${getOverallProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{courses.length}</div>
              <div className="text-gray-600">Total Courses</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{getCompletedCourses().length}</div>
              <div className="text-gray-600">Completed</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900">{getInProgressCourses().length}</div>
              <div className="text-gray-600">In Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Course Progress</h3>
        </div>
        
        <div className="divide-y">
          {courses.map(course => {
            const courseProgress = getCourseProgress(course.id);
            const isCompleted = courseProgress === 100;
            const isInProgress = courseProgress > 0 && courseProgress < 100;
            
            return (
              <div key={course.id} className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      isCompleted ? 'bg-green-500' : 
                      isInProgress ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}></div>
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    {isCompleted && (
                      <TrophyIcon className="h-5 w-5 text-yellow-500 ml-2" />
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-600">
                    {courseProgress}%
                  </div>
                </div>
                
                <div className="bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 
                      isInProgress ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${courseProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{course.category}</span>
                  <span>{course.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        </div>
        
        <div className="p-6">
          {Object.keys(progress).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpenIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No learning activity yet</p>
              <p className="text-sm">Start a course to track your progress</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(progress).map(([courseId, courseProgress]) => {
                const course = courses.find(c => c.id === courseId);
                if (!course) return null;
                
                return (
                  <div key={courseId} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Last accessed: {course.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {courseProgress.lastAccessed ? 
                          new Date(courseProgress.lastAccessed).toLocaleDateString() : 
                          'Never'
                        }
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
