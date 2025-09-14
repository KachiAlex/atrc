import React, { useState } from 'react';
import toast from 'react-hot-toast';

const VideoUploadManager = ({ onVideoUrlSet, initialVideoUrl = '' }) => {
  const [videoUrl, setVideoUrl] = useState(initialVideoUrl);
  const [videoInfo, setVideoInfo] = useState(null);

  const validateVideoUrl = (url) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/)|youtu\.be\/)[\w-]+/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/\d+/;
    const directVideoRegex = /\.(mp4|avi|mov|wmv|flv|webm)(\?.*)?$/i;
    
    return youtubeRegex.test(url) || vimeoRegex.test(url) || directVideoRegex.test(url);
  };

  const extractVideoId = (url) => {
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      return url.split('v=')[1]?.split('&')[0];
    }
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1]?.split('?')[0];
    }
    if (url.includes('youtube.com/embed/')) {
      return url.split('embed/')[1]?.split('?')[0];
    }
    
    // Vimeo
    if (url.includes('vimeo.com/')) {
      return url.split('vimeo.com/')[1]?.split('?')[0];
    }
    
    return null;
  };

  const getVideoThumbnail = (url) => {
    const videoId = extractVideoId(url);
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    
    if (url.includes('vimeo.com')) {
      return `https://vumbnail.com/${videoId}.jpg`;
    }
    
    return null;
  };

  const getEmbedUrl = (url) => {
    const videoId = extractVideoId(url);
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    if (url.includes('vimeo.com')) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url; // Direct video URL
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setVideoUrl(url);
    
    if (url && validateVideoUrl(url)) {
      const thumbnail = getVideoThumbnail(url);
      const embedUrl = getEmbedUrl(url);
      
      setVideoInfo({
        thumbnail,
        embedUrl,
        type: url.includes('youtube') || url.includes('youtu.be') ? 'youtube' : 
              url.includes('vimeo') ? 'vimeo' : 'direct'
      });
      
      onVideoUrlSet && onVideoUrlSet(url);
      toast.success('Video URL validated successfully!');
    } else if (url) {
      setVideoInfo(null);
      toast.error('Please enter a valid YouTube, Vimeo, or direct video URL');
    } else {
      setVideoInfo(null);
    }
  };

  const clearVideo = () => {
    setVideoUrl('');
    setVideoInfo(null);
  };

  return (
    <div className="space-y-4">
      {/* Video URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎥 Video URL
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={handleUrlChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 bg-white"
          placeholder="Enter YouTube or Vimeo URL"
        />
        <p className="text-xs text-gray-500 mt-1">
          Supported: YouTube, Vimeo URLs
        </p>
      </div>

      {/* Video Preview */}
      {videoInfo && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👁️ Video Preview
          </label>
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            {videoInfo.thumbnail ? (
              <div className="relative">
                <img
                  src={videoInfo.thumbnail}
                  alt="Video thumbnail"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black bg-opacity-50 rounded-full p-4">
                    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-64 flex items-center justify-center bg-gray-200">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎥</div>
                  <p className="text-sm text-gray-600">Video URL provided</p>
                </div>
              </div>
            )}
            
            {/* Clear Button */}
            <button
              type="button"
              onClick={clearVideo}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Video Info */}
      {videoInfo && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Video Information</h4>
          <div className="space-y-1 text-sm text-blue-800">
            <p><strong>Type:</strong> {videoInfo.type.charAt(0).toUpperCase() + videoInfo.type.slice(1)}</p>
            <p><strong>URL:</strong> {videoUrl}</p>
            <p><strong>Embed URL:</strong> {videoInfo.embedUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploadManager;
