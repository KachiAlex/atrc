import React from 'react';

const VideoEmbed = ({ videoUrl, title = "Course Video" }) => {
  if (!videoUrl) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-2">🎥</div>
          <p className="text-gray-600">No video available</p>
        </div>
      </div>
    );
  }

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

  const embedUrl = getEmbedUrl(videoUrl);
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isVimeo = videoUrl.includes('vimeo.com');

  return (
    <div className="w-full">
      <div className="relative w-full h-0 pb-[56.25%] bg-gray-200 rounded-lg overflow-hidden">
        {isYouTube || isVimeo ? (
          <iframe
            src={embedUrl}
            title={title}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={videoUrl}
            controls
            className="absolute top-0 left-0 w-full h-full"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
  );
};

export default VideoEmbed;
