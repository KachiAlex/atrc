import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Icon from '../ui/Icon';
import PWAStatus from '../PWAStatus';

const PAGE_NAMES = {
  '/app/dashboard': 'Dashboard',
  '/app/community': 'Community Reports',
  '/app/disputes': 'Dispute Resolution',
  '/app/meetings': 'Live Meetings',
  '/app/events': 'Local Events',
  '/app/announcements': 'Announcements',
  '/app/reports': 'Analytics',
  '/app/projects': 'Projects',
  '/app/books': 'Digital Library',
  '/app/courses': 'Courses',
  '/app/docx': 'Documents',
  '/app/profile': 'Profile',
  '/app/settings': 'Settings',
};

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, changeLanguage, availableLanguages } = useLanguage();
  const location = useLocation();
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const langRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const pageName = PAGE_NAMES[location.pathname] || 'Dashboard';
  const currentLang = availableLanguages.find((l) => l.code === language);
  const initials = (currentUser?.displayName || 'U')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const ghostBtn =
    'min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-2 px-3 rounded-[10px] border transition-colors text-[15px] font-semibold';
  const ghostStyle = {
    borderColor: 'var(--border)',
    background: 'var(--surface)',
    color: 'var(--ink)',
  };

  return (
    <header
      className="flex items-center justify-between gap-3 px-6 lg:px-9 py-3 border-b"
      style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      {/* Breadcrumb */}
      <div className="text-[15px] font-medium" style={{ color: 'var(--muted)' }}>
        Member area / <span className="font-semibold" style={{ color: 'var(--ink)' }}>{pageName}</span>
      </div>

      <div className="flex items-center gap-2">
        <PWAStatus />

        {/* Language */}
        <div className="relative" ref={langRef}>
          <button
            type="button"
            className={ghostBtn}
            style={ghostStyle}
            onClick={() => setLangOpen(!langOpen)}
            aria-label="Change language"
          >
            <Icon name="language" size={18} />
            <span className="hidden sm:inline">{currentLang?.name || 'English'}</span>
            <Icon name="chevronDown" size={14} />
          </button>
          {langOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-[12px] border shadow-lg py-1 z-50 max-h-80 overflow-y-auto"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { changeLanguage(l.code); setLangOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-[15px] flex items-center gap-2 transition-colors"
                  style={{ color: 'var(--ink)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span>{l.flag}</span>
                  <span className={l.code === language ? 'font-bold' : ''}>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme */}
        <button
          type="button"
          onClick={toggleTheme}
          className={ghostBtn}
          style={ghostStyle}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon name={isDarkMode ? 'sun' : 'moon'} size={20} />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className={`${ghostBtn} relative`}
          style={ghostStyle}
          aria-label="Notifications"
        >
          <Icon name="bell" size={20} />
          <span
            className="absolute top-[9px] right-[10px] w-[9px] h-[9px] rounded-full bg-[#C0392B]"
            style={{ border: '2px solid var(--surface)' }}
          />
        </button>

        {/* User */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            className={ghostBtn}
            style={ghostStyle}
            onClick={() => setUserOpen(!userOpen)}
          >
            <span className="h-7 w-7 rounded-full bg-[#17275F] dark:bg-[#E3B04B] flex items-center justify-center">
              <span className="text-[12px] font-bold text-white dark:text-[#14182B]">{initials}</span>
            </span>
            <Icon name="chevronDown" size={14} />
          </button>
          {userOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-[12px] border shadow-lg py-1 z-50"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <Link
                to="/app/profile"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-[15px] transition-colors"
                style={{ color: 'var(--ink)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon name="user" size={18} /> Profile
              </Link>
              <Link
                to="/app/settings"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-[15px] transition-colors"
                style={{ color: 'var(--ink)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon name="settings" size={18} /> Settings
              </Link>
              <button
                onClick={() => { setUserOpen(false); logout(); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[15px] transition-colors"
                style={{ color: 'var(--danger-fg, #9B2C2C)' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon name="logout" size={18} /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
