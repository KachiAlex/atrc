import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase/config';
import { doc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { BookmarkIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline';

const BookmarkManager = () => {
  const { currentUser } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bookmarks');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: '' });

  useEffect(() => {
    if (currentUser) {
      fetchBookmarks();
      fetchNotes();
    }
  }, [currentUser, fetchBookmarks, fetchNotes]);

  const fetchBookmarks = useCallback(async () => {
    try {
      const bookmarksRef = collection(db, 'userBookmarks');
      const q = query(bookmarksRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const bookmarksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBookmarks(bookmarksData);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  }, [currentUser]);

  const fetchNotes = useCallback(async () => {
    try {
      const notesRef = collection(db, 'userNotes');
      const q = query(notesRef, where('userId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);
      
      const notesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotes(notesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const addBookmark = async (item) => {
    try {
      const bookmarkData = {
        userId: currentUser.uid,
        type: item.type, // 'course', 'lesson', 'book', 'meeting'
        itemId: item.id,
        title: item.title,
        description: item.description || '',
        url: item.url || '',
        createdAt: new Date().toISOString()
      };

      const bookmarkRef = doc(collection(db, 'userBookmarks'));
      await setDoc(bookmarkRef, bookmarkData);
      
      setBookmarks(prev => [...prev, { id: bookmarkRef.id, ...bookmarkData }]);
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  };

  const removeBookmark = async (bookmarkId) => {
    try {
      await deleteDoc(doc(db, 'userBookmarks', bookmarkId));
      setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  };

  const addNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    try {
      const noteData = {
        userId: currentUser.uid,
        title: newNote.title,
        content: newNote.content,
        tags: newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const noteRef = doc(collection(db, 'userNotes'));
      await setDoc(noteRef, noteData);
      
      setNotes(prev => [{ id: noteRef.id, ...noteData }, ...prev]);
      setNewNote({ title: '', content: '', tags: '' });
      setShowAddNote(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const updateNote = async (noteId, updatedData) => {
    try {
      const noteRef = doc(db, 'userNotes', noteId);
      await updateDoc(noteRef, {
        ...updatedData,
        updatedAt: new Date().toISOString()
      });
      
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { ...note, ...updatedData, updatedAt: new Date().toISOString() }
          : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, 'userNotes', noteId));
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const getBookmarkIcon = (type) => {
    switch (type) {
      case 'course': return '📚';
      case 'lesson': return '📖';
      case 'book': return '📕';
      case 'meeting': return '🎥';
      default: return '🔖';
    }
  };

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
        <h2 className="text-2xl font-bold text-gray-900">My Learning Resources</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BookmarkIcon className="h-4 w-4 inline mr-2" />
            Bookmarks ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'notes'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <PencilIcon className="h-4 w-4 inline mr-2" />
            Notes ({notes.length})
          </button>
        </div>
      </div>

      {/* Bookmarks Tab */}
      {activeTab === 'bookmarks' && (
        <div className="space-y-4">
          {bookmarks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BookmarkIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
              <p className="text-gray-600">Bookmark courses, lessons, and resources to access them quickly</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookmarks.map(bookmark => (
                <div key={bookmark.id} className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{getBookmarkIcon(bookmark.type)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{bookmark.title}</h4>
                        <p className="text-xs text-gray-500 capitalize">{bookmark.type}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {bookmark.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{bookmark.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(bookmark.createdAt).toLocaleDateString()}</span>
                    {bookmark.url && (
                      <a 
                        href={bookmark.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 flex items-center"
                      >
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Add Note Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddNote(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors flex items-center"
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Add Note
            </button>
          </div>

          {/* Add Note Form */}
          {showAddNote && (
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Note</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Note title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Write your note here..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={newNote.tags}
                    onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., leadership, governance, culture"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowAddNote(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNote}
                    className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notes List */}
          {notes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <PencilIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
              <p className="text-gray-600">Create notes to capture your thoughts and insights</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onUpdate={updateNote}
                  onDelete={deleteNote}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Note Card Component
const NoteCard = ({ note, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: note.title,
    content: note.content,
    tags: note.tags.join(', ')
  });

  const handleSave = () => {
    onUpdate(note.id, {
      title: editData.title,
      content: editData.content,
      tags: editData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {isEditing ? (
        <div className="space-y-4">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium"
          />
          <textarea
            value={editData.content}
            onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={editData.tags}
            onChange={(e) => setEditData(prev => ({ ...prev, tags: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Tags (comma-separated)"
          />
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start justify-between mb-3">
            <h4 className="font-medium text-gray-900">{note.title}</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-400 hover:text-primary-600 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{note.content}</p>
          
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {note.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            Created: {new Date(note.createdAt).toLocaleDateString()}
            {note.updatedAt !== note.createdAt && (
              <span> • Updated: {new Date(note.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkManager;
