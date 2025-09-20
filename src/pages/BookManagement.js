import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import BookUploadModal from '../components/BookUploadModal';

const BookManagement = () => {
  const { currentUser } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const categories = [
    { value: 'leadership', label: 'Leadership & Governance' },
    { value: 'spiritual', label: 'Spiritual Growth' },
    { value: 'community', label: 'Community Development' },
    { value: 'history', label: 'Traditional History' },
    { value: 'wisdom', label: 'Traditional Wisdom' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'sw', label: 'Swahili' },
    { value: 'yo', label: 'Yoruba' },
    { value: 'ig', label: 'Igbo' },
    { value: 'ha', label: 'Hausa' },
    { value: 'zu', label: 'Zulu' },
    { value: 'fr', label: 'French' },
    { value: 'ar', label: 'Arabic' }
  ];

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const booksRef = collection(db, 'books');
      const q = query(booksRef, where('isPublished', '==', true), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBooks(booksData);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const sanitizeFileName = (fileName) => {
    // Remove special characters and spaces, replace with underscores
    return fileName.replace(/[^a-zA-Z0-9.-]/g, '_').replace(/_{2,}/g, '_');
  };

  const handleBookUpload = async (formData) => {
    try {
      setLoading(true);
      
      // Debug: Check authentication status
      console.log('Upload attempt - User authenticated:', !!currentUser);
      console.log('Upload attempt - User UID:', currentUser?.uid);
      console.log('Upload attempt - User email:', currentUser?.email);
      
      let coverImageUrl = formData.coverImageUrl;
      let pdfUrl = formData.pdfUrl;

      // Upload new files if provided
      if (formData.coverImageFile) {
        const sanitizedCoverName = sanitizeFileName(formData.coverImageFile.name);
        coverImageUrl = await uploadFile(formData.coverImageFile, `books/covers/${Date.now()}_${sanitizedCoverName}`);
      }
      if (formData.pdfFile) {
        const sanitizedPdfName = sanitizeFileName(formData.pdfFile.name);
        pdfUrl = await uploadFile(formData.pdfFile, `books/pdfs/${Date.now()}_${sanitizedPdfName}`);
      }

      const bookData = {
        title: formData.title,
        author: formData.author,
        description: formData.description,
        category: formData.category,
        language: formData.language,
        coverImageUrl,
        pdfUrl,
        isPublished: formData.publishStatus === 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'books'), bookData);
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    // TODO: Implement edit functionality
    console.log('Edit book:', book);
  };

  const handleDelete = async (book) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      setLoading(true);
      
      // Delete files from storage
      if (book.coverImageUrl) {
        const coverRef = ref(storage, book.coverImageUrl);
        await deleteObject(coverRef);
      }
      if (book.pdfUrl) {
        const pdfRef = ref(storage, book.pdfUrl);
        await deleteObject(pdfRef);
      }
      
      // Delete document
      await deleteDoc(doc(db, 'books', book.id));
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
    } finally {
      setLoading(false);
    }
  };


  console.log('BookManagement rendering, loading:', loading, 'books count:', books.length, 'showUploadModal:', showUploadModal);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Book Management</h1>
            <p className="text-gray-600 mt-2">Upload and manage books for Traditional Rulers</p>
          </div>
          <button
            onClick={() => {
              console.log('Add New Book button clicked!');
              setShowUploadModal(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Book
          </button>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {book.coverImageUrl ? (
                  <img 
                    src={book.coverImageUrl} 
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p>No Cover Image</p>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{book.title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2">by {book.author}</p>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{book.description}</p>
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {languages.find(l => l.value === book.language)?.label}
                    </span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                      {categories.find(c => c.value === book.category)?.label}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(book)}
                    className="flex-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(book)}
                    className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {books.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books yet</h3>
            <p className="text-gray-500 mb-4">Get started by uploading your first book for Traditional Rulers</p>
            <p className="text-sm text-gray-400">Use the "Add New Book" button above to get started</p>
          </div>
        )}
      </div>

      {/* Book Upload Modal */}
      <BookUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleBookUpload}
      />
    </div>
  );
};

export default BookManagement;
