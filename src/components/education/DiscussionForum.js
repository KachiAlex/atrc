import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit, addDoc } from 'firebase/firestore';
import { ChatBubbleLeftRightIcon, HeartIcon, ShareIcon, FlagIcon, UserIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const DiscussionForum = () => {
  const { currentUser } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' });
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchDiscussions();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedDiscussion) {
      fetchReplies(selectedDiscussion.id);
    }
  }, [selectedDiscussion]);

  const fetchDiscussions = async () => {
    try {
      const discussionsRef = collection(db, 'discussions');
      const q = query(discussionsRef, orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      
      const discussionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setDiscussions(discussionsData);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (discussionId) => {
    try {
      const repliesRef = collection(db, 'discussionReplies');
      const q = query(
        repliesRef, 
        where('discussionId', '==', discussionId),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      const repliesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReplies(repliesData);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const createDiscussion = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const discussionData = {
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        authorEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: 0,
        replies: 0,
        views: 0,
        isPinned: false,
        isLocked: false
      };

      const docRef = await addDoc(collection(db, 'discussions'), discussionData);
      
      setDiscussions(prev => [{ id: docRef.id, ...discussionData }, ...prev]);
      setNewPost({ title: '', content: '', category: 'general' });
      setShowNewPost(false);
    } catch (error) {
      console.error('Error creating discussion:', error);
    }
  };

  const addReply = async () => {
    if (!newReply.trim() || !selectedDiscussion) return;

    try {
      const replyData = {
        discussionId: selectedDiscussion.id,
        content: newReply,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Anonymous',
        authorEmail: currentUser.email,
        createdAt: new Date().toISOString(),
        likes: 0
      };

      const docRef = await addDoc(collection(db, 'discussionReplies'), replyData);
      
      // Update discussion reply count
      const discussionRef = doc(db, 'discussions', selectedDiscussion.id);
      await updateDoc(discussionRef, {
        replies: selectedDiscussion.replies + 1,
        updatedAt: new Date().toISOString()
      });

      setReplies(prev => [...prev, { id: docRef.id, ...replyData }]);
      setNewReply('');
      
      // Update local discussion state
      setSelectedDiscussion(prev => ({
        ...prev,
        replies: prev.replies + 1,
        updatedAt: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const likeDiscussion = async (discussionId) => {
    try {
      const discussionRef = doc(db, 'discussions', discussionId);
      const discussion = discussions.find(d => d.id === discussionId);
      
      await updateDoc(discussionRef, {
        likes: discussion.likes + 1
      });

      setDiscussions(prev => prev.map(d => 
        d.id === discussionId 
          ? { ...d, likes: d.likes + 1 }
          : d
      ));
    } catch (error) {
      console.error('Error liking discussion:', error);
    }
  };

  const likeReply = async (replyId) => {
    try {
      const replyRef = doc(db, 'discussionReplies', replyId);
      const reply = replies.find(r => r.id === replyId);
      
      await updateDoc(replyRef, {
        likes: reply.likes + 1
      });

      setReplies(prev => prev.map(r => 
        r.id === replyId 
          ? { ...r, likes: r.likes + 1 }
          : r
      ));
    } catch (error) {
      console.error('Error liking reply:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-gray-100 text-gray-800',
      leadership: 'bg-blue-100 text-blue-800',
      culture: 'bg-green-100 text-green-800',
      governance: 'bg-purple-100 text-purple-800',
      education: 'bg-yellow-100 text-yellow-800',
      technology: 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || colors.general;
  };

  const filteredDiscussions = discussions.filter(discussion => {
    if (activeTab === 'all') return true;
    return discussion.category === activeTab;
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Discussion Forum</h2>
          <p className="text-gray-600">Connect with fellow Traditional Rulers and share insights</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
          New Discussion
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-2 overflow-x-auto">
        {['all', 'general', 'leadership', 'culture', 'governance', 'education', 'technology'].map(category => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === category
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* New Post Form */}
      {showNewPost && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Discussion</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Discussion title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newPost.category}
                onChange={(e) => setNewPost(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="general">General</option>
                <option value="leadership">Leadership</option>
                <option value="culture">Culture</option>
                <option value="governance">Governance</option>
                <option value="education">Education</option>
                <option value="technology">Technology</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Share your thoughts..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createDiscussion}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Post Discussion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discussions List */}
      <div className="space-y-4">
        {filteredDiscussions.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
            <p className="text-gray-600">Start the conversation by creating a new discussion</p>
          </div>
        ) : (
          filteredDiscussions.map(discussion => (
            <div key={discussion.id} className="bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    <UserIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{discussion.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>by {discussion.authorName}</span>
                      <span>•</span>
                      <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(discussion.category)}`}>
                  {discussion.category}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4 line-clamp-3">{discussion.content}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => likeDiscussion(discussion.id)}
                    className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
                  >
                    <HeartIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{discussion.likes}</span>
                  </button>
                  <button
                    onClick={() => setSelectedDiscussion(discussion)}
                    className="flex items-center text-gray-600 hover:text-primary-600 transition-colors"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">{discussion.replies}</span>
                  </button>
                  <button className="flex items-center text-gray-600 hover:text-gray-800 transition-colors">
                    <ShareIcon className="h-4 w-4 mr-1" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
                <button className="text-gray-400 hover:text-red-500 transition-colors">
                  <FlagIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Discussion Detail Modal */}
      {selectedDiscussion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedDiscussion.title}</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <span>by {selectedDiscussion.authorName}</span>
                    <span>•</span>
                    <span>{new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{selectedDiscussion.replies} replies</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedDiscussion.content}</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Replies ({replies.length})</h3>
                
                {replies.map(reply => (
                  <div key={reply.id} className="border-l-4 border-primary-200 pl-4 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                          <UserIcon className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{reply.authorName}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => likeReply(reply.id)}
                        className="flex items-center text-gray-600 hover:text-red-500 transition-colors"
                      >
                        <HeartIcon className="h-4 w-4 mr-1" />
                        <span className="text-sm">{reply.likes}</span>
                      </button>
                    </div>
                    <p className="text-gray-700 text-sm">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t">
              <div className="flex space-x-3">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
                <button
                  onClick={addReply}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionForum;
