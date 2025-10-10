import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';

const CommunityManagement = () => {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedCommunityForMembers, setSelectedCommunityForMembers] = useState(null);
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    ruler: '',
    location: '',
    description: '',
    status: 'active'
  });

  // Load communities from Firestore
  useEffect(() => {
    const loadCommunities = async () => {
      try {
        const communitiesRef = collection(db, 'communities');
        const q = query(communitiesRef, where('createdBy', '==', currentUser?.uid));
        const querySnapshot = await getDocs(q);
        const communitiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommunities(communitiesData);
      } catch (error) {
        console.error('Error loading communities:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadCommunities();
    }
  }, [currentUser]);

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
      const communityData = {
        ...formData,
        createdBy: currentUser.uid,
        createdAt: new Date(),
        members: 0
      };

      if (editingCommunity) {
        // Update existing community
        await updateDoc(doc(db, 'communities', editingCommunity.id), communityData);
        setCommunities(prev => prev.map(c => 
          c.id === editingCommunity.id ? { ...c, ...communityData } : c
        ));
        setEditingCommunity(null);
      } else {
        // Add new community
        const docRef = await addDoc(collection(db, 'communities'), communityData);
        setCommunities(prev => [...prev, { id: docRef.id, ...communityData }]);
      }

      setFormData({ name: '', ruler: '', location: '', description: '', status: 'active' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving community:', error);
    }
  };

  const handleEdit = (community) => {
    setEditingCommunity(community);
    setFormData({
      name: community.name,
      ruler: community.ruler,
      location: community.location,
      description: community.description || '',
      status: community.status
    });
    setShowAddForm(true);
  };

  const handleDelete = async (communityId) => {
    if (window.confirm(t('community.confirmDelete'))) {
      try {
        await deleteDoc(doc(db, 'communities', communityId));
        setCommunities(prev => prev.filter(c => c.id !== communityId));
        toast.success('Community deleted successfully');
      } catch (error) {
        console.error('Error deleting community:', error);
        toast.error('Failed to delete community');
      }
    }
  };

  const getTotalMembers = () => {
    return communities.reduce((sum, c) => sum + (c.members || 0), 0);
  };

  const handleViewMembers = async () => {
    if (communities.length === 0) {
      toast.error('No communities available');
      return;
    }
    setLoadingMembers(true);
    setShowMembersModal(true);
    
    try {
      // Fetch all users from Firestore
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const allUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMembers(allUsers);
      toast.success(`Loaded ${allUsers.length} members`);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleGenerateReport = () => {
    // Generate a downloadable report
    const reportData = {
      title: 'Community Management Report',
      generatedAt: new Date().toLocaleString(),
      totalCommunities: communities.length,
      activeCommunities: communities.filter(c => c.status === 'active').length,
      inactiveCommunities: communities.filter(c => c.status === 'inactive').length,
      totalMembers: getTotalMembers(),
      communities: communities.map(c => ({
        name: c.name,
        ruler: c.ruler,
        location: c.location,
        members: c.members || 0,
        status: c.status
      }))
    };

    // Create downloadable JSON file
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `community-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Report generated and downloaded!');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{t('community.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {t('community.title')}
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {t('community.subtitle')}
          </p>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {editingCommunity ? t('community.editCommunity') : t('community.addCommunity')}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('community.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {t('community.ruler')}
                    </label>
                    <input
                      type="text"
                      name="ruler"
                      value={formData.ruler}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('community.location')}
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('community.description')}
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('community.status')}
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  >
                    <option value="active">{t('community.active')}</option>
                    <option value="inactive">{t('community.inactive')}</option>
                  </select>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {editingCommunity ? t('community.update') : t('community.add')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingCommunity(null);
                      setFormData({ name: '', ruler: '', location: '', description: '', status: 'active' });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    {t('community.cancel')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Communities List */}
          <div className="lg:col-span-2">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('community.traditionalCommunities')}
                </h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  {t('community.addNew')}
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {communities.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t('community.noCommunities')}
                    </p>
                  </div>
                ) : (
                  communities.map((community) => (
                    <div key={community.id} className={`p-6 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-xl">👑</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {community.name}
                            </h3>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('community.ruler')}: {community.ruler}
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {t('community.location')}: {community.location}
                            </p>
                            {community.description && (
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                                {community.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {community.members} {t('community.members')}
                          </p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            community.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {t(`community.${community.status}`)}
                          </span>
                          <div className="mt-2 space-x-2">
                            <button
                              onClick={() => handleEdit(community)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              {t('community.edit')}
                            </button>
                            <button
                              onClick={() => handleDelete(community.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              {t('community.delete')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('community.quickActions')}
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  {t('community.addNewCommunity')}
                </button>
                <button 
                  onClick={() => handleViewMembers()}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  {t('community.viewMembers')} ({getTotalMembers()})
                </button>
                <button 
                  onClick={() => handleGenerateReport()}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  {t('community.generateReport')}
                </button>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {t('community.statistics')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('community.totalCommunities')}:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {communities.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('community.totalMembers')}:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {communities.reduce((sum, c) => sum + c.members, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t('community.activeCommunities')}:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {communities.filter(c => c.status === 'active').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members Modal */}
      {showMembersModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Community Members ({members.length})
              </h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {loadingMembers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12">
                  <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No members found
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => (
                    <div key={member.id} className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {member.displayName || member.email || 'Unknown User'}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {member.email}
                          </p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              member.role === 'admin' ? 'bg-red-100 text-red-800' :
                              member.role === 'ruler' ? 'bg-purple-100 text-purple-800' :
                              member.role === 'chief' ? 'bg-blue-100 text-blue-800' :
                              member.role === 'elder' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {member.role || 'member'}
                            </span>
                            {member.community && (
                              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                {communities.find(c => c.id === member.community)?.name || 'Community Member'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {member.traditionalTitle || 'No title'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityManagement;
