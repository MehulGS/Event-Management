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

Once provisioned, log in at: `POST /api/auth/login` with the configured credentials.
The admin dashboard UI is planned for a future phase — admin API endpoints are live and testable via any HTTP client.

---

## Feature Scope

| Feature | Status |
|---|---|
| Public event listing with category, city, and keyword filters | ✅ Implemented |
| Pagination | ✅ Implemented |
| Event detail view (API) | ✅ Implemented |
| User registration (`POST /api/auth/signup`) | ✅ Implemented |
| User login (`POST /api/auth/login`) | ✅ Implemented |
| JWT HTTP-only cookie auth | ✅ Implemented |
| Current user (`GET /api/auth/me`) | ✅ Implemented |
| Logout (`POST /api/auth/logout`) | ✅ Implemented |
| Admin provisioning (`npm run seed-admin`) | ✅ Implemented |
| Admin identity test (`GET /api/admin/me`) | ✅ Implemented |
| Admin event creation (`POST /api/admin/events`) | ✅ Implemented |
| Admin event editing (`PATCH /api/admin/events/:id`) | ✅ Implemented |
| Admin event activation/deactivation (`PATCH /api/admin/events/:id/status`) | ✅ Implemented |
| Favourite category selection (API) | ✅ Implemented |
| Personalised My Feed (API) | ✅ Implemented |
| Persistent reminders — database-backed (API) | ✅ Implemented |
| Persistent card designer — database-backed (API) | ✅ Implemented |
| Claymorphism design system (tokens, shared components) | ✅ Implemented |
| Landing page (`/`) with featured events | ✅ Implemented |
| Public events page (`/events`) with filters and pagination | ✅ Implemented |
| Responsive layout (mobile and desktop) | ✅ Implemented |
| Login page UI | ⬜ Planned |
| Signup page UI | ⬜ Planned |
| Admin dashboard UI | ⬜ Planned |
| My Feed page UI | ⬜ Planned |
| Reminders page UI | ⬜ Planned |
| Card designer UI | ⬜ Planned |

**Phases 1–9a (Backend + Design System + Landing + Events pages)** are complete. Remaining UI phases are planned.

> **Event seeding note:** The sample-event seed script (`scripts/seed-events.ts`) has been removed. The public events listing will be empty until an administrator creates events via the API (`POST /api/admin/events`) or the database is populated through an explicitly documented process. No actual event documents in MongoDB are affected — only the script file and its npm command have been removed.

---

## Technology Stack

- **Framework**: Next.js 16.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4 + CSS custom properties (Claymorphism tokens)
- **Database**: MongoDB Atlas (cloud-hosted)
- **ODM**: Mongoose 9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password hashing**: `bcryptjs`
- **Validation**: Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion *(installed, available for future phases)*
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

The public events listing will be empty until events are created via `POST /api/admin/events` using the provisioned admin account.

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

> **Note:** The sample-event seed script (`npm run seed`) has been removed. The public listing will be empty until events are created by the admin through the API.

---

## Admin Provisioning

The admin account is created by running `npm run seed-admin`, which reads credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment file. **There is no public admin registration endpoint** — the signup API always assigns `role: "user"`.

```bash
# Ensure ADMIN_EMAIL and ADMIN_PASSWORD are set in .env.local, then:
npm run seed-admin
```

**What the script does:**
- Creates the admin account if it does not exist.
- Leaves it unchanged if it already exists with the correct password hash.
- Updates the password hash if `ADMIN_PASSWORD` has changed (credential rotation).
- **Refuses to promote an existing normal user.** If the email already belongs to a `user`-role account, the script exits with an error.

**Changing the admin password:** Update `ADMIN_PASSWORD` in your environment and re-run `npm run seed-admin`. The admin must log in again after the change.

**Sharing credentials with an evaluator:** Share `ADMIN_EMAIL` and `ADMIN_PASSWORD` values via a secure channel (encrypted message, private shared document, or Vercel environment variable dashboard). Never commit actual passwords to the repository.

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
- Tokens are delivered in `HttpOnly`, `SameSite=Strict` cookies (also `Secure` in production), preventing JavaScript access.
- All API inputs are validated with Zod before reaching the database.
- The `role` field is never accepted from the client — signup always assigns `"user"` server-side.
- Admin is provisioned via `npm run seed-admin` only; no public endpoint can create an admin.
- All state-changing auth endpoints perform an `Origin` header check as a CSRF defence.
- Admin-sensitive endpoints re-read the user's role from the database rather than trusting the JWT claim.
- The `.env.local` file is git-ignored. `.env.example` contains no real credentials.

