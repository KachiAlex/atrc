import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

const DisputeResolution = () => {
  const { isDarkMode } = useTheme();
  const { currentUser, userProfile } = useAuth();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'land',
    description: '',
    complainantName: '',
    respondentName: '',
    priority: 'medium',
    location: ''
  });

  useEffect(() => {
    fetchDisputes();
  }, [currentUser]);

  const fetchDisputes = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const disputesRef = collection(db, 'disputes');
      let q;
      
      // Show all disputes for admins and rulers, only own disputes for others
      if (userProfile?.role === 'admin' || userProfile?.role === 'ruler' || userProfile?.role === 'chief' || userProfile?.role === 'elder') {
        q = query(disputesRef, orderBy('createdAt', 'desc'));
      } else {
        q = query(disputesRef, where('createdBy', '==', currentUser.uid), orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      const disputesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDisputes(disputesData);
    } catch (error) {
      console.error('Error fetching disputes:', error);
      toast.error('Failed to load disputes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('You must be logged in to file a dispute');
      return;
    }

    try {
      const disputeData = {
        ...formData,
        status: 'pending',
        createdBy: currentUser.uid,
        createdByName: userProfile?.displayName || currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        evidence: [],
        comments: [],
        assignedRuler: null,
        assignedElders: []
      };

      await addDoc(collection(db, 'disputes'), disputeData);
      toast.success('Dispute filed successfully');
      setFormData({
        title: '',
        category: 'land',
        description: '',
        complainantName: '',
        respondentName: '',
        priority: 'medium',
        location: ''
      });
      setShowAddForm(false);
      fetchDisputes();
    } catch (error) {
      console.error('Error filing dispute:', error);
      toast.error('Failed to file dispute');
    }
  };

  const handleStatusUpdate = async (disputeId, newStatus) => {
    try {
      await updateDoc(doc(db, 'disputes', disputeId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success('Dispute status updated');
      fetchDisputes();
    } catch (error) {
      console.error('Error updating dispute status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleFileUpload = async (disputeId, files) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(storage, `disputes/${disputeId}/evidence/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return {
          name: file.name,
          url: downloadURL,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: currentUser.uid
        };
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      
      // Update dispute with new evidence
      const disputeRef = doc(db, 'disputes', disputeId);
      const dispute = disputes.find(d => d.id === disputeId);
      const updatedEvidence = [...(dispute.evidence || []), ...uploadedFiles];
      
      await updateDoc(disputeRef, {
        evidence: updatedEvidence,
        updatedAt: serverTimestamp()
      });

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      fetchDisputes();
    } catch (error) {
      console.error('Error uploading evidence:', error);
      toast.error('Failed to upload evidence');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (disputeId) => {
    if (!window.confirm('Are you sure you want to delete this dispute?')) return;
    
    try {
      await deleteDoc(doc(db, 'disputes', disputeId));
      toast.success('Dispute deleted successfully');
      fetchDisputes();
    } catch (error) {
      console.error('Error deleting dispute:', error);
      toast.error('Failed to delete dispute');
    }
  };

  const viewDetails = (dispute) => {
    setSelectedDispute(dispute);
    setShowDetailModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageDispute = userProfile?.role === 'admin' || userProfile?.role === 'ruler' || userProfile?.role === 'chief' || userProfile?.role === 'elder';

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
          <p className={`mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Loading disputes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Dispute Resolution
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage traditional dispute resolution processes
          </p>
        </div>

        {/* Add Dispute Form */}
        {showAddForm && (
          <div className="mb-8">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                File New Dispute
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Dispute Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="land">Land Boundary</option>
                      <option value="title">Traditional Title</option>
                      <option value="cultural">Cultural Practice</option>
                      <option value="family">Family Matter</option>
                      <option value="property">Property Dispute</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Priority *
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Complainant Name *
                    </label>
                    <input
                      type="text"
                      name="complainantName"
                      value={formData.complainantName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Respondent Name *
                    </label>
                    <input
                      type="text"
                      name="respondentName"
                      value={formData.respondentName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    File Dispute
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({
                        title: '',
                        category: 'land',
                        description: '',
                        complainantName: '',
                        respondentName: '',
                        priority: 'medium',
                        location: ''
                      });
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Disputes List */}
          <div className="lg:col-span-3">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Active Disputes ({disputes.length})
                </h2>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  File New Dispute
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {disputes.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      No disputes filed yet
                    </p>
                  </div>
                ) : (
                  disputes.map((dispute) => (
                    <div key={dispute.id} className={`p-6 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {dispute.title}
                            </h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}>
                              {dispute.status.replace('_', ' ')}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                              {dispute.priority}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {dispute.category}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Complainant: {dispute.complainantName}
                              </p>
                            </div>
                            <div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Respondent: {dispute.respondentName}
                              </p>
                            </div>
                            {dispute.location && (
                              <div>
                                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  Location: {dispute.location}
                                </p>
                              </div>
                            )}
                          </div>
                          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                            Filed by: {dispute.createdByName} • {dispute.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                          </p>
                        </div>
                        <div className="ml-4 flex flex-col space-y-2">
                          <button 
                            onClick={() => viewDetails(dispute)}
                            className="bg-primary-600 text-white px-3 py-1 rounded-md text-sm hover:bg-primary-700"
                          >
                            View Details
                          </button>
                          {canManageDispute && (
                            <>
                              {dispute.status !== 'resolved' && (
                                <button 
                                  onClick={() => handleStatusUpdate(dispute.id, 'resolved')}
                                  className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                                >
                                  Mark Resolved
                                </button>
                              )}
                              <button 
                                onClick={() => handleDelete(dispute.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="w-full bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  File New Dispute
                </button>
                <button 
                  onClick={() => fetchDisputes()}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Refresh List
                </button>
              </div>
            </div>

            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Dispute Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {disputes.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Pending:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {disputes.filter(d => d.status === 'pending').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    In Progress:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {disputes.filter(d => d.status === 'in_progress').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Resolved:
                  </span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {disputes.filter(d => d.status === 'resolved').length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-inherit">
              <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedDispute.title}
              </h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedDispute(null);
                }}
                className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Status and Priority */}
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedDispute.status)}`}>
                  {selectedDispute.status.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedDispute.priority)}`}>
                  {selectedDispute.priority.toUpperCase()} Priority
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  {selectedDispute.category}
                </span>
              </div>

              {/* Parties Involved */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Complainant</h4>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedDispute.complainantName}</p>
                </div>
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Respondent</h4>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{selectedDispute.respondentName}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Description</h4>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                  {selectedDispute.description}
                </p>
              </div>

              {/* Evidence Section */}
              <div>
                <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Evidence</h4>
                {selectedDispute.evidence && selectedDispute.evidence.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDispute.evidence.map((file, index) => (
                      <div key={index} className={`p-3 rounded-lg flex items-center justify-between ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{file.name}</span>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm"
                        >
                          View
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No evidence uploaded yet</p>
                )}
                
                {/* Upload Evidence */}
                <div className="mt-4">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Upload Additional Evidence
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(selectedDispute.id, e.target.files)}
                    disabled={uploading}
                    className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  />
                  {uploading && <p className="text-sm text-primary-600 mt-2">Uploading...</p>}
                </div>
              </div>

              {/* Metadata */}
              <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filed by:</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDispute.createdByName}</span>
                  </div>
                  <div>
                    <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Filed on:</span>
                    <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedDispute.createdAt?.toDate?.()?.toLocaleString() || 'Recently'}
                    </span>
                  </div>
                  {selectedDispute.location && (
                    <div>
                      <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Location:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{selectedDispute.location}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {canManageDispute && (
                <div className="flex gap-4">
                  {selectedDispute.status === 'pending' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedDispute.id, 'in_progress');
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Start Mediation
                    </button>
                  )}
                  {selectedDispute.status !== 'resolved' && (
                    <button
                      onClick={() => {
                        handleStatusUpdate(selectedDispute.id, 'resolved');
                        setShowDetailModal(false);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputeResolution;
