import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon, { CrownMark } from '../ui/Icon';

const Sidebar = () => {
  const { currentUser, userRole } = useAuth();
  const location = useLocation();
  const [isInstituteOpen, setIsInstituteOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/app/dashboard', icon: 'dashboard' },
    { name: 'Community Reports', href: '/app/community', icon: 'reports' },
    { name: 'Live Meetings', href: '/app/meetings', icon: 'meetings' },
    { name: 'Local Events', href: '/app/events', icon: 'events' },
    ...(userRole === 'admin' ? [{ name: 'Announcements', href: '/app/announcements', icon: 'announcements' }] : []),
    { name: 'Analytics', href: '/app/reports', icon: 'analytics' },
  ];

  const instituteItems = [
    { name: 'Digital Library', href: '/app/books', icon: 'library' },
    { name: 'Courses', href: '/app/courses', icon: 'courses' },
    { name: 'Documents', href: '/app/docx', icon: 'file' },
  ];

  const utilityItems = [
    { name: 'Profile', href: '/app/profile', icon: 'user' },
    { name: 'Settings', href: '/app/settings', icon: 'settings' },
  ];

  const isActive = (path) => location.pathname === path;
  const isInstituteActive = () => instituteItems.some((item) => isActive(item.href));

  React.useEffect(() => {
    if (isInstituteActive()) setIsInstituteOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const itemClass = (active) =>
    `group flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[15px] font-medium transition-colors duration-150 min-h-[44px] ${
      active
        ? 'bg-[#1A2866] text-white'
        : 'text-[#C9D0EE] hover:bg-[#1A2866] hover:text-white'
    }`;

  const iconClass = (active) => (active ? 'text-[#E3B04B]' : 'text-[#8B98C9] group-hover:text-white');

  const initials = (currentUser?.displayName || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="w-64 min-h-screen flex flex-col"
      style={{ background: 'var(--side)' }}
    >
      {/* Brand */}
      <div className="p-5">
        <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
          <CrownMark size={40} variant="gold" />
          <div className="ml-3">
            <h1 className="text-lg font-bold text-white leading-tight">ATRC</h1>
            <p className="text-[13px] text-[#AAB4E0]">Traditional Rulers</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="mt-2 px-3 flex-1">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link key={item.name} to={item.href} className={itemClass(isActive(item.href))}>
              <Icon name={item.icon} size={20} className={`flex-shrink-0 ${iconClass(isActive(item.href))}`} />
              {item.name}
            </Link>
          ))}

          {/* Leadership Institute */}
          <div className="pt-4">
            <button
              onClick={() => setIsInstituteOpen(!isInstituteOpen)}
              className="flex items-center justify-between w-full px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-[#8B98C9] hover:text-white transition-colors min-h-[36px]"
            >
              <span>Leadership Institute</span>
              <Icon
                name="chevronDown"
                size={16}
                className={`transform transition-transform duration-200 ${isInstituteOpen ? '' : '-rotate-90'}`}
              />
            </button>
            <div
              className={`mt-1 space-y-1 transition-all duration-200 overflow-hidden ${
                isInstituteOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {instituteItems.map((item) => (
                <Link key={item.name} to={item.href} className={itemClass(isActive(item.href))}>
                  <Icon name={item.icon} size={20} className={`flex-shrink-0 ${iconClass(isActive(item.href))}`} />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Utility + user card pinned to bottom */}
      <div className="px-3 pb-4 space-y-1">
        {utilityItems.map((item) => (
          <Link key={item.name} to={item.href} className={itemClass(isActive(item.href))}>
            <Icon name={item.icon} size={20} className={`flex-shrink-0 ${iconClass(isActive(item.href))}`} />
            {item.name}
          </Link>
        ))}
        <div className="rounded-[12px] bg-[#1A2350] p-3 mt-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-[#E3B04B] flex items-center justify-center flex-shrink-0">
              <span className="text-[13px] font-bold text-[#14182B]">{initials}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {currentUser?.displayName || 'Member'}
              </p>
              <p className="text-[13px] text-[#AAB4E0] truncate">
                {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Member'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
