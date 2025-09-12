import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { QuestionMarkCircleIcon, CheckCircleIcon, XCircleIcon, ClockIcon, TrophyIcon } from '@heroicons/react/24/outline';

const QuizSystem = () => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizResults, setQuizResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      fetchQuizzes();
      fetchQuizResults();
    }
  }, [currentUser]);

  useEffect(() => {
    let timer;
    if (isQuizActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && isQuizActive) {
      submitQuiz();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isQuizActive]);

  const fetchQuizzes = async () => {
    try {
      const quizzesRef = collection(db, 'quizzes');
      const quizzesSnapshot = await getDocs(quizzesRef);
      const quizzesData = quizzesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuizzes(quizzesData);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
    }
  };

  const fetchQuizResults = async () => {
    try {
      const resultsRef = collection(db, 'quizResults');
      const q = query(resultsRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const resultsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setQuizResults(resultsData);
    } catch (error) {
      console.error('Error fetching quiz results:', error);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(quiz.timeLimit * 60); // Convert minutes to seconds
    setIsQuizActive(true);
  };

  const selectAnswer = (questionId, answerIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < currentQuiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    setIsQuizActive(false);
    
    // Calculate score
    let correctAnswers = 0;
    currentQuiz.questions.forEach(question => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
    const passed = score >= currentQuiz.passingScore;

    // Save result
    try {
      const resultData = {
        userId: currentUser.uid,
        quizId: currentQuiz.id,
        quizName: currentQuiz.title,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: currentQuiz.questions.length,
        passed: passed,
        completedAt: new Date().toISOString(),
        timeSpent: (currentQuiz.timeLimit * 60) - timeLeft,
        answers: selectedAnswers
      };

      const resultRef = doc(collection(db, 'quizResults'));
      await setDoc(resultRef, resultData);
      
      setQuizResults(prev => [...prev, { id: resultRef.id, ...resultData }]);
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }

    // Reset quiz state
    setCurrentQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setTimeLeft(0);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  // Quiz Taking Interface
  if (currentQuiz && isQuizActive) {
    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{currentQuiz.title}</h2>
                <p className="text-gray-600">Question {currentQuestionIndex + 1} of {currentQuiz.questions.length}</p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatTime(timeLeft)}
                </div>
                <div className="text-sm text-gray-600">Time Remaining</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex items-start mb-6">
              <QuestionMarkCircleIcon className="h-6 w-6 text-primary-600 mr-3 mt-1" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {currentQuestion.question}
                </h3>
                
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <label
                      key={index}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAnswers[currentQuestion.id] === index
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={index}
                        checked={selectedAnswers[currentQuestion.id] === index}
                        onChange={() => selectAnswer(currentQuestion.id, index)}
                        className="sr-only"
                      />
                      <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                        selectedAnswers[currentQuestion.id] === index
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedAnswers[currentQuestion.id] === index && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          <div className="flex space-x-3">
            {currentQuestionIndex === currentQuiz.questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quizzes & Assessments</h2>
          <p className="text-gray-600">Test your knowledge and track your progress</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-primary-600">{quizResults.length}</div>
          <div className="text-sm text-gray-600">Quizzes Completed</div>
        </div>
      </div>

      {/* Available Quizzes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map(quiz => {
          const userResult = quizResults.find(result => result.quizId === quiz.id);
          const isCompleted = !!userResult;
          const bestScore = userResult?.score || 0;
          
          return (
            <div key={quiz.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      isCompleted ? 'bg-green-100' : 'bg-primary-100'
                    }`}>
                      <QuestionMarkCircleIcon className={`h-6 w-6 ${
                        isCompleted ? 'text-green-600' : 'text-primary-600'
                      }`} />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-gray-900">{quiz.title}</h3>
                      <p className="text-sm text-gray-600">{quiz.category}</p>
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{quiz.description}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{quiz.questions.length}</div>
                    <div className="text-xs text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{quiz.timeLimit}</div>
                    <div className="text-xs text-gray-600">Minutes</div>
                  </div>
                </div>

                {isCompleted && (
                  <div className={`${getScoreBgColor(bestScore)} rounded-lg p-3 mb-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Best Score</span>
                      <span className={`text-lg font-bold ${getScoreColor(bestScore)}`}>
                        {bestScore}%
                      </span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => startQuiz(quiz)}
                  className={`w-full py-2 px-4 rounded-md transition-colors text-sm font-medium ${
                    isCompleted
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  {isCompleted ? 'Retake Quiz' : 'Start Quiz'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quiz Results */}
      {quizResults.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-yellow-500" />
              Quiz Results
            </h3>
          </div>
          
          <div className="divide-y">
            {quizResults
              .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
              .map(result => (
                <div key={result.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                        result.passed ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {result.passed ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{result.quizName}</h4>
                        <p className="text-sm text-gray-600">
                          {result.correctAnswers}/{result.totalQuestions} correct answers
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                        {result.score}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(result.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        result.passed ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.score}%` }}
                    ></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizSystem;
