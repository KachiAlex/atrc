import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { AcademicCapIcon, TrophyIcon, CheckCircleIcon, ClockIcon, StarIcon } from '@heroicons/react/24/outline';

const LearningPaths = () => {
  const { currentUser } = useAuth();
  const [learningPaths, setLearningPaths] = useState([]);
  const [userProgress, setUserProgress] = useState({});
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchLearningPaths();
      fetchUserProgress();
      fetchCertificates();
    }
  }, [currentUser]);

  const fetchLearningPaths = async () => {
    try {
      const pathsRef = collection(db, 'learningPaths');
      const pathsSnapshot = await getDocs(pathsRef);
      const pathsData = pathsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLearningPaths(pathsData);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
    }
  };

  const fetchUserProgress = async () => {
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

  const fetchCertificates = async () => {
    try {
      const certificatesRef = collection(db, 'certificates');
      const q = query(certificatesRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const certificatesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCertificates(certificatesData);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPathProgress = (pathId) => {
    const pathProgress = userProgress[pathId];
    if (!pathProgress || !pathProgress.courses) return 0;
    
    const completedCourses = Object.values(pathProgress.courses).filter(course => course.completed).length;
    const path = learningPaths.find(p => p.id === pathId);
    const totalCourses = path?.courses?.length || 0;
    
    return totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0;
  };

  const isPathCompleted = (pathId) => {
    return getPathProgress(pathId) === 100;
  };

  const generateCertificate = async (pathId) => {
    try {
      const path = learningPaths.find(p => p.id === pathId);
      if (!path) return;

      const certificateData = {
        userId: currentUser.uid,
        pathId: pathId,
        pathName: path.name,
        completedAt: new Date().toISOString(),
        certificateId: `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'issued'
      };

      const certificateRef = doc(collection(db, 'certificates'));
      await setDoc(certificateRef, certificateData);
      
      setCertificates(prev => [...prev, { id: certificateRef.id, ...certificateData }]);
    } catch (error) {
      console.error('Error generating certificate:', error);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Learning Paths</h2>
          <p className="text-gray-600">Structured learning journeys for Traditional Rulers</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{certificates.length}</div>
          <div className="text-sm text-gray-600">Certificates Earned</div>
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningPaths.map(path => {
          const progress = getPathProgress(path.id);
          const isCompleted = isPathCompleted(path.id);
          const hasCertificate = certificates.some(cert => cert.pathId === path.id);
          
          return (
            <div key={path.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Path Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-100' : 'bg-primary-100'
                    }`}>
                      <AcademicCapIcon className={`h-6 w-6 ${
                        isCompleted ? 'text-green-600' : 'text-primary-600'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{path.name}</h3>
                      <p className="text-sm text-gray-600">{path.category}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <TrophyIcon className="h-6 w-6 text-yellow-500" />
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">{path.description}</p>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-green-500' : 'bg-primary-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Path Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{path.courses?.length || 0}</div>
                    <div className="text-xs text-gray-600">Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{path.duration}</div>
                    <div className="text-xs text-gray-600">Duration</div>
                  </div>
                </div>

                {/* Difficulty and Rating */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">Difficulty:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(star => (
                        <StarIcon
                          key={star}
                          className={`h-4 w-4 ${
                            star <= path.difficulty 
                              ? 'text-yellow-400 fill-current' 
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 capitalize">{path.difficultyLevel}</span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors text-sm font-medium">
                    {isCompleted ? 'Review Path' : 'Continue Learning'}
                  </button>
                  
                  {isCompleted && !hasCertificate && (
                    <button
                      onClick={() => generateCertificate(path.id)}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center"
                    >
                      <TrophyIcon className="h-4 w-4 mr-2" />
                      Get Certificate
                    </button>
                  )}
                  
                  {hasCertificate && (
                    <button className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium flex items-center justify-center">
                      <TrophyIcon className="h-4 w-4 mr-2" />
                      View Certificate
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Certificates Section */}
      {certificates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
              My Certificates
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {certificates.map(certificate => (
                <div key={certificate.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <TrophyIcon className="h-8 w-8 text-yellow-500 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">{certificate.pathName}</h4>
                      <p className="text-sm text-gray-600">Certificate of Completion</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    Completed: {new Date(certificate.completedAt).toLocaleDateString()}
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    ID: {certificate.certificateId}
                  </div>
                  
                  <button className="w-full bg-primary-600 text-white py-2 px-3 rounded-md hover:bg-primary-700 transition-colors text-sm">
                    Download Certificate
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommended Paths */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Learning Paths</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Leadership Excellence</h4>
            <p className="text-sm text-gray-600 mb-3">Master the art of traditional leadership in modern contexts</p>
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              8 weeks • 12 courses
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Cultural Preservation</h4>
            <p className="text-sm text-gray-600 mb-3">Learn to preserve and promote traditional culture</p>
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-1" />
              6 weeks • 8 courses
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPaths;
