import React, { useEffect, useState } from 'react';
import { db, storage } from '../firebase/config';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../contexts/AuthContext';

const ProjectReports = () => {
  const { currentUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    community: '',
    dateFrom: '',
    dateTo: ''
  });
  const [form, setForm] = useState({
    title: '',
    description: '',
    community: '',
    budget: '',
    timeline: '',
    status: 'proposed',
    attachment: null
  });

  const fetchProjects = async () => {
    const q = query(collection(db, 'projectReports'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    setProjects(rows);
    setFilteredProjects(rows);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filter projects based on current filters
  useEffect(() => {
    let filtered = [...projects];

    if (filters.status) {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.community) {
      filtered = filtered.filter(p => 
        p.community?.toLowerCase().includes(filters.community.toLowerCase())
      );
    }
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(p => {
        const createdDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return createdDate >= fromDate;
      });
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter(p => {
        const createdDate = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
        return createdDate <= toDate;
      });
    }

    setFilteredProjects(filtered);
  }, [projects, filters]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'attachment') {
      setForm((f) => ({ ...f, attachment: files && files[0] ? files[0] : null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((f) => ({ ...f, [name]: value }));
  };

  const handleEdit = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title || '',
      description: project.description || '',
      community: project.community || '',
      budget: project.budget || '',
      timeline: project.timeline || '',
      status: project.status || 'proposed',
      attachment: null
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      const updateData = {
        title: form.title.trim(),
        description: form.description.trim(),
        community: form.community.trim(),
        budget: form.budget ? Number(form.budget) : null,
        timeline: form.timeline.trim(),
        status: form.status,
        updatedAt: serverTimestamp()
      };

      if (form.attachment) {
        const fileRef = ref(storage, `projectReports/${currentUser.uid}/${Date.now()}_${form.attachment.name}`);
        await uploadBytes(fileRef, form.attachment);
        updateData.attachmentUrl = await getDownloadURL(fileRef);
      }

      await updateDoc(doc(db, 'projectReports', editingId), updateData);
      
      setEditingId(null);
      setForm({ title: '', description: '', community: '', budget: '', timeline: '', status: 'proposed', attachment: null });
      await fetchProjects();
    } catch (err) {
      console.error('Failed to update project:', err);
      alert('Failed to update. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', description: '', community: '', budget: '', timeline: '', status: 'proposed', attachment: null });
  };

  const exportToCSV = () => {
    const headers = ['Title', 'Community', 'Status', 'Budget', 'Timeline', 'Description', 'Created Date'];
    const csvContent = [
      headers.join(','),
      ...filteredProjects.map(p => [
        `"${(p.title || '').replace(/"/g, '""')}"`,
        `"${(p.community || '').replace(/"/g, '""')}"`,
        `"${(p.status || '').replace(/"/g, '""')}"`,
        p.budget || '',
        `"${(p.timeline || '').replace(/"/g, '""')}"`,
        `"${(p.description || '').replace(/"/g, '""')}"`,
        p.createdAt?.toDate ? p.createdAt.toDate().toLocaleDateString() : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `project-reports-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      let attachmentUrl = '';
      if (form.attachment) {
        const fileRef = ref(storage, `projectReports/${currentUser.uid}/${Date.now()}_${form.attachment.name}`);
        await uploadBytes(fileRef, form.attachment);
        attachmentUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, 'projectReports'), {
        title: form.title.trim(),
        description: form.description.trim(),
        community: form.community.trim(),
        budget: form.budget ? Number(form.budget) : null,
        timeline: form.timeline.trim(),
        status: form.status,
        attachmentUrl,
        createdBy: currentUser.uid,
        createdAt: serverTimestamp()
      });

      setForm({ title: '', description: '', community: '', budget: '', timeline: '', status: 'proposed', attachment: null });
      await fetchProjects();
    } catch (err) {
      console.error('Failed to submit project report:', err);
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Project Reports</h1>
        <button 
          onClick={exportToCSV}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium mb-3">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select 
            name="status" 
            value={filters.status} 
            onChange={handleFilterChange}
            className="border rounded px-3 py-2 bg-transparent"
          >
            <option value="">All Statuses</option>
            <option value="proposed">Proposed</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
          <input 
            name="community" 
            value={filters.community} 
            onChange={handleFilterChange}
            placeholder="Filter by community" 
            className="border rounded px-3 py-2 bg-transparent"
          />
          <input 
            name="dateFrom" 
            type="date" 
            value={filters.dateFrom} 
            onChange={handleFilterChange}
            className="border rounded px-3 py-2 bg-transparent"
          />
          <input 
            name="dateTo" 
            type="date" 
            value={filters.dateTo} 
            onChange={handleFilterChange}
            className="border rounded px-3 py-2 bg-transparent"
          />
        </div>
      </div>

      <form onSubmit={editingId ? handleUpdate : handleSubmit} className="grid gap-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="title" value={form.title} onChange={handleChange} placeholder="Project Title" className="border rounded px-3 py-2 bg-transparent" required />
          <input name="community" value={form.community} onChange={handleChange} placeholder="Community" className="border rounded px-3 py-2 bg-transparent" />
          <input name="budget" value={form.budget} onChange={handleChange} placeholder="Budget (USD)" type="number" className="border rounded px-3 py-2 bg-transparent" />
          <input name="timeline" value={form.timeline} onChange={handleChange} placeholder="Timeline (e.g., Jan–Mar 2025)" className="border rounded px-3 py-2 bg-transparent" />
        </div>

        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border rounded px-3 py-2 bg-transparent" rows={4} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <select name="status" value={form.status} onChange={handleChange} className="border rounded px-3 py-2 bg-transparent">
            <option value="proposed">Proposed</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
          <input name="attachment" onChange={handleChange} type="file" accept="image/*,application/pdf" className="border rounded px-3 py-2 bg-transparent" />
          <div className="flex gap-2">
            <button disabled={submitting} type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded disabled:opacity-50">
              {submitting ? (editingId ? 'Updating...' : 'Submitting...') : (editingId ? 'Update Project' : 'Submit Project Report')}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded">
                Cancel
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-3">
          Project Reports ({filteredProjects.length})
        </h2>
        <div className="grid gap-4">
          {filteredProjects.map((p) => (
            <div key={p.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{p.title}</div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200">{p.status || 'proposed'}</span>
                  <button 
                    onClick={() => handleEdit(p)}
                    className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {p.community || '—'} • {p.timeline || '—'}
                {p.createdAt?.toDate && (
                  <span> • {p.createdAt.toDate().toLocaleDateString()}</span>
                )}
              </div>
              <div className="text-sm mt-2">{p.description}</div>
              <div className="text-sm mt-2">Budget: {p.budget != null ? `$${p.budget.toLocaleString()}` : '—'}</div>
              {p.attachmentUrl ? (
                <a href={p.attachmentUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline mt-2 inline-block">View attachment</a>
              ) : null}
            </div>
          ))}
          {filteredProjects.length === 0 && (
            <div className="text-sm text-gray-500">
              {projects.length === 0 ? 'No project reports yet.' : 'No projects match the current filters.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectReports;


