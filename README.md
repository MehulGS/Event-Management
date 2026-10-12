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
14. [Testing Instructions](#testing-instructions)
15. [Assignment Questions](#assignment-questions)
16. [AI Usage Disclosure](#ai-usage-disclosure)
17. [Known Limitations and Remaining Work](#known-limitations-and-remaining-work)
18. [Assignment Submission Checklist](#assignment-submission-checklist)

---

## Live Demo

> **Deployment pending.** The live URL will be updated here once the application is deployed to Vercel.
>
> Placeholder: `https://community-events-board.vercel.app` *(not yet active)*

---

## Admin Login

The admin account is provisioned via `npm run seed-admin` using environment variables — see [Admin Provisioning](#admin-provisioning).

**How to share credentials with an evaluator:**
- Do **not** commit credentials to the repository.
- Share the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values securely (e.g. via an encrypted message, a private shared document, or Vercel environment variable access).
- The evaluator runs `npm run seed-admin` locally with those values to provision the admin account.
- Then navigate to `/login` in the browser and log in with the admin credentials.
- After login, the header automatically shows admin links: **Dashboard** and **Manage Events**.

---

## Feature Scope

| Feature | Status |
|---|---|
| Public event listing with category, city, and keyword filters | ✅ Implemented |
| URL-synced pagination | ✅ Implemented |
| Event detail view | ✅ Implemented |
| User registration (`POST /api/auth/signup`) | ✅ Implemented |
| User login (`POST /api/auth/login`) | ✅ Implemented |
| JWT HTTP-only cookie auth | ✅ Implemented |
| Current user (`GET /api/auth/me`) | ✅ Implemented |
| Logout (`POST /api/auth/logout`) | ✅ Implemented |
| Admin provisioning (`npm run seed-admin`) | ✅ Implemented |
| Admin identity test (`GET /api/admin/me`) | ✅ Implemented |
| Admin event listing (`GET /api/admin/events`) | ✅ Implemented |
| Admin event creation (`POST /api/admin/events`) | ✅ Implemented |
| Admin event editing (`PATCH /api/admin/events/:id`) | ✅ Implemented |
| Admin event activation/deactivation | ✅ Implemented |
| Favourite category selection (API) | ✅ Implemented |
| Personalised My Feed (API) | ✅ Implemented |
| Persistent reminders — database-backed (API) | ✅ Implemented |
| Persistent card designer — database-backed (API) | ✅ Implemented |
| Claymorphism design system (tokens, shared components) | ✅ Implemented |
| Landing page (`/`) with featured events | ✅ Implemented |
| Public events page (`/events`) with filters and pagination | ✅ Implemented |
| Responsive layout (mobile and desktop) | ✅ Implemented |
| **Login page UI (`/login`)** | ✅ Implemented |
| **Signup page UI (`/signup`)** | ✅ Implemented |
| **Authentication-aware navigation (SiteHeader)** | ✅ Implemented |
| **Edge middleware for route protection** | ✅ Implemented |
| **Admin dashboard UI (`/admin`)** | ✅ Implemented |
| **Admin create event UI (`/admin/events/new`)** | ✅ Implemented |
| **Admin edit event UI (`/admin/events/[id]/edit`)** | ✅ Implemented |
| **Favourite categories UI (`/favorites`)** | ✅ Implemented |
| **My Feed UI (`/feed`)** | ✅ Implemented |
| **My Reminders UI (`/reminders`)** | ✅ Implemented |
| **Card Designer UI (on `/events/[id]`)** | ✅ Implemented |
| **Reminder button on event detail page** | ✅ Implemented |

**All backend and frontend features are now complete.**

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
- **Animations**: Framer Motion *(installed, available)*
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
4. Under **Network Access**, add your development IP address (or `0.0.0.0/0` for unrestricted access during development).
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

> **Note:** The sample-event seed script (`npm run seed`) has been removed. The public listing will be empty until events are created by the admin through the dashboard.

---

## Admin Provisioning

The admin account is created by running `npm run seed-admin`, which reads credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment file.

```bash
# Ensure ADMIN_EMAIL and ADMIN_PASSWORD are set in .env.local, then:
npm run seed-admin
```

Once provisioned, navigate to `/login` and sign in with the admin credentials. The header will automatically show **Dashboard** and **Manage Events** links.

**Changing the admin password:** Update `ADMIN_PASSWORD` in your environment and re-run `npm run seed-admin`.

**Sharing credentials with an evaluator:** Share `ADMIN_EMAIL` and `ADMIN_PASSWORD` via a secure channel. Never commit actual passwords to the repository.

---

## API Documentation

See [`docs/API.md`](docs/API.md) for the full REST API contract.

**Base path**: `/api`

| Area | Endpoints | Status |
|---|---|---|
| Health | `GET /api/health` | ✅ Live |
| Auth | `POST /api/auth/signup` | ✅ Live |
| Auth | `POST /api/auth/login` | ✅ Live |
| Auth | `GET /api/auth/me` | ✅ Live |
| Auth | `POST /api/auth/logout` | ✅ Live |
| Admin test | `GET /api/admin/me` | ✅ Live |
| Admin events list | `GET /api/admin/events` | ✅ Live |
| Public events | `GET /api/events` | ✅ Live |
| Public events | `GET /api/events/:id` | ✅ Live |
| Admin events | `POST /api/admin/events` | ✅ Live |
| Admin events | `PATCH /api/admin/events/:id` | ✅ Live |
| Admin events | `PATCH /api/admin/events/:id/status` | ✅ Live |
| Favourites | `GET/PUT /api/favourites` | ✅ Live |
| My Feed | `GET /api/feed` | ✅ Live |
| Reminders | `GET/POST /api/reminders` | ✅ Live |
| Reminders | `DELETE /api/reminders/:eventId` | ✅ Live |
| Card design | `GET/PUT /api/events/:id/card-design` | ✅ Live |

---

## Database Design

See [`docs/DATABASE.md`](docs/DATABASE.md) for full schema definitions, field validation rules, index recommendations, and design trade-offs.

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
- The admin UI performs an additional client-side role check and redirects non-admins.
- The `.env.local` file is git-ignored. `.env.example` contains no real credentials.

---

## Testing Instructions

### Evaluator flow

1. Copy `.env.example` to `.env.local` and fill in all variables.
2. Run `npm run seed-admin` to provision the admin account.
3. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

### Pages to verify

| Page | Path | Notes |
|---|---|---|
| Landing | `/` | Public; featured events shown |
| Events listing | `/events` | Filters, pagination |
| Event detail | `/events/:id` | Reminder button + Card Designer |
| Login | `/login` | Email/password; show/hide password |
| Signup | `/signup` | Includes confirm-password validation |
| My Feed | `/feed` | Requires login; shows events by favourite category |
| Favourites | `/favorites` | Select category preferences |
| My Reminders | `/reminders` | View and remove saved reminders |
| Admin Dashboard | `/admin` | Admin only; event list with status controls |
| Create Event | `/admin/events/new` | Admin only |
| Edit Event | `/admin/events/:id/edit` | Admin only |

### Running checks

```bash
npx tsc --noEmit   # TypeScript type check
npm run lint       # ESLint
npm run build      # Production build
```

---

## Assignment Questions

### 1. How is the database structured, and what design decisions were made?

Four MongoDB collections: `events`, `users`, `reminders`, `carddesigns`. Reminders are stored as a separate collection to avoid unbounded array growth. Favourite categories are an array on the user document (only 5 possible values). Card designs are per-user per-event (compound unique index on `{user, event}`).

### 2. How does the combined filter query work?

The public listing builds an AND filter: `isActive: true`, `date > now`, optional `category` (exact match), `city` (case-insensitive regex), `search` (MongoDB text index). Results are always sorted by `date` ascending.

### 3. How are passwords stored and how are admin pages protected?

Passwords use `bcryptjs` saltRounds=12. Admin is provisioned via `npm run seed-admin` only. Each admin API route re-reads the role from the database. The UI enforces a client-side role check in the admin layout, backed by the Edge middleware cookie check.

---

## AI Usage Disclosure

AI tools were used to assist with documentation drafting, project planning, and code generation for this project. See [`docs/AI-USAGE.md`](docs/AI-USAGE.md) for the full policy and usage log.

All code generated with AI assistance is reviewed and understood before being committed.

---

## Known Limitations and Remaining Work

- Next.js 16 deprecates `middleware.ts` in favour of `proxy.ts` — a codemod migration is available via `npx @next/codemod@canary middleware-to-proxy .`.
- JWTs are stateless; no server-side revocation mechanism.
- No rate limiting is implemented; add before production deployment.
- Image upload is not supported; `imageUrl` accepts an external URL string only.
- Full WCAG compliance requires manual testing with assistive technologies.
- The events listing will be empty until events are created via the admin dashboard.
- The sample-event seed script has been removed.

---

## Assignment Submission Checklist

- [x] MongoDB Atlas connected and models implemented
- [x] Admin provisioning via `npm run seed-admin`
- [x] Public event listing API with filters and pagination
- [x] User registration and login (API + UI)
- [x] All personalization APIs implemented (Favourites, Feed, Reminders, Card Design)
- [x] Claymorphism design system (CSS tokens, shared components)
- [x] Landing page with featured events
- [x] Public events page with filters, pagination, loading/empty/error states
- [x] Responsive design (mobile and desktop)
- [x] Login page UI (`/login`)
- [x] Signup page UI (`/signup`)
- [x] Authentication-aware navigation header
- [x] Edge middleware for route protection
- [x] Admin dashboard UI (`/admin`) — event list, status controls
- [x] Admin create event UI (`/admin/events/new`)
- [x] Admin edit event UI (`/admin/events/[id]/edit`)
- [x] Favourite categories UI (`/favorites`)
- [x] My Feed UI (`/feed`)
- [x] My Reminders UI (`/reminders`)
- [x] Card Designer UI (on `/events/[id]`)
- [x] Reminder button on event detail page
- [x] `GET /api/admin/events` endpoint (was missing; now implemented)
- [x] `.env.example` complete with all variable names (no values)
- [x] No secrets committed to the repository
- [x] TypeScript check passes (source files clean)
- [x] ESLint passes (0 errors)
- [x] Production build succeeds
- [ ] `docs/AI-USAGE.md` usage log completed
- [ ] Deployment URL filled in
- [ ] Admin credentials shared securely with evaluator
- [ ] Submission video recorded and uploaded
- [ ] Repository link submitted
