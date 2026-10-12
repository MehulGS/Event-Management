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
| Public event listing with category, city, and keyword filters | ⬜ Planned |
| Pagination | ⬜ Planned |
| Event detail view | ⬜ Planned |
| User registration and login | ⬜ Planned |
| Admin event creation, editing, and activation/deactivation | ⬜ Planned |
| Favourite category selection | ⬜ Planned |
| Personalised My Feed | ⬜ Planned |
| Persistent reminders (database-backed) | ⬜ Planned |
| Persistent card designer (database-backed) | ⬜ Planned |
| Claymorphism UI | ⬜ Planned |
| Responsive layout (mobile and desktop) | ⬜ Planned |

**Phase 1 (Backend Foundation)** and **Phase 2 (Database Models and Seed Data)** are complete. All other features are planned.

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
npm run dev      # Start development server with Turbopack (http://localhost:3000)
npm run build    # Production build
npm run start    # Start the production server (requires a prior build)
npm run lint     # Run ESLint
npm run seed     # Seed 15 sample events into the database
```

> Seed command: `npm run seed` (uses `npx tsx scripts/seed-events.ts` internally). Requires `MONGODB_URI` to be set. Safe to re-run — uses upsert and does not create duplicates.

---

## Admin Login Configuration

The admin account is seeded from `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env.local`. There is no public admin registration endpoint.

Once the seed script is implemented (Phase 2 of the development plan), run it once to create the admin account in your Atlas database before attempting to log in.

Admin pages are accessible at `/admin`. Both the Next.js middleware and API route guards enforce the `admin` role — a regular user account cannot access admin functionality.

---

## API Documentation

See [`docs/API.md`](docs/API.md) for the full proposed REST API contract.

**Base path**: `/api`

Quick reference:

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Public events | `GET /api/events`, `GET /api/events/:id` |
| Admin events | `POST /api/events`, `PATCH /api/events/:id`, `PATCH /api/events/:id/status` |
| Favourites | `GET /api/user/favourites`, `PUT /api/user/favourites` |
| My Feed | `GET /api/user/feed` |
| Reminders | `GET /api/user/reminders`, `POST /api/user/reminders`, `DELETE /api/user/reminders/:eventId` |
| Card design | `GET /api/user/card-design`, `PUT /api/user/card-design` |
| Health | `GET /api/health` |

> All other endpoints are proposed. The health endpoint is implemented.

---

## Database Design

See [`docs/DATABASE.md`](docs/DATABASE.md) for full schema definitions, field validation rules, index recommendations, and design trade-offs.

Collections: `events`, `users`, `reminders`, `carddesigns`.

---

## Security Notes

- Passwords are hashed with `bcryptjs` (saltRounds = 12). Plain-text passwords are never stored or logged.
- JWTs are signed with a secret stored only in environment variables.
- Tokens are delivered in `HttpOnly`, `Secure`, `SameSite=Strict` cookies, preventing JavaScript access.
- All API inputs are validated with Zod before reaching the database.
- The `.env.local` file is git-ignored. `.env.example` contains no real credentials.
- Admin routes are protected by both Edge Middleware and per-route role checks (defence in depth).

> The above describes the intended implementation. Security controls have not yet been implemented or verified.

---

## Testing Instructions

Automated testing has not been set up. Manual testing instructions will be added once the API routes are implemented.

Refer to the [Testing Checklist](docs/DEVELOPMENT-PLAN.md#testing-checklist) in `docs/DEVELOPMENT-PLAN.md` for the full list of scenarios to verify.

---

## Assignment Questions

### 1. How is the database structured, and what design decisions were made?

The application uses four MongoDB collections: `events`, `users`, `reminders`, and `carddesigns`. Reminders are stored as a separate collection (rather than embedded in the user document) to avoid unbounded array growth and allow atomic per-reminder operations. Favourite categories are stored as a small string array on the user document because there are only five possible values. Each collection has targeted indexes to support its primary query pattern (see `docs/DATABASE.md`).

### 2. How does the combined filter query work, and which index supports it?

The public event listing filters by `{ isActive: true }` first, then optionally by `category` (exact enum match), `city` (case-insensitive regex), and `search` (MongoDB `$text` query against a text index on `title` and `description`). The compound index `{ isActive: 1, category: 1, date: 1 }` supports the most common filter path. When a text search is active, the text index is used and results are sorted by relevance score rather than date. Pending verification with `explain()` once models and seed data exist.

### 3. How are passwords stored, and how are the admin page and API protected?

Passwords are hashed with `bcryptjs` at saltRounds = 12 before being saved to the database. The plain-text password is never persisted or logged. Admin protection is implemented at two layers: Next.js Edge Middleware intercepts requests to `/admin/*` and redirects unauthenticated users to the login page; each admin API route independently verifies the JWT and checks that `role === 'admin'`, returning `403 FORBIDDEN` otherwise. Pending verification — security controls have not been implemented yet.

---

## AI Usage Disclosure

AI tools were used to assist with documentation drafting and project planning for this project. See [`docs/AI-USAGE.md`](docs/AI-USAGE.md) for the full policy and usage log.

The usage log will be completed honestly at the end of development. All code generated with AI assistance is reviewed and understood before being committed.

---

## Known Limitations and Remaining Work

- **Features are not yet implemented.** The codebase contains the Next.js scaffold, MongoDB connection utility, shared API response helpers, environment validation, the `/api/health` endpoint, all four Mongoose models (`Event`, `User`, `Reminder`, `CardDesign`), and 15 seeded sample events across all categories and multiple Indian cities.
- `lucide-react` and `framer-motion` have not been installed.
- The seed script does not exist yet.
- No user-facing API routes, UI components, or authentication logic have been built.
- The admin account cannot be created until the auth service is implemented in Phase 3.
- Image upload is not planned; `imageUrl` accepts an external URL only.
- No rate limiting is currently planned.
- Full WCAG compliance requires manual testing with assistive technologies beyond what is covered in this plan.
- The MongoDB connection string in `.env` does not specify a database name, so Mongoose connects to the default `test` database. Update the URI to include the database name (e.g. `.../community-events-board?retryWrites=true&w=majority`) before populating data.

---

## Assignment Submission Checklist

- [ ] All features listed in Feature Scope are implemented
- [ ] MongoDB Atlas is connected and all collections are populated
- [ ] Admin account is seeded and login works
- [ ] Public event listing, filtering, sorting, and pagination work
- [ ] User registration and login work
- [ ] Favourite categories persist across sessions
- [ ] My Feed reflects favourite categories
- [ ] Reminders persist in the database
- [ ] Card designer preferences persist in the database
- [ ] UI uses Claymorphism design system consistently
- [ ] Application is responsive on mobile and desktop
- [ ] `.env.example` is complete with all variable names (no values)
- [ ] No secrets committed to the repository
- [ ] `docs/AI-USAGE.md` contains an honest usage log
- [ ] Assignment questions answered in README
- [ ] Submission video recorded and uploaded
- [ ] Repository link submitted
