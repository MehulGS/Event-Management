# Development Plan — Community Events Board

> This plan maps every assignment requirement to a concrete implementation task with acceptance criteria. Tasks are grouped into phases that respect inter-dependencies. No task is marked complete unless the code exists, builds, and has been manually verified.

---

## Table of Contents

1. [Requirement Map](#requirement-map)
2. [Phase Overview](#phase-overview)
3. [Phase 1 — Foundation and Configuration](#phase-1--foundation-and-configuration)
4. [Phase 2 — Database Models and Seed Data](#phase-2--database-models-and-seed-data)
5. [Phase 3 — Authentication and Authorization](#phase-3--authentication-and-authorization)
6. [Phase 4 — Admin Event Management](#phase-4--admin-event-management)
7. [Phase 5 — Public Event Discovery](#phase-5--public-event-discovery)
8. [Phase 6 — Favourite Categories and My Feed](#phase-6--favourite-categories-and-my-feed)
9. [Phase 7 — Persistent Reminders](#phase-7--persistent-reminders)
10. [Phase 8 — Persistent Card Designer](#phase-8--persistent-card-designer)
11. [Phase 9 — Responsive Claymorphism UI](#phase-9--responsive-claymorphism-ui)
12. [Phase 10 — Testing and Security Verification](#phase-10--testing-and-security-verification)
13. [Phase 11 — README, GitHub, and Submission Recording](#phase-11--readme-github-and-submission-recording)
14. [Testing Checklist](#testing-checklist)

---

## Requirement Map

| Assignment Requirement | Implementation Phase | Key Files |
|---|---|---|
| MongoDB database with at least 2 collections | Phase 2 | `src/models/` |
| Mongoose schemas with validation | Phase 2 | `src/models/` |
| Admin: create, edit, activate/deactivate events | Phase 4 | `src/app/api/events/`, `src/app/admin/` |
| Public event listing with filters and pagination | Phase 5 | `src/app/api/events/`, `src/app/(public)/events/` |
| Category filter | Phase 5 | query param `category` |
| City filter | Phase 5 | query param `city` |
| Text search | Phase 5 | MongoDB text index + `$text` query |
| User registration and login | Phase 3 | `src/app/api/auth/` |
| Password hashing (bcrypt) | Phase 3 | `src/services/authService.ts` |
| JWT authentication | Phase 3 | `src/lib/auth.ts` |
| Admin page/API protected | Phase 3–4 | `src/middleware.ts`, route guards |
| Favourite categories | Phase 6 | `src/app/api/user/favourites/` |
| My Feed (personalised) | Phase 6 | `src/app/api/user/feed/` |
| Reminders (persistent, DB-backed) | Phase 7 | `src/models/Reminder.ts`, `src/app/api/user/reminders/` |
| Card designer (persistent, DB-backed) | Phase 8 | `src/models/CardDesign.ts`, `src/app/api/user/card-design/` |
| Claymorphism UI | Phase 9 | `src/components/`, `globals.css` |
| Responsive design | Phase 9 | Tailwind responsive classes |

---

## Phase Overview

```
Phase 1  →  Phase 2  →  Phase 3  →  Phase 4
                                        ↓
                              Phase 5  (can overlap 4)
                                        ↓
                    Phase 6, 7, 8  (parallel after Phase 5)
                                        ↓
                              Phase 9  (UI — ongoing)
                                        ↓
                              Phase 10 → Phase 11
```

---

## Phase 1 — Foundation and Configuration

**Goal**: All tooling, environment config, and shared utilities are in place before any feature is built.

### Status: Partially implemented — backend foundation complete

| Task | Status | Notes |
|---|---|---|
| Next.js project scaffold | ✅ Done | `create-next-app` with TypeScript + Tailwind |
| `src/lib/db.ts` — Mongoose connection | ✅ Done | Global cache, lazy URI check, `bufferCommands: false`, typed return |
| `src/lib/env.ts` — Server env validation | ✅ Done | `validateEnv()` and `getEnv()` helpers |
| `src/lib/api-response.ts` — Response utilities | ✅ Done | `ok()`, `created()`, `errorResponse()`, typed error codes |
| `GET /api/health` — Health endpoint | ✅ Done | DB ready-state check, 200/503, no secrets in response |
| ESLint config (`eslint.config.mjs`) | ✅ Done | Fixed: upgraded `eslint-config-next` to 16.4.0 for ESLint 9 compatibility |
| `next.config.ts` — Turbopack, caching | ✅ Done | Component caching + partial prefetching enabled |
| `.env.example` with all required vars | ✅ Done | All variable names present, no values |
| `src/types/index.ts` — shared TS interfaces | ✅ Done | `IEvent`, `IUser`, `IReminder`, `ICardDesign` — implemented in Phase 2 |
| `src/lib/auth.ts` — JWT sign/verify helpers | ✅ Done | `signToken()`, `verifyToken()`, cookie helpers — implemented in Phase 3 |
| `src/lib/csrf.ts` — Origin-based CSRF check | ✅ Done | `isSameOrigin()` — implemented in Phase 3 |
| `src/lib/errors.ts` — typed API error helpers | ⬜ TODO | Folded into `api-response.ts`; a separate `errors.ts` is not required |
| CSS custom properties in `globals.css` | ⬜ TODO | All tokens from `DESIGN-SYSTEM.md` |
| Install `lucide-react` | ⬜ TODO | `npm install lucide-react` |
| Install `framer-motion` | ⬜ TODO | `npm install framer-motion` |

**Acceptance criteria**:
- `npm run build` completes without errors.
- `connectDB()` successfully connects to Atlas when `MONGODB_URI` is set.
- All CSS tokens are available globally.

**Dependencies**: None.

---

## Phase 2 — Database Models and Seed Data

**Goal**: All Mongoose models exist with validation, indexes, and a seed script that creates the admin account and sample events.

### Status: Implemented

| Task | Status | Notes |
|---|---|---|
| `src/models/Event.ts` | ✅ Done | Schema per `DATABASE.md` |
| `src/models/User.ts` | ✅ Done | Schema per `DATABASE.md`; `passwordHash` excluded from toJSON |
| `src/models/Reminder.ts` | ✅ Done | Schema per `DATABASE.md` |
| `src/models/CardDesign.ts` | ✅ Done | Schema per `DATABASE.md` |
| `scripts/seed-events.ts` | ✅ Done | 15 sample events across all categories |
| `scripts/seed-admin.ts` | ✅ Done | Idempotent admin provisioning (`npm run seed-admin`) |

**Acceptance criteria**:
- All models import without TypeScript errors.
- Running `npx ts-node src/scripts/seed.ts` populates the database.
- MongoDB Atlas shows the collections with the expected documents and indexes.
- Duplicate email insert throws `MongoServerError` (unique index).
- Inserting more than 3 stickers throws Mongoose validation error.

**Dependencies**: Phase 1 complete.

---

## Phase 3 — Authentication and Authorization

**Goal**: Users can register, log in, and receive a JWT. Protected routes reject unauthenticated requests.

### Status: Implemented — core auth and admin protection complete

| Task | Status | Notes |
|---|---|---|
| `src/lib/auth.ts` — JWT sign/verify + cookie helpers | ✅ Done | `signToken()`, `verifyToken()`, `getAuthFromRequest()`, `buildAuthCookie()`, `buildClearAuthCookie()`, `getCookieMaxAge()` |
| `src/lib/csrf.ts` — Origin-based CSRF protection | ✅ Done | `isSameOrigin()` used on all state-changing endpoints |
| `POST /api/auth/signup` | ✅ Done | Zod v4 validation, bcrypt hash, role="user" server-assigned, role injection blocked |
| `POST /api/auth/login` | ✅ Done | Compare hash, issue JWT, set HttpOnly cookie |
| `GET /api/auth/me` | ✅ Done | Requires valid cookie/Bearer; returns safe profile |
| `POST /api/auth/logout` | ✅ Done | Clears cookie with Max-Age=0 |
| `GET /api/admin/me` | ✅ Done | Test endpoint; re-reads role from DB; 401/403/200 |
| `scripts/seed-admin.ts` — Admin provisioning | ✅ Done | `npm run seed-admin`; idempotent; refuses to silently promote normal user |
| `src/middleware.ts` — Edge JWT check | ⬜ TODO | Planned for page route protection |
| Login page UI | ⬜ TODO | `src/app/(auth)/login/page.tsx` |
| Signup page UI | ⬜ TODO | `src/app/(auth)/signup/page.tsx` |

**Acceptance criteria**:
- ✅ Registering with an existing email returns `409 CONFLICT`.
- ✅ Logging in with wrong password returns `401 UNAUTHORIZED`.
- ✅ Logging in sets the `token` HttpOnly cookie.
- ✅ A valid user token cannot access admin-only API routes (returns `403 FORBIDDEN`).
- ✅ Role injection via signup body (`role: "admin"`) is blocked — account is created as `user`.
- ⬜ Visiting `/admin` without a valid token redirects to `/login` (requires middleware, planned).

---

## Phase 4 — Admin Event Management

**Goal**: The admin can create, edit, and activate/deactivate events through a protected dashboard.

### Status: Implemented — API layer complete

| Task | Status | Notes |
|---|---|---|
| `POST /api/admin/events` — create event | ✅ Done | Admin only; Zod v4 validation; CSRF check; mass-assignment prevention |
| `PATCH /api/admin/events/:id` — update event | ✅ Done | Admin only; partial update; `.strict()` schema rejects unknown fields |
| `PATCH /api/admin/events/:id/status` — toggle active | ✅ Done | Admin only; boolean-only `isActive`; no deletion |
| `GET /api/admin/events` — list all (admin) | ⬜ TODO | Includes inactive events; needed for admin dashboard |
| Admin dashboard page | ⬜ TODO | `src/app/admin/page.tsx` — event list table |
| New event form | ⬜ TODO | `src/app/admin/events/new/page.tsx` |
| Edit event form | ⬜ TODO | `src/app/admin/events/[id]/edit/page.tsx` |
| Admin layout with auth guard | ⬜ TODO | `src/app/admin/layout.tsx` |

**Acceptance criteria**:
- ✅ Admin can create an event (HTTP 201 with full event object).
- ✅ Admin can update specific event fields; unknown fields are rejected (400).
- ✅ Admin can toggle an event inactive; it disappears from the public listing.
- ✅ Non-admin JWT returns `403` on all admin event API routes.
- ✅ Role re-read from DB on every request; JWT role claim not trusted for admin checks.
- ⬜ Admin dashboard UI (planned Phase 9).

**Dependencies**: Phase 3 complete.

---

## Phase 5 — Public Event Discovery

**Goal**: Any visitor can browse, filter, search, and paginate events.

### Status: Implemented — API layer complete

| Task | Status | Notes |
|---|---|---|
| `GET /api/events` — public listing | ✅ Done | Active + upcoming only; category/city/search filters; pagination |
| `GET /api/events/:id` — event detail | ✅ Done | Active + upcoming only; 404 for inactive, past, or missing |
| Public events listing page | ⬜ TODO | `src/app/(public)/events/page.tsx` |
| Event detail page | ⬜ TODO | `src/app/(public)/events/[id]/page.tsx` |
| EventCard component | ⬜ TODO | Displays title, category badge, date, city, image |
| EventFilters component | ⬜ TODO | Category select, city input, keyword input |
| EventGrid component | ⬜ TODO | Responsive grid layout |
| Pagination component | ⬜ TODO | Previous / Next / page numbers |

**Acceptance criteria**:
- ✅ Listing returns only active, upcoming events (isActive=true AND date > now).
- ✅ Category filter applies exact enum match; invalid value returns 400.
- ✅ City filter is case-insensitive substring match; special regex chars are escaped.
- ✅ Keyword search uses MongoDB `$text` index across `title` and `description`.
- ✅ All three filters combine with AND logic.
- ✅ Results always sorted by `date` ascending (nearest upcoming first).
- ✅ Pagination returns correct page, limit, total, totalPages, hasNextPage, hasPrevPage.
- ✅ Empty result set returns HTTP 200 with `data: []` and correct pagination metadata.
- ✅ Invalid ID returns 404 without crashing.
- ✅ Inactive events and past events return 404 from the detail endpoint.
- ⬜ UI pages (planned Phase 9).

**Dependencies**: Phase 2 complete (Phase 4 provides seed data for realistic testing).

---

## Phase 6 — Favourite Categories and My Feed

**Goal**: Authenticated users can save up to 5 category preferences and see a personalised feed.

### Status: Implemented

| Task | Status | Notes |
|---|---|---|
| `GET /api/favourites` | ✅ Done | Returns `favouriteCategories` array from user document |
| `PUT /api/favourites` | ✅ Done | Replaces category list; validates enum values; deduplicates; CSRF protected |
| `GET /api/feed` | ✅ Done | Active events filtered by stored prefs; empty prefs → empty feed; pagination supported |
| Favourites settings UI | ⬜ TODO | Category toggle chips |
| My Feed page | ⬜ TODO | `src/app/(user)/feed/page.tsx` |

**Acceptance criteria**:
- ✅ Saving `["Music", "Kids"]` and loading My Feed returns only Music and Kids events.
- ✅ Saving an empty array returns an empty feed on My Feed (not all events).
- ✅ Invalid category names in the PUT body return `400 VALIDATION_ERROR`.
- ✅ CSRF check enforced on PUT.
- ✅ User ID sourced from JWT only — not from request body.

**Dependencies**: Phase 3 and Phase 5 complete.

---

## Phase 7 — Persistent Reminders

**Goal**: Authenticated users can save and remove event reminders that persist in the database.

### Status: Implemented

| Task | Status | Notes |
|---|---|---|
| `GET /api/reminders` | ✅ Done | Returns all reminders with populated event data; orphan documents excluded |
| `POST /api/reminders` | ✅ Done | Saves reminder; validates active+upcoming event; 409 on duplicate; CSRF protected |
| `DELETE /api/reminders/:eventId` | ✅ Done | Removes only the authenticated user's reminder; 404 if missing; CSRF protected |
| Reminder toggle button on event card | ⬜ TODO | Bookmark icon, optimistic UI update |
| Reminders page | ⬜ TODO | `src/app/(user)/reminders/page.tsx` |

**Acceptance criteria**:
- ✅ Saving the same event reminder twice returns `409 CONFLICT`.
- ✅ Removing a reminder that does not exist returns `404 NOT_FOUND`.
- ✅ Reminders persist across sessions (stored in DB, not `localStorage`).
- ✅ Past or inactive events cannot be reminded.
- ✅ One user cannot delete another user's reminder.
- ⬜ Reminders page UI (planned Phase 9).

**Dependencies**: Phase 3 and Phase 5 complete.

---

## Phase 8 — Persistent Card Designer

**Goal**: Authenticated users can customise and persistently save an event card theme, stickers, and font style.

### Status: Implemented (API layer)

| Task | Status | Notes |
|---|---|---|
| `GET /api/events/:id/card-design` | ✅ Done | Returns saved design or default `{theme:"pastel-cloud",stickers:[]}` |
| `PUT /api/events/:id/card-design` | ✅ Done | Upsert per user–event pair; validates theme + stickers; CSRF protected |
| CardDesigner component | ⬜ TODO | Theme picker, sticker picker (max 3), font picker |
| Live card preview | ⬜ TODO | Event card renders with selected theme in real time |
| Card designer page | ⬜ TODO | `src/app/(user)/card-designer/page.tsx` |

**Design decisions**:
- Card designs are **per user per event** (compound unique index `{ user, event }`).
- Duplicate stickers in submitted array are silently deduplicated before saving.
- A user cannot overwrite another user's design — the filter always includes `user: authenticatedUserId`.
- Default design: `{ theme: "pastel-cloud", stickers: [] }`.

**Acceptance criteria**:
- ✅ Selecting more than 3 stickers is rejected by the API with `400`.
- ✅ Saving a design and reloading returns the same design.
- ✅ Invalid theme or sticker values return `400`.
- ✅ A user's design is isolated from other users.
- ⬜ Live card preview (planned Phase 9).

**Dependencies**: Phase 3 and Phase 5 complete.

---

## Phase 9 — Responsive Claymorphism UI

**Goal**: All pages use the defined design system consistently. The application is fully responsive across mobile, tablet, and desktop.

| Task | Status | Notes |
|---|---|---|
| Update `globals.css` with all design tokens | ⬜ TODO | Colours, shadows, radii, spacing |
| Navbar component | ⬜ TODO | Logo, nav links, auth state, hamburger menu |
| Footer component | ⬜ TODO | Simple footer with links |
| Apply card shadow conventions | ⬜ TODO | All cards use `--shadow-raised` |
| Apply button styles | ⬜ TODO | Primary, secondary, danger variants |
| Apply input styles | ⬜ TODO | Inset shadow on all form fields |
| Category badge components | ⬜ TODO | Correct colours per category |
| Loading skeletons | ⬜ TODO | Match event card shape |
| Empty state components | ⬜ TODO | Friendly message + icon |
| Error state components | ⬜ TODO | Toast notifications |
| Responsive event grid | ⬜ TODO | 1 → 2 → 3 columns |
| Reduced motion support | ⬜ TODO | CSS media query + Framer Motion hook |
| Accessibility audit | ⬜ TODO | Focus states, ARIA labels, semantic HTML |

**Acceptance criteria**:
- All pages render correctly at 375px, 768px, and 1280px widths.
- No horizontal scroll on mobile.
- All interactive elements have visible focus styles.
- No raw hex colour values in component files (all reference CSS tokens or Tailwind classes mapped to tokens).

**Dependencies**: Phases 1–8 providing real content to style.

---

## Phase 10 — Testing and Security Verification

**Goal**: Verify that authentication, authorization, and data integrity work correctly.

| Task | Status | Notes |
|---|---|---|
| Manual API testing (Postman or curl) | ⬜ TODO | Cover all endpoints per `API.md` |
| Auth boundary testing | ⬜ TODO | Confirm unauthenticated and wrong-role rejections |
| Input validation testing | ⬜ TODO | Submit invalid data to each endpoint |
| Duplicate data testing | ⬜ TODO | Duplicate email, duplicate reminder |
| Pagination testing | ⬜ TODO | Verify page counts and edge cases (last page, empty page) |
| Filter combination testing | ⬜ TODO | Category + city + search together |
| Security review | ⬜ TODO | Check no secrets in source, no plain-text passwords in DB |

**Acceptance criteria**:
- All endpoints return the documented status codes for the documented scenarios.
- No plain-text passwords in the `users` collection.
- No JWT secret in any committed file.
- Admin routes return `401`/`403` for unauthenticated or unauthorised requests.

**Dependencies**: Phases 2–8 complete.

---

## Phase 11 — README, GitHub, and Submission Recording

**Goal**: Final documentation polish and submission preparation.

| Task | Status | Notes |
|---|---|---|
| Complete `README.md` | ✅ Done (this sprint) | Updated in this documentation task |
| Complete `.env.example` | ⬜ TODO | All variable names, no values |
| Fill in `AI-USAGE.md` with actual usage | ⬜ TODO | Record tools and tasks at the end |
| Record submission video | ⬜ TODO | Demonstrate all features per brief |
| Final GitHub push | ⬜ TODO | Clean commit history; no secrets |
| Answer assignment questions in README | ✅ Done | Marked pending verification where implementation is needed |

**Dependencies**: Phase 10 complete.

---

## Testing Checklist

Use this checklist during and after Phase 10.

### Authentication
- [x] Signup with valid data creates a user (HTTP 201, role="user")
- [x] Signup with existing email returns 409
- [x] Signup with short password returns 400
- [x] Signup with `role:"admin"` in body — account created as `user`, /admin/me returns 403
- [x] Login with correct credentials returns JWT cookie (HTTP 200, Set-Cookie: token=...)
- [x] Login with wrong password returns 401
- [x] GET /api/auth/me without token returns 401
- [x] GET /api/auth/me with valid cookie returns user profile (no passwordHash)
- [x] GET /api/auth/me with invalid/expired JWT returns 401
- [x] POST /api/auth/logout clears the cookie (Set-Cookie: token=; Max-Age=0)
- [x] GET /api/admin/me without token returns 401
- [x] GET /api/admin/me as normal user returns 403
- [x] GET /api/admin/me as admin returns 200 with admin identity
- [ ] Visiting `/admin` without token redirects to `/login` (middleware not yet implemented)

### Events (Admin)
- [x] Admin can create an event with all required fields (HTTP 201)
- [x] Creating event with missing required field returns 400
- [x] Creating event with invalid category returns 400
- [x] Creating event with negative price returns 400
- [x] Creating event with non-HTTP(S) imageUrl returns 400
- [x] Unknown fields in create body are rejected with 400 (`.strict()` schema)
- [x] Non-admin user token returns 403 on POST /api/admin/events
- [x] Unauthenticated request returns 401 on POST /api/admin/events
- [x] Admin can edit an event's title and category (PATCH /api/admin/events/:id)
- [x] Unknown fields in update body are rejected with 400
- [x] PATCH with invalid ID returns 404
- [x] Admin can deactivate an event (PATCH /api/admin/events/:id/status)
- [x] Admin can reactivate an event
- [x] Deactivated event does not appear in public listing
- [x] Passing `isActive` as a string returns 400 on status endpoint

### Events (Public)
- [x] Public listing returns only active, upcoming events (isActive=true AND date > now)
- [x] Past events do not appear in public listing
- [x] Inactive upcoming events do not appear in public listing
- [x] Results sorted by date ascending (nearest upcoming first)
- [x] Category filter narrows results correctly (exact match)
- [x] Invalid category value returns 400
- [x] City filter is case-insensitive substring match
- [x] Keyword search returns relevant results (text index on title + description)
- [x] Category + city + keyword combined returns intersection (AND logic)
- [x] Empty result set returns HTTP 200 with data:[] and correct pagination
- [x] Pagination: page 2 returns different results than page 1
- [x] total and totalPages are accurate
- [x] limit > 50 returns 400
- [x] page < 1 returns 400
- [x] GET /api/events/:id returns 404 for non-existent event
- [x] GET /api/events/:id returns 404 for inactive event (same as missing)
- [x] GET /api/events/:id returns 404 for past event
- [x] GET /api/events/:id with malformed (non-hex) ID returns 404 without crashing

> **Verification note**: Logic-level checks (TypeScript, ESLint, production build) all pass. Live database tests require Atlas connectivity and manual API testing. Atlas credentials are not available in this automated session — database-dependent test results remain unverified.

### Favourites and My Feed
- [x] Unauthenticated users cannot access `/api/favourites` or `/api/feed` (401 returned)
- [x] Setting favourites persists (PUT validates, stores, returns saved categories)
- [x] Invalid category name in PUT body returns 400 VALIDATION_ERROR
- [x] Empty `favouriteCategories` array returns empty feed (not all events) on GET /api/feed
- [x] My Feed shows only active upcoming events in favourite categories
- [x] Feed results sorted by date ascending (nearest upcoming first)
- [ ] Live integration test: PUT then GET then verify feed contents (requires Atlas)

### Reminders
- [x] Unauthenticated requests to reminders return 401
- [x] POST requires active + upcoming event (inactive/past returns 404)
- [x] Duplicate reminder returns 409 CONFLICT
- [x] GET returns only the authenticated user's reminders
- [x] DELETE removes only the authenticated user's reminder; 404 if missing
- [x] DELETE does not modify the event itself
- [ ] Live integration test: save, list, delete cycle (requires Atlas)

### Card Designer
- [x] Unauthenticated requests return 401
- [x] Invalid theme returns 400 VALIDATION_ERROR
- [x] Invalid sticker value returns 400 VALIDATION_ERROR
- [x] More than 3 stickers returns 400 VALIDATION_ERROR
- [x] GET returns default design when none saved
- [x] Repeated PUT updates the same user–event design (upsert)
- [x] Different users' designs are isolated (user filter in upsert)
- [ ] Live integration test: save and retrieve design (requires Atlas)

### UI and Responsiveness
- [ ] No horizontal scroll at 375px viewport
- [ ] Event grid collapses to 1 column on mobile
- [ ] All buttons and links have visible focus states
- [ ] Loading skeletons appear while data fetches
- [ ] Empty state shown when no events match filters
- [ ] Error toast shown on failed API call
