# ATRC — App & UI Description for Redesign

## 1. What the app is

**ATRC (African Traditional Rulers Council)** is a web platform for African traditional
leadership — a digital home for kings, chiefs, elders, and their communities. It combines
community governance tooling with an e-learning institute.

The app serves two audiences:

- **Public visitors** — a marketing/information site (landing page, public events, public announcements).
- **Members** — traditional rulers, delegates, learners, and admins who sign in to a dashboard app covering governance work and education.

### Core feature areas

| Area | What it does |
|---|---|
| **Dashboard** | Role-aware home after login. All roles currently see the same "Traditional Rulers" dashboard; admins are redirected to an admin panel. Stat cards, activity feeds, quick actions. |
| **Community Reports** | Members file reports about their community (issues, projects, updates). Form + list of past reports with status. |
| **Dispute Resolution** | Traditional dispute/case management — file disputes between parties, track status, resolutions. (Exists, currently hidden from nav.) |
| **Live Meetings** | Watch live/recorded council meetings — video embeds (YouTube-style), meeting list with titles/dates. |
| **Local Events** | Events calendar — members create events, others view details, RSVP. Public events page also exists. |
| **Announcements** | Admin-only publishing of official announcements; a public announcements page shows them to visitors. |
| **Reports/Analytics** | Charts (recharts — line/bar/pie) over platform data: users, events, disputes, activity over time ranges. |
| **Project Reports** | Progress tracking for community development projects. (Exists, hidden from nav.) |
| **Digital Library (Books)** | "Leadership Institute" section — EPUB/PDF/DOCX ebook reader with per-book cover art, upload (admin), per-user reading progress and bookmarks, plus **in-reader translation** (select text → translate, or translate whole chapters) and text-to-speech-ish features. |
| **Courses** | E-learning courses with modules/lessons, video content, progress tracking, quizzes, certificates, discussion forum, live Q&A. |
| **DOCX Documents** | Upload/read .docx documents in-app. |
| **AI Assistant** | Floating chat assistant (always-visible bottom-right bubble): text + voice input, contextual suggestions, admin analytics insights. Powered by external AI APIs. |
| **Profile & Settings** | User profile (name, title/role, community, avatar), app settings — theme (dark mode), language (multi-language UI), notifications. |
| **Admin Panel** | Admin-only area: user management, content moderation, publishing announcements, book/course uploads. |

## 2. Users & roles

- **admin** — full access + announcements publishing + admin panel.
- **ruler / chief / elder / delegate** — traditional leaders; the dashboard is branded around them.
- **learner** — default signup role; education-focused member.

Role mainly changes *which nav items and screens are visible* (e.g., Announcements and the admin panel are admin-only).

## 3. Brand identity (current)

