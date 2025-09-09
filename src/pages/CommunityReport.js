import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';

const CommunityReport = () => {
  const { isDarkMode } = useTheme();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reports, setReports] = useState([]);
  const [form, setForm] = useState({
    title: '',
    category: 'security',
    description: '',
    incidentDate: '',
    location: '',
    urgency: 'normal'
  });

  useEffect(() => {
    const loadReports = async () => {
      if (!currentUser) return;
      try {
        const reportsRef = collection(db, 'communityReports');
        const q = query(reportsRef, where('createdBy', '==', currentUser.uid), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error loading community reports', err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
        status: 'submitted'
      };
      await addDoc(collection(db, 'communityReports'), payload);
      setForm({ title: '', category: 'security', description: '', incidentDate: '', location: '', urgency: 'normal' });
      // reload
      const reportsRef = collection(db, 'communityReports');
      const q = query(reportsRef, where('createdBy', '==', currentUser.uid), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReports(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error submitting report', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto"></div>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-4`}>Loading reports…</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Community Report</h1>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
            Traditional Rulers can submit reports about happenings in their communities.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-1">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
              <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Submit Report</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Title</label>
                  <input name="title" value={form.title} onChange={handleChange} required className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Category</label>
                    <select name="category" value={form.category} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                      <option value="security">Security</option>
                      <option value="health">Health</option>
                      <option value="education">Education</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="economy">Economy</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Urgency</label>
                    <select name="urgency" value={form.urgency} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}>
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Incident Date</label>
                    <input type="date" name="incidentDate" value={form.incidentDate} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
                    <input name="location" value={form.location} onChange={handleChange} className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={`w-full px-3 py-2 border rounded-md ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}></textarea>
                </div>
                <div className="flex justify-end">
                  <button disabled={submitting} type="submit" className={`px-4 py-2 rounded-md text-white ${submitting ? 'bg-gray-500' : 'bg-primary-600 hover:bg-primary-700'} transition-colors`}>
                    {submitting ? 'Submitting…' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Reports list */}
          <div className="lg:col-span-2">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Your Reports</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {reports.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No reports yet. Submit your first community report.</p>
                  </div>
                ) : (
                  reports.map((r) => (
                    <div key={r.id} className={`p-6 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{r.title}</h3>
                          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mt-1`}>{r.description}</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-sm">
                            <span className="badge badge-primary">{r.category}</span>
                            {r.location && <span className="badge badge-gray">{r.location}</span>}
                            {r.incidentDate && <span className="badge badge-gray">{r.incidentDate}</span>}
                            <span className={`badge ${r.urgency === 'critical' ? 'badge-danger' : r.urgency === 'high' ? 'badge-warning' : 'badge-gray'}`}>{r.urgency}</span>
                            <span className="badge badge-secondary">{r.status || 'submitted'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityReport;


