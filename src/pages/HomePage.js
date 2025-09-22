import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import LogoImage from '../components/LogoImage';

const HomePage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch events from Firebase
  const fetchEvents = async () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('isPublished', '==', true),
        orderBy('date', 'desc'),
        limit(3)
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Fallback to static data
      setEvents([
        {
          id: 1,
          title: 'Annual Cultural Festival',
          date: '2024-03-15',
          location: 'Lagos State',
          organizer: 'Oba Adeyemi III',
          type: 'cultural',
          status: 'upcoming',
          description: 'Celebrating traditional African culture with music, dance, and ceremonial activities.'
        },
        {
          id: 2,
          title: 'Traditional Marriage Ceremony',
          date: '2024-02-20',
          location: 'Anambra State',
          organizer: 'Eze Nwosu',
          type: 'ceremony',
          status: 'upcoming',
          description: 'Sacred union ceremony following traditional customs and spiritual blessings.'
        },
        {
          id: 3,
          title: 'Council Meeting',
          date: '2024-01-25',
          location: 'Abuja',
          organizer: 'ATRC Council',
          type: 'meeting',
          status: 'completed',
          description: 'Monthly gathering of traditional rulers to discuss community matters and governance.'
        }
      ]);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Fetch announcements from Firebase
  const fetchAnnouncements = async () => {
    try {
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('isPublished', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const announcementsSnapshot = await getDocs(announcementsQuery);
      const announcementsData = announcementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(announcementsData);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // Fallback to static data
      setAnnouncements([
        {
          id: 1,
          title: 'Council Meeting Announcement',
          content: 'The monthly council meeting will be held on January 30th, 2024 at 10:00 AM.',
          author: 'Oba Adeyemi III',
          date: '2024-01-20',
          priority: 'high',
          createdBy: 'admin'
        },
        {
          id: 2,
          title: 'Cultural Festival Update',
          content: 'The annual cultural festival has been rescheduled to March 15th, 2024.',
          author: 'Eze Nwosu',
          date: '2024-01-18',
          priority: 'medium',
          createdBy: 'ruler'
        },
        {
          id: 3,
          title: 'New Community Guidelines',
          content: 'Please review the updated community guidelines for traditional practices.',
          author: 'Emir Muhammad',
          date: '2024-01-15',
          priority: 'low',
          createdBy: 'ruler'
        }
      ]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    // Trigger initial animation
    setIsVisible(true);
    
    // Fetch data
    fetchEvents();
    fetchAnnouncements();
    
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


  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <LogoImage type="traditional-rulers" size="small" />
              </div>
              <div className="ml-3">
                <h1 className={`text-lg font-bold atrc-gradient-text`}>
                  ATRC
                </h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Africa Traditional Rulers for Christ
                </p>
              </div>
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
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center flex flex-col items-center justify-center">
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
        className={`py-16 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${
          visibleSections.has('stats') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 justify-items-center">
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
        className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${
          visibleSections.has('features') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${
            visibleSections.has('features') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              {t('features.title')}
            </h2>
            <p className={`mt-4 text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {t('features.subtitle')}
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
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

      {/* Traditional Leadership Gallery Section */}
      <div 
        id="leadership-gallery" 
        data-animate
        className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${
          visibleSections.has('leadership-gallery') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${
            visibleSections.has('leadership-gallery') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              Traditional Leadership in Action
            </h2>
            <p className={`mt-4 text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Witness the profound wisdom and cultural richness of traditional African leadership through these ceremonial gatherings.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* First Image - Church Gathering */}
            <div className={`transform transition-all duration-1000 ${
              visibleSections.has('leadership-gallery') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300`}>
                <div className="relative">
                  <img 
                    src="/images/traditional-leaders/spiritual-leadership.jpeg" 
                    alt="Traditional rulers and elders in church ceremony with prayer and reverence"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-2`}>
                      Spiritual Leadership
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-100'}`}>
                      Traditional rulers in ornate ceremonial regalia during sacred church gathering, displaying deep spiritual devotion and cultural heritage
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">⛪</span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Ceremonial Gathering
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    A powerful moment of spiritual unity, where traditional African leaders in magnificent ceremonial regalia demonstrate their deep faith and cultural heritage within sacred church spaces.
                  </p>
                </div>
              </div>
            </div>

            {/* Second Image - Ceremonial Interaction */}
            <div className={`transform transition-all duration-1000 delay-200 ${
              visibleSections.has('leadership-gallery') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl overflow-hidden shadow-2xl hover:shadow-3xl transition-shadow duration-300`}>
                <div className="relative">
                  <img 
                    src="/images/traditional-leaders/ceremonial-gathering.jpeg" 
                    alt="Traditional rulers in sacred ceremony with candle ritual and ornate regalia"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-white'} mb-2`}>
                      Sacred Ceremony
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-100'}`}>
                      Traditional rulers and community members in ceremonial gathering, showcasing unity, worship, and the preservation of cultural traditions
                    </p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-2xl">🕯️</span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Sacred Ritual
                    </span>
                  </div>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    A sacred gathering of traditional rulers and community members in worship, demonstrating the harmony between African cultural traditions and Christian faith.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-8`}>
              <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Experience Traditional Wisdom
              </h3>
              <p className={`text-lg mb-6 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Join our platform to connect with traditional leaders, learn from their wisdom, and contribute to preserving African cultural heritage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                >
                  Join Our Community
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

      {/* Leadership Institute Section */}
      <div 
        id="leadership-institute" 
        data-animate
        className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${
          visibleSections.has('leadership-institute') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${
            visibleSections.has('leadership-institute') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="flex flex-col items-center mb-8">
              <LogoImage type="leadership-institute" size="xlarge" className="mb-6" />
              <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
                Africa Traditional Rulers for Christ (ATRC) Leadership Institute
              </h2>
              <p className={`mt-4 text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Empowering Traditional African Leaders through Christ-centered education, wisdom, and practical leadership training.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Digital Library */}
            <div className={`transform transition-all duration-1000 ${
              visibleSections.has('leadership-institute') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-8 text-center hover:shadow-xl transition-shadow duration-300`}>
                <div className="text-5xl mb-4">📚</div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Digital Library
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Access a comprehensive collection of books on leadership, governance, and spiritual growth for traditional rulers.
                </p>
                <Link
                  to="/app/books"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <span className="mr-2">📖</span>
                  Explore Library
                </Link>
              </div>
            </div>

            {/* Courses */}
            <div className={`transform transition-all duration-1000 delay-200 ${
              visibleSections.has('leadership-institute') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-8 text-center hover:shadow-xl transition-shadow duration-300`}>
                <div className="text-5xl mb-4">🎓</div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Leadership Courses
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Structured learning paths designed specifically for traditional African leaders and their development.
                </p>
                <Link
                  to="/app/courses"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span className="mr-2">🎯</span>
                  Start Learning
                </Link>
              </div>
            </div>

            {/* Wisdom & Training */}
            <div className={`transform transition-all duration-1000 delay-400 ${
              visibleSections.has('leadership-institute') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-8 text-center hover:shadow-xl transition-shadow duration-300`}>
                <div className="text-5xl mb-4">🧠</div>
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Wisdom & Training
                </h3>
                <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Biblical wisdom and practical training programs to enhance leadership effectiveness and spiritual growth.
                </p>
                <Link
                  to="/auth"
                  className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <span className="mr-2">⭐</span>
                  Learn More
                </Link>
              </div>
            </div>
          </div>

          {/* Call to Action for Leadership Institute */}
          <div className="mt-16 text-center">
            <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-8`}>
              <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Join the Leadership Institute
              </h3>
              <p className={`text-lg mb-6 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Transform your leadership through Christ-centered education and connect with fellow traditional rulers across Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/auth"
                  className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                >
                  <span className="mr-2">🎓</span>
                  Enroll Now
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center px-8 py-4 border border-gray-300 text-lg font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="mr-2">📚</span>
                  Browse Resources
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div 
        id="events" 
        data-animate
        className={`py-20 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${
          visibleSections.has('events') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${
            visibleSections.has('events') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              Upcoming Events
            </h2>
            <p className={`mt-4 text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join traditional rulers and community members in celebrating our rich cultural heritage and spiritual gatherings.
            </p>
          </div>

          {/* Events Grid - Show 3 recent events */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingEvents ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className={`transform transition-all duration-1000 delay-${index * 200}`}>
                  <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden animate-pulse`}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-6 bg-gray-300 rounded-full w-16"></div>
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </div>
                      <div className="h-6 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="h-4 bg-gray-300 rounded mb-4"></div>
                      <div className="h-8 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : events.length > 0 ? (
              events.map((event, index) => {
                const getTypeColor = (type) => {
                  switch (type) {
                    case 'cultural': return 'bg-purple-100 text-purple-800';
                    case 'ceremony': return 'bg-pink-100 text-pink-800';
                    case 'meeting': return 'bg-blue-100 text-blue-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                return (
                  <div key={event.id} className={`transform transition-all duration-1000 delay-${index * 200} ${
                    visibleSections.has('events') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}>
                    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300`}>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(event.type)}`}>
                            {event.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {event.title}
                        </h3>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {event.description || 'Event details will be provided closer to the date.'}
                        </p>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <span className="mr-4">📍 {event.location}</span>
                          <span>👤 {event.organizer || event.createdBy}</span>
                        </div>
                        <button className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors">
                          Learn More
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // No events state
              <div className="col-span-3 text-center py-12">
                <div className="text-4xl mb-4">📅</div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No upcoming events at the moment. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* View More Events */}
          <div className="mt-12 text-center">
            <Link
              to="/events"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
            >
              <span className="mr-2">📅</span>
              View All Events
            </Link>
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div 
        id="announcements" 
        data-animate
        className={`py-20 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} ${
          visibleSections.has('announcements') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transform transition-all duration-1000 ${
            visibleSections.has('announcements') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <h2 className={`text-3xl font-extrabold ${isDarkMode ? 'text-white' : 'text-gray-900'} sm:text-4xl`}>
              Latest Announcements
            </h2>
            <p className={`mt-4 text-lg max-w-3xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Stay informed with the latest news, updates, and important communications from traditional rulers.
            </p>
          </div>

          {/* Announcements Grid - Show 3 recent announcements */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingAnnouncements ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className={`transform transition-all duration-1000 delay-${index * 200}`}>
                  <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-6 animate-pulse`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-6 bg-gray-300 rounded-full w-20"></div>
                      <div className="h-4 bg-gray-300 rounded w-16"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
              ))
            ) : announcements.length > 0 ? (
              announcements.map((announcement, index) => {
                const getPriorityColor = (priority) => {
                  switch (priority) {
                    case 'high': return 'bg-red-100 text-red-800';
                    case 'medium': return 'bg-yellow-100 text-yellow-800';
                    case 'low': return 'bg-green-100 text-green-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                return (
                  <div key={announcement.id} className={`transform transition-all duration-1000 delay-${index * 200} ${
                    visibleSections.has('announcements') ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                  }`}>
                    <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl p-6 hover:shadow-lg transition-shadow duration-300`}>
                      <div className="flex items-center justify-between mb-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority} Priority
                        </span>
                        <span className="text-sm text-gray-500">
                          {announcement.createdAt 
                            ? new Date(announcement.createdAt.seconds * 1000).toLocaleDateString()
                            : announcement.date
                          }
                        </span>
                      </div>
                      <h3 className={`text-lg font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {announcement.title}
                      </h3>
                      <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {announcement.content}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        By {announcement.author || announcement.createdBy}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              // No announcements state
              <div className="col-span-3 text-center py-12">
                <div className="text-4xl mb-4">📢</div>
                <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  No announcements at the moment. Check back soon!
                </p>
              </div>
            )}
          </div>

          {/* View More Announcements */}
          <div className="mt-12 text-center">
            <Link
              to="/announcements"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
            >
              <span className="mr-2">📢</span>
              View All Announcements
            </Link>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
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
        className={`py-20 atrc-gradient-bg ${
          visibleSections.has('cta') ? 'animate-fadeInUp' : 'opacity-0'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <LogoImage type="traditional-rulers" size="small" />
                <div className="ml-3">
                  <h3 className={`text-lg font-semibold atrc-gradient-text`}>
                    ATRC
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
