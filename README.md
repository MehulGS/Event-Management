# Community Events Board

A responsive full-stack web application where administrators manage community events and visitors can discover events, save reminders, personalise their event feed by selecting favourite categories, and customise how event cards look.

---

## Table of Contents

1. [Feature Scope](#feature-scope)
2. [Technology Stack](#technology-stack)
3. [Prerequisites](#prerequisites)
4. [Local Setup](#local-setup)
5. [Environment Variables](#environment-variables)
6. [MongoDB Atlas Setup](#mongodb-atlas-setup)
7. [Development Commands](#development-commands)
8. [Admin Login Configuration](#admin-login-configuration)
9. [API Documentation](#api-documentation)
10. [Database Design](#database-design)
11. [Security Notes](#security-notes)
12. [Testing Instructions](#testing-instructions)
13. [Assignment Questions](#assignment-questions)
14. [AI Usage Disclosure](#ai-usage-disclosure)
15. [Known Limitations and Remaining Work](#known-limitations-and-remaining-work)
16. [Assignment Submission Checklist](#assignment-submission-checklist)

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
| Favourite category selection | ✅ Implemented |
| Personalised My Feed | ✅ Implemented |
| Persistent reminders (database-backed) | ✅ Implemented |
| Persistent card designer (database-backed) | ✅ Implemented |
| Claymorphism UI | ⬜ Planned |
| Responsive layout (mobile and desktop) | ⬜ Planned |

**Phases 1–8 (Backend Foundation through Personalization APIs)** are complete. Frontend UI (Phase 9) and remaining features are planned.

---

## Technology Stack

- **Framework**: Next.js 16.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB Atlas (cloud-hosted)
- **ODM**: Mongoose 9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`)
- **Password hashing**: `bcryptjs`
- **Validation**: Zod
- **Icons**: Lucide React *(to be installed)*
- **Animations**: Framer Motion *(to be installed)*
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

# 5. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env.local` and provide values for each variable. **Never commit `.env.local`.**

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Long random string used to sign JWTs |
| `JWT_EXPIRES_IN` | ✅ | Token lifespan, e.g. `7d` |
| `ADMIN_EMAIL` | ✅ | Email address of the seeded admin account |
| `ADMIN_PASSWORD` | ✅ | Password for the seeded admin account |
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL of the running app |

> `NEXT_PUBLIC_APP_URL` is the only variable exposed to the browser. All others stay server-side.

---

## MongoDB Atlas Setup

1. Create a free account at [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a new **free-tier cluster** (M0).
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, add your development IP address (or `0.0.0.0/0` for unrestricted access during development — tighten this before production).
5. Click **Connect → Connect your application** and copy the connection string.
6. Replace `<password>` in the connection string with your database user's password and append the database name before the query string: `.../community-events?retryWrites=true&w=majority`
7. Paste the full string as `MONGODB_URI` in `.env.local`.

---

## Development Commands

```bash
npm run dev        # Start development server with Turbopack (http://localhost:3000)
npm run build      # Production build
npm run start      # Start the production server (requires a prior build)
npm run lint       # Run ESLint
npm run seed       # Seed 15 sample events into the database
npm run seed-admin # Provision the admin account (idempotent, safe to re-run)
```

> **Seed events**: `npm run seed` (uses `npx tsx scripts/seed-events.ts`). Requires `MONGODB_URI` to be set. Safe to re-run — uses upsert and does not create duplicates.
>
> **Seed admin**: `npm run seed-admin` reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from environment variables. Run once before testing admin login. Safe to re-run. See [Admin Login Configuration](#admin-login-configuration) for details.

---

## Admin Login Configuration

The admin account is created using the `npm run seed-admin` command, which reads credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your `.env` or `.env.local` file. **There is no public admin registration endpoint** — the signup API always assigns `role: "user"` regardless of what is submitted in the request body.

### Provisioning the admin account

```bash
# Ensure ADMIN_EMAIL and ADMIN_PASSWORD are set in .env.local, then:
npm run seed-admin
```

**What the script does:**
- Creates the admin account if it does not exist.
- Leaves it unchanged if it exists with the correct password hash.
- Updates the password hash if `ADMIN_PASSWORD` has changed (credential rotation).
- **Refuses to promote an existing normal user account.** If the email already belongs to a `user`-role account, the script exits with an error. Promotion requires manual action in MongoDB Atlas.

**Changing the admin password:** Update `ADMIN_PASSWORD` in your environment and re-run `npm run seed-admin`. The admin must log in again after the change.

### Testing admin login

Once provisioned, log in via `POST /api/auth/login` with the configured credentials. The response sets a `token` HTTP-only cookie. Verify admin access with `GET /api/admin/me`.

Admin pages at `/admin/*` will be protected by Next.js Edge Middleware in a future phase. The API routes already enforce admin authorization server-side.

---

## API Documentation

See [`docs/API.md`](docs/API.md) for the full REST API contract.

**Base path**: `/api`

Quick reference:

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
- All state-changing auth endpoints perform an `Origin` header check (in addition to `SameSite=Strict`) as a CSRF defence.
- Admin-sensitive endpoints re-read the user's role from the database rather than trusting the JWT claim.
- The `.env.local` file is git-ignored. `.env.example` contains no real credentials.

---

## Testing Instructions

### Manual API testing (Phase 3 — auth)

Use any HTTP client (Postman, Bruno, curl) to exercise the auth endpoints. For browser-based testing, the `token` cookie is set automatically.

```
POST /api/auth/signup    { "email": "...", "password": "..." }
POST /api/auth/login     { "email": "...", "password": "..." }
GET  /api/auth/me        (requires token cookie)
POST /api/auth/logout
GET  /api/admin/me       (requires admin token cookie)
```

All tested scenarios and actual results are recorded in [`docs/DEVELOPMENT-PLAN.md`](docs/DEVELOPMENT-PLAN.md#testing-checklist).

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

1. **Base filter** — always applied: `{ isActive: true, date: { $gt: now } }`. This ensures only active, upcoming events are returned.
2. **`category`** — exact case-sensitive enum match added when supplied. Unsupported values are rejected by Zod before reaching the database.
3. **`city`** — case-insensitive substring regex (`/escaped_input/i`) added when supplied. User input is escaped with a regex escaping function before being passed to `RegExp` to prevent regex injection.
4. **`search`** — MongoDB `$text` query operator added when supplied. Matches whole-word stems across the `title` and `description` text index. Partial-word substring matching (e.g. "jaz" matching "jazz") is **not** supported — this is standard `$text` behaviour, documented in `docs/API.md`.

**Sort order**: Results are always sorted by `date` ascending (nearest upcoming first). Text relevance score is **not** used as a sort key, preserving chronological order even when a search term is provided.

**Index usage**:
- No filters → `{ isActive: 1, date: 1 }` compound index.
- With `category` → `{ category: 1, isActive: 1, date: 1 }` compound index.
- With `city` → `{ city: 1, isActive: 1, date: 1 }` compound index (prefix anchoring not used; contains regex does not use index range scan, but the index still narrows the dataset when combined with equality conditions).
- With `search` → text index on `{ title: "text", description: "text" }`. Category and city post-filters apply after the text scan.

When all three filters are combined, MongoDB uses the text index for the `$text` clause and applies `isActive`, `date`, `category`, and `city` as residual filters. Full index selection details will be confirmed with `explain()` once live Atlas connectivity is available.

### 3. How are passwords stored, and how are the admin page and API protected?

Passwords are hashed with `bcryptjs` at saltRounds = 12 before being saved to the database. The plain-text password is never persisted or logged.

**Admin provisioning**: The admin account is created exclusively via `npm run seed-admin`, which reads credentials from environment variables server-side. The signup API enforces `role: "user"` regardless of any `role` field in the request body — there is no way to self-register as admin.

**API authorization**: Each protected API route calls `getAuthFromRequest()` (from `src/lib/auth.ts`) to extract and verify the JWT from the cookie. For admin endpoints, the user's role is re-read from the database (not taken from the token) to ensure freshness. Unauthenticated requests receive `401 UNAUTHORIZED`; authenticated non-admin requests receive `403 FORBIDDEN`.

**Defence in depth**: `SameSite=Strict` cookies prevent CSRF from cross-site pages. All state-changing auth endpoints additionally check the `Origin` header via `src/lib/csrf.ts`. Next.js Edge Middleware (planned) will add a third layer for page-level redirects.

---

## AI Usage Disclosure

AI tools were used to assist with documentation drafting and project planning for this project. See [`docs/AI-USAGE.md`](docs/AI-USAGE.md) for the full policy and usage log.

The usage log will be completed honestly at the end of development. All code generated with AI assistance is reviewed and understood before being committed.

---

## Known Limitations and Remaining Work

- **User features are implemented (API layer).** Phases 6–8 (Favourites, My Feed, Reminders, Card Design) are complete. The frontend UI (Phase 9) is planned.
- `lucide-react` and `framer-motion` have not been installed (needed for Phase 9 UI).
- Next.js Edge Middleware (`src/middleware.ts`) for page-level route protection is not yet implemented.
- `GET /api/admin/events` (admin event listing with inactive events) is planned but not yet implemented.
- JWTs are stateless; there is no server-side revocation mechanism. If token revocation before expiry is required, a deny-list (e.g. Redis) would need to be added.
- No rate limiting is currently planned; add before production deployment.
- The MongoDB connection string in `.env` does not specify a database name, causing Mongoose to use the default `test` database. Update the URI to include the database name before production (e.g. `.../community-events-board?retryWrites=true&w=majority`).
- Image upload is not planned; `imageUrl` accepts an external URL only.
- City filter uses a contains regex (`/city/i`) which does not use a database index range scan. Acceptable at this scale; for larger datasets, consider normalising city to a stored-lowercase field and using an exact equality match.
- Full WCAG compliance requires manual testing with assistive technologies.

---

## Assignment Submission Checklist

- [ ] All features listed in Feature Scope are implemented
- [ ] MongoDB Atlas is connected and all collections are populated
- [ ] Admin account is seeded and login works
- [ ] Public event listing, filtering, sorting, and pagination work
- [ ] User registration and login work
- [x] All personalization APIs implemented (Favourites, Feed, Reminders, Card Design)
- [ ] Claymorphism UI implemented
- [ ] Application is responsive on mobile and desktop
- [ ] `.env.example` is complete with all variable names (no values)
- [ ] No secrets committed to the repository
- [ ] `docs/AI-USAGE.md` contains an honest usage log
- [ ] Assignment questions answered in README
- [ ] Submission video recorded and uploaded
- [ ] Repository link submitted
