# Community Events Board

A responsive full-stack web application where administrators manage community events and visitors can discover events, save reminders, personalise their event feed by selecting favourite categories, and customise how event cards look.

---

## Table of Contents

1. [Live Demo](#live-demo)
2. [Admin Login](#admin-login)
3. [Feature Scope](#feature-scope)
4. [Technology Stack](#technology-stack)
5. [Prerequisites](#prerequisites)
6. [Local Setup](#local-setup)
7. [Environment Variables](#environment-variables)
8. [MongoDB Atlas Setup](#mongodb-atlas-setup)
9. [Development Commands](#development-commands)
10. [Admin Provisioning](#admin-provisioning)
11. [API Documentation](#api-documentation)
12. [Database Design](#database-design)
13. [Security Notes](#security-notes)
14. [Event URL Format](#event-url-format)
15. [Admin Pagination](#admin-pagination)
16. [Event Date Validation](#event-date-validation)
17. [Expired Event Deactivation](#expired-event-deactivation)
18. [Card Designer](#card-designer)
19. [Testing Instructions](#testing-instructions)
20. [Assignment Questions](#assignment-questions)
21. [AI Usage Disclosure](#ai-usage-disclosure)
22. [Known Limitations and Remaining Work](#known-limitations-and-remaining-work)
23. [Assignment Submission Checklist](#assignment-submission-checklist)

---

## Live Demo

> **Deployment pending.** The live URL will be updated here once the application is deployed to Vercel.

---

## Admin Login

The admin account is provisioned via `npm run seed-admin` using environment variables — see [Admin Provisioning](#admin-provisioning).

**How to share credentials with an evaluator:**
- Do **not** commit credentials to the repository.
- Share the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values securely (e.g. via an encrypted message, a private shared document, or Vercel environment variable access).
- The evaluator runs `npm run seed-admin` locally with those values to provision the admin account.
- Navigate to `/login` in the browser and log in with the admin credentials.
- After login, the header automatically shows admin links: **Dashboard** and **Manage Events**.

---

## Feature Scope

| Feature | Status |
|---|---|
| Public event listing with category, city, and keyword filters | ✅ Implemented |
| URL-synced pagination (public) | ✅ Implemented |
| Event detail view with readable slug URLs | ✅ Implemented |
| User registration (`POST /api/auth/signup`) | ✅ Implemented |
| User login (`POST /api/auth/login`) | ✅ Implemented |
| JWT HTTP-only cookie auth | ✅ Implemented |
| Current user (`GET /api/auth/me`) | ✅ Implemented |
| Logout (`POST /api/auth/logout`) | ✅ Implemented |
| Admin provisioning (`npm run seed-admin`) | ✅ Implemented |
| Admin identity test (`GET /api/admin/me`) | ✅ Implemented |
| Admin event listing — 10 per page with pagination UI | ✅ Implemented |
| Admin event creation with past-date validation | ✅ Implemented |
| Admin event editing (`PATCH /api/admin/events/:id`) | ✅ Implemented |
| Admin event activation/deactivation | ✅ Implemented |
| Expired-event automatic deactivation | ✅ Implemented |
| Favourite category selection (API) | ✅ Implemented |
| Personalised My Feed (API) | ✅ Implemented |
| Persistent reminders — database-backed (API) | ✅ Implemented |
| Persistent card designer — database-backed (API) | ✅ Implemented |
| Claymorphism design system (tokens, shared components) | ✅ Implemented |
| Landing page (`/`) with featured events | ✅ Implemented |
| Public events page (`/events`) with filters and pagination | ✅ Implemented |
| Responsive layout (mobile and desktop) | ✅ Implemented |
| Login page UI (`/login`) | ✅ Implemented |
| Signup page UI (`/signup`) | ✅ Implemented |
| Authentication-aware navigation (SiteHeader) | ✅ Implemented |
| Edge middleware for route protection | ✅ Implemented |
| Admin dashboard UI (`/admin`) with paginated table | ✅ Implemented |
| Admin create event UI (`/admin/events/new`) | ✅ Implemented |
| Admin edit event UI (`/admin/events/[id]/edit`) | ✅ Implemented |
| Favourite categories UI (`/favorites`) | ✅ Implemented |
| My Feed UI (`/feed`) | ✅ Implemented |
| My Reminders UI (`/reminders`) | ✅ Implemented |
| Card Designer UI — "Design your card" on event detail | ✅ Implemented |
| Reminder button on event detail page | ✅ Implemented |

> **Event seeding note:** The sample-event seed script has been removed. The public events listing will be empty until an administrator creates events via the admin dashboard (`/admin`) or the API (`POST /api/admin/events`).

---

## Technology Stack

- **Framework**: Next.js 16.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + CSS custom properties (Claymorphism tokens)
- **Database**: MongoDB Atlas (cloud-hosted)
- **ODM**: Mongoose 9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) in `HttpOnly` cookies
- **Password hashing**: `bcryptjs`
- **Validation**: Zod
- **Icons**: Lucide React
- **Build tool**: Turbopack (via Next.js)

---

## Prerequisites

- **Node.js** 20 or later
- **npm** 10 or later
- A **MongoDB Atlas** account (free tier is sufficient)
- Git

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/MehulGS/Event-Management
cd Event-Management

# 2. Install dependencies
npm install

# 3. Create your local environment file
cp .env.example .env.local

# 4. Fill in the required values in .env.local (see Environment Variables below)

# 5. Provision the admin account
npm run seed-admin

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The public events listing will be empty until events are created via the admin dashboard at `/admin` or via `POST /api/admin/events`.

---

## Environment Variables

Copy `.env.example` to `.env.local` and provide values for each variable. **Never commit `.env.local`.**

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string (include database name) |
| `JWT_SECRET` | ✅ | Long random string used to sign JWTs (32+ chars) |
| `JWT_EXPIRES_IN` | ✅ | Token lifespan, e.g. `7d` |
| `ADMIN_EMAIL` | ✅ | Email address of the seeded admin account |
| `ADMIN_PASSWORD` | ✅ | Password for the seeded admin account |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL of the running app (e.g. `http://localhost:3000`) |

> `NEXT_PUBLIC_APP_URL` is the only variable exposed to the browser. All others remain server-side only.

---

## MongoDB Atlas Setup

1. Create a free account at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new **free-tier cluster** (M0).
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, add your development IP address (or `0.0.0.0/0` for development).
5. Click **Connect → Connect your application** and copy the connection string.
6. Replace `<password>` with your database user password and append the database name: `.../community-events?retryWrites=true&w=majority`
7. Paste the full string as `MONGODB_URI` in `.env.local`.

---

## Development Commands

```bash
npm run dev        # Start development server with Turbopack (http://localhost:3000)
npm run build      # Production build
npm run start      # Start the production server (requires a prior build)
npm run lint       # Run ESLint
npm run seed-admin # Provision the admin account (idempotent, safe to re-run)
```

> **No sample-event seeder.** There is no `npm run seed` command. The public listing is populated only through the admin dashboard or the admin API.

---

## Admin Provisioning

The admin account is created by running `npm run seed-admin`, which reads credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment file.

```bash
npm run seed-admin
```

Once provisioned, navigate to `/login` and sign in with the admin credentials. The header will automatically show **Dashboard** links.

**Changing the admin password:** Update `ADMIN_PASSWORD` in your environment and re-run `npm run seed-admin`.

---

## API Documentation

See [`docs/API.md`](docs/API.md) for the full REST API contract.

**Base path**: `/api`

| Area | Endpoints | Notes |
|---|---|---|
| Health | `GET /api/health` | |
| Auth | `POST /api/auth/signup` | |
| Auth | `POST /api/auth/login` | |
| Auth | `GET /api/auth/me` | |
| Auth | `POST /api/auth/logout` | |
| Admin identity | `GET /api/admin/me` | |
| Admin events | `GET /api/admin/events?page=N&limit=10` | Paginated, max 10 per page |
| Admin events | `POST /api/admin/events` | date must be in the future |
| Admin events | `GET /api/admin/events/:id` | Single event for edit form |
| Admin events | `PATCH /api/admin/events/:id` | date must be in the future if updated |
| Admin events | `PATCH /api/admin/events/:id/status` | Activate / deactivate |
| Public events | `GET /api/events` | Active + upcoming only |
| Public events | `GET /api/events/:id` | Active + upcoming only |
| Favourites | `GET/PUT /api/favourites` | |
| My Feed | `GET /api/feed` | Auth required |
| Reminders | `GET/POST /api/reminders` | |
| Reminders | `DELETE /api/reminders/:eventId` | |
| Card design | `GET/PUT /api/events/:id/card-design` | |

---

## Database Design

See [`docs/DATABASE.md`](docs/DATABASE.md) for full schema definitions.

Collections: `events`, `users`, `reminders`, `carddesigns`.

---

## Security Notes

- Passwords are hashed with `bcryptjs` (saltRounds = 12). Plain-text passwords are never stored or logged.
- JWTs are signed with a secret stored only in environment variables.
- Tokens are delivered in `HttpOnly`, `SameSite=Strict` cookies, preventing JavaScript access.
- All API inputs are validated with Zod before reaching the database.
- The `role` field is never accepted from the client — signup always assigns `"user"` server-side.
- Admin is provisioned via `npm run seed-admin` only; no public endpoint can create an admin.
- All state-changing auth endpoints perform an `Origin` header check as a CSRF defence.
- Admin-sensitive endpoints re-read the user's role from the database rather than trusting the JWT claim.
- Edge middleware redirects unauthenticated requests away from `/feed`, `/favorites`, `/reminders`, and `/admin`.
- The `.env.local` file is git-ignored. `.env.example` contains no real credentials.

---

## Event URL Format

Event detail URLs use a human-readable slug rather than a bare database ID:

```
/events/coimbatore-jazz-evening-6acd20dbf9be593f89b0e8dd
```

**Format:** `/events/<title-slug>-<24-char-objectid>`

- The slug is generated from the event title (lowercase, non-alphanumeric → hyphen, max 60 chars).
- The 24-character MongoDB ObjectId is always appended as a suffix for reliable database lookup.
- If an event title changes, old links continue to work — the server extracts the ID from the suffix and issues a **301 redirect** to the canonical URL.
- Bare ObjectId URLs (`/events/<id>`) are also accepted and redirect to the canonical slug URL.
- Invalid or non-existent IDs render the existing friendly not-found page.
- The raw ObjectId is never displayed as a heading, label, or button text.

---

## Admin Pagination

The admin dashboard (`/admin`) shows **10 events per page**, fetched from `GET /api/admin/events?page=N&limit=10`.

- Previous / Next buttons and numbered page buttons are displayed below the table.
- Previous is disabled on page 1; Next is disabled on the last page.
- The current page number and total event count are shown.
- After an activate/deactivate action, the current page is refreshed automatically.
- If a page becomes empty after a change, the dashboard snaps back to page 1.
- All events (active and inactive, past and future) are shown in the admin table.

---

## Event Date Validation

When creating or editing an event, the date and time must be **in the future**.

- **Client side**: The `datetime-local` input has a `min` attribute set to the current moment. A JavaScript check also rejects past dates before the form is submitted, with a clear error message.
- **Server side**: The Zod schema for `POST /api/admin/events` and `PATCH /api/admin/events/:id` rejects any date that is not strictly in the future (`.refine(v => new Date(v) > new Date())`).
- **Timezone**: All comparisons use UTC (`new Date()`). The `datetime-local` input is interpreted in the browser's local timezone by the browser, then submitted as an ISO 8601 string which MongoDB stores in UTC.
- Editing an existing event's other fields (title, description, status, etc.) does not require changing the date. Only a newly submitted date value is validated against the future constraint.

---

## Expired Event Deactivation

Events whose scheduled date has passed are automatically marked `isActive: false` by the server.

### Mechanism

`src/lib/expireEvents.ts` exports `runExpiry()`, which runs:

```js
Event.updateMany(
  { isActive: true, date: { $lte: now } },
  { $set: { isActive: false } }
)
```

This is called at the start of every:
- `GET /api/admin/events` (dashboard load)
- `PATCH /api/admin/events/:id/status` (status toggle)

### Effect on public APIs

Public APIs (`GET /api/events`, `GET /api/feed`) already filter `date: { $gt: now }` independently, so expired events are never served to the public regardless of whether `runExpiry()` has run.

### Scheduler limitation

This project runs on Vercel (serverless). A reliable scheduled cron job requires **Vercel Cron Jobs** (a paid feature not configured here). Therefore, expiry is triggered opportunistically on admin requests. The public API's own date filter guarantees correctness for end users at all times.

### Performance

The `{ isActive: 1, date: 1 }` compound index on the `events` collection makes the expiry filter a fast index range scan. When no events have expired, `updateMany` matches zero documents and returns immediately. A per-process throttle (60 seconds) prevents redundant updates in warm serverless instances.

---

## Card Designer

The **"Design your card"** section appears on every public event detail page below the main event card.

### Controls
- **Three background themes** (5 available: Pastel Cloud, Sunset Peach, Mint Fresh, Sky Blue, Lilac Dream).
- **Five stickers** (🎵 🌟 🎉 🏆 🍕). Click to add; click again or select another when at the limit to swap.
- Maximum **3 stickers** at a time. The UI shows how many slots remain.
- A "You have unsaved changes" indicator and a `beforeunload` warning prevent accidental data loss.

### Live preview
The preview panel updates **immediately** on every theme or sticker change. It displays:
- The selected gradient background
- The event category, title, city, and date (real event data)
- The selected stickers
- A theme-coloured accent strip and theme label

### Persistence
- Designs are saved via `PUT /api/events/:id/card-design` (requires authentication).
- On revisiting the event page, the saved design is loaded from `GET /api/events/:id/card-design` and restored automatically.
- If no design has been saved, the preview shows the default (Pastel Cloud, no stickers).
- Designs are stored per user per event in the `carddesigns` collection; one user's design does not affect another user's view.
- Unauthenticated visitors see a sign-up CTA; the designer controls are not shown to guests.

---

## Testing Instructions

### Evaluator flow

1. Copy `.env.example` to `.env.local` and fill in all variables.
2. Run `npm run seed-admin` to provision the admin account.
3. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

### Pages to verify

| Page | Path | Notes |
|---|---|---|
| Landing | `/` | Featured events with slug URLs |
| Events listing | `/events` | Filters, pagination, slug URLs |
| Event detail | `/events/<slug>-<id>` | Reminder button + "Design your card" |
| Login | `/login` | |
| Signup | `/signup` | |
| My Feed | `/feed` | Requires login; upcoming events from saved categories |
| Favourites | `/favorites` | |
| My Reminders | `/reminders` | |
| Admin Dashboard | `/admin` | 10 per page, pagination controls, status toggle |
| Create Event | `/admin/events/new` | Past dates rejected on client and server |
| Edit Event | `/admin/events/:id/edit` | |

### Verification checks

```bash
npx tsc --noEmit   # TypeScript — must show 0 errors
npm run lint       # ESLint — must show 0 errors
npm run build      # Production build — must succeed
```

**Verified results (as of final build):**
- `npx tsc --noEmit`: 0 errors
- `npm run lint`: 0 errors, 0 warnings
- `npm run build`: 26/26 pages generated successfully

**Manual checks required (live MongoDB not available in CI):**
- Admin list returns exactly 10 events per page
- Next/Previous pagination controls work correctly
- Creating an event with a past date fails on both client and server with a clear message
- Expired events are excluded from `/events` and `/feed`
- Expired active records become inactive after the next admin dashboard visit
- Event links show readable slugs (e.g. `/events/summer-jazz-night-abc123...`)
- Event detail pages resolve correctly for canonical and bare-ID URLs
- Card preview updates immediately with theme/sticker changes
- Saved designs are restored after page refresh
- Three-sticker limit is enforced in the UI
- Existing authentication and admin restrictions remain intact

---

## Assignment Questions

### 1. How is the database structured?

Four MongoDB collections: `events`, `users`, `reminders`, `carddesigns`. Reminders are a separate collection to avoid unbounded array growth. Favourite categories are an array on the user document (only 5 possible values). Card designs have a compound unique index on `{user, event}`.

### 2. How does the combined filter query work?

The public listing builds an AND filter: `isActive: true`, `date > now`, optional `category` (exact match), `city` (case-insensitive regex), `search` (MongoDB text index). Results are always sorted by `date` ascending.

### 3. How are passwords stored and how are admin pages protected?

Passwords use `bcryptjs` saltRounds=12. Admin is provisioned via `npm run seed-admin` only. Each admin API route re-reads the role from the database. The UI enforces a client-side role check in the admin layout, backed by the Edge middleware cookie check.

---

## AI Usage Disclosure

AI tools were used to assist with documentation drafting, project planning, and code generation. See [`docs/AI-USAGE.md`](docs/AI-USAGE.md) for the full policy and usage log.

All code generated with AI assistance is reviewed and understood before being committed.

---

## Known Limitations and Remaining Work

- **Middleware deprecation**: Next.js 16 deprecates `middleware.ts` in favour of `proxy.ts`. The migration can be applied via `npx @next/codemod@canary middleware-to-proxy .`. For this assignment the current middleware functions correctly.
- **Scheduled expiry**: No automated cron job is configured (requires a paid Vercel feature). Expiry runs opportunistically on admin requests. Public APIs are always correct regardless.
- JWTs are stateless; no server-side revocation mechanism.
- No rate limiting is implemented; add before production deployment.
- Image upload is not supported; `imageUrl` accepts an external URL string only.
- Full WCAG compliance requires manual testing with assistive technologies.
- **No sample-event seeder**: The public listing is empty until events are created via the admin dashboard. There is no `npm run seed` command.

---

## Assignment Submission Checklist

- [x] MongoDB Atlas connected and models implemented
- [x] Admin provisioning via `npm run seed-admin` (no sample-event seeder)
- [x] Public event listing API with filters and pagination
- [x] User registration and login (API + UI)
- [x] All personalization APIs implemented (Favourites, Feed, Reminders, Card Design)
- [x] Claymorphism design system (CSS tokens, shared components)
- [x] Landing page with featured events
- [x] Public events page with filters, pagination, loading/empty/error states
- [x] Responsive design (mobile and desktop)
- [x] Login and Signup page UIs
- [x] Authentication-aware navigation header
- [x] Edge middleware for route protection
- [x] Admin dashboard — 10 events per page with working pagination
- [x] Admin create/edit event UIs
- [x] Past-date validation (client + server)
- [x] Expired-event automatic deactivation (`runExpiry` utility)
- [x] Readable slug-based event URLs (`/events/<slug>-<id>`)
- [x] Canonical redirect for stale/bare-ID URLs
- [x] "Design your card" section on event detail page
- [x] Card Designer live preview with real event data
- [x] Card Design persistence and restore-on-reload
- [x] Favourite categories UI
- [x] My Feed UI
- [x] My Reminders UI
- [x] Indian currency (INR) formatting throughout
- [x] Friendly date formatting throughout
- [x] Loading, empty, and error states on all data views
- [x] TypeScript: 0 errors
- [x] ESLint: 0 errors
- [x] Production build: successful (26/26 pages)
- [x] No real credentials in repository
- [x] docs/AI-USAGE.md usage log completed
- [ ] Deployment URL filled in
- [ ] Admin credentials shared securely with evaluator
- [ ] Submission video recorded and uploaded
- [ ] Repository link submitted
