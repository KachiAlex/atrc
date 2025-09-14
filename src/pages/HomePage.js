import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import ATRCLogo from '../components/ATRCLogo';
import TraditionalRulerCard from '../components/TraditionalRulerCard';

const HomePage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Trigger initial animation
    setIsVisible(true);
    
    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => new Set([...prev, entry.target.id]));
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all sections
    const sections = document.querySelectorAll('[data-animate]');
    sections.forEach(section => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  // Auto-advance banner slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 5); // 5 slides total
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const bannerSlides = [
    {
      id: 1,
      title: "Unity in Diversity",
      subtitle: "Connecting Traditional Rulers Across Africa",
      description: "Join our network of traditional leaders working together for community development and cultural preservation.",
      image: "👑",
      gradient: "from-blue-600 to-purple-600",
      backgroundImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop"
    },
    {
      id: 2,
      title: "Digital Transformation",
      subtitle: "Modern Solutions for Traditional Leadership",
      description: "Embrace technology while preserving cultural heritage through our comprehensive digital platform.",
      image: "📱",
      gradient: "from-green-600 to-blue-600",
      backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=800&fit=crop"
    },
    {
      id: 3,
      title: "Community Development",
      subtitle: "Building Stronger Communities Together",
      description: "Collaborate on projects that enhance education, healthcare, and infrastructure in your communities.",
      image: "🏘️",
      gradient: "from-purple-600 to-pink-600",
      backgroundImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200&h=800&fit=crop"
    },
    {
      id: 4,
      title: "Cultural Preservation",
      subtitle: "Honoring Our Rich Heritage",
      description: "Document and preserve traditional knowledge, customs, and practices for future generations.",
      image: "🎭",
      gradient: "from-orange-600 to-red-600",
      backgroundImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=1200&h=800&fit=crop"
    },
    {
      id: 5,
      title: "Global Network",
      subtitle: "Connecting Africa to the World",
      description: "Build international partnerships and showcase African traditional leadership on the global stage.",
      image: "🌍",
      gradient: "from-teal-600 to-green-600",
      backgroundImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&h=800&fit=crop"
    }
  ];

  const features = [
    {
      icon: '🏘️',
      title: t('features.community.title'),
      description: t('features.community.desc')
    },
    {
      icon: '⚖️',
      title: t('features.disputes.title'),
      description: t('features.disputes.desc')
    },
    {
      icon: '📅',
      title: t('features.events.title'),
      description: t('features.events.desc')
    },
    {
      icon: '📢',
      title: t('features.announcements.title'),
      description: t('features.announcements.desc')
    },
    {
      icon: '📊',
      title: t('features.analytics.title'),
      description: t('features.analytics.desc')
    },
    {
      icon: '👥',
      title: t('features.members.title'),
      description: t('features.members.desc')
    }
  ];

  const stats = [
    { number: '500+', label: t('stats.communities') },
    { number: '50+', label: t('stats.rulers') },
    { number: '1000+', label: t('stats.members') },
    { number: '24/7', label: t('stats.support') }
  ];

  const traditionalRulers = [
    {
      id: 1,
      name: "Oba Adeyemi III",
      title: "Alaafin of Oyo",
      kingdom: "Oyo Kingdom, Nigeria",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&crop=face",
      description: "A distinguished traditional ruler known for his wisdom and leadership in preserving Yoruba culture and traditions.",
      achievements: ["Cultural Preservation", "Community Development", "Youth Empowerment"]
    },
    {
      id: 2,
      name: "Kabaka Mutebi II",
      title: "King of Buganda",
      kingdom: "Buganda Kingdom, Uganda",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop&crop=face",
      description: "A modern traditional leader who has successfully bridged traditional governance with contemporary development.",
      achievements: ["Education Advancement", "Economic Development", "Cultural Heritage"]
    },
    {
      id: 3,
      name: "Oba Rilwan Akiolu",
      title: "Oba of Lagos",
      kingdom: "Lagos Kingdom, Nigeria",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop&crop=face",
      description: "A progressive traditional ruler who has been instrumental in modernizing traditional governance practices.",
      achievements: ["Urban Development", "Technology Integration", "Social Welfare"]
    },
    {
      id: 4,
      name: "Asantehene Otumfuo Osei Tutu II",
      title: "King of Ashanti",
      kingdom: "Ashanti Kingdom, Ghana",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=500&fit=crop&crop=face",
      description: "A revered monarch known for his commitment to education and development in the Ashanti region.",
      achievements: ["Educational Excellence", "Healthcare Initiatives", "Cultural Promotion"]
    },
    {
      id: 5,
      name: "Emir Muhammadu Sanusi II",
      title: "Emir of Kano",
      kingdom: "Kano Emirate, Nigeria",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop&crop=face",
      description: "A forward-thinking traditional leader who has championed economic reforms and social development.",
      achievements: ["Economic Reforms", "Social Justice", "Interfaith Dialogue"]
    },
    {
      id: 6,
      name: "Mwami Ndeze III",
      title: "King of Rwanda",
      kingdom: "Rwanda Kingdom",
      image: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400&h=500&fit=crop&crop=face",
      description: "A traditional ruler dedicated to reconciliation and unity in post-conflict Rwanda.",
      achievements: ["Reconciliation", "National Unity", "Cultural Revival"]
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ATRCLogo size="small" />
              </div>
              <div className="ml-3">
                <h1 className={`text-xl font-bold atrc-gradient-text`}>
                  ATRFC
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Africa Traditional Rulers for Christ
                </p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className={`hover:text-primary-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Features
              </a>
              <a href="#rulers" className={`hover:text-primary-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Traditional Rulers
              </a>
              <a href="#heritage" className={`hover:text-primary-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Cultural Heritage
              </a>
              <a href="#stats" className={`hover:text-primary-500 transition-colors duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Statistics
              </a>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageSelector />
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-md hover:bg-gray-100 ${isDarkMode ? 'hover:bg-gray-700' : ''}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/auth"
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                {t('nav.joinATRC')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Dynamic Banner Hero Section */}
      <div className="relative overflow-hidden h-screen">
        {/* Enhanced Background Slides */}
        <div className="absolute inset-0">
          {bannerSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${slide.backgroundImage})`
                }}
              />
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient}`}></div>
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center">
              {bannerSlides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`transition-all duration-1000 ${
                    index === currentSlide 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-8 absolute inset-0'
                  }`}
                >
                  <div className={`transform transition-all duration-1000 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}>
                    <div className="text-8xl mb-6 animate-bounce">{slide.image}</div>
                    <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl mb-4">
                      <span className="block">{slide.title}</span>
                      <span className="block text-yellow-300">{slide.subtitle}</span>
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-white/90 max-w-3xl mx-auto">
                      {slide.description}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className={`mt-12 transform transition-all duration-1000 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/auth"
                    className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {t('home.joinCommunity')}
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white hover:bg-white hover:text-primary-600 transition-all duration-300 transform hover:scale-105"
                  >
                    {t('home.signIn')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-300"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % bannerSlides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors duration-300"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Stats Section */}
      <div 
        id="stats" 
        data-animate
        className={`py-12 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${
          visibleSections.has('stats') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center transform transition-all duration-700 delay-${index * 100} ${
                  visibleSections.has('stats') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                } hover:scale-105`}
              >
                <div className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  {stat.number}
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div 
        id="features" 
        data-animate
        className={`py-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${
          visibleSections.has('features') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${
            visibleSections.has('features') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              {t('features.title')}
            </h2>
            <p className={`mt-4 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('features.subtitle')}
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                    visibleSections.has('features') 
                      ? 'translate-y-0 opacity-100' 
                      : 'translate-y-8 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-12">
                    {feature.icon}
                  </div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2 transition-colors duration-300`}>
                    {feature.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-300`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Traditional Rulers Gallery Section */}
      <div 
        id="rulers" 
        data-animate
        className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${
          visibleSections.has('rulers') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${
            visibleSections.has('rulers') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              Our Distinguished Traditional Rulers
            </h2>
            <p className={`mt-4 text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Meet the esteemed traditional leaders who are shaping the future of African communities through wisdom, innovation, and cultural preservation.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {traditionalRulers.map((ruler, index) => (
                <TraditionalRulerCard
                  key={ruler.id}
                  ruler={ruler}
                  index={index}
                  isDarkMode={isDarkMode}
                  visibleSections={visibleSections}
                  sectionId="rulers"
                />
              ))}
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-8`}>
              <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Join Our Network of Traditional Leaders
              </h3>
              <p className={`text-lg mb-6 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Connect with fellow traditional rulers, share knowledge, and collaborate on community development initiatives across Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                >
                  Become a Member
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cultural Heritage Section */}
      <div 
        id="heritage" 
        data-animate
        className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${
          visibleSections.has('heritage') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${
            visibleSections.has('heritage') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              Preserving African Cultural Heritage
            </h2>
            <p className={`mt-4 text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Our platform celebrates the rich diversity of African cultures, traditions, and leadership practices.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🏛️",
                title: "Traditional Architecture",
                description: "Showcasing the architectural marvels of African kingdoms and palaces"
              },
              {
                icon: "🎭",
                title: "Cultural Festivals",
                description: "Celebrating traditional ceremonies and cultural festivals across Africa"
              },
              {
                icon: "📜",
                title: "Oral Traditions",
                description: "Preserving ancient wisdom, stories, and traditional knowledge"
              },
              {
                icon: "👑",
                title: "Royal Regalia",
                description: "Honoring the symbols and artifacts of traditional leadership"
              }
            ].map((item, index) => (
              <div 
                key={index}
                className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 text-center hover:shadow-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 ${
                  visibleSections.has('heritage') 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl mb-4 transform transition-transform duration-300 hover:scale-110 hover:rotate-12">
                  {item.icon}
                </div>
                <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {item.title}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div 
        id="cta" 
        data-animate
        className={`py-16 atrc-gradient-bg ${
          visibleSections.has('cta') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transform transition-all duration-1000 ${
            visibleSections.has('cta') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              {t('cta.title')}
            </h2>
            <p className="mt-4 text-lg text-white/90">
              {t('cta.subtitle')}
            </p>
            <div className="mt-8">
              <Link
                to="/auth"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                {t('cta.getStarted')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} border-t border-gray-200`}>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <ATRCLogo size="small" />
                <div className="ml-3">
                  <h3 className={`text-lg font-semibold atrc-gradient-text`}>
                    ATRFC
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Africa Traditional Rulers for Christ
                  </p>
                </div>
              </div>
              <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {t('footer.description')}
              </p>
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider`}>
                {t('footer.features')}
              </h4>
              <ul className="mt-4 space-y-2">
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('features.community.title')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('features.disputes.title')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('features.events.title')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('features.analytics.title')}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wider`}>
                {t('footer.support')}
              </h4>
              <ul className="mt-4 space-y-2">
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('footer.helpCenter')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('footer.contactUs')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('footer.privacyPolicy')}</Link></li>
                <li><Link to="/login" className={`text-sm ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>{t('footer.termsOfService')}</Link></li>
              </ul>
            </div>
          </div>
          <div className={`mt-8 pt-8 border-t border-gray-200 text-center`}>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
