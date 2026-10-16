import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, getDocs, query, orderBy, limit } from '../api/store';
import { db } from '../api/config';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Icon from '../components/ui/Icon';
import BookReader from './BookReader';
import ProgressTracker from '../components/education/ProgressTracker';
import BookmarkManager from '../components/education/BookmarkManager';
import LearningPaths from '../components/education/LearningPaths';
import QuizSystem from '../components/education/QuizSystem';
import DiscussionForum from '../components/education/DiscussionForum';
import toast from 'react-hot-toast';

const TraditionalRulersDashboard = () => {
  const { currentUser } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  console.log('TraditionalRulersDashboard - Component rendered');
  const [activeTab, setActiveTab] = useState('overview');
  const [status] = useState("Verified");
  const [stats] = useState({
    myCommunities: 3,
    activeDisputes: 2,
    upcomingEvents: 4,
    totalMembers: 45,
    documentsPublished: 7
  });

  // Overview data (live)
  const [recentReports, setRecentReports] = useState([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState([]);
  const [nextMeeting, setNextMeeting] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await getDocs(query(collection(db, 'communityReports'), orderBy('createdAt', 'desc'), limit(3)));
        setRecentReports(r.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { /* empty list is fine */ }
      try {
        const ev = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc'), limit(3)));
        setUpcomingEventsList(ev.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { /* empty list is fine */ }
      try {
        const m = await getDocs(query(collection(db, 'liveMeetings'), orderBy('createdAt', 'desc'), limit(1)));
        const docs = m.docs.map(d => ({ id: d.id, ...d.data() }));
        if (docs[0]) setNextMeeting(docs[0]);
      } catch (e) { /* none scheduled */ }
    };
    load();
  }, []);

  // Form states
  const [profileData, setProfileData] = useState({
    throneName: 'Ife Kingdom',
    rulerName: currentUser?.displayName || 'HRM Oba Adewale',
    country: 'Nigeria'
  });
  
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });

  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    budget: '',
    timeline: ''
  });

  const [memberData, setMemberData] = useState({
    name: '',
    email: '',
    role: 'member'
  });

  const [loading, setLoading] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);

  // Handler functions
  const handleSaveProfile = async () => {
    if (!profileData.throneName || !profileData.rulerName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        throneName: profileData.throneName,
        rulerName: profileData.rulerName,
        country: profileData.country,
        updatedAt: new Date()
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    if (!projectData.title || !projectData.description) {
      toast.error('Please fill in project title and description');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'projects'), {
        title: projectData.title,
        description: projectData.description,
        budget: projectData.budget,
        timeline: projectData.timeline,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        status: 'planning'
      });
      toast.success('Project created successfully!');
      setProjectData({ title: '', description: '', budget: '', timeline: '' });
      setShowProjectForm(false);
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberData.name || !memberData.email) {
      toast.error('Please fill in member name and email');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'communityMembers'), {
        name: memberData.name,
        email: memberData.email,
        role: memberData.role,
        addedBy: currentUser.uid,
        createdAt: new Date(),
        status: 'active'
      });
      toast.success('Member added successfully!');
      setMemberData({ name: '', email: '', role: 'member' });
      setShowMemberForm(false);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error('Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async () => {
    if (!eventData.title || !eventData.date) {
      toast.error('Please fill in event title and date');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'events'), {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        location: eventData.location,
        organizer: currentUser.displayName || currentUser.email,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        isPublished: true,
        type: 'community',
        status: 'upcoming'
      });
      toast.success('Event created successfully!');
      setEventData({ title: '', description: '', date: '', location: '' });
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMeeting = () => {
    navigate('/app/meetings');
    toast.success('Redirecting to Live Meetings...');
  };

  const statusColor = status === "Verified" ? "bg-green-500" : status === "Pending" ? "bg-yellow-500" : "bg-red-500";

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'dashboard' },
    { id: 'profile', label: 'Throne Profile', icon: 'user' },
    { id: 'verification', label: 'Verification', icon: 'checkCircle' },
    { id: 'projects', label: 'Projects', icon: 'fileEdit' },
    { id: 'community', label: 'Community', icon: 'users' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'documents', label: 'Documents', icon: 'file' },
    { id: 'events', label: 'Events', icon: 'events' },
    { id: 'learning', label: 'Learning Center', icon: 'library' },
    { id: 'library', label: 'Digital Library', icon: 'library' }
  ];

  const statusBadge = (s) => {
    const v = (s || '').toLowerCase();
    if (v === 'approved' || v === 'resolved' || v === 'closed') return 'a-badge-ok';
    if (v === 'pending' || v === 'submitted' || v === 'under review') return 'a-badge-warn';
    if (v === 'rejected' || v === 'urgent') return 'a-badge-danger';
    return 'a-badge-neutral';
  };

  const fmtDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="a-page min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-9 py-6 sm:py-9">
        {/* Greeting + actions */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="a-page-title">
              {greeting()}, {currentUser?.displayName || 'Ruler'}
            </h1>
            <p className="mt-1.5 text-[16px]" style={{ color: 'var(--muted)' }}>
              Here is what needs the council's attention today.
            </p>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setActiveTab('events')} className="a-btn-ghost">
              <Icon name="plus" size={17} /> Create event
            </button>
            <Link to="/app/community" className="a-btn-primary">
              <Icon name="fileEdit" size={17} /> File a report
            </Link>
          </div>
        </div>

        {/* Overview (default view) */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Upcoming events', value: upcomingEventsList.length || stats.upcomingEvents, icon: 'events' },
                { label: 'Meetings this month', value: nextMeeting ? 1 : 0, icon: 'meetings' },
                { label: 'Open reports', value: recentReports.length, icon: 'reports' },
                { label: 'Courses in progress', value: 0, icon: 'courses' },
              ].map((s) => (
                <div key={s.label} className="a-card !p-4 sm:!p-5">
                  <div
                    className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3"
                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
                  >
                    <Icon name={s.icon} size={20} />
                  </div>
                  <div className="text-[26px] font-bold leading-none">{s.value}</div>
                  <div className="text-[14px] font-medium mt-1.5" style={{ color: 'var(--muted)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Next meeting — live card */}
            <div className="rounded-card p-5 sm:p-6 text-white" style={{ background: 'var(--hero)' }}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[12px] font-semibold uppercase tracking-wide text-[#AAB4E0]">Next meeting</span>
                    <span className="a-badge a-badge-live">LIVE TODAY</span>
                  </div>
                  <div className="font-serif font-semibold text-[22px]">
                    {nextMeeting?.title || 'Quarterly Council Assembly'}
                  </div>
                  <div className="text-[14px] text-[#C9D0EE] mt-0.5">
                    {nextMeeting?.scheduledAt
                      ? fmtDate(nextMeeting.scheduledAt)
                      : 'Check the meetings page for the next session'} · open to council delegates
                  </div>
                </div>
                <Link to="/app/meetings" className="a-btn-gold">
                  <Icon name="play" size={16} /> Join live
                </Link>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5">
              {/* Recent reports */}
              <div className="a-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="a-section-title">Recent community reports</h2>
                  <Link to="/app/community" className="text-[14px] font-semibold inline-flex items-center gap-1" style={{ color: 'var(--brand)' }}>
                    View all <Icon name="arrowRight" size={15} />
                  </Link>
                </div>
                {recentReports.length === 0 ? (
                  <p className="text-[15px] py-6 text-center" style={{ color: 'var(--muted)' }}>No reports filed yet.</p>
                ) : (
                  <div className="space-y-1">
                    {recentReports.map((r) => (
                      <div key={r.id} className="flex items-center justify-between gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <div className="min-w-0">
                          <div className="font-semibold text-[15px] truncate">{r.title || r.subject || 'Report'}</div>
                          <div className="text-[13px]" style={{ color: 'var(--muted)' }}>
                            Filed {fmtDate(r.createdAt)}{r.location || r.ward ? ` · ${r.location || r.ward}` : ''}
                          </div>
                        </div>
                        <span className={`a-badge flex-shrink-0 capitalize ${statusBadge(r.status)}`}>
                          {r.status || 'Submitted'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming events */}
              <div className="a-card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="a-section-title">Upcoming events</h2>
                  <Link to="/app/events" className="text-[14px] font-semibold inline-flex items-center gap-1" style={{ color: 'var(--brand)' }}>
                    View all <Icon name="arrowRight" size={15} />
                  </Link>
                </div>
                {upcomingEventsList.length === 0 ? (
                  <p className="text-[15px] py-6 text-center" style={{ color: 'var(--muted)' }}>No upcoming events.</p>
                ) : (
                  <div className="space-y-1">
                    {upcomingEventsList.map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                        <div className="min-w-0">
                          <div className="font-semibold text-[15px] truncate">{ev.title}</div>
                          <div className="text-[13px]" style={{ color: 'var(--muted)' }}>
                            {fmtDate(ev.date)}{ev.location ? ` · ${ev.location}` : ''}
                          </div>
                        </div>
                        <span className="a-badge a-badge-info flex-shrink-0 capitalize">{ev.type || 'Event'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Continue learning */}
            <div className="a-card flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-11 h-11 rounded-[12px] flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--warn-bg)', color: 'var(--warn-fg)' }}
                >
                  <Icon name="courses" size={22} />
                </div>
                <div className="min-w-0">
                  <div className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Continue learning</div>
                  <div className="font-semibold text-[16px]">Leadership Foundations</div>
                  <div className="mt-1.5 w-48 h-1.5 rounded-full" style={{ background: 'var(--surface2)' }}>
                    <div className="h-1.5 rounded-full bg-[#E3B04B]" style={{ width: '38%' }} />
                  </div>
                  <div className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>Module 3 of 8 · 38% complete</div>
                </div>
              </div>
              <Link to="/app/courses" className="a-btn-primary">Resume lesson</Link>
            </div>
          </div>
        )}

        {/* Management tabs */}
        <div className="a-card !p-0 overflow-hidden mt-8">
          <div className="flex overflow-x-auto border-b" style={{ borderColor: 'var(--border)' }}>
            {tabs.filter(t => t.id !== 'overview').map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 sm:px-5 py-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors border-b-2 min-h-[44px]"
                style={
                  activeTab === tab.id
                    ? { color: 'var(--brand)', borderColor: 'var(--brand)' }
                    : { color: 'var(--muted)', borderColor: 'transparent' }
                }
              >
                <Icon name={tab.icon} size={17} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4 sm:p-6 mt-5`}>
          {activeTab === 'overview' && (
            <p className="text-[15px]" style={{ color: 'var(--muted)' }}>
              Pick a management tab above — profile, verification, projects, community, analytics, documents, events, learning or library.
            </p>
          )}
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Throne Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Throne Name
                  </label>
                  <input
                    type="text"
                    value={profileData.throneName}
                    onChange={(e) => setProfileData({...profileData, throneName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Ruler Name
                  </label>
                  <input
                    type="text"
                    value={profileData.rulerName}
                    onChange={(e) => setProfileData({...profileData, rulerName: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Country
                  </label>
                  <select
                    value={profileData.country}
                    onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Kenya">Kenya</option>
                    <option value="South Africa">South Africa</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Verification Tab */}
          {activeTab === 'verification' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Verification Status
              </h3>
              <div className="space-y-6">
                {/* Current Status */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Current Verification Status
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusColor}`}>
                      {status}
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Your throne and authority have been verified by the ATRC administration.
                  </p>
                </div>

                {/* Verification Requirements */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Verification Requirements
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3">✅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Official throne documentation
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3">✅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Government recognition certificate
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3">✅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Community endorsement letters
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-500 mr-3">✅</span>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        ATRC membership application
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification History */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Verification History
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Initial verification completed
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        March 15, 2024
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Annual verification due
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        March 15, 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects Tab */}
          {activeTab === 'projects' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Community Development Projects
                </h3>
                <button 
                  onClick={() => setShowProjectForm(!showProjectForm)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {showProjectForm ? 'Cancel' : 'Create New Project'}
                </button>
              </div>

              {/* Project Creation Form */}
              {showProjectForm && (
                <div className={`mb-6 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Create New Project
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Project Title
                      </label>
                      <input
                        type="text"
                        value={projectData.title}
                        onChange={(e) => setProjectData({...projectData, title: e.target.value})}
                        placeholder="Enter project title"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Budget (₦)
                      </label>
                      <input
                        type="text"
                        value={projectData.budget}
                        onChange={(e) => setProjectData({...projectData, budget: e.target.value})}
                        placeholder="Enter project budget"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Description
                      </label>
                      <textarea
                        value={projectData.description}
                        onChange={(e) => setProjectData({...projectData, description: e.target.value})}
                        placeholder="Enter project description"
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Timeline
                      </label>
                      <input
                        type="text"
                        value={projectData.timeline}
                        onChange={(e) => setProjectData({...projectData, timeline: e.target.value})}
                        placeholder="e.g., 6 months"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleCreateProject}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </>
                      ) : (
                        'Create Project'
                      )}
                    </button>
                    <button
                      onClick={() => setShowProjectForm(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                </button>
              </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Active Projects */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      School Renovation
                    </h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Renovating the local primary school to improve learning conditions.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progress</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦2.5M / ₦3.2M</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Water Well Project
                    </h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Planning
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Installing a new water well to provide clean water to the community.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progress</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>25%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '25%'}}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦800K / ₦3.2M</span>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Health Center
                    </h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Completed
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Built a new health center to serve the community's medical needs.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Progress</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Budget</span>
                      <span className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>₦5.2M / ₦5.2M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Community Tab */}
          {activeTab === 'community' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Community Management
                </h3>
                <div className="flex gap-3">
                  <button 
                    onClick={handleScheduleMeeting}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Schedule Meeting
                  </button>
                  <button 
                    onClick={() => setShowMemberForm(!showMemberForm)}
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200 flex items-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {showMemberForm ? 'Cancel' : 'Add Member'}
                </button>
                </div>
              </div>

              {/* Member Addition Form */}
              {showMemberForm && (
                <div className={`mb-6 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Add Community Member
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={memberData.name}
                        onChange={(e) => setMemberData({...memberData, name: e.target.value})}
                        placeholder="Enter member's full name"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={memberData.email}
                        onChange={(e) => setMemberData({...memberData, email: e.target.value})}
                        placeholder="Enter member's email"
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Role
                      </label>
                      <select
                        value={memberData.role}
                        onChange={(e) => setMemberData({...memberData, role: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="member">Community Member</option>
                        <option value="elder">Elder</option>
                        <option value="chief">Chief</option>
                        <option value="secretary">Secretary</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleAddMember}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Adding...
                        </>
                      ) : (
                        'Add Member'
                      )}
                    </button>
                    <button
                      onClick={() => setShowMemberForm(false)}
                      className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Community Stats */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Community Statistics
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalMembers}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Members
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.myCommunities}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Communities
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.activeDisputes}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Active Disputes
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.upcomingEvents}
                      </div>
                      <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Upcoming Events
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Members */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Recent Members
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          A
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Adebayo Johnson
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Elder
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          F
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Fatima Ibrahim
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Member
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-yellow-600">Pending</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          O
                        </div>
                        <div className="ml-3">
                          <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Olumide Okafor
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            Chief
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-green-600">Verified</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Community Activities */}
              <div className={`mt-6 p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Recent Community Activities
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        New member Adebayo Johnson joined the community
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      2 hours ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Community meeting scheduled for next week
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      1 day ago
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        Dispute resolution session completed
                      </span>
                    </div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      3 days ago
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              <h3 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dashboard Analytics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Key Metrics */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Total Community Members
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.totalMembers}
                      </p>
                    </div>
                    <div className="text-2xl">👥</div>
                  </div>
                  <div className="mt-2">
                    <span className="text-green-600 text-sm">+12%</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      from last month
                    </span>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Active Projects
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        3
                      </p>
                    </div>
                    <div className="text-2xl">🏗️</div>
                  </div>
                  <div className="mt-2">
                    <span className="text-blue-600 text-sm">+1</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      new this month
                    </span>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Events This Month
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.upcomingEvents}
                      </p>
                    </div>
                    <div className="text-2xl">📅</div>
                  </div>
                  <div className="mt-2">
                    <span className="text-purple-600 text-sm">+2</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      scheduled
                    </span>
                  </div>
                </div>

                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Documents Published
                      </p>
                      <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stats.documentsPublished}
                      </p>
                    </div>
                    <div className="text-2xl">📄</div>
                  </div>
                  <div className="mt-2">
                    <span className="text-green-600 text-sm">+3</span>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      this quarter
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Community Growth Chart */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Community Growth
                  </h4>
                  <div className="h-64 flex items-end justify-between space-x-2">
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '60%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Jan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '70%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Feb</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '80%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Mar</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '90%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Apr</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-8 bg-primary-500 rounded-t" style={{height: '100%'}}></div>
                      <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>May</span>
                    </div>
                  </div>
                </div>

                {/* Project Status Chart */}
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Project Status Distribution
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completed</span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>40%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>In Progress</span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>35%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Planning</span>
                      </div>
                      <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>25%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Upload Official Documents
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Document
                  </label>
                  <input
                    type="file"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200">
                  Upload Document
                </button>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Create Event
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={eventData.title}
                    onChange={(e) => setEventData({...eventData, title: e.target.value})}
                    placeholder="Enter event title"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={eventData.description}
                    onChange={(e) => setEventData({...eventData, description: e.target.value})}
                    placeholder="Enter event description"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date
                  </label>
                  <input
                    type="date"
                    value={eventData.date}
                    onChange={(e) => setEventData({...eventData, date: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventData.location}
                    onChange={(e) => setEventData({...eventData, location: e.target.value})}
                    placeholder="Enter event location"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
                <button 
                  onClick={handleSaveEvent}
                  disabled={loading}
                  className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Event'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Learning Center Tab */}
          {activeTab === 'learning' && (
            <div>
              <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Learning Center
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                  <div className="text-3xl mb-3">📚</div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Christ-Shaped Leadership 101
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Learn to lead with wisdom and integrity based on biblical principles.
                  </p>
                  <button 
                    onClick={() => navigate('/app/courses')}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  >
                    View Course
                  </button>
                </div>
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                  <div className="text-3xl mb-3">⚖️</div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Customary Law and Governance
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Understanding traditional governance systems and customary law.
                  </p>
                  <button 
                    onClick={() => navigate('/app/courses')}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  >
                    View Course
                  </button>
                </div>
                <div className={`p-6 rounded-lg border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}>
                  <div className="text-3xl mb-3">🤝</div>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Conflict Resolution for Rulers
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                    Master the art of traditional dispute resolution and mediation.
                  </p>
                  <button 
                    onClick={() => navigate('/app/courses')}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors duration-200"
                  >
                    View Course
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <div>
              <ProgressTracker />
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div>
              <BookmarkManager />
            </div>
          )}

          {/* Learning Paths Tab */}
          {activeTab === 'paths' && (
            <div>
              <LearningPaths />
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === 'quizzes' && (
            <div>
              <QuizSystem />
            </div>
          )}

          {/* Discussion Forum Tab */}
          {activeTab === 'forum' && (
            <div>
              <DiscussionForum />
            </div>
          )}

          {/* Digital Library Tab */}
          {activeTab === 'library' && (
            <div>
              <BookReader />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraditionalRulersDashboard;