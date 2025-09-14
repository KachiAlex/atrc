import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import toast from 'react-hot-toast';

const CourseUploadModal = ({ isOpen, onClose, onUpload }) => {
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    description: '',
    category: '',
    language: 'English',
    duration: '',
    level: 'beginner',
    publishStatus: 'published',
    thumbnailFile: null,
    thumbnailUrl: '',
    videoFile: null,
    videoUrl: '',
    materials: []
  });
  const [uploadType, setUploadType] = useState('file'); // 'file' or 'url'
  const [loading, setLoading] = useState(false);

  const categories = [
    'Leadership & Governance',
    'Spiritual Growth',
    'Community Development',
    'Traditional Values',
    'Christian Education',
    'History & Culture',
    'Prayer & Worship',
    'Family & Marriage',
    'Youth Ministry',
    'Business & Economics',
    'Health & Wellness',
    'Technology & Innovation',
    'Other'
  ];

  const languages = [
    'English', 'French', 'Spanish', 'Swahili', 'Arabic',
    'Yoruba', 'Igbo', 'Hausa', 'Efik', 'Ibibio', 'Nupe',
    'Tiv', 'Urhobo', 'Edo', 'Ijaw', 'Fulani', 'Kanuri',
    'Xhosa', 'Afrikaans', 'Amharic', 'Tigrinya', 'Oromo',
    'Zulu', 'Sotho', 'Tswana', 'Venda', 'Tsonga', 'Ndebele'
  ];

  const levels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
  };

  const uploadFile = async (file, path) => {
    if (!file) return null;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let thumbnailUrl = formData.thumbnailUrl;
      let videoUrl = formData.videoUrl;

      // Upload thumbnail if file is provided
      if (formData.thumbnailFile) {
        const thumbnailPath = `courses/thumbnails/${Date.now()}_${formData.thumbnailFile.name}`;
        thumbnailUrl = await uploadFile(formData.thumbnailFile, thumbnailPath);
      }

      // Upload video if file is provided
      if (formData.videoFile) {
        const videoPath = `courses/videos/${Date.now()}_${formData.videoFile.name}`;
        videoUrl = await uploadFile(formData.videoFile, videoPath);
      }

      const courseData = {
        title: formData.title,
        instructor: formData.instructor,
        description: formData.description,
        category: formData.category,
        language: formData.language,
        duration: formData.duration,
        level: formData.level,
        thumbnailUrl,
        videoUrl,
        materials: formData.materials,
        isPublished: formData.publishStatus === 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
        enrolledCount: 0,
        rating: 0,
        reviewCount: 0
      };

      await addDoc(collection(db, 'courses'), courseData);
      
      toast.success('Course created successfully!');
      onUpload();
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        instructor: '',
        description: '',
        category: '',
        language: 'English',
        duration: '',
        level: 'beginner',
        publishStatus: 'published',
        thumbnailFile: null,
        thumbnailUrl: '',
        videoFile: null,
        videoUrl: '',
        materials: []
      });
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Course Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📚 Course Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                placeholder="Enter course title"
              />
            </div>

            {/* Instructor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👨‍🏫 Instructor *
              </label>
              <input
                type="text"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                placeholder="Enter instructor name"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                placeholder="Enter course description"
              />
            </div>

            {/* Category and Language */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏷️ Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
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
                  🌍 Language *
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                >
                  {languages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration and Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏱️ Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  placeholder="e.g., 2 hours, 4 weeks, 30 minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📊 Level *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                >
                  {levels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Upload Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📁 Upload Type
              </label>
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
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

            {/* Thumbnail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🖼️ Course Thumbnail
              </label>
              {uploadType === 'file' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    name="thumbnailFile"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    id="thumbnailFile"
                  />
                  <label
                    htmlFor="thumbnailFile"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    📁
                    <span className="text-sm text-gray-600">
                      Click to upload thumbnail
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </span>
                  </label>
                  {formData.thumbnailFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.thumbnailFile.name}
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  name="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  placeholder="Enter thumbnail image URL"
                />
              )}
            </div>

            {/* Video Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🎥 Video Content
              </label>
              {uploadType === 'file' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    name="videoFile"
                    accept="video/*"
                    onChange={handleInputChange}
                    className="hidden"
                    id="videoFile"
                  />
                  <label
                    htmlFor="videoFile"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    📁
                    <span className="text-sm text-gray-600">
                      Click to upload video
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      MP4, AVI, MOV up to 100MB
                    </span>
                  </label>
                  {formData.videoFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.videoFile.name}
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
                  placeholder="Enter video URL (YouTube, Vimeo, etc.)"
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
                Published courses will be visible to all rulers in the Learning Center
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
                {loading ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CourseUploadModal;
