import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const LiveMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    meetingType: 'google-meet',
    meetingUrl: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '',
    host: '',
    isActive: false
  });

  const meetingTypes = [
    { value: 'google-meet', label: 'Google Meet', icon: '📹' },
    { value: 'mixlr', label: 'Mixlr', icon: '🎙️' },
    { value: 'zoom', label: 'Zoom', icon: '💻' },
    { value: 'teams', label: 'Microsoft Teams', icon: '👥' }
  ];

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const meetingsRef = collection(db, 'liveMeetings');
      const q = query(meetingsRef, orderBy('scheduledDate', 'desc'));
      const snapshot = await getDocs(q);
      const meetingsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeetings(meetingsData);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const meetingData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (editingMeeting) {
        await updateDoc(doc(db, 'liveMeetings', editingMeeting.id), meetingData);
      } else {
        await addDoc(collection(db, 'liveMeetings'), meetingData);
      }

      setShowForm(false);
      setEditingMeeting(null);
      setFormData({
        title: '',
        description: '',
        meetingType: 'google-meet',
        meetingUrl: '',
        scheduledDate: '',
        scheduledTime: '',
        duration: '',
        host: '',
        isActive: false
      });
      fetchMeetings();
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      description: meeting.description,
      meetingType: meeting.meetingType,
      meetingUrl: meeting.meetingUrl,
      scheduledDate: meeting.scheduledDate,
      scheduledTime: meeting.scheduledTime,
      duration: meeting.duration,
      host: meeting.host,
      isActive: meeting.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (meeting) => {
    if (window.confirm('Are you sure you want to delete this meeting?')) {
      try {
        await deleteDoc(doc(db, 'liveMeetings', meeting.id));
        fetchMeetings();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Failed to delete meeting');
      }
    }
  };

  const toggleActive = async (meeting) => {
    try {
      await updateDoc(doc(db, 'liveMeetings', meeting.id), {
        isActive: !meeting.isActive,
        updatedAt: new Date()
      });
      fetchMeetings();
    } catch (error) {
      console.error('Error updating meeting:', error);
      alert('Failed to update meeting');
    }
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return 'Not scheduled';
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString();
  };

  const isUpcoming = (date, time) => {
    if (!date || !time) return false;
    const meetingDateTime = new Date(`${date}T${time}`);
    return meetingDateTime > new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Meetings</h1>
          <p className="text-gray-600">Schedule and manage live meetings for Traditional Rulers</p>
        </div>

        {/* Add Meeting Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Schedule New Meeting
          </button>
        </div>

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {meetingTypes.find(t => t.value === meeting.meetingType)?.icon || '📹'}
                  </div>
                  <p className="text-blue-600 font-medium">
                    {meetingTypes.find(t => t.value === meeting.meetingType)?.label || 'Live Meeting'}
                  </p>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{meeting.title}</h3>
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      meeting.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {meeting.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {isUpcoming(meeting.scheduledDate, meeting.scheduledTime) && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">Host: {meeting.host}</p>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{meeting.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-xs text-gray-600">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDateTime(meeting.scheduledDate, meeting.scheduledTime)}
                  </div>
                  {meeting.duration && (
                    <div className="flex items-center text-xs text-gray-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Duration: {meeting.duration}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(meeting)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(meeting)}
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                      meeting.isActive
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {meeting.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(meeting)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {meetings.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings scheduled</h3>
            <p className="text-gray-500 mb-4">Get started by scheduling your first live meeting</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Schedule First Meeting
            </button>
          </div>
        )}
      </div>

      {/* Meeting Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingMeeting(null);
                    setFormData({
                      title: '',
                      description: '',
                      meetingType: 'google-meet',
                      meetingUrl: '',
                      scheduledDate: '',
                      scheduledTime: '',
                      duration: '',
                      host: '',
                      isActive: false
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter meeting title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Host *
                    </label>
                    <input
                      type="text"
                      name="host"
                      value={formData.host}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter host name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter meeting description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Type *
                    </label>
                    <select
                      name="meetingType"
                      value={formData.meetingType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {meetingTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 1 hour, 30 minutes"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting URL *
                  </label>
                  <input
                    type="url"
                    name="meetingUrl"
                    value={formData.meetingUrl}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://meet.google.com/... or https://mixlr.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the meeting link (Google Meet, Mixlr, Zoom, etc.)
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Activate meeting immediately
                  </label>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingMeeting(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMeetings;
