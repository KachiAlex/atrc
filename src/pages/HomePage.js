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
        { id: 2, title: 'Course enrolment is open', content: 'New Leadership Institute intake.', createdAt: '2024-10-09' },
        { id: 3, title: 'Updated guidance for community reports', content: 'What to include when you file.', createdAt: '2024-10-02' }
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

  const eventBadgeClass = (type) => {
    const t = (type || '').toLowerCase();
    if (t === 'community' || t === 'dialogue') return 'a-badge-ok';
    if (t === 'culture' || t === 'ceremony') return 'a-badge-warn';
    return 'a-badge-info';
  };

  const goldDark = '#8A6210';

  return (
    <div className="min-h-screen text-[17px] leading-[1.55]" style={{ background: 'var(--bg)', color: 'var(--ink)' }}>

      {/* ===== Top nav ===== */}
      <nav className="border-b" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" aria-label="ATRC home" className="flex items-center gap-3">
            <CrownMark size={40} variant="dark" />
            <div className="leading-[1.1]">
              <div className="font-display font-bold text-[24px]" style={{ color: 'var(--brand)' }}>ATRC</div>
              <div className="text-[11px] tracking-[0.09em] uppercase" style={{ color: 'var(--muted)' }}>African Traditional Rulers Council</div>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[16px] font-medium">
            <a href="#platform" className="hover:opacity-70">Platform</a>
            <a href="#institute" className="hover:opacity-70">Leadership Institute</a>
            <Link to="/events" className="hover:opacity-70">Events</Link>
            <Link to="/announcements" className="hover:opacity-70">Announcements</Link>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-11 h-11 inline-flex items-center justify-center rounded-[10px] border"
              style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--ink)' }}
              aria-label="Toggle theme"
            >
              <Icon name={isDarkMode ? 'sun' : 'moon'} size={20} />
            </button>
            <Link
              to="/auth"
              className="hidden sm:inline-flex min-h-[44px] items-center px-5 rounded-[10px] border-[1.5px] font-semibold transition-colors"
              style={{ borderColor: 'var(--brand)', color: 'var(--brand)' }}
            >
              Sign in
            </Link>
            <Link to="/auth" className="a-btn-primary min-h-[44px] px-5">Join</Link>
          </div>
        </div>
      </nav>

      {/* ===== Hero ===== */}
      <section style={{ background: '#0F1A44' }} className="text-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-[88px] pb-24 flex flex-wrap items-center gap-14">
          <div className="flex-[1_1_480px] min-w-0">
            <div className="inline-flex items-center gap-2.5 text-[13px] font-semibold tracking-[0.14em] uppercase text-[#E3B04B]">
              <span className="w-7 h-0.5 bg-[#E3B04B] inline-block" />
              The digital home of traditional leadership
            </div>
            <h1 className="mt-5 font-display font-bold leading-[1.08] tracking-[-0.01em] text-[42px] sm:text-[54px] lg:text-[62px]">
              Where the council gathers, wherever its people are.
            </h1>
            <p className="mt-6 text-[20px] leading-[1.55] text-[#C9D0EE] max-w-[540px]">
              Hold meetings, settle disputes, record community progress and learn together. One platform for kings, chiefs, elders and the communities they serve.
            </p>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <Link
                to="/auth"
                className="min-h-[52px] inline-flex items-center gap-2.5 px-7 rounded-[12px] font-bold text-[17px] bg-[#E3B04B] text-[#14182B] hover:bg-[#EDBE5E] transition-colors"
              >
                Join the council
                <Icon name="arrowRight" size={20} />
              </Link>
              <Link
                to="/events"
                className="min-h-[52px] inline-flex items-center px-7 rounded-[12px] border-[1.5px] border-[#8A97CF] text-white font-semibold text-[17px] hover:bg-white/10 transition-colors"
              >
                See public events
              </Link>
            </div>
          </div>

          {/* Preview cards */}
          <div className="hidden lg:flex flex-[1_1_420px] min-w-0 flex-col gap-4">
            <div
              className="rounded-[20px] p-[22px] text-[#14182B]"
              style={{ background: '#FFFCF6', boxShadow: '0 24px 48px rgba(5,10,35,.35)' }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-semibold tracking-[0.08em] uppercase text-[#5B6075]">Live meeting</span>
                <span className="inline-flex items-center gap-1.5 bg-[#9B2C2C] text-white text-[12px] font-bold tracking-[0.08em] px-2.5 py-1 rounded-full">
                  <span className="w-[7px] h-[7px] rounded-full bg-white inline-block" />
                  LIVE
                </span>
              </div>
              <div className="mt-3.5 h-[170px] rounded-[12px] bg-[#17275F] flex items-center justify-center">
                <span className="w-14 h-14 rounded-full bg-[#E3B04B] text-[#14182B] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z"/></svg>
                </span>
              </div>
              <div className="mt-3.5 font-display font-semibold text-[21px]">Quarterly Council Assembly</div>
              <div className="mt-0.5 text-[15px] text-[#5B6075]">Sample meeting card</div>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[180px] bg-[#16245A] border border-[#2A3A78] rounded-[16px] px-[18px] py-4">
                <div className="text-[13px] text-[#E3B04B] font-semibold tracking-[0.06em] uppercase">Report filed</div>
                <div className="mt-1 text-[16px] text-white font-medium">Water point repair, Ward 3</div>
                <div className="mt-0.5 text-[14px] text-[#AAB4E0]">Status: under review</div>
              </div>
              <div className="flex-1 min-w-[180px] bg-[#16245A] border border-[#2A3A78] rounded-[16px] px-[18px] py-4">
                <div className="text-[13px] text-[#E3B04B] font-semibold tracking-[0.06em] uppercase">Announcement</div>
                <div className="mt-1 text-[16px] text-white font-medium">Assembly agenda published</div>
                <div className="mt-0.5 text-[14px] text-[#AAB4E0]">From the council secretariat</div>
              </div>
            </div>
          </div>
        </div>
        <WeaveBand height={16} />
      </section>

      {/* ===== Feature chips ===== */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-14">
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
      <section id="platform" className="max-w-6xl mx-auto px-6 lg:px-8 pb-24">
        <div className="max-w-[680px]">
          <div className="text-[13px] font-semibold tracking-[0.14em] uppercase" style={{ color: 'var(--gold)' }}>The platform</div>
          <h2 className="mt-3 font-display font-bold text-[32px] sm:text-[42px] leading-[1.15]" style={{ color: 'var(--brand)' }}>
            The work of governance and the work of learning, in one place
          </h2>
          <p className="mt-4 text-[19px]" style={{ color: 'var(--muted)' }}>
            Every tool follows the way councils already operate: record, deliberate, decide, share.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="a-card !p-7">
              <div
                className="w-12 h-12 rounded-[12px] flex items-center justify-center"
                style={{ background: 'var(--brand-soft)', color: 'var(--brand)' }}
              >
                <Icon name={f.icon} size={24} />
              </div>
              <h3 className="font-display font-semibold text-[23px] mt-[18px]">{f.title}</h3>
              <p className="text-[16.5px] mt-2" style={{ color: 'var(--muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Leadership Institute ===== */}
      <section id="institute" style={{ background: 'var(--surface2)' }} className="border-y">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-[13px] font-semibold tracking-[0.14em] uppercase" style={{ color: 'var(--gold)' }}>Leadership Institute</div>
            <h2 className="mt-3 font-display font-bold text-[32px] sm:text-[42px] leading-[1.15]" style={{ color: 'var(--brand)' }}>
              Read, translate and learn at your own pace
            </h2>
            <ul className="mt-6 space-y-4 text-[17px]">
              {[
                'Pick up where you left off. Progress and bookmarks are saved to your account.',
                'Select any passage to translate it, or translate a whole chapter.',
                'Courses with lessons, quizzes, discussion and certificates.',
              ].map((li) => (
                <li key={li} className="flex items-start gap-3">
                  <Icon name="check" size={22} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                  {li}
                </li>
              ))}
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

      {/* ===== Events + Announcements (one section, 3:2) ===== */}
      <section id="events" className="max-w-6xl mx-auto px-6 lg:px-8 py-24">
        <div className="flex flex-wrap gap-14">

          {/* Events */}
          <div className="flex-[3_1_520px] min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display font-bold text-[32px]" style={{ color: 'var(--brand)' }}>Upcoming events</h2>
              <Link to="/events" className="font-semibold whitespace-nowrap" style={{ color: goldDark }}>View all</Link>
            </div>
            {loadingEvents ? (
              <div className="text-center py-10" style={{ color: 'var(--muted)' }}>Loading events…</div>
            ) : (
              <div className="mt-6 flex flex-col gap-4">
                {events.map((event) => {
                  const db2 = dateBlock(event.date);
                  return (
                    <div key={event.id} className="flex gap-5 items-center a-card !px-[22px] !py-[18px]">
                      <div className="flex-shrink-0 w-16 text-center rounded-[12px] py-2" style={{ background: 'var(--brand)' }}>
                        <div className="text-[12px] tracking-[0.1em] font-semibold" style={{ color: 'var(--gold)' }}>{db2.mon}</div>
                        <div className="font-display font-bold text-[28px] leading-[1.1] text-white">{db2.day}</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-display font-semibold text-[21px] truncate">{event.title}</div>
                        <div className="text-[15px]" style={{ color: 'var(--muted)' }}>
                          {event.location ? `${event.location} · ` : ''}Public event · RSVP open
                        </div>
                      </div>
                      <span className={`a-badge flex-shrink-0 capitalize ${eventBadgeClass(event.type)}`}>
                        {event.type || 'Event'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Announcements */}
          <div className="flex-[2_1_340px] min-w-0">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display font-bold text-[32px]" style={{ color: 'var(--brand)' }}>Announcements</h2>
              <Link to="/announcements" className="font-semibold whitespace-nowrap" style={{ color: goldDark }}>View all</Link>
            </div>
            {loadingAnnouncements ? (
              <div className="text-center py-10" style={{ color: 'var(--muted)' }}>Loading announcements…</div>
            ) : (
              <div className="mt-6 a-card !px-6 !py-1.5">
                {announcements.map((a, i) => (
                  <div
                    key={a.id}
                    className="py-[18px]"
                    style={i < announcements.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
                  >
                    <div className="text-[13px] font-semibold tracking-[0.06em] uppercase" style={{ color: goldDark }}>
                      {formatDate(a.createdAt || a.date)}
                    </div>
                    <div className="mt-0.5 font-semibold text-[17.5px]">{a.title}</div>
                    <div className="text-[15px]" style={{ color: 'var(--muted)' }}>
                      {a.content || a.description}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section style={{ background: 'var(--hero)' }} className="text-white">
        <div className="max-w-[860px] mx-auto px-6 lg:px-8 py-[88px] text-center">
          <h2 className="font-display font-bold text-[34px] sm:text-[42px] leading-[1.15]">
            Bring your community onto one platform
          </h2>
          <p className="mt-4 text-[19px] text-[#C9D0EE] max-w-[600px] mx-auto">
            Create an account to file reports, join meetings and start learning. Existing members can sign in.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5 justify-center">
            <Link
              to="/auth"
              className="min-h-[52px] inline-flex items-center px-[30px] rounded-[12px] font-bold bg-[#E3B04B] text-[#14182B] hover:bg-[#EDBE5E] transition-colors"
            >
              Create your account
            </Link>
            <Link
              to="/auth"
              className="min-h-[52px] inline-flex items-center px-[30px] rounded-[12px] border-[1.5px] border-[#8A97CF] text-white font-semibold hover:bg-white/10 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer style={{ background: '#0A1233' }} className="text-[#AAB4E0]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-14 pb-10 flex flex-wrap gap-10 justify-between">
          <div className="flex-[1_1_320px] max-w-[420px]">
            <div className="font-display font-bold text-[26px] text-white">ATRC</div>
            <div className="mt-1 text-[13px] tracking-[0.09em] uppercase text-[#E3B04B]">African Traditional Rulers Council</div>
            <p className="mt-3.5 text-[15.5px]">
              A digital platform for traditional governance, dispute resolution and cultural preservation.
            </p>
          </div>
          <div className="flex flex-wrap gap-14">
            <div className="flex flex-col gap-2.5 text-[15.5px]">
              <span className="text-white font-semibold">Platform</span>
              <a href="#platform" className="hover:text-white">Features</a>
              <a href="#institute" className="hover:text-white">Leadership Institute</a>
            </div>
            <div className="flex flex-col gap-2.5 text-[15.5px]">
              <span className="text-white font-semibold">Public</span>
              <Link to="/events" className="hover:text-white">Events</Link>
              <Link to="/announcements" className="hover:text-white">Announcements</Link>
            </div>
            <div className="flex flex-col gap-2.5 text-[15.5px]">
              <span className="text-white font-semibold">Members</span>
              <Link to="/auth" className="hover:text-white">Sign in</Link>
              <Link to="/auth" className="hover:text-white">Join</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 pb-8 text-[14px] text-[#8C97C9]">
          © {new Date().getFullYear()} African Traditional Rulers Council
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
