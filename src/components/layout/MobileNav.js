import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import Icon, { CrownMark } from '../ui/Icon';

const MobileNav = () => {
  const { currentUser, userRole, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Bottom tab bar — labels always visible (design rule)
  const tabs = [
    { name: 'Home', href: '/app/dashboard', icon: 'home' },
    { name: 'Reports', href: '/app/community', icon: 'reports' },
    { name: 'Meetings', href: '/app/meetings', icon: 'meetings' },
    { name: 'Library', href: '/app/books', icon: 'library' },
  ];

  const drawerNav = [
    { name: 'Dashboard', href: '/app/dashboard', icon: 'dashboard' },
    { name: 'Community Reports', href: '/app/community', icon: 'reports' },
    { name: 'Live Meetings', href: '/app/meetings', icon: 'meetings' },
    { name: 'Local Events', href: '/app/events', icon: 'events' },
    ...(userRole === 'admin' ? [{ name: 'Announcements', href: '/app/announcements', icon: 'announcements' }] : []),
    { name: 'Analytics', href: '/app/reports', icon: 'analytics' },
    { name: 'Digital Library', href: '/app/books', icon: 'library' },
    { name: 'Courses', href: '/app/courses', icon: 'courses' },
    { name: 'Documents', href: '/app/docx', icon: 'file' },
    { name: 'Profile', href: '/app/profile', icon: 'user' },
    { name: 'Settings', href: '/app/settings', icon: 'settings' },
  ];

  const initials = (currentUser?.displayName || 'U')
    .split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const close = () => setIsOpen(false);

  return (
    <>
      {/* Mobile top bar */}
      <div
        className="lg:hidden sticky top-0 z-40 border-b"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="px-4 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0 hover:opacity-90">
            <CrownMark size={34} variant="gold" />
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight truncate" style={{ color: 'var(--ink)' }}>ATRC</h1>
              <p className="text-[12px] leading-tight truncate" style={{ color: 'var(--muted)' }}>Traditional Rulers</p>
            </div>
          </Link>
          <button
            onClick={toggleTheme}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] border"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink)' }}
            aria-label="Toggle theme"
          >
            <Icon name={isDarkMode ? 'sun' : 'moon'} size={20} />
          </button>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[12px] font-semibold transition-colors"
              style={{ color: isActive(tab.href) ? 'var(--brand)' : 'var(--muted)' }}
            >
              <Icon name={tab.icon} size={22} />
              {tab.name}
            </Link>
          ))}
          <button
            onClick={() => setIsOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[12px] font-semibold"
            style={{ color: 'var(--muted)' }}
          >
            <Icon name="menu" size={22} />
            More
          </button>
        </div>
      </nav>
      {/* Bottom padding so content isn't hidden behind tab bar */}
      <div className="lg:hidden h-[60px]" />

      {/* Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={close} />
          <div
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] shadow-xl overflow-y-auto"
            style={{ background: 'var(--side)' }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <CrownMark size={36} variant="gold" />
                  <div>
                    <h1 className="text-base font-bold text-white leading-tight">ATRC</h1>
                    <p className="text-[12px] text-[#AAB4E0]">Traditional Rulers</p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] text-[#C9D0EE] hover:bg-[#1A2866]"
                  aria-label="Close menu"
                >
                  <Icon name="close" size={22} />
                </button>
              </div>

              <nav className="space-y-1">
                {drawerNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={close}
                    className={`flex items-center gap-3 px-3 py-3 rounded-[10px] text-[15px] font-medium min-h-[44px] transition-colors ${
                      isActive(item.href)
                        ? 'bg-[#1A2866] text-white'
                        : 'text-[#C9D0EE] hover:bg-[#1A2866] hover:text-white'
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      className={isActive(item.href) ? 'text-[#E3B04B]' : 'text-[#8B98C9]'}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* User card + logout */}
              <div className="mt-8 rounded-[12px] bg-[#1A2350] p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#E3B04B] flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#14182B]">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {currentUser?.displayName || 'Member'}
                    </p>
                    <p className="text-[13px] text-[#AAB4E0] capitalize">{userRole || 'Member'}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] text-[#C9D0EE] hover:bg-[#27315F]"
                    aria-label="Sign out"
                  >
                    <Icon name="logout" size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileNav;
