import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useLanguage } from '../contexts/LanguageContext';
import LiveQA from '../components/education/LiveQA';

const LiveMeetingsViewer = () => {
  const { t } = useLanguage();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState(null);

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
      const q = query(meetingsRef, where('isActive', '==', true), orderBy('scheduledDate', 'desc'));
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

  const isLive = (date, time) => {
    if (!date || !time) return false;
    const meetingDateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const endTime = new Date(meetingDateTime.getTime() + (2 * 60 * 60 * 1000)); // Assume 2 hours duration
    return now >= meetingDateTime && now <= endTime;
  };

  const joinMeeting = (meeting) => {
    window.open(meeting.meetingUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Meetings</h1>
          <p className="text-gray-600">Join live meetings and discussions with Traditional Rulers</p>
        </div>

        {/* Live Status Banner */}
        {meetings.some(meeting => isLive(meeting.scheduledDate, meeting.scheduledTime)) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <p className="font-medium">Live meetings are currently in progress!</p>
                <p className="text-sm">Join now to participate in ongoing discussions.</p>
              </div>
            </div>
          </div>
        )}

        {/* Meetings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <div key={meeting.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center relative">
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {meetingTypes.find(t => t.value === meeting.meetingType)?.icon || '📹'}
                  </div>
                  <p className="text-blue-600 font-medium">
                    {meetingTypes.find(t => t.value === meeting.meetingType)?.label || 'Live Meeting'}
                  </p>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {isLive(meeting.scheduledDate, meeting.scheduledTime) ? (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                      🔴 LIVE
                    </span>
                  ) : isUpcoming(meeting.scheduledDate, meeting.scheduledTime) ? (
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs rounded-full">
                      ⏰ Upcoming
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-gray-500 text-white text-xs rounded-full">
                      📅 Past
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">{meeting.title}</h3>
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
                    onClick={() => joinMeeting(meeting)}
                    className={`flex-1 px-3 py-2 rounded text-sm transition-colors ${
                      isLive(meeting.scheduledDate, meeting.scheduledTime)
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : isUpcoming(meeting.scheduledDate, meeting.scheduledTime)
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                    disabled={!isLive(meeting.scheduledDate, meeting.scheduledTime) && !isUpcoming(meeting.scheduledDate, meeting.scheduledTime)}
                  >
                    {isLive(meeting.scheduledDate, meeting.scheduledTime)
                      ? '🔴 Join Live'
                      : isUpcoming(meeting.scheduledDate, meeting.scheduledTime)
                      ? '⏰ Join When Live'
                      : '📅 Meeting Ended'
                    }
                  </button>
                  <button
                    onClick={() => setSelectedMeeting(meeting)}
                    className="flex-1 bg-gray-500 text-white px-3 py-2 rounded text-sm hover:bg-gray-600 transition-colors"
                  >
                    Details
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No live meetings available</h3>
            <p className="text-gray-500">Check back later for scheduled meetings</p>
          </div>
        )}
      </div>

      {/* Meeting Details Modal */}
      {selectedMeeting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedMeeting.title}</h2>
                  <p className="text-gray-600">Host: {selectedMeeting.host}</p>
                </div>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{selectedMeeting.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Meeting Type</h4>
                    <p className="text-gray-600">
                      {meetingTypes.find(t => t.value === selectedMeeting.meetingType)?.icon} {meetingTypes.find(t => t.value === selectedMeeting.meetingType)?.label}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Scheduled Time</h4>
                    <p className="text-gray-600">{formatDateTime(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime)}</p>
                  </div>
                  {selectedMeeting.duration && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Duration</h4>
                      <p className="text-gray-600">{selectedMeeting.duration}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Status</h4>
                    <p className="text-gray-600">
                      {isLive(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime) ? '🔴 Live Now' :
                       isUpcoming(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime) ? '⏰ Upcoming' : '📅 Past'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Live Q&A Section */}
              {isLive(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime) && (
                <div className="mt-6 border-t pt-6">
                  <LiveQA meetingId={selectedMeeting.id} />
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => joinMeeting(selectedMeeting)}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isLive(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime)
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : isUpcoming(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime)
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-400 text-white cursor-not-allowed'
                  }`}
                  disabled={!isLive(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime) && !isUpcoming(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime)}
                >
                  {isLive(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime)
                    ? '🔴 Join Live Meeting'
                    : isUpcoming(selectedMeeting.scheduledDate, selectedMeeting.scheduledTime)
                    ? '⏰ Join When Live'
                    : '📅 Meeting Ended'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveMeetingsViewer;