- **Name/logo**: "ATRC — Traditional Rulers" with a custom logo; a second logo variant for the "Leadership Institute" sub-brand.
- **Colors** (Tailwind tokens):
  - `primary` = deep blue (#1e3a8a family) — "shield"
  - `secondary`/`gold` = amber/gold (#f59e0b family) — royalty accent
  - `accent` = purple (#a855f7 family) — "crown"
  - Supporting: green/red/blue for statuses, `atc-gradient-text` for headings.
- **Typography**: Inter (sans, UI) + Playfair Display (serif, headings/heritage feel).
- **Motifs**: shield, crown, African heritage; emoji used as icons throughout nav/cards.
- **Dark mode**: class-based toggle (`isDarkMode`), near-everywhere supported — gray-800/900 surfaces, light text.
- **Feel**: functional but plain — Tailwind utility styling, light shadows, generous whitespace; hero sections use full-bleed imagery + white text.

## 4. Information architecture / routes

**Public:**
`/` HomePage · `/events` EventsPage · `/announcements` AnnouncementsPage · `/login` · `/register` · `/auth` (modern combined login/signup) · `/admin-setup` (one-time admin bootstrap)

**Protected app shell** (`/app/*` — sidebar + top navbar on desktop, bottom/mobile nav on mobile):
`/app/dashboard` · `/app/community` (Community Reports) · `/app/meetings` (Live Meetings) · `/app/events` (Local Events) · `/app/announcements` (admin) · `/app/reports` (analytics) · `/app/projects` (hidden) · `/app/disputes` (hidden) · `/app/books` (Digital Library) · `/app/courses` · `/app/docx` · `/app/profile` · `/app/settings` · `/app/admin/panel` (admin, no shell)

## 5. Current UI, screen by screen

### Global layout
- **Desktop**: fixed left sidebar (w-64) — logo at top, vertical nav list with emoji icons, collapsible "Leadership Institute" submenu (Books + Courses), user card pinned at bottom (avatar circle + name + "Traditional Ruler"). Top navbar across the content: page context + user menu/theme/language controls. Content scrolls in the right pane.
- **Mobile**: sidebar replaced by `MobileNav` (bottom nav / hamburger); navbar hidden.
- **Active nav item**: light-blue tinted pill (`bg-primary-100 text-primary-700`, dark: `bg-primary-900`).
- Toasts: react-hot-toast, top-right, colored by type.

### Public landing page (`/`)
Long-scroll single page (~49KB source): sticky translucent top nav (logo + links + "Sign In" button) → full-viewport **hero** (banner image, big serif headline, two CTAs — filled primary + outlined) → stats strip (animated counters) → **features grid** (icon + title + blurb cards) → "how it works"/benefit sections alternating white/gray-50 → **three CTA cards** (blue/green/purple) → events preview cards with type badges + "View All" → announcements preview → final CTA band → footer.

### Auth screens
- `/auth` (`ModernAuth`): modern split/tabbed sign-in vs sign-up; sign-up collects name, email, phone, community, title, role selection, password.
- `/login`, `/register`: simpler legacy forms — centered card, email/password, role dropdown, link to the other page.

### Dashboard (`/app/dashboard`)
`TraditionalRulersDashboard` (~60KB): greeting header; grid of **stat cards** (colored icon square + big number + label — events, meetings, reports, etc.); sections for recent activity/lists; quick-action buttons to feature pages. Admin users redirect to the admin panel instead.

### Feature pages (shared pattern)
Community Report, Disputes, Events, Announcements, Reports, Projects all follow a consistent page recipe:
- **Header**: page title + subtitle, right-aligned primary action button ("New Report", "Create Event").
- **Filters/tabs**: status filter chips or a `<select>`, sometimes search.
- **List**: either a card grid or a table-like list; each item = card with colored status badge (open/closed/pending/approved), key fields, date, actions (view/edit/delete/approve).
- **Empty state**: centered "No X yet" with CTA.
- **Forms**: modal or dedicated panel — labeled inputs, selects, date pickers, textarea, submit/cancel; validation via toasts.
- **Reports page**: filter chips for time range + recharts line/bar/pie charts in cards.

### Digital Library (`/app/books`)
Book grid (cover thumbnails, title, author) + upload modal (admin) → **in-app reader**: paged EPUB/EPUB-ish reader with prev/next, progress bar, font-size controls; **selection → translate** popover, whole-chapter translation panel with progress bar, bookmarks sidebar, highlights.

### Courses (`/app/courses`)
Course cards → course detail with modules/lessons list → lesson player (video embed + text), progress tracker ring, quiz modal (multiple-choice, scored), discussion thread, bookmarking.

### Live Meetings (`/app/meetings`)
List of meetings with thumbnails; viewer shows an embedded video player + meeting metadata + live/recorded badge.

### AI Assistant (global)
Floating circular button bottom-right on every screen → expands to a chat panel: message list, input + send, mic button for voice, suggestion chips; admin variant includes analytics insights.

### Profile / Settings
Profile: avatar, editable fields (name, title, community, contact), save.
Settings: toggles — dark mode, language selector, notification prefs.

## 6. Components worth preserving as concepts

- Layout shell: Sidebar / MobileNav / Navbar
- Stat cards, status badges, empty states, filter chips
- Book/EPUB reader + translation overlay
- Course player + quiz + progress ring
- Video embed player
- Upload modals (book/course), toast system, loading skeletons
- Floating AI assistant
- Dark-mode support everywhere (class-based)

## 7. Tech constraints (for the redesign)

- React 18 + Create React App, React Router 6, **Tailwind CSS 3.3** (keep Tailwind — whole codebase uses it), dark mode via `class`.
- Icons are currently **emoji + a couple of custom logo components**; replacing emoji with an icon set (e.g., lucide/heroicons) would be the single biggest visual upgrade.
- Fonts: Inter + Playfair Display loaded already.
- PWA — mobile layouts matter (bottom nav pattern, touch targets).
- Multi-language UI exists (language context + selector) — labels should stay short/flexible.
- Keep the same routes and data fields; this is a visual/interaction redesign, not an architecture change.