---

## Testing Instructions

### Manual API testing

Use any HTTP client (Postman, Bruno, curl) to exercise the API endpoints. For browser-based testing, the `token` cookie is set automatically by the login endpoint.

```
POST /api/auth/signup    { "email": "...", "password": "..." }
POST /api/auth/login     { "email": "...", "password": "..." }
GET  /api/auth/me        (requires token cookie)
POST /api/auth/logout
GET  /api/admin/me       (requires admin token cookie)
GET  /api/events         (public; supports ?category=Music&city=...&search=...&page=1&limit=12)
POST /api/admin/events   (requires admin token)
```

### Running checks

```bash
npx tsc --noEmit   # TypeScript type check
npm run lint       # ESLint
npm run build      # Production build
```

---

## Assignment Questions

### 1. How is the database structured, and what design decisions were made?

The application uses four MongoDB collections: `events`, `users`, `reminders`, and `carddesigns`. Reminders are stored as a separate collection (rather than embedded in the user document) to avoid unbounded array growth and allow atomic per-reminder operations. Favourite categories are stored as a small string array on the user document because there are only five possible values. Each collection has targeted indexes to support its primary query pattern (see `docs/DATABASE.md`).

### 2. How does the combined filter query work, and which index supports it?

The public event listing (`GET /api/events`) builds a MongoDB filter with AND logic:

1. **Base filter** — always applied: `{ isActive: true, date: { $gt: now } }`.
2. **`category`** — exact case-sensitive enum match.
3. **`city`** — case-insensitive substring regex (`/escaped_input/i`).
4. **`search`** — MongoDB `$text` query on the text index of `title` and `description`.

Results are sorted by `date` ascending (nearest upcoming first). Text relevance score is not used as a sort key.

### 3. How are passwords stored, and how are the admin page and API protected?

Passwords are hashed with `bcryptjs` at saltRounds = 12. The admin account is created exclusively via `npm run seed-admin`. Each protected API route calls `getAuthFromRequest()` to verify the JWT, and admin endpoints re-read the role from the database rather than trusting the JWT claim.

---

## AI Usage Disclosure

AI tools were used to assist with documentation drafting, project planning, and code generation for this project. See [`docs/AI-USAGE.md`](docs/AI-USAGE.md) for the full policy and usage log.

All code generated with AI assistance is reviewed and understood before being committed.

---

## Known Limitations and Remaining Work

- **Frontend UI phases remaining:** Login, Signup, Admin Dashboard, My Feed, Reminders, and Card Designer pages are not yet implemented.
- Next.js Edge Middleware (`src/middleware.ts`) for page-level route protection is not yet implemented.
- `GET /api/admin/events` (admin event listing with inactive events) is planned but not implemented.
- JWTs are stateless; no server-side revocation mechanism.
- No rate limiting is currently implemented; add before production deployment.
- Image upload is not supported; `imageUrl` accepts an external URL string only.
- City filter uses a contains regex which does not use a database index range scan. Acceptable at current scale.
- Full WCAG compliance requires manual testing with assistive technologies.
- The events listing will be empty until events are created via the admin API.
- The sample-event seed script has been removed to reflect a production-ready setup.

---

## Assignment Submission Checklist

- [x] MongoDB Atlas connected and models implemented
- [x] Admin provisioning via `npm run seed-admin`
- [x] Public event listing API with filters and pagination
- [x] User registration and login (API)
- [x] All personalization APIs implemented (Favourites, Feed, Reminders, Card Design)
- [x] Claymorphism design system (CSS tokens, shared components)
- [x] Landing page with featured events
- [x] Public events page with filters, pagination, loading/empty/error states
- [x] Responsive design (mobile and desktop)
- [x] `.env.example` complete with all variable names (no values)
- [x] No secrets committed to the repository
- [x] Sample-event seeder removed; admin provisioning retained
- [ ] Auth UI pages (login, signup) — planned
- [ ] Admin dashboard UI — planned
- [ ] My Feed, Reminders, Card Designer UI — planned
- [ ] `docs/AI-USAGE.md` usage log completed
- [ ] Deployment URL filled in
- [ ] Admin credentials shared securely with evaluator
- [ ] Submission video recorded and uploaded
- [ ] Repository link submitted
