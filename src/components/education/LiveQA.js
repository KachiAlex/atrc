import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, addDoc, onSnapshot } from 'firebase/firestore';
import { QuestionMarkCircleIcon, MicrophoneIcon, SpeakerWaveIcon, HandRaisedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const LiveQA = ({ meetingId }) => {
  const { currentUser } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (currentUser && meetingId) {
      checkModeratorStatus();
      setupQuestionsListener();
    }
  }, [currentUser, meetingId]);

  const checkModeratorStatus = async () => {
    try {
      const meetingRef = doc(db, 'meetings', meetingId);
      const meetingDoc = await getDoc(meetingRef);
      
      if (meetingDoc.exists()) {
        const meetingData = meetingDoc.data();
        setIsModerator(meetingData.moderatorId === currentUser.uid || currentUser.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking moderator status:', error);
    }
  };

  const setupQuestionsListener = () => {
    const questionsRef = collection(db, 'meetingQuestions');
    const q = query(
      questionsRef,
      where('meetingId', '==', meetingId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questionsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
      setLoading(false);
    });

    return unsubscribe;
  };

  const submitQuestion = async () => {
    if (!newQuestion.trim()) return;

    try {
      const questionData = {
        meetingId: meetingId,
        question: newQuestion,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        authorEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        status: 'pending', // pending, answered, dismissed
        upvotes: 0,
        isHighlighted: false,
        answer: '',
        answeredAt: null,
        answeredBy: null
      };

      await addDoc(collection(db, 'meetingQuestions'), questionData);
      setNewQuestion('');
    } catch (error) {
      console.error('Error submitting question:', error);
    }
  };

  const upvoteQuestion = async (questionId) => {
    try {
      const questionRef = doc(db, 'meetingQuestions', questionId);
      const question = questions.find(q => q.id === questionId);
      
      await updateDoc(questionRef, {
        upvotes: question.upvotes + 1
      });
    } catch (error) {
      console.error('Error upvoting question:', error);
    }
  };

  const answerQuestion = async (questionId, answer) => {
    try {
      const questionRef = doc(db, 'meetingQuestions', questionId);
      
      await updateDoc(questionRef, {
        status: 'answered',
        answer: answer,
        answeredAt: new Date().toISOString(),
        answeredBy: currentUser.uid
      });
    } catch (error) {
      console.error('Error answering question:', error);
    }
  };

  const highlightQuestion = async (questionId) => {
    try {
      const questionRef = doc(db, 'meetingQuestions', questionId);
      const question = questions.find(q => q.id === questionId);
      
      await updateDoc(questionRef, {
        isHighlighted: !question.isHighlighted
      });
    } catch (error) {
      console.error('Error highlighting question:', error);
    }
  };

  const dismissQuestion = async (questionId) => {
    try {
      const questionRef = doc(db, 'meetingQuestions', questionId);
      
      await updateDoc(questionRef, {
        status: 'dismissed'
      });
    } catch (error) {
      console.error('Error dismissing question:', error);
    }
  };

  const filteredQuestions = questions.filter(question => {
    if (activeTab === 'all') return question.status !== 'dismissed';
    if (activeTab === 'pending') return question.status === 'pending';
    if (activeTab === 'answered') return question.status === 'answered';
    if (activeTab === 'highlighted') return question.isHighlighted;
    return true;
  });

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      answered: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-20"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Live Q&A</h2>
          <p className="text-gray-600">Ask questions and interact with the speaker</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Question Submission */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Ask a Question</h3>
        <div className="flex space-x-3">
          <textarea
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
          />
          <button
            onClick={submitQuestion}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors flex items-center"
          >
            <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
            Ask
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { key: 'all', label: 'All Questions', count: questions.filter(q => q.status !== 'dismissed').length },
          { key: 'pending', label: 'Pending', count: questions.filter(q => q.status === 'pending').length },
          { key: 'answered', label: 'Answered', count: questions.filter(q => q.status === 'answered').length },
          { key: 'highlighted', label: 'Highlighted', count: questions.filter(q => q.isHighlighted).length }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <QuestionMarkCircleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No questions yet</h3>
            <p className="text-gray-600">Be the first to ask a question!</p>
          </div>
        ) : (
          filteredQuestions.map(question => (
            <QuestionCard
              key={question.id}
              question={question}
              isModerator={isModerator}
              onUpvote={upvoteQuestion}
              onAnswer={answerQuestion}
              onHighlight={highlightQuestion}
              onDismiss={dismissQuestion}
              getStatusColor={getStatusColor}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Question Card Component
const QuestionCard = ({ 
  question, 
  isModerator, 
  onUpvote, 
  onAnswer, 
  onHighlight, 
  onDismiss, 
  getStatusColor 
}) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answer, setAnswer] = useState('');

  const handleAnswer = () => {
    if (answer.trim()) {
      onAnswer(question.id, answer);
      setAnswer('');
      setShowAnswerForm(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm border ${
      question.isHighlighted ? 'ring-2 ring-yellow-400 bg-yellow-50' : ''
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
            <QuestionMarkCircleIcon className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{question.authorName}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{new Date(question.createdAt).toLocaleTimeString()}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(question.status)}`}>
                {question.status}
              </span>
              {question.isHighlighted && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  Highlighted
                </span>
              )}
            </div>
          </div>
        </div>
        
        {isModerator && (
          <div className="flex space-x-2">
            <button
              onClick={() => onHighlight(question.id)}
              className={`p-2 rounded-md transition-colors ${
                question.isHighlighted 
                  ? 'bg-yellow-100 text-yellow-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="Highlight question"
            >
              <HandRaisedIcon className="h-4 w-4" />
            </button>
            {question.status === 'pending' && (
              <button
                onClick={() => setShowAnswerForm(true)}
                className="p-2 bg-green-100 text-green-600 rounded-md hover:bg-green-200 transition-colors"
                title="Answer question"
              >
                <CheckCircleIcon className="h-4 w-4" />
              </button>
            )}
            {question.status === 'pending' && (
              <button
                onClick={() => onDismiss(question.id)}
                className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                title="Dismiss question"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>
      
      <p className="text-gray-700 mb-4">{question.question}</p>
      
      {question.answer && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
          <div className="flex items-center mb-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium text-green-800">Answer</span>
          </div>
          <p className="text-green-700">{question.answer}</p>
          {question.answeredAt && (
            <p className="text-sm text-green-600 mt-2">
              Answered at {new Date(question.answeredAt).toLocaleString()}
            </p>
          )}
        </div>
      )}
      
      {showAnswerForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h5 className="font-medium text-gray-900 mb-2">Answer this question:</h5>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
            rows={3}
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowAnswerForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAnswer}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Submit Answer
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <button
          onClick={() => onUpvote(question.id)}
          className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
        >
          <HandRaisedIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{question.upvotes} upvotes</span>
        </button>
        
        <div className="text-sm text-gray-500">
          {question.upvotes > 0 && (
            <span className="text-primary-600 font-medium">
              {question.upvotes} people want this answered
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveQA;
