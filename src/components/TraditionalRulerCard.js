import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TraditionalRulerCard = ({ ruler, index, isDarkMode, visibleSections, sectionId }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div 
      className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
        visibleSections.has(sectionId) 
          ? 'translate-y-0 opacity-100' 
          : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Ruler Image */}
      <div className="relative h-64 overflow-hidden">
        {!imageError ? (
          <img 
            src={ruler.image} 
            alt={`${ruler.name}, ${ruler.title}`}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">👑</div>
              <p className="text-primary-600 font-semibold">{ruler.name}</p>
              <p className="text-primary-500 text-sm">{ruler.title}</p>
            </div>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white">
            {ruler.name}
          </h3>
          <p className="text-sm text-gray-200">
            {ruler.title}
          </p>
        </div>
      </div>

      {/* Ruler Information */}
      <div className="p-6">
        <div className="mb-4">
          <p className={`text-sm font-medium ${isDarkMode ? 'text-primary-400' : 'text-primary-600'}`}>
            {ruler.kingdom}
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {ruler.description}
          </p>
        </div>

        {/* Achievements */}
        <div className="space-y-2">
          <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Key Achievements:
          </h4>
          <div className="flex flex-wrap gap-2">
            {ruler.achievements.map((achievement, idx) => (
              <span 
                key={idx}
                className={`px-2 py-1 text-xs rounded-full ${
                  isDarkMode 
                    ? 'bg-primary-900 text-primary-300' 
                    : 'bg-primary-100 text-primary-700'
                }`}
              >
                {achievement}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6">
          <Link
            to="/auth"
            className={`w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg transition-colors duration-200 ${
              isDarkMode
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            Connect with {ruler.name.split(' ')[0]}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TraditionalRulerCard;
