import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, limit } from '../api/store';
import { db } from '../api/config';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Icon, { CrownMark, WeaveBand } from '../components/ui/Icon';

const HomePage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  const fetchEvents = async () => {
    try {
      const eventsQuery = query(collection(db, 'events'), orderBy('date', 'desc'), limit(3));
      const eventsSnapshot = await getDocs(eventsQuery);
      setEvents(eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([
        { id: 1, title: 'Council Assembly', date: '2024-03-15', location: 'Abuja', type: 'governance', status: 'upcoming' },
        { id: 2, title: 'Youth and Elders Dialogue', date: '2024-03-22', location: 'Enugu', type: 'community', status: 'upcoming' },
        { id: 3, title: 'Heritage Day Celebration', date: '2024-04-01', location: 'Lagos State', type: 'culture', status: 'upcoming' }
      ]);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const announcementsQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(3));
      const announcementsSnapshot = await getDocs(announcementsQuery);
      setAnnouncements(announcementsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setAnnouncements([
        { id: 1, title: 'Assembly agenda published', content: 'Read the full agenda before you RSVP.', createdAt: '2024-10-12' },
        { id: 2, title: 'Course enrolment is open', content: 'Leadership Foundations is now accepting new learners.', createdAt: '2024-10-09' }
      ]);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchAnnouncements();
  }, []);

  const features = [
    { icon: 'reports', title: 'Community Reports', desc: 'File reports on issues, projects and updates from your community, and follow each one from submitted to resolved.' },
    { icon: 'disputes', title: 'Dispute Resolution', desc: 'Record disputes between parties, track each case through its stages, and keep a clear account of every resolution.' },
    { icon: 'meetings', title: 'Live Meetings', desc: 'Join council sessions live or watch the recording later, with the meeting details beside the video.' },
    { icon: 'events', title: 'Local Events', desc: 'Publish gatherings, share the details and collect RSVPs. Public events are visible to everyone.' },
    { icon: 'library', title: 'Digital Library', desc: 'Read books and documents in the app, bookmark where you stopped, and translate a passage or a whole chapter.' },
    { icon: 'courses', title: 'Courses', desc: 'Learn through modules and lessons, check understanding with quizzes, and earn certificates.' },
  ];

  const featureChips = [
    { icon: 'language', label: 'Multi-language', sub: 'Interface and in-book translation' },
    { icon: 'meetings', label: 'Live and recorded', sub: 'Council meetings, from anywhere' },
    { icon: 'file', label: 'EPUB, PDF and DOCX', sub: 'Read inside the app' },
    { icon: 'smartphone', label: 'Installable on phones', sub: 'Works like an app, built for touch' },
  ];

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    if (isNaN(date)) return String(d);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const dateBlock = (d) => {
    const date = new Date(d);
    if (isNaN(date)) return { day: '—', mon: '' };
    return {
      day: date.toLocaleDateString('en-GB', { day: '2-digit' }),
      mon: date.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    };
  };

  const eventTypeColor = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'governance' || t === 'meeting') return 'a-badge-info';
    if (t === 'community' || t === 'ceremony') return 'a-badge-warn';
    return 'a-badge-ok';
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>

      {/* ===== Top nav ===== */}
      <nav
        className="sticky top-0 z-40 border-b"
        style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-[68px]">
          <Link to="/" className="flex items-center gap-2.5">
            <CrownMark size={38} variant="dark" />
            <div className="leading-tight">
              <div className="font-bold text-[16px]">ATRC</div>
              <div className="text-[12px]" style={{ color: 'var(--muted)' }}>Traditional Rulers</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[15px] font-medium" style={{ color: 'var(--muted)' }}>
            <a href="#platform" className="hover:opacity-70">Platform</a>
            <a href="#institute" className="hover:opacity-70">Leadership Institute</a>
            <Link to="/events" className="hover:opacity-70">Events</Link>
            <Link to="/announcements" className="hover:opacity-70">Announcements</Link>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-[10px] border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink)' }}
              aria-label="Toggle theme"
            >
              <Icon name={isDarkMode ? 'sun' : 'moon'} size={19} />
            </button>
            <Link to="/auth" className="a-btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link to="/auth" className="a-btn-primary">Join</Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section style={{ background: 'var(--hero)' }} className="text-white">
        <WeaveBand height={14} />
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 lg:pt-24 lg:pb-28 grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <h1 className="font-serif font-bold leading-[1.08] text-[42px] sm:text-[54px] lg:text-[62px]">
              The digital home of traditional leadership
            </h1>
            <p className="mt-5 text-[19px] leading-relaxed text-[#C9D0EE] max-w-xl">
              Where the council gathers, wherever its people are.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link to="/auth" className="a-btn-gold text-[16px] px-7">Join the council</Link>
              <Link
                to="/events"
                className="a-btn text-[16px] px-7 border border-[#3D4B8C] text-white hover:bg-[#1A2866]"
                style={{ background: 'transparent' }}
              >
                See public events
              </Link>
            </div>
          </div>

          {/* Floating preview cards */}
          <div className="hidden lg:flex flex-col gap-4 relative">
            <div className="self-start w-[300px] rounded-card p-4 shadow-xl" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Live meeting</span>
                <span className="a-badge a-badge-live">LIVE</span>
              </div>
              <div className="mt-2 font-semibold text-[16px]">Quarterly Council Assembly</div>
              <div className="text-[14px]" style={{ color: 'var(--muted)' }}>Sample meeting card</div>
            </div>
            <div className="self-end w-[300px] rounded-card p-4 shadow-xl" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
              <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Report filed</span>
              <div className="mt-2 font-semibold text-[16px]">Water point repair, Ward 3</div>
              <div className="text-[14px]" style={{ color: 'var(--muted)' }}>Status: under review</div>
            </div>
            <div className="self-start w-[300px] rounded-card p-4 shadow-xl ml-10" style={{ background: 'var(--surface)', color: 'var(--ink)' }}>
              <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>Announcement</span>
              <div className="mt-2 font-semibold text-[16px]">Assembly agenda published</div>
              <div className="text-[14px]" style={{ color: 'var(--muted)' }}>From the council secretariat</div>
            </div>
          </div>
        </div>
        <WeaveBand height={14} />
      </section>

      {/* ===== Feature chips ===== */}
      <section className="max-w-6xl mx-auto px-5 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featureChips.map((chip) => (
            <div key={chip.label} className="a-card flex items-start gap-3">
              <Icon name={chip.icon} size={24} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--brand)' }} />
              <div>
                <div className="font-semibold text-[15px]">{chip.label}</div>
                <div className="text-[14px]" style={{ color: 'var(--muted)' }}>{chip.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== The platform ===== */}
      <section id="platform" className="max-w-6xl mx-auto px-5 pb-20">
        <span className="a-badge a-badge-info mb-4">The platform</span>
        <h2 className="font-serif font-bold text-[30px] sm:text-[38px] leading-tight max-w-2xl">
          The work of governance and the work of learning, in one place
        </h2>
        <p className="mt-4 text-[17px] max-w-2xl" style={{ color: 'var(--muted)' }}>
          Every tool follows the way councils already operate: record, deliberate, decide, share.
        </p>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="a-card">
              <div
                className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-4"
                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
              >
                <Icon name={f.icon} size={24} />
              </div>
              <h3 className="font-serif font-semibold text-[20px] mb-2">{f.title}</h3>
              <p className="text-[15px] leading-relaxed" style={{ color: 'var(--muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Leadership Institute ===== */}
      <section id="institute" style={{ background: 'var(--surface)' }} className="border-y" >
        <div className="max-w-6xl mx-auto px-5 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="a-badge a-badge-warn mb-4">Leadership Institute</span>
            <h2 className="font-serif font-bold text-[30px] sm:text-[38px] leading-tight">
              Read, translate and learn at your own pace
            </h2>
            <ul className="mt-6 space-y-3.5 text-[16px]" style={{ color: 'var(--muted)' }}>
              <li className="flex gap-2.5"><Icon name="check" size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--ok-fg)' }} />Pick up where you left off. Progress and bookmarks are saved to your account.</li>
              <li className="flex gap-2.5"><Icon name="check" size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--ok-fg)' }} />Select any passage to translate it, or translate a whole chapter.</li>
              <li className="flex gap-2.5"><Icon name="check" size={20} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--ok-fg)' }} />Courses with lessons, quizzes, discussion and certificates.</li>
            </ul>
            <Link to="/auth" className="a-btn-primary mt-8 px-7">Open the Institute</Link>
          </div>

          {/* Reader preview mock */}
          <div className="a-card !p-0 overflow-hidden shadow-lg">
            <div className="px-5 py-3 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
              <Icon name="library" size={18} style={{ color: 'var(--brand)' }} />
              <span className="text-[13px] font-semibold" style={{ color: 'var(--muted)' }}>Chapter 3 — Sample text</span>
            </div>
            <div className="p-6 font-serif text-[17px] leading-relaxed">
              <p>The elders sat in a wide circle so that no voice would come from behind another.</p>
              <p className="mt-4">A council that listens first rarely has to command.</p>
              <p className="mt-4">Only then did the question go round.</p>
            </div>
            <div className="px-6 pb-5">
              <div className="rounded-[12px] p-4" style={{ background: 'var(--warn-bg)' }}>
                <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--warn-fg)' }}>
                  Translated to Français
                </span>
                <p className="mt-1.5 font-serif text-[15px]" style={{ color: 'var(--ink)' }}>
                  Un conseil qui écoute d'abord a rarement besoin de commander.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Events ===== */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif font-bold text-[28px] sm:text-[34px]">Upcoming events</h2>
          <Link to="/events" className="text-[15px] font-semibold inline-flex items-center gap-1.5" style={{ color: 'var(--brand)' }}>
            View all <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        {loadingEvents ? (
          <div className="text-center py-10 a-muted">Loading events…</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <div key={event.id} className="a-card">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-serif font-semibold text-[19px] leading-snug">{event.title}</h3>
                  <Icon name="events" size={20} className="flex-shrink-0 mt-1" style={{ color: 'var(--brand)' }} />
                </div>
                <p className="mt-2 text-[14px]" style={{ color: 'var(--muted)' }}>
                  {formatDate(event.date)}{event.location ? ` · ${event.location}` : ''} · RSVP open
                </p>
                <span className={`a-badge mt-4 capitalize ${eventTypeColor(event.type)}`}>
                  {event.type || 'Event'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== Announcements ===== */}
      <section className="max-w-6xl mx-auto px-5 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif font-bold text-[28px] sm:text-[34px]">Announcements</h2>
          <Link to="/announcements" className="text-[15px] font-semibold inline-flex items-center gap-1.5" style={{ color: 'var(--brand)' }}>
            View all <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        {loadingAnnouncements ? (
          <div className="text-center py-10 a-muted">Loading announcements…</div>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => {
              const db2 = dateBlock(a.createdAt || a.date);
              return (
                <div key={a.id} className="a-card flex gap-5 items-start">
                  <div
                    className="flex-shrink-0 w-14 rounded-[10px] py-2 text-center"
                    style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
                  >
                    <div className="text-[18px] font-bold leading-none">{db2.day}</div>
                    <div className="text-[11px] font-semibold tracking-wide mt-1">{db2.mon}</div>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[17px]">{a.title}</h3>
                    <p className="text-[15px] mt-1 line-clamp-2" style={{ color: 'var(--muted)' }}>
                      {a.content || a.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ===== Footer ===== */}
      <footer style={{ background: 'var(--side)' }} className="text-white">
        <WeaveBand height={14} />
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <CrownMark size={40} variant="gold" />
              <div>
                <div className="font-bold text-[17px]">ATRC</div>
                <div className="text-[13px] text-[#AAB4E0]">African Traditional Rulers Council</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-[15px] text-[#C9D0EE]">
              <Link to="/events" className="hover:text-white">Events</Link>
              <Link to="/announcements" className="hover:text-white">Announcements</Link>
              <Link to="/auth" className="hover:text-white">Sign in</Link>
              <Link to="/auth" className="hover:text-white">Join the council</Link>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-[#27315F] text-[13px] text-[#8B98C9]">
            © {new Date().getFullYear()} African Traditional Rulers Council
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
