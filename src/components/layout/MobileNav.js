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
      {/* Mobile top bar — always dark indigo */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0F1A44]">
        <div className="h-16 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 min-w-0 hover:opacity-90">
            <CrownMark size={36} variant="gold" />
            <h1 className="font-display font-bold text-[22px] text-white leading-tight">ATRC</h1>
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 inline-flex items-center justify-center text-white"
              aria-label="Toggle theme"
            >
              <Icon name={isDarkMode ? 'sun' : 'moon'} size={22} />
            </button>
            <span className="w-[38px] h-[38px] rounded-full bg-[#E3B04B] text-[#14182B] flex items-center justify-center font-bold text-[15px]">
              {initials}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav
        aria-label="Main"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t grid grid-cols-5"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)', paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className="flex flex-col items-center justify-center gap-[3px] min-h-[64px] text-[12px] transition-colors"
              style={{ color: active ? 'var(--brand)' : 'var(--muted)', fontWeight: active ? 700 : 600 }}
            >
              <span
                className="w-[52px] h-[30px] rounded-[15px] flex items-center justify-center"
                style={active ? { background: 'var(--brand-soft)' } : undefined}
              >
                <Icon name={tab.icon} size={22} />
              </span>
              {tab.name}
            </Link>
          );
        })}
        <button
          onClick={() => setIsOpen(true)}
          className="flex flex-col items-center justify-center gap-[3px] min-h-[64px] text-[12px] font-semibold"
          style={{ color: 'var(--muted)' }}
        >
          <span className="w-[52px] h-[30px] flex items-center justify-center">
            <Icon name="menu" size={22} />
          </span>
          More
        </button>
      </nav>
      {/* Bottom padding so content isn't hidden behind tab bar */}
      <div className="lg:hidden h-[72px]" />

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
                    <h1 className="font-display font-bold text-white leading-tight">ATRC</h1>
                    <p className="text-[11px] tracking-[0.08em] uppercase text-[#E3B04B]">Traditional Rulers</p>
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
                    className={`flex items-center gap-3 px-[14px] rounded-[10px] text-[16px] min-h-[46px] transition-colors ${
                      isActive(item.href)
                        ? 'bg-[#22338A] text-white font-semibold'
                        : 'text-[#C9D0EE] font-medium hover:bg-[#1A2866] hover:text-white'
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      size={20}
                      className={isActive(item.href) ? 'text-[#E3B04B]' : 'text-[#C9D0EE]'}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>

              {/* User card + logout */}
              <div className="mt-8 rounded-[12px] bg-[#16245A] p-3">
                <div className="flex items-center gap-3">
                  <div className="w-[42px] h-[42px] rounded-full bg-[#E3B04B] flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-[#14182B]">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {currentUser?.displayName || 'Member'}
                    </p>
                    <p className="text-[14px] text-[#AAB4E0] capitalize">{userRole || 'Member'}</p>
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
