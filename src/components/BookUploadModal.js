import React, { useState } from 'react';
// import { X, Upload, FileText, Image, Link } from 'lucide-react';

const BookUploadModal = ({ isOpen, onClose, onUpload }) => {
  console.log('BookUploadModal props:', { isOpen, onClose: !!onClose, onUpload: !!onUpload });
  
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    language: 'English',
    publishStatus: 'draft',
    coverImageFile: null,
    coverImageUrl: '',
    pdfFile: null,
    pdfUrl: ''
  });
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'
  const [loading, setLoading] = useState(false);

  const categories = [
    'Spiritual Growth',
    'Leadership',
    'Community Development',
    'Traditional Values',
    'Christian Education',
    'History & Culture',
    'Prayer & Worship',
    'Family & Marriage',
    'Youth Ministry',
    'Other'
  ];

  const languages = [
    'English', 'French', 'Spanish', 'Swahili', 'Arabic',
    'Yoruba', 'Igbo', 'Hausa', 'Efik', 'Ibibio', 'Nupe',
    'Tiv', 'Urhobo', 'Edo', 'Ijaw', 'Fulani', 'Kanuri',
    'Xhosa', 'Afrikaans', 'Amharic', 'Tigrinya', 'Oromo',
    'Zulu', 'Sotho', 'Tswana', 'Venda', 'Tsonga', 'Ndebele'
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onUpload(formData);
      setFormData({
        title: '',
        author: '',
        description: '',
        category: '',
        language: 'English',
        publishStatus: 'draft',
        coverImageFile: null,
        coverImageUrl: '',
        pdfFile: null,
        pdfUrl: ''
      });
      onClose();
    } catch (error) {
      console.error('Error uploading book:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Upload New Book</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Book Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                placeholder="Enter book title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Author *
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                placeholder="Enter author name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
              placeholder="Enter book description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
              >
                <option value="">Select category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                name="language"
                value={formData.language}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
              >
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="publishStatus"
                value={formData.publishStatus}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          {/* Upload Type Toggle */}
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Upload Type:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setUploadType('file')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadType === 'file'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📁 File Upload
              </button>
              <button
                type="button"
                onClick={() => setUploadType('url')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  uploadType === 'url'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🔗 URL Link
              </button>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🖼️ Cover Image
            </label>
            {uploadType === 'file' ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  name="coverImageFile"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                  id="coverImageFile"
                />
                <label
                  htmlFor="coverImageFile"
                  className="cursor-pointer flex flex-col items-center"
                >
                  📁
                  <span className="text-sm text-gray-600">
                    Click to upload cover image
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 10MB
                  </span>
                </label>
                {formData.coverImageFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {formData.coverImageFile.name}
                  </p>
                )}
              </div>
            ) : (
              <input
                type="url"
                name="coverImageUrl"
                value={formData.coverImageUrl}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                placeholder="Enter cover image URL"
              />
            )}
          </div>

          {/* PDF File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📄 PDF File *
            </label>
            {uploadType === 'file' ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  name="pdfFile"
                  accept=".pdf"
                  onChange={handleInputChange}
                  required
                  className="hidden"
                  id="pdfFile"
                />
                <label
                  htmlFor="pdfFile"
                  className="cursor-pointer flex flex-col items-center"
                >
                  📄
                  <span className="text-sm text-gray-600">
                    Click to upload PDF file
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PDF files up to 50MB
                  </span>
                </label>
                {formData.pdfFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {formData.pdfFile.name}
                  </p>
                )}
              </div>
            ) : (
              <input
                type="url"
                name="pdfUrl"
                value={formData.pdfUrl}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                placeholder="Enter PDF file URL"
              />
            )}
          </div>

          {/* Publish Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📢 Publish Status
            </label>
            <select
              name="publishStatus"
              value={formData.publishStatus}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
            >
              <option value="draft">Save as Draft</option>
              <option value="published">Publish Immediately</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Published books will be visible to all rulers in the Digital Library
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
            >
              {loading ? 'Uploading...' : 'Upload Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookUploadModal;