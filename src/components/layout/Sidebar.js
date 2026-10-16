import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon, { CrownMark } from '../ui/Icon';

const Sidebar = () => {
  const { currentUser, userRole } = useAuth();
  const location = useLocation();

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

  const isActive = (path) => location.pathname === path;

  const itemClass = (active) =>
    `group flex items-center gap-3 px-[14px] rounded-[10px] text-[16px] transition-colors duration-150 min-h-[46px] ${
      active
        ? 'bg-[#22338A] text-white font-semibold'
        : 'text-[#C9D0EE] font-medium hover:bg-[#1A2866] hover:text-white'
    }`;

  const iconClass = (active) =>
    active ? 'text-[#E3B04B]' : 'text-[#C9D0EE] group-hover:text-white';

  const initials = (currentUser?.displayName || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="w-[280px] min-h-screen flex flex-col" style={{ background: 'var(--side)' }}>
      {/* Brand */}
      <div className="px-6 pt-6 pb-1">
        <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <CrownMark size={40} variant="gold" />
          <div className="leading-[1.1]">
            <h1 className="font-display font-bold text-[22px] text-white">ATRC</h1>
            <p className="text-[11px] tracking-[0.08em] uppercase text-[#E3B04B]">
              Traditional Rulers
            </p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="mt-8 px-4 flex-1 flex flex-col gap-1">
        {navigation.map((item) => (
          <Link key={item.name} to={item.href} className={itemClass(isActive(item.href))}>
            <Icon name={item.icon} size={20} className={`flex-shrink-0 ${iconClass(isActive(item.href))}`} />
            {item.name}
          </Link>
        ))}

        {/* Leadership Institute */}
        <div className="mx-[14px] mt-[22px] mb-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-[#E3B04B]">
          Leadership Institute
        </div>
        {instituteItems.map((item) => (
          <Link key={item.name} to={item.href} className={itemClass(isActive(item.href))}>
            <Icon name={item.icon} size={20} className={`flex-shrink-0 ${iconClass(isActive(item.href))}`} />
            {item.name}
          </Link>
        ))}
      </nav>

      {/* User card pinned to bottom */}
      <div className="mt-auto px-4 pb-6 pt-6">
        <Link to="/app/profile" className="flex items-center gap-3 p-3 rounded-[12px] bg-[#16245A] hover:bg-[#1B2A66] transition-colors">
          <span className="flex-shrink-0 w-[42px] h-[42px] rounded-full bg-[#E3B04B] text-[#14182B] flex items-center justify-center font-bold">
            {initials}
          </span>
          <span className="leading-[1.25] min-w-0">
            <span className="block text-white font-semibold truncate">
              {currentUser?.displayName || 'Member'}
            </span>
            <span className="block text-[14px] text-[#AAB4E0] truncate">
              {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Member'}
            </span>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
